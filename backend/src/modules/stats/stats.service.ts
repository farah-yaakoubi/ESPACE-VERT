// src/modules/stats/stats.service.ts
import { statsRepository } from "./stats.repository";

export const statsService = {
  async getDashboard() {
    return statsRepository.getDashboard();
  },
};
