// Types partagés — système de recommandation de semences
// Importés par : SemencesRecommandation.tsx  +  api/semences/recommander/route.ts

export interface VisiteurProfil {
  pays:       string;   // ex: "Tunisie", "Algérie", "Maroc", "France"
  region:     string;   // ex: "Nord", "Sahel", "Sud", "Côte"
  climat:     string;   // ex: "Chaud et sec", "Tempéré", "Humide", "Semi-aride"
  mois:       number;   // 0–11 (mois de semis prévu)
  sol:        string;   // ex: "Sableux", "Argileux", "Limoneux"
  mode:       string;   // ex: "Plein champ", "Sous serre", "Pépinière"
  experience: string;   // ex: "Débutant", "Intermédiaire", "Confirmé"
  objectifs:  string[]; // ex: ["Rendement maximal", "Résistance aux maladies"]
}

export interface ProduitSemence {
  id_produit:     number;
  nom:            string;
  slug:           string;
  description:    string | null;
  categorie:      string;
  marque:         string | null;
  saison:         string | null;
  type_semence:   string | null;
  resistance:     string | null;
  descriptif_var: string | null;
  productivite:   string | null;
  biologique:     boolean | null;
  tags:           string[];
}

export interface RecommandationResult {
  id_produit:    number;
  slug:          string;
  score:         number;                       // 0–100
  niveau:        "excellent" | "bon" | "partiel";
  raison:        string;                       // phrase courte (~15 mots max)
  details:       string;                       // explication complète (~40 mots)
  points_forts:  string[];                     // 2–3 bullets
  avertissement?: string;                      // si incompatibilité partielle
}
