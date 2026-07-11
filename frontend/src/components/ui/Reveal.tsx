"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/**
 * Reveal — fade + slide-up animation triggered when the wrapped content
 * enters the viewport. Drop this around any section header, grid, or
 * card to get a smooth "on scroll" appearance, consistent across the site.
 */
export function Reveal({
  children,
  delay = 0,
  y = 32,
  duration = 0.7,
  once = true,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  once?: boolean;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : y }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
