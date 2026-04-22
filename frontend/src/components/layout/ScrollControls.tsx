"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ACCENT = "#3cb648";

const IcoUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);
const IcoDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M12 5v14M5 12l7 7 7-7" />
  </svg>
);

function ProgressRing({ pct }: { pct: number }) {
  const R = 16, CIRC = 2 * Math.PI * R;
  return (
    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r={R} fill="none" stroke="#e5e7eb" strokeWidth="2" />
      <circle cx="18" cy="18" r={R} fill="none" stroke={ACCENT} strokeWidth="2.5"
        strokeLinecap="round" strokeDasharray={CIRC}
        strokeDashoffset={CIRC * (1 - pct / 100)}
        style={{ transition: "stroke-dashoffset 0.18s ease" }} />
    </svg>
  );
}

export default function ScrollControls() {
  const [pct, setPct]         = useState(0);
  const [atTop, setAtTop]     = useState(true);
  const [atBottom, setAtBottom] = useState(false);
  const [show, setShow]       = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y  = window.scrollY;
      const wh = window.innerHeight;
      const dh = document.documentElement.scrollHeight;
      setPct(dh > wh ? Math.round((y / (dh - wh)) * 100) : 0);
      setAtTop(y < 60);
      setAtBottom(y + wh >= dh - 80);
      setShow(y > 200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="fixed right-5 bottom-28 z-40 flex flex-col items-center gap-2"
        >
          <AnimatePresence>
            {pct > 0 && pct < 100 && (
              <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="text-[10px] font-black tabular-nums bg-white text-gray-400 px-2 py-0.5 rounded-full shadow-sm border border-gray-100">
                {pct}%
              </motion.span>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!atTop && (
              <motion.button key="up"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                whileHover={{ scale: 1.12, y: -2 }} whileTap={{ scale: 0.9 }}
                className="relative w-10 h-10 rounded-full shadow-lg flex items-center justify-center group"
                style={{ background: `linear-gradient(135deg, #27942f, ${ACCENT})` }}
                title="Haut de page"
              >
                <span className="text-white relative z-10"><IcoUp /></span>
                <motion.span className="absolute inset-0 rounded-full" style={{ background: "rgba(60,182,72,0.35)" }}
                  animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }} />
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900/95 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl">
                  Haut de page
                  <span className="absolute left-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-l-gray-900/95" />
                </span>
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!atBottom && (
              <motion.button key="down"
                onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })}
                initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                whileHover={{ scale: 1.12, y: -2 }} whileTap={{ scale: 0.9 }}
                className="relative w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center group"
                title="Bas de page"
              >
                <ProgressRing pct={pct} />
                <span className="relative z-10 text-gray-500 group-hover:text-[#3cb648] transition-colors"><IcoDown /></span>
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900/95 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl">
                  Bas de page
                  <span className="absolute left-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-l-gray-900/95" />
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
