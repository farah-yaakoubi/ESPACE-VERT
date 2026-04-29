// src/modules/produit/produit.controller.ts
// HTTP in/out uniquement — parse req, appelle service, envoie res
import { Request, Response } from "express";
import multer from "multer";
import path   from "path";
import fs     from "fs";
import { produitService } from "./produit.service";
import {
  CreateProduitSchema, UpdateProduitSchema,
  ProduitQuerySchema, ProduitPublicQuerySchema, AddImageSchema,
} from "./produit.schema";
import { ok, created, badRequest, notFound, conflict, serverError } from "../../lib/response";

// ── Multer pour images de catalogue ──────────────────────────────
const UPLOAD_DIR_IMAGES = path.join(process.cwd(), "uploads", "images");
const UPLOAD_DIR_PDFS   = path.join(process.cwd(), "uploads", "pdfs");
[UPLOAD_DIR_IMAGES, UPLOAD_DIR_PDFS].forEach(d => fs.mkdirSync(d, { recursive: true }));

const imageUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR_IMAGES),
    filename:    (_req,  file, cb) => {
      const ext  = path.extname(file.originalname).toLowerCase() || ".jpg";
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    ["image/jpeg","image/png","image/webp","image/gif","image/svg+xml"].includes(file.mimetype)
      ? cb(null, true) : cb(new Error("Format image invalide"));
  },
}).single("file");

const pdfUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR_PDFS),
    filename:    (_req, _file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`),
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    file.mimetype === "application/pdf" ? cb(null, true) : cb(new Error("PDF uniquement"));
  },
}).single("file");

function fileUrl(req: Request, subdir: string, filename: string): string {
  const base = process.env.UPLOADS_BASE_URL ?? `${req.protocol}://${req.get("host")}`;
  return `${base}/uploads/${subdir}/${filename}`;
}

// ── Helpers ────────────────────────────────────────────────────
const parseId = (param: string) => {
  const n = Number(param);
  return isNaN(n) ? null : n;
};

const handleError = (res: Response, err: unknown) => {
  const e = err as any;
  if (e?.status === 404)       return notFound(res,    e.message);
  if (e?.status === 409)       return conflict(res,    e.message);
  if (e?.status === 400)       return badRequest(res,  e.message);
  console.error("[Controller]", err);
  return serverError(res);
};

// ══════════════════════════════════════════════════════════════
// PUBLIC
// ══════════════════════════════════════════════════════════════
export const listPublic = async (req: Request, res: Response) => {
  try {
    const params = ProduitPublicQuerySchema.parse(req.query);
    const result = await produitService.listPublic(params);
    ok(res, result.data, result.meta);
  } catch (err) { handleError(res, err); }
};

export const getBySlugPublic = async (req: Request, res: Response) => {
  try {
    const data = await produitService.getBySlugPublic(req.params.slug);
    ok(res, data);
  } catch (err) { handleError(res, err); }
};

// ══════════════════════════════════════════════════════════════
// ADMIN
// ══════════════════════════════════════════════════════════════
export const list = async (req: Request, res: Response) => {
  try {
    const params = ProduitQuerySchema.parse(req.query);
    const result = await produitService.list(params);
    ok(res, result.data, result.meta);
  } catch (err) { handleError(res, err); }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return badRequest(res, "ID invalide");
    const data = await produitService.getById(id);
    ok(res, data);
  } catch (err) { handleError(res, err); }
};

export const create = async (req: Request, res: Response) => {
  try {
    const dto  = CreateProduitSchema.parse(req.body);
    const data = await produitService.create(dto, req.admin!.id_admin);
    created(res, data);
  } catch (err) {
    if ((err as any)?.name === "ZodError") return badRequest(res, JSON.stringify((err as any).errors));
    handleError(res, err);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id  = parseId(req.params.id);
    if (!id) return badRequest(res, "ID invalide");
    const dto  = UpdateProduitSchema.parse(req.body);
    const data = await produitService.update(id, dto, req.admin!.id_admin);
    ok(res, data);
  } catch (err) {
    if ((err as any)?.name === "ZodError") return badRequest(res, JSON.stringify((err as any).errors));
    handleError(res, err);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return badRequest(res, "ID invalide");
    await produitService.delete(id, req.admin!.id_admin);
    ok(res, { message: "Produit supprimé" });
  } catch (err) { handleError(res, err); }
};

export const addImage = async (req: Request, res: Response) => {
  try {
    const id  = parseId(req.params.id);
    if (!id) return badRequest(res, "ID invalide");
    const dto  = AddImageSchema.parse(req.body);
    const data = await produitService.addImage(id, dto, req.admin!.id_admin);
    created(res, data);
  } catch (err) {
    if ((err as any)?.name === "ZodError") return badRequest(res, JSON.stringify((err as any).errors));
    handleError(res, err);
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const imgId = parseId(req.params.imgId);
    if (!imgId) return badRequest(res, "ID image invalide");
    await produitService.deleteImage(imgId, req.admin!.id_admin);
    ok(res, { message: "Image supprimée" });
  } catch (err) { handleError(res, err); }
};

export const updateImageHandler = async (req: Request, res: Response) => {
  try {
    const id    = parseId(req.params.id);
    const imgId = parseId(req.params.imgId);
    if (!id || !imgId) return badRequest(res, "ID invalide");
    // Si is_principale, utilise setPrincipale pour bien remettre les autres à false
    if (req.body.is_principale === true) {
      const data = await produitService.setPrincipale(id, imgId, req.admin!.id_admin);
      return ok(res, data);
    }
    const data = await produitService.updateImage(imgId, req.body, req.admin!.id_admin);
    ok(res, data);
  } catch (err) { handleError(res, err); }
};

// ── Upload image fichier local → catalogue ────────────────────────
export const uploadImageFile = (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) return badRequest(res, "ID invalide");

  imageUpload(req, res, async (err) => {
    if (err) return badRequest(res, err.message);
    if (!req.file) return badRequest(res, "Aucun fichier reçu");
    try {
      const url  = fileUrl(req, "images", req.file.filename);
      const alt  = (req.body?.alt  as string) || null;
      const isPrinc = req.body?.is_principale === "true";
      const data = await produitService.addImage(id, {
        url, alt, ordre: 0, is_principale: isPrinc,
      }, req.admin!.id_admin);
      created(res, data);
    } catch (e) { handleError(res, e); }
  });
};

// ── Upload PDF fiche technique ────────────────────────────────────
export const uploadFicheTechnique = (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) return badRequest(res, "ID invalide");

  pdfUpload(req, res, async (err) => {
    if (err) return badRequest(res, err.message);
    if (!req.file) return badRequest(res, "Aucun fichier reçu");
    try {
      const url  = fileUrl(req, "pdfs", req.file.filename);
      const data = await produitService.update(id, { fiche_technique: url }, req.admin!.id_admin);
      ok(res, { url, produit: data });
    } catch (e) { handleError(res, e); }
  });
};
