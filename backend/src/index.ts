// src/index.ts
// REMPLACE l'ancien fichier — ajoute les routes notifications et chat
import "dotenv/config";
import express      from "express";
import cors         from "cors";
import helmet       from "helmet";
import morgan       from "morgan";
import rateLimit    from "express-rate-limit";
import path         from "path";

import { corsOptions }                        from "./config/cors";
import { notFoundHandler, errorHandler }      from "./middleware/errorHandler";

// ── Routes publiques ──────────────────────────────────────────────────────────
import { produitPublicRouter }    from "./modules/produit/produit.routes";
import { marquePublicRouter }     from "./modules/marque/marque.routes";
import { activitePublicRouter }   from "./modules/activite/activite.routes";
import { categoriePublicRouter, marqueTreeRouter } from "./modules/categorie/categorie.routes";
import { actualitePublicRouter }  from "./modules/actualite/actualite.routes";
import { faqPublicRouter }        from "./modules/faq/faq.routes";
import { devisPublicRouter }      from "./modules/devis/devis.routes";
import { rdvPublicRouter }        from "./modules/rdv/rdv.routes";
import { contactPublicRouter }    from "./modules/contact/contact.routes";
import { visiteurPublicRouter }   from "./modules/visiteur/visiteur.routes";

// ── Routes admin ──────────────────────────────────────────────────────────────
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
// ── NOUVEAU ───────────────────────────────────────────────────────────────────
import { notifRouter }            from "./modules/notifications/notifications.routes";
import { chatRouter }             from "./modules/chat/chat.routes"; 

const app  = express();
const PORT = process.env.PORT ?? 4000;

app.set("trust proxy", 1);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ── Middlewares ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: "Trop de requêtes" });

// ── Routes publiques ──────────────────────────────────────────────────────────
app.use("/api/produits",          produitPublicRouter);
app.use("/api/marques",           marquePublicRouter);
app.use("/api/marques/:slug",     marqueTreeRouter);
app.use("/api/activites",         activitePublicRouter);
app.use("/api/categories",        categoriePublicRouter);
app.use("/api/actualites",        actualitePublicRouter);
app.use("/api/faq",               faqPublicRouter);
app.use("/api/devis",             publicLimiter, devisPublicRouter);
app.use("/api/rdv",               publicLimiter, rdvPublicRouter);
app.use("/api/contact",           publicLimiter, contactPublicRouter);
app.use("/api/visiteurs",         visiteurPublicRouter);

// ── Routes admin ──────────────────────────────────────────────────────────────
app.use("/api/admin/auth",        authAdminRouter);
app.use("/api/admin/produits",    produitAdminRouter);
app.use("/api/admin/marques",     marqueAdminRouter);
app.use("/api/admin/activites",   activiteAdminRouter);
app.use("/api/admin/categories",  categorieAdminRouter);
app.use("/api/admin/actualites",  actualiteAdminRouter);
app.use("/api/admin/faq",         faqAdminRouter);
app.use("/api/admin/devis",       devisAdminRouter);
app.use("/api/admin/rdv",         rdvAdminRouter);
app.use("/api/admin/messages",    contactAdminRouter);
app.use("/api/admin/visiteurs",   visiteurAdminRouter);
app.use("/api/admin/admins",      adminAdminRouter);
app.use("/api/admin/stats",       statsAdminRouter);
app.use("/api/admin/audit",       auditAdminRouter);
app.use("/api/admin/upload",      uploadRouter);
// ── NOUVEAU ───────────────────────────────────────────────────────────────────
app.use("/api/admin/notifications", notifRouter);
app.use("/api/admin/chat",          chatRouter);

// ── Error handlers ────────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => console.log(`✅  API EspaceVert démarrée sur le port ${PORT}`));
