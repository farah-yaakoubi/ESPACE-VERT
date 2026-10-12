"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

const INK = "#1b2118";
const BODY = "#5b655a";
const FOREST = "#1f4d34";
const LEAF = "#7dc040";
const WHEAT = "#c9a24a";
const EASE_SMOOTH = [0.25, 0.46, 0.45, 0.94] as const;

function splitWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean);
}

export function HomeSectionHeading({
  eyebrow,
  title,
  highlight,
  subtitle,
  icon,
  inView,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  icon?: LucideIcon;
  inView: boolean;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  const reduceMotion = useReducedMotion();
  const Icon = icon;
  const motionReady = inView || reduceMotion;
  const titleWords = splitWords(title);
  const highlightWords = highlight ? splitWords(highlight) : [];
  const titleDelay = 0.14;
  const wordStagger = 0.075;
  const highlightDelay = titleDelay + titleWords.length * wordStagger + 0.06;

  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <motion.div
        className={`mb-2 flex items-center gap-2 ${centered ? "justify-center" : ""}`}
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: motionReady ? 1 : 0, y: motionReady ? 0 : 10 }}
        transition={{ duration: 0.45, ease: EASE_SMOOTH }}
      >
        {Icon && (
          <motion.span
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 shadow-sm ring-1 ring-[#1f4d34]/10"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.82, rotate: -12 }}
            animate={{
              opacity: motionReady ? 1 : 0,
              scale: motionReady ? [1, 1.08, 1] : 0.82,
              rotate: motionReady ? 0 : -12,
            }}
            transition={{
              opacity: { duration: 0.55, ease: EASE_SMOOTH, delay: 0.05 },
              rotate: { duration: 0.55, ease: EASE_SMOOTH, delay: 0.05 },
              scale: reduceMotion
                ? { duration: 0 }
                : { duration: 2.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.1 },
            }}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2} style={{ color: FOREST }} />
          </motion.span>
        )}
        <span
          className="text-[11px] font-extrabold uppercase tracking-[0.12em] sm:text-xs"
          style={{ color: FOREST }}
        >
          {eyebrow}
        </span>
      </motion.div>

      <h2
        className="text-[clamp(1.55rem,3.2vw,2.35rem)] font-extrabold leading-[1.16]"
        style={{ color: INK, fontFamily: "var(--font-cairo), Cairo, sans-serif", letterSpacing: 0 }}
      >
        <span className="inline-flex flex-wrap gap-x-2 gap-y-1">
          {titleWords.map((word, index) => (
            <span key={`${word}-${index}`} className="overflow-hidden pb-1">
              <motion.span
                className="inline-block"
                initial={reduceMotion ? false : { y: "115%", opacity: 0, rotate: 1.5 }}
                animate={{
                  y: motionReady ? "0%" : "115%",
                  opacity: motionReady ? 1 : 0,
                  rotate: motionReady ? 0 : 1.5,
                }}
                transition={{
                  duration: 0.7,
                  ease: EASE_SMOOTH,
                  delay: titleDelay + index * wordStagger,
                }}
              >
                {word}
              </motion.span>
            </span>
          ))}

          {highlightWords.length > 0 && (
            <motion.span
              className="relative inline-flex flex-wrap gap-x-2 gap-y-1 overflow-hidden rounded-md px-1 pb-1"
              style={{ color: FOREST }}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: motionReady ? 1 : 0 }}
              transition={{ duration: 0.35, ease: EASE_SMOOTH, delay: highlightDelay }}
            >
              <motion.span
                aria-hidden
                className="absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-18deg]"
                style={{ background: "linear-gradient(90deg, transparent, rgba(125,192,64,0.18), transparent)" }}
                initial={reduceMotion ? false : { x: "-120%" }}
                animate={{ x: motionReady ? ["-120%", "340%"] : "-120%" }}
                transition={{
                  duration: 2.4,
                  ease: EASE_SMOOTH,
                  delay: highlightDelay + 0.65,
                  repeat: Infinity,
                  repeatDelay: 2.8,
                }}
              />
              {highlightWords.map((word, index) => (
                <span key={`${word}-${index}`} className="overflow-hidden pb-1">
                  <motion.span
                    className="inline-block"
                    initial={reduceMotion ? false : { y: "115%", opacity: 0, scale: 0.98 }}
                    animate={{
                      y: motionReady ? "0%" : "115%",
                      opacity: motionReady ? 1 : 0,
                      scale: motionReady ? 1 : 0.98,
                    }}
                    transition={{
                      duration: 0.68,
                      ease: EASE_SMOOTH,
                      delay: highlightDelay + index * wordStagger,
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
              <motion.span
                aria-hidden
                className="absolute bottom-0 left-0 h-[3px] rounded-full"
                style={{ background: `linear-gradient(90deg, ${LEAF}, ${WHEAT})` }}
                initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
                animate={{
                  scaleX: motionReady ? 1 : 0,
                  opacity: motionReady ? 1 : 0,
                }}
                transition={{ duration: 0.68, ease: EASE_SMOOTH, delay: highlightDelay + 0.24 }}
              />
            </motion.span>
          )}
        </span>
      </h2>

      <motion.div
        aria-hidden
        className={`mt-3 h-1 rounded-full ${centered ? "mx-auto" : ""}`}
        style={{ background: `linear-gradient(90deg, ${LEAF}, ${FOREST})` }}
        initial={reduceMotion ? false : { width: 0, opacity: 0 }}
        animate={{
          width: motionReady ? [48, 70, 48] : 0,
          opacity: motionReady ? 1 : 0,
        }}
        transition={{
          width: reduceMotion
            ? { duration: 0 }
            : {
                duration: 2.6,
                ease: "easeInOut",
                delay: highlight ? highlightDelay + 0.12 : 0.34,
                repeat: Infinity,
                repeatDelay: 1.2,
              },
          opacity: { duration: 0.55, ease: EASE_SMOOTH, delay: highlight ? highlightDelay + 0.12 : 0.34 },
        }}
      />

      {subtitle && (
        <motion.p
          className={`mt-3 text-[14px] font-semibold leading-7 sm:text-[15px] ${centered ? "mx-auto" : ""}`}
          style={{ color: BODY, maxWidth: 620 }}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: motionReady ? 1 : 0, y: motionReady ? 0 : 12 }}
          transition={{ duration: 0.6, ease: EASE_SMOOTH, delay: highlight ? highlightDelay + 0.22 : 0.5 }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
