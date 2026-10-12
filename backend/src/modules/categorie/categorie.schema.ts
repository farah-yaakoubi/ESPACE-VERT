// src/modules/categorie/categorie.schema.ts
import { z } from "zod";

const TranslationsSchema = z.record(z.enum(["fr", "ar", "en"]), z.record(z.string(), z.string().nullable())).optional();

const CategorieBaseSchema = z.object({
  nom:         z.string().min(1).max(150),
  slug:        z.string().min(1).max(180).regex(/^[a-z0-9-]+$/),
  description: z.string().optional().nullable(),
  translations: TranslationsSchema,
  image:       z.string().url().max(500).optional().nullable(),
  id_activite: z.number().int().positive().optional().nullable(),
  id_marque:   z.number().int().positive().optional().nullable(),
  parent_id:   z.number().int().positive().optional().nullable(),
  // Parents secondaires (additif) : permet à une catégorie d'apparaître
  // sous plusieurs catégories parentes en plus de parent_id ci-dessus
  // (ex. "Tomate" rattachée à la fois à "Semences hybrides" et
  // "Semences standard"). N'affecte pas parent_id ni le reste du site.
  parent_ids_extra: z.array(z.number().int().positive()).max(20).optional(),
  ordre:       z.number().int().min(0).optional().default(0),
});

export const CreateCategorieSchema = CategorieBaseSchema.refine(
  (data) => data.id_marque != null || data.id_activite != null || data.parent_id != null,
  { message: "Une catégorie doit appartenir à au moins une marque ou une activité", path: ["id_marque"] }
);

export const UpdateCategorieSchema = CategorieBaseSchema.partial().extend({
  actif: z.boolean().optional(),
}).refine(
  (data) => {
    // Si on met à jour id_marque ou id_activite, vérifier qu'au moins un reste renseigné
    // Si aucun des deux n'est fourni dans le update, on laisse passer (valeurs existantes en base)
    if (data.id_marque === null && data.id_activite === null) return false;
    return true;
  },
  { message: "Une catégorie doit appartenir à au moins une marque ou une activité", path: ["id_marque"] }
);

export const CategorieQuerySchema = z.object({
  id_marque:   z.coerce.number().int().positive().optional(),
  id_activite: z.coerce.number().int().positive().optional(),
  // "root" = seulement les catégories sans parent ; "all" = tout (défaut)
  scope:       z.enum(["root", "all"]).optional().default("all"),
  // renvoie l'arbre imbriqué pour la route publique
  tree:        z.coerce.boolean().optional().default(false),
  // recherche globale par nom (utilisée par la recherche de la navbar)
  search:      z.string().optional(),
});

export type CreateCategorieDto  = z.infer<typeof CreateCategorieSchema>;
export type UpdateCategorieDto  = z.infer<typeof UpdateCategorieSchema>;
export type CategorieQueryDto   = z.infer<typeof CategorieQuerySchema>;
