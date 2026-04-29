import { Request, Response } from "express";
import { upload, fileUrl } from "../../middleware/upload";
import { ok, badRequest, serverError } from "../../lib/response";

export const uploadFile = [
  upload.single("file"),
  (req: Request, res: Response) => {
    try {
      if (!req.file) return badRequest(res, "Aucun fichier reçu.");
      ok(res, {
        url:      fileUrl(req, req.file.filename),
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size:     req.file.size,
      });
    } catch { serverError(res); }
  },
];
