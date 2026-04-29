// src/modules/upload/upload.routes.ts
// POST /api/admin/upload/image  → upload image → returns { url }
// POST /api/admin/upload/pdf    → upload PDF   → returns { url }
import { Router, Request, Response } from "express";
import multer from "multer";
import path   from "path";
import fs     from "fs";
import { authenticate } from "../../middleware/authMiddleware";
import { ok, badRequest, serverError } from "../../lib/response";

const uploadRouter = Router();
uploadRouter.use(authenticate);

// ── Dossiers de stockage ──────────────────────────────────────────
const UPLOAD_DIR_IMAGES = path.join(process.cwd(), "uploads", "images");
const UPLOAD_DIR_PDFS   = path.join(process.cwd(), "uploads", "pdfs");
[UPLOAD_DIR_IMAGES, UPLOAD_DIR_PDFS].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ── Storage images ────────────────────────────────────────────────
const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR_IMAGES),
  filename:    (_req,  file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase() || ".jpg";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});
const uploadImage = multer({
  storage: imageStorage,
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg","image/png","image/webp","image/gif","image/svg+xml"];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Format image invalide"));
  },
}).single("file");

// ── Storage PDFs ──────────────────────────────────────────────────
const pdfStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR_PDFS),
  filename:    (_req,  file, cb) => {
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`;
    cb(null, name);
  },
});
const uploadPdf = multer({
  storage: pdfStorage,
  limits:  { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    file.mimetype === "application/pdf"
      ? cb(null, true)
      : cb(new Error("Seuls les fichiers PDF sont acceptés"));
  },
}).single("file");

// ── Helper — construire l'URL publique ────────────────────────────
function fileUrl(req: Request, subdir: string, filename: string): string {
  const base = process.env.UPLOADS_BASE_URL
    ?? `${req.protocol}://${req.get("host")}`;
  return `${base}/uploads/${subdir}/${filename}`;
}

// ── POST /image ───────────────────────────────────────────────────
uploadRouter.post("/image", (req: Request, res: Response) => {
  uploadImage(req, res, (err) => {
    if (err) return badRequest(res, err.message);
    if (!req.file) return badRequest(res, "Aucun fichier reçu");
    ok(res, {
      url:      fileUrl(req, "images", req.file.filename),
      filename: req.file.filename,
      size:     req.file.size,
    });
  });
});

// ── POST /pdf ─────────────────────────────────────────────────────
uploadRouter.post("/pdf", (req: Request, res: Response) => {
  uploadPdf(req, res, (err) => {
    if (err) return badRequest(res, err.message);
    if (!req.file) return badRequest(res, "Aucun fichier reçu");
    ok(res, {
      url:      fileUrl(req, "pdfs", req.file.filename),
      filename: req.file.filename,
      size:     req.file.size,
    });
  });
});

// ── DELETE /image/:filename ───────────────────────────────────────
uploadRouter.delete("/image/:filename", (req: Request, res: Response) => {
  const filename = path.basename(req.params.filename); // sécurité
  const filepath = path.join(UPLOAD_DIR_IMAGES, filename);
  try {
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    ok(res, { deleted: filename });
  } catch { serverError(res); }
});

// ── DELETE /pdf/:filename ─────────────────────────────────────────
uploadRouter.delete("/pdf/:filename", (req: Request, res: Response) => {
  const filename = path.basename(req.params.filename);
  const filepath = path.join(UPLOAD_DIR_PDFS, filename);
  try {
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    ok(res, { deleted: filename });
  } catch { serverError(res); }
});

export { uploadRouter };
