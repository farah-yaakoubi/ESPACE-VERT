import { cn } from "@/lib/utils";
import { SectionTitleLine } from "@/components/ui/SectionTitleIcon";
import type { IcoName } from "@/components/icons/AgriIcons";

interface SectionHeaderProps {
  eyebrow?:  string;
  title:     string;
  subtitle?: string;
  align?:    "left" | "center";
  className?: string;
  /** Icône minimaliste affichée en début de ligne du titre (facultatif) */
  icon?: IcoName;
}

export function SectionHeader({ eyebrow, title, subtitle, align = "center", className, icon }: SectionHeaderProps) {
  return (
    <div className={cn("mb-6", align === "center" ? "text-center" : "text-left", className)}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="section-title">
        {icon ? (
          <SectionTitleLine icon={icon} align={align}>
            {title}
          </SectionTitleLine>
        ) : (
          title
        )}
      </h2>
      {/* Accent line */}
      <div
        className={cn("mt-3 h-1 w-10 rounded-full", align === "center" ? "mx-auto" : "")}
        style={{ background: "linear-gradient(90deg, #7dc040, #15803d)" }}
      />
      {subtitle && (
        <p className={cn("mt-4 text-gray-500 leading-relaxed", align === "center" ? "max-w-2xl mx-auto" : "max-w-2xl")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}