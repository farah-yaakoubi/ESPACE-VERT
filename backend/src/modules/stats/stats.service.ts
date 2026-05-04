// src/modules/stats/stats.service.ts
import { statsRepository } from "./stats.repository";

export const statsService = {
  // Existant (INCHANGÉ)
  async getDashboard() {
    return statsRepository.getDashboard();
  },

  // Nouveau
  async getAdvancedAnalytics(days: number) {
    return statsRepository.getAdvancedAnalytics(days);
  },

  async getHeatmapHoraire(days: number) {
    return statsRepository.getHeatmapHoraire(days);
  },

  async getEntonnoir(days: number) {
    return statsRepository.getEntonnoir(days);
  },
};
