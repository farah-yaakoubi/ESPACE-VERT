"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
  </svg>
);

interface FertivertHeroProps {
  logoPath?: string;
}

export default function FertivertHero({
  logoPath = "/logos/LOGO_FERTiVERT_white.png",
}: FertivertHeroProps) {
  const [fbVisible, setFbVisible] = useState(false);
  const [fbHovered, setFbHovered] = useState(false);

  // Entrée après 1.8s → auto fade-out après 3.5s (sauf si hover)
  useEffect(() => {
    const enterTimer = setTimeout(() => setFbVisible(true), 1800);
    return () => clearTimeout(enterTimer);
  }, []);

  useEffect(() => {
    if (!fbVisible || fbHovered) return;
    const exitTimer = setTimeout(() => setFbVisible(false), 3500);
    return () => clearTimeout(exitTimer);
  }, [fbVisible, fbHovered]);

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden"
      style={{
        minHeight: "75vh",
        background: "linear-gradient(160deg, #0a2410 0%, #0f3518 25%, #1D6B2A 55%, #3CB648 100%)",
      }}
    >
      {/* ── Grain organique ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.15,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          mixBlendMode: "overlay",
        }}
      />

      {/* ── Halo central respirant ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(140,198,63,0.18) 0%, rgba(30,138,48,0.08) 50%, transparent 75%)",
        }}
      />

      {/* ── Cercles orbitaux ── */}
      {[580, 430, 290].map((size, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size,
            height: size,
            border: `1px solid rgba(140,198,63,${0.08 - i * 0.02})`,
          }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 30 + i * 14, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* ── LOGO — grande taille, très visible ── */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, scale: 0.78, y: 32 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        style={{ width: "min(560px, 88vw)", height: "min(560px, 88vw)" }}
      >
        {/* Halo vert pulsant derrière le logo */}
        <motion.div
          className="absolute pointer-events-none"
          style={{
            inset: "-20%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(140,198,63,0.32) 0%, rgba(26,107,48,0.12) 45%, transparent 68%)",
            filter: "blur(28px)",
          }}
          animate={{ opacity: [0.6, 1, 0.6], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        {/* Halo blanc doux */}
        <motion.div
          className="absolute pointer-events-none"
          style={{
            inset: "5%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 60%)",
            filter: "blur(16px)",
          }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
        />

        {/* Logo flottant */}
        <motion.div
          className="w-full h-full relative"
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 2.2 }}
        >
          <Image
            src={logoPath}
            alt="Fertivert"
            fill
            className="object-contain"
            priority
            quality={100}
            style={{
              filter:
                "drop-shadow(0 0 40px rgba(140,198,63,0.6)) drop-shadow(0 0 80px rgba(140,198,63,0.25)) drop-shadow(0 16px 40px rgba(0,0,0,0.5))",
            }}
          />
        </motion.div>

        {/* Reflet au sol */}
        <div
          className="absolute -bottom-4 left-1/2 pointer-events-none"
          style={{
            transform: "translateX(-50%)",
            width: "70%",
            height: 32,
            background:
              "radial-gradient(ellipse, rgba(140,198,63,0.22) 0%, transparent 70%)",
            filter: "blur(10px)",
          }}
        />
      </motion.div>

      {/* ── FACEBOOK — fade+slide in → auto fade-out → hover = glisse le label ── */}
      <AnimatePresence>
        {fbVisible && (
          <motion.div
            className="absolute z-20"
            style={{ bottom: 44, right: 40 }}
            initial={{ opacity: 0, x: 55, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 40, y: 8 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <a
              href="https://www.facebook.com/profile.php?id=61566418239096&locale=fr_FR"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Fertivert sur Facebook"
              className="flex items-center rounded-full text-white overflow-hidden cursor-pointer"
              onMouseEnter={() => setFbHovered(true)}
              onMouseLeave={() => {
                setFbHovered(false);
                // relance le timer de disparition après 2s
                setTimeout(() => setFbVisible(false), 2000);
              }}
              style={{
                background: "rgba(255,255,255,0.14)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.28)",
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.18)",
                transition: "box-shadow 0.3s, background 0.3s",
              }}
            >
              {/* Icône */}
              <div
                style={{
                  width: 50,
                  height: 50,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <FacebookIcon />
              </div>

              {/* Label — glisse au hover */}
              <motion.div
                style={{ overflow: "hidden" }}
                animate={{
                  maxWidth: fbHovered ? 120 : 0,
                  opacity: fbHovered ? 1 : 0,
                }}
                transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
              >
                <span
                  className="whitespace-nowrap pr-5 text-sm font-semibold"
                  style={{ letterSpacing: "0.02em" }}
                >
                  Suivez-nous
                </span>
              </motion.div>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Vague de transition ── */}
      <div className="absolute bottom-0 inset-x-0 z-10">
        <svg
          viewBox="0 0 1440 68"
          preserveAspectRatio="none"
          style={{ width: "100%", height: 68, display: "block", marginBottom: -2 }}
        >
          <path
            d="M0,34 C200,68 400,0 600,30 C760,54 920,6 1100,28 C1230,44 1340,14 1440,34 L1440,68 L0,68 Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
