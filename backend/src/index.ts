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
import { notifRouter }            from "./modules/notifications/notifications.routes";
import { chatRouter }             from "./modules/chat/chat.routes";
import { heroSlidePublicRouter, heroSlideAdminRouter } from "./modules/hero-slide/hero-slide.routes";

// ── ✅ AJOUT : Route chatbot public ───────────────────────────────────────────
import { aiRouter }               from "./modules/ai/ai.routes";

const app  = express();
const PORT = process.env.PORT ?? 4000;

app.set("trust proxy", 1);

// ── Fichiers statiques uploads ────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ── Middlewares ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { error: "Trop de soumissions, veuillez réessayer dans quelques minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS",
});

// ── Routes publiques ──────────────────────────────────────────────────────────
app.use("/api/produits",          produitPublicRouter);
app.use("/api/marques",           marquePublicRouter);
app.use("/api/marques/:slug",     marqueTreeRouter);
app.use("/api/activites",         activitePublicRouter);
app.use("/api/categories",        categoriePublicRouter);
app.use("/api/actualites",        actualitePublicRouter);
app.use("/api/faq",               faqPublicRouter);
app.use("/api/devis",             submissionLimiter, devisPublicRouter);
app.use("/api/rdv",               submissionLimiter, rdvPublicRouter);
app.use("/api/contact",           submissionLimiter, contactPublicRouter);
app.use("/api/visiteurs",         visiteurPublicRouter);
app.use("/api/hero-slides",       heroSlidePublicRouter);

// ── ✅ AJOUT : Chatbot public ─────────────────────────────────────────────────
app.use("/api/ai",                aiRouter);

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
app.use("/api/admin/contact",     contactAdminRouter);
app.use("/api/admin/visiteurs",   visiteurAdminRouter);
app.use("/api/admin/admins",      adminAdminRouter);
app.use("/api/admin/stats",       statsAdminRouter);
app.use("/api/admin/audit",       auditAdminRouter);
app.use("/api/admin/uploads",     uploadRouter);
app.use("/api/admin/upload",      uploadRouter);
app.use("/api/admin/notifications", notifRouter);
app.use("/api/admin/chat",        chatRouter);
app.use("/api/admin/hero-slides", heroSlideAdminRouter);

// ── Fallback ──────────────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Espace Vert API démarrée sur le port ${PORT}`);
});

export default app;