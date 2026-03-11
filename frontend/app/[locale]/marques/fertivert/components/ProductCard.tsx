"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhoneIcon,
  EnvelopeIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { hexToRgba } from "@/lib/colors";

interface ProductCardPremiumProps {
  product: {
    id: string;
    name: string;
    formats?: string[];
    format?: string;
    code: string;
    description: string;
    image?: string;
    catName: string;
    catColor?: string;
    subName?: string;
    divisionName?: string;
  };
  accentColor: string;
  locale: string;
}

export function ProductCardPremium({ product, accentColor, locale }: ProductCardPremiumProps) {
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<"contact" | "success">("contact");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", company: "" });

  const format = product.formats?.[0] ?? product.format ?? "";
  const tagColor = product.catColor ?? accentColor;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalStep("success");
    setTimeout(() => {
      setShowModal(false);
      setModalStep("contact");
      setFormData({ name: "", email: "", phone: "", company: "" });
    }, 3000);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="group bg-white rounded-2xl overflow-hidden flex flex-col"
        style={{
          border: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
          transition: "box-shadow 0.22s ease, transform 0.22s ease",
        }}
        whileHover={{
          boxShadow: `0 4px 8px rgba(0,0,0,0.06), 0 16px 48px ${hexToRgba(accentColor, 0.16)}, 0 0 0 1.5px ${hexToRgba(accentColor, 0.3)}`,
          y: -3,
        }}
        transition={{ duration: 0.2 }}
      >
        {/* ── Zone image ── */}
        <div className="relative overflow-hidden" style={{ height: 190 }}>
          {/* Fond dégradé */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(145deg, #f8faf7 0%, #edf2eb 100%)",
          }} />

          {/* Bande accent en haut */}
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{
            background: `linear-gradient(90deg, ${accentColor}, ${hexToRgba(accentColor, 0.2)})`,
          }} />

          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-8 group-hover:scale-[1.06] transition-transform duration-500"
            />
          ) : (
            /* Placeholder élégant */
            <div className="absolute inset-0 flex items-center justify-center">
              <div style={{
                width: 80, height: 80,
                background: hexToRgba(accentColor, 0.07),
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                  stroke={hexToRgba(accentColor, 0.3)} strokeWidth="1.4" strokeLinecap="round">
                  <path d="M20 5c0 0-8 0-13 5C4 13 4 19 4 19s6 0 9-3c5-5 5-11 7-11z"/>
                  <path d="M4 19l7-7"/>
                </svg>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-black px-2.5 py-1 rounded-lg" style={{
              background: "rgba(255,255,255,0.95)",
              color: tagColor,
              border: `1px solid ${hexToRgba(tagColor, 0.18)}`,
              backdropFilter: "blur(8px)",
            }}>
              {product.catName}
            </span>
          </div>

          {format && (
            <div className="absolute bottom-3 right-3">
              <span className="text-[11px] font-black px-2.5 py-1 rounded-lg" style={{
                background: accentColor,
                color: "#f2faf3",
                boxShadow: `0 2px 10px ${hexToRgba(accentColor, 0.4)}`,
              }}>
                {format}
              </span>
            </div>
          )}
        </div>

        {/* ── Contenu ── */}
        <div className="flex flex-col flex-1 p-5">

          {/* En-tête */}
          <div className="mb-3.5">
            <h3 className="text-[15px] font-black text-gray-900 leading-tight mb-1">
              {product.name}
            </h3>
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{product.code}</span>
              {product.subName && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                  background: hexToRgba(accentColor, 0.08),
                  color: accentColor,
                }}>
                  {product.subName}
                </span>
              )}
              {product.divisionName && (
                <span className="text-[10px] text-gray-400 font-medium">{product.divisionName}</span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-[12.5px] text-gray-500 leading-relaxed line-clamp-3 flex-1 mb-4">
            {product.description}
          </p>

          {/* Séparateur */}
          <div className="h-px mb-4" style={{ background: "#f0f1f0" }} />

          {/* Actions */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:+21671333858"
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: accentColor }}
              >
                <PhoneIcon className="w-3.5 h-3.5" />
                Appeler
              </a>

              <button
                onClick={() => setShowModal(true)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold border transition-all"
                style={{
                  borderColor: hexToRgba(accentColor, 0.28),
                  color: accentColor,
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = accentColor;
                  el.style.color = "#f2faf3";
                  el.style.borderColor = accentColor;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "transparent";
                  el.style.color = accentColor;
                  el.style.borderColor = hexToRgba(accentColor, 0.28);
                }}
              >
                <DocumentArrowDownIcon className="w-3.5 h-3.5" />
                Fiche tech.
              </button>
            </div>

            <a
              href={`/${locale}/contact?product=${encodeURIComponent(product.name)}`}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold w-full transition-all hover:opacity-80"
              style={{ background: hexToRgba(accentColor, 0.07), color: accentColor }}
            >
              <EnvelopeIcon className="w-3.5 h-3.5" />
              Demander un devis
            </a>
          </div>
        </div>
      </motion.div>

      {/* ── Modal fiche technique ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(4,10,5,0.75)", backdropFilter: "blur(6px)" }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.93, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 20 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
              style={{ boxShadow: `0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px ${hexToRgba(accentColor, 0.15)}` }}
            >
              {modalStep === "contact" ? (
                <>
                  <div className="relative px-7 py-7 overflow-hidden" style={{
                    background: "linear-gradient(135deg, #f5fdf5 0%, #edfbee 50%, #0a6030 100%)",
                  }}>
                    {/* Coin déco */}
                    <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10" style={{
                      background: `radial-gradient(circle, ${accentColor}, transparent 70%)`,
                    }} />

                    <button
                      onClick={() => setShowModal(false)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                      style={{ background: "rgba(255,255,255,0.1)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"}
                    >
                      <XMarkIcon className="w-4 h-4 text-white" />
                    </button>

                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{
                      background: accentColor,
                    }}>
                      <DocumentArrowDownIcon className="w-5 h-5" style={{ color: "#f5fdf5" }} />
                    </div>
                    <h3 className="text-xl font-black text-white mb-1">Fiche Technique</h3>
                    <p className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {product.name}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
                    <p className="text-[12.5px] text-gray-500 leading-relaxed">
                      Remplissez vos coordonnées pour recevoir la fiche technique. Notre équipe vous recontactera sous 24h.
                    </p>

                    {[
                      { key: "name", label: "Nom complet", type: "text", required: true },
                      { key: "email", label: "Email professionnel", type: "email", required: true },
                      { key: "phone", label: "Téléphone", type: "tel", required: true },
                      { key: "company", label: "Entreprise / Exploitation", type: "text", required: false },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: "#6b7280" }}>
                          {field.label}{field.required && <span style={{ color: accentColor }}> *</span>}
                        </label>
                        <input
                          type={field.type}
                          required={field.required}
                          value={(formData as any)[field.key]}
                          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all"
                          style={{
                            border: "1.5px solid #e8eae7",
                            background: "#fafcf9",
                            color: "#1f2937",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = accentColor;
                            e.target.style.boxShadow = `0 0 0 3px ${hexToRgba(accentColor, 0.1)}`;
                            e.target.style.background = "white";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#e8eae7";
                            e.target.style.boxShadow = "none";
                            e.target.style.background = "#fafcf9";
                          }}
                        />
                      </div>
                    ))}

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl text-[13px] font-black text-white mt-1 transition-all hover:opacity-90"
                      style={{
                        background: "linear-gradient(135deg, #edfbee, #0a6030)",
                        boxShadow: `0 4px 16px rgba(26,92,46,0.3)`,
                      }}
                    >
                      Recevoir la fiche technique →
                    </button>

                    <p className="text-[10.5px] text-center" style={{ color: "#b0b8b2" }}>
                      Vos données sont confidentielles et ne seront pas partagées.
                    </p>
                  </form>
                </>
              ) : (
                <div className="p-10 text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{ background: hexToRgba(accentColor, 0.1) }}
                  >
                    <CheckCircleIcon className="w-9 h-9" style={{ color: accentColor }} />
                  </motion.div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Demande envoyée !</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">
                    Notre équipe vous contactera avec la fiche technique de <strong className="text-gray-700">{product.name}</strong>.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ProductCardPremium;