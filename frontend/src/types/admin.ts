// src/types/admin.ts

import { Visiteur } from "./visiteur";

export interface VisiteurWithCount extends Visiteur {
  _count: {
    visites_pages: number;
    devis: number;
    rendez_vous: number;
  };
}

export interface PaginatedVisiteurs {
  visiteurs: VisiteurWithCount[];
  total: number;
}