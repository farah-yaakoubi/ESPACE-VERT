"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function AboutPage() {
  const t = useTranslations("about");
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f0f9e8] to-white">
      <div className="max-w-[1400px] mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-black text-[#2d5016] mb-6">
            {t("title")}
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Histoire */}
        <div className="bg-white rounded-3xl p-12 shadow-xl mb-12">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#6b9e3e] to-[#4a7c2f] rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">📜</span>
            </div>
            <div>
              <h2 className="text-3xl font-black text-[#2d5016] mb-4">{t("history")}</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {t("historyText")}
              </p>
            </div>
          </div>
        </div>

        {/* Évolution */}
        <div className="bg-white rounded-3xl p-12 shadow-xl mb-12">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#8cc63f] to-[#6b9e3e] rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">🚀</span>
            </div>
            <div>
              <h2 className="text-3xl font-black text-[#2d5016] mb-4">{t("evolution")}</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {t("evolutionText")}
              </p>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="bg-gradient-to-br from-[#6b9e3e] to-[#4a7c2f] rounded-3xl p-12 shadow-xl mb-12 text-white">
          <h2 className="text-3xl font-black mb-6">{t("mission")}</h2>
          <p className="text-lg leading-relaxed">
            {t("missionText")}
          </p>
        </div>

        {/* Valeurs */}
        <div className="mt-20">
          <h2 className="text-4xl font-black text-center text-[#2d5016] mb-12">{t("values")}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "⭐", title: t("quality"), text: t("qualityText"), color: "from-yellow-400 to-yellow-600" },
              { icon: "💡", title: t("innovation"), text: t("innovationText"), color: "from-blue-400 to-blue-600" },
              { icon: "🤝", title: t("service"), text: t("serviceText"), color: "from-green-400 to-green-600" },
              { icon: "🌍", title: t("sustainability"), text: t("sustainabilityText"), color: "from-emerald-400 to-emerald-600" },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <span className="text-3xl">{value.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-[#2d5016] mb-3">{value.title}</h3>
                <p className="text-gray-700">{value.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
