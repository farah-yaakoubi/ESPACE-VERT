import { visiteurRepository } from "./visiteur.repository";
import { paginate } from "../../lib/response";
import { TrackDto, VisiteurQueryDto, StatsVisiteurQueryDto } from "./visiteur.schema";

export const visiteurService = {

  async track(data: TrackDto, ip: string, userAgent: string | null) {
    const visiteur = await visiteurRepository.upsert(data.token_visiteur, ip, userAgent);

    if (data.url) {
      await visiteurRepository.logPage(visiteur.id_visiteur, data.url, data.titre, data.duree);
    }

    // Tracking recherche
    if (data.search_query?.trim()) {
      await visiteurRepository.logSearch(visiteur.id_visiteur, data.search_query.trim(), data.search_results ?? 0);
    }

    return visiteur.token_visiteur;
  },

  async list(params: VisiteurQueryDto) {
    const { visiteurs, total } = await visiteurRepository.findAll(params);
    return { data: visiteurs, meta: paginate(total, params.page, params.limit) };
  },

  async getById(id: number) {
    const v = await visiteurRepository.findById(id);
    if (!v) throw { status: 404, message: "Visiteur introuvable" };
    return v;
  },

  async getStats(params: StatsVisiteurQueryDto) {
    return visiteurRepository.getStats(params);
  },
};
