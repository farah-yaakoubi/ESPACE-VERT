"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";
import type { Agence } from "@/config/agences";

/**
 * ContactInfoCards — 3 cartes (téléphone / e-mail / adresse) à cheval sur
 * la bande de couleur du hero et le fond blanc, comme les repères de
 * contact rapide de la maquette de référence.
 */
export function ContactInfoCards({ agence }: { agence: Agence }) {
  const items = [
    { icon: Phone, label: "Téléphone", value: agence.tel },
    { icon: Mail, label: "E-mail", value: agence.email ?? "—" },
    { icon: MapPin, label: "Adresse", value: agence.ville.replace(" — Siège", "") },
  ];

  return (
    <div className="container-ev relative z-10 -mt-12 sm:-mt-14">
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map(({ icon: Icon, label, value }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="flex items-center gap-4 rounded-2xl border border-sand-200 bg-white p-5 shadow-[0_16px_48px_rgba(10,60,8,0.10)]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ev-100 text-ev-700">
              <Icon size={19} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-ev-600">
                {label}
              </p>
              <p className="truncate text-sm font-bold text-ev-950">{value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}