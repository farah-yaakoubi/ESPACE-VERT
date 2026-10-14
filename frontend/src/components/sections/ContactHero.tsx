"use client";

/**
 * ContactHero — bandeau simple, même esprit que le hero Semences & plants :
 * petit titre en majuscules espacées, grand titre gras, phrase courte.
 * Fond beige uni (pas de photo, pas de décor).
 */
export function ContactHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section
      className="relative overflow-hidden pb-12 sm:pb-16"
      style={{
        backgroundColor: "#f3ecd9",
        paddingTop: "calc(var(--nav-h, 80px) + 48px)",
      }}
    >
      <div className="container-ev flex flex-col items-center text-center">
        {eyebrow && (
          <p className="mb-3 text-[12px] font-extrabold uppercase tracking-[0.22em] text-[#1b2118]/70 sm:text-[13px]">
            {eyebrow}
          </p>
        )}

        <h1
          className="text-[clamp(2rem,4.4vw,3.2rem)] font-black leading-[1.08] tracking-tight text-[#1b2118]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h1>

        {subtitle && (
          <p className="mt-4 max-w-lg text-[13.5px] font-medium text-[#1b2118]/70 sm:text-sm">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}