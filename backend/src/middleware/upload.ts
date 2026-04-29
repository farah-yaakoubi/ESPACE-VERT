// src/middleware/upload.ts
// Upload local vers /uploads/ + sert en statique via /uploads/*
import multer   from "multer";
import path     from "path";
import fs       from "fs";
import crypto   from "crypto";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
const MAX_MB  = 8;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename:    (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = crypto.randomBytes(12).toString("hex");
    cb(null, `${name}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits:     { fileSize: MAX_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`Type non supporté. Acceptés: JPG, PNG, WEBP, GIF, PDF`));
  },
});

/** URL publique du fichier uploadé */
export function fileUrl(req: any, filename: string): string {
  const proto = req.headers["x-forwarded-proto"] ?? req.protocol;
  const host  = req.headers["x-forwarded-host"]  ?? req.get("host");
  return `${proto}://${host}/uploads/${filename}`;
}
