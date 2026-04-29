// src/index.ts
// ══════════════════════════════════════════════════════════════════
//  ESPACE VERT — Backend v2
//  Architecture modulaire : module = schema + repository + service
//                                   + controller + routes
// ══════════════════════════════════════════════════════════════════
import "dotenv/config";
import express      from "express";
import cors         from "cors";
import helmet       from "helmet";
import morgan       from "morgan";
import rateLimit    from "express-rate-limit";
import path         from "path";

import { corsOptions }        from "./config/cors";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";

// ── Modules : routes publiques ────────────────────────────────────
import { produitPublicRouter }    from "./modules/produit/produit.routes";
import { marquePublicRouter }     from "./modules/marque/marque.routes";
import { activitePublicRouter }   from "./modules/activite/activite.routes";
import { categoriePublicRouter, marqueTreeRouter }  from "./modules/categorie/categorie.routes"; // ← ajout marqueTreeRouter
import { actualitePublicRouter }  from "./modules/actualite/actualite.routes";
import { faqPublicRouter }        from "./modules/faq/faq.routes";
import { devisPublicRouter }      from "./modules/devis/devis.routes";
import { rdvPublicRouter }        from "./modules/rdv/rdv.routes";
import { contactPublicRouter }    from "./modules/contact/contact.routes";
import { visiteurPublicRouter }   from "./modules/visiteur/visiteur.routes";

// ── Modules : routes admin ────────────────────────────────────────
import { authAdminRouter }        from "./modules/auth/auth.routes";
import { produitAdminRouter }     from "./modules/produit/produit.routes";
import { marqueAdminRouter }      from "./modules/marque/marque.routes";
import { activiteAdminRouter }    from "./modules/activite/activite.routes";
import { categorieAdminRouter }   from "./modules/categorie/categorie.routes";
import { actualiteAdminRouter }   from "./modules/actualite/actualite.routes";
import { faqAdminRouter }         from "./modules/faq/faq.routes";
import { devisAdminRouter }       from "./modules/devis/devis.routes";
import { rdvAdminRouter }         from "./modules/rdv/rdv.routes";
import { contactAdminRouter }     from "./modules/contact/contact.routes";
import { visiteurAdminRouter }    from "./modules/visiteur/visiteur.routes";
import { adminAdminRouter }       from "./modules/admin/admin.routes";
import { statsAdminRouter }       from "./modules/stats/stats.routes";
import { auditAdminRouter }       from "./modules/audit/audit.routes";
import { uploadRouter }           from "./modules/upload/upload.routes";

// ══════════════════════════════════════════════════════════════════
const app  = express();
const PORT = Number(process.env.PORT ?? 4000);

// ── Fichiers statiques uploadés ───────────────────────────────────
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ── Sécurité & parsing ────────────────────────────────────────────
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Logs HTTP (dev uniquement) ────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ── Rate limiters ─────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 min
  max:      10,
  message:  { success: false, error: "Trop de tentatives, réessayez dans 15 minutes" },
  standardHeaders: true,
  legacyHeaders:   false,
});

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      60,
  message:  { success: false, error: "Trop de requêtes" },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ══════════════════════════════════════════════════════════════════
//  ROUTES PUBLIQUES   /api/*
// ══════════════════════════════════════════════════════════════════
app.use("/api/produits",          produitPublicRouter);
app.use("/api/marques",           marquePublicRouter);
app.use("/api/marques/:slug",     marqueTreeRouter);    // ← NOUVEAU : GET /api/marques/:slug/tree
app.use("/api/activites",         activitePublicRouter);
app.use("/api/categories",        categoriePublicRouter);
app.use("/api/actualites",        actualitePublicRouter);
app.use("/api/faq",               faqPublicRouter);
app.use("/api/devis",             publicLimiter, devisPublicRouter);
app.use("/api/rdv",               publicLimiter, rdvPublicRouter);
app.use("/api/contact",           publicLimiter, contactPublicRouter);
app.use("/api/visiteurs",         visiteurPublicRouter);

// ══════════════════════════════════════════════════════════════════
//  ROUTES ADMIN       /api/admin/*
// ══════════════════════════════════════════════════════════════════
app.use("/api/admin/auth",       authLimiter,  authAdminRouter);
app.use("/api/admin/produits",   produitAdminRouter);
app.use("/api/admin/marques",    marqueAdminRouter);
app.use("/api/admin/activites",  activiteAdminRouter);
app.use("/api/admin/categories", categorieAdminRouter);
app.use("/api/admin/actualites", actualiteAdminRouter);
app.use("/api/admin/faq",        faqAdminRouter);
app.use("/api/admin/devis",      devisAdminRouter);
app.use("/api/admin/rdv",        rdvAdminRouter);
app.use("/api/admin/messages",   contactAdminRouter);
app.use("/api/admin/visiteurs",  visiteurAdminRouter);
app.use("/api/admin/admins",     adminAdminRouter);
app.use("/api/admin/stats",      statsAdminRouter);
app.use("/api/admin/audit",      auditAdminRouter);
app.use("/api/admin/upload",     uploadRouter);

// ── Health check ──────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ success: true, status: "ok", ts: new Date().toISOString(), version: "2.0.0" });
});

// ── Handlers finaux ───────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Démarrage ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Espace Vert API v2.0 — http://localhost:${PORT}\n`);
  console.log("   Routes publiques  → /api/*");
  console.log("   Routes admin      → /api/admin/*");
  console.log("   Health            → /api/health\n");
});

export default app;