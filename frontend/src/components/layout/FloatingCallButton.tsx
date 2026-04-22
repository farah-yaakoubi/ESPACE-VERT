"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EV = { dark: "#0a6030", primary: "#4a9060", mid: "#3d7228", lime: "#8cc83f", tint: "#f0f9eb" };

const IcoPhone = (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.72a16 16 0 0 0 6.36 6.36l.98-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IcoWA = (p: any) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>;
const IcoMail = (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const IcoX = (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>;

export default function FloatingCallButton() {
  const [open, setOpen]         = useState(false);
  const [visible, setVisible]   = useState(false);
  const [atFooter, setAtFooter] = useState(false);
  const footerRef = useRef<Element | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    footerRef.current = document.querySelector("footer") || document.querySelector("#site-footer");
    const onScroll = () => {
      if (!footerRef.current) footerRef.current = document.querySelector("footer") || document.querySelector("#site-footer");
      if (footerRef.current) setAtFooter(footerRef.current.getBoundingClientRect().top < window.innerHeight - 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleEnter = () => { closeTimer.current && clearTimeout(closeTimer.current); setOpen(true); };
  const handleLeave = () => { closeTimer.current = setTimeout(() => setOpen(false), 280); };
  const show = visible && !atFooter;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.85 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className="fixed right-5 bottom-8 z-50"
          onMouseEnter={handleEnter} onMouseLeave={handleLeave}
        >
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.88, y: 10 }}
                transition={{ type: "spring", stiffness: 340, damping: 28 }}
                className="absolute right-0 bottom-[68px] w-72 bg-white rounded-3xl overflow-hidden"
                style={{ boxShadow: "0 24px 64px rgba(26,61,10,0.18), 0 0 0 1px rgba(0,0,0,0.05)" }}
              >
                <div className="relative px-5 py-4 text-white" style={{ background: `linear-gradient(135deg, ${EV.dark}, ${EV.mid})` }}>
                  <div className="absolute top-0 inset-x-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${EV.lime}, #a3d95f)` }} />
                  <button onClick={() => setOpen(false)} className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors">
                    <IcoX className="w-3.5 h-3.5 text-white" />
                  </button>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] mb-1" style={{ color: EV.lime }}>Groupe Espace Vert</p>
                  <h3 className="text-[16px] font-black">Contactez-nous</h3>
                  <p className="text-[12px] text-white/60 mt-0.5">Notre équipe vous répond</p>
                </div>
                <div className="p-3 space-y-1.5">
                  {[
                    { href: "tel:+21671333858", icon: IcoPhone, label: "Appeler", value: "(+216) 71 333 858", color: EV.primary, bg: EV.tint },
                    { href: "tel:+21671348404", icon: IcoPhone, label: "Appeler", value: "(+216) 71 348 404", color: EV.primary, bg: EV.tint },
                  ].map((item, i) => (
                    <motion.a key={i} href={item.href}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:bg-[#f0f9eb] hover:border-[#c8e4a8] transition-all group">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform" style={{ backgroundColor: item.bg, color: item.color }}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{item.label}</p>
                        <p className="text-[14px] font-black" style={{ color: EV.dark }}>{item.value}</p>
                      </div>
                    </motion.a>
                  ))}
                  <motion.a href="https://wa.me/21671333858" target="_blank" rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:bg-green-50 hover:border-green-200 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0 text-green-500 group-hover:scale-105 transition-transform">
                      <IcoWA className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">WhatsApp</p>
                      <p className="text-[14px] font-black text-green-600">Envoyer un message</p>
                    </div>
                  </motion.a>
                  <motion.a href="mailto:secretariat.groupeev@planet.tn"
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-500 group-hover:scale-105 transition-transform">
                      <IcoMail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Email</p>
                      <p className="text-[13px] font-bold text-blue-700 truncate">secretariat.groupeev@planet.tn</p>
                    </div>
                  </motion.a>
                </div>
                <div className="px-4 pb-4">
                  <p className="text-[11px] text-center text-gray-400 bg-gray-50 rounded-xl py-2">📍 69, rue Abderrazak Chraibi, 1001 Tunis</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button onClick={() => setOpen(v => !v)}
            className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center overflow-hidden relative"
            style={{ background: `linear-gradient(135deg, ${EV.dark}, ${EV.mid})` }}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.93 }} aria-label="Nous appeler">
            <AnimatePresence mode="wait">
              {open
                ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}><IcoX className="w-5 h-5 text-white" /></motion.span>
                : <motion.span key="ph" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}><IcoPhone className="w-6 h-6 text-white relative z-10" /></motion.span>
              }
            </AnimatePresence>
            {!open && (
              <motion.span className="absolute inset-0 rounded-full" style={{ background: EV.lime }}
                animate={{ scale: [1, 1.7, 1.7], opacity: [0.55, 0, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }} />
            )}
          </motion.button>
          {!open && (
            <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4 }}
              className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-[#0a6030] text-white text-xs font-black px-3 py-1.5 rounded-xl whitespace-nowrap shadow-lg pointer-events-none">
              Nous appeler
              <span className="absolute left-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-l-[#0a6030]" />
            </motion.span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
