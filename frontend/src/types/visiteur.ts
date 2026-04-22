// src/types/visiteur.ts

export interface VisitePage {
  id?: number;
  url: string;
  titre: string | null;
  duree: number;
  visited_at?: string;
}

export interface Visiteur {
  id_visiteur: number;
  token_visiteur: string;
  ip_address: string;
  user_agent: string | null;
  last_visit?: string;

  visites_pages?: VisitePage[];
  devis?: any[];         // à typer plus tard si tu veux
  rendez_vous?: any[];
  messages?: any[];
}