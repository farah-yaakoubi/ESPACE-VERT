export const adminStats = {
  // Existant (INCHANGÉ)
  dashboard: () => request<DashboardStats>("/admin/stats"),

  // ── Nouveaux endpoints analytics ──────────────────────────────
  analytics:  (days = 30) => request<AdvancedAnalytics>(`/admin/stats/analytics?days=${days}`),
  heatmap:    (days = 30) => request<HeatmapCell[]>(`/admin/stats/heatmap?days=${days}`),
  entonnoir:  (days = 30) => request<EntonnoirStep[]>(`/admin/stats/entonnoir?days=${days}`),
};

// ── Nouveaux types à ajouter dans la section types du fichier ─────
export interface AdvancedAnalytics {
  kpis: {
    visiteurs_actifs:   number;
    total_visiteurs:    number;
    nouveaux_visiteurs: number;
    page_views:         number;
    avg_duree_sec:      number;
    pages_par_visite:   number;
    devis_total:        number;
    taux_conversion:    number;
    growth_visiteurs:   number;
    growth_pages:       number;
  };
  series: {
    visiteurs_par_jour: { date: string; nb: number }[];
    pages_par_jour:     { date: string; nb: number }[];
    devis_par_jour:     { date: string; nb: number }[];
  };
  top_pages: { url: string; titre: string; vues: number; duree: number }[];
  geo: {
    pays:    { pays: string; nb: number }[];
    regions: { region: string; nb: number }[];
  };
  recherches:   { query: string; nb: number }[];
  produits_vus: { slug: string; nb: number }[];
  conversions: {
    devis_par_statut: Record<string, number>;
    total: number;
    taux:  number;
  };
  periode: { days: number; depuis: string };
}

export interface HeatmapCell {
  heure:        number;
  jour_semaine: number;
  nb:           number;
}

export interface EntonnoirStep {
  label: string;
  nb:    number;
  pct:   number;
}
