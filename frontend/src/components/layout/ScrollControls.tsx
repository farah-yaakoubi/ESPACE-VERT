"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

function ScrollButton({
  label,
  disabled,
  onClick,
  direction,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  direction: "up" | "down";
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`group relative flex h-14 w-14 items-center justify-center rounded-2xl transition ${
        disabled
          ? "cursor-default opacity-35"
          : "hover:bg-emerald-50 hover:shadow-sm"
      }`}
    >
      <Image
        src="/icons/scroll icon.webp"
        alt={label}
        width={44}
        height={44}
        className={`h-11 w-11 ${direction === "up" ? "rotate-180" : ""}`}
      />
      <span className="pointer-events-none absolute right-full mr-3 rounded-lg bg-slate-950 px-2.5 py-1.5 text-[11px] font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}

export default function ScrollControls() {
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);
  const [showUp, setShowUp] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const wh = window.innerHeight;
      const dh = document.documentElement.scrollHeight;
      const scrollable = Math.max(1, dh - wh);
      const isLowerHalf = y / scrollable >= 0.5;

      setAtTop(y < 80);
      setAtBottom(y + wh >= dh - 80);
      setShowUp(isLowerHalf);
      setShow(dh > wh + 240 && y > 180);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-6 z-40 hidden flex-col items-center gap-2 sm:flex"
          style={{ bottom: "104px" }}
          aria-label="Navigation de page"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={showUp ? "scroll-up" : "scroll-down"}
              initial={{ opacity: 0, y: showUp ? 10 : -10, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: showUp ? -10 : 10, scale: 0.94 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {showUp ? (
                <ScrollButton
                  label="Haut de page"
                  disabled={atTop}
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  direction="up"
                />
              ) : (
                <ScrollButton
                  label="Bas de page"
                  disabled={atBottom}
                  onClick={() =>
                    window.scrollTo({
                      top: document.documentElement.scrollHeight,
                      behavior: "smooth",
                    })
                  }
                  direction="down"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}