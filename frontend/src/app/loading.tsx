"use client";

import { useI18n } from "@/i18n/I18nProvider";

export default function Loading() {
  const { t } = useI18n();
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-ev-100 border-t-ev-600 animate-spin" />
        <p className="text-sm text-gray-400 font-medium">{t("common.loading", "Chargement…")}</p>
      </div>
    </div>
  );
}
