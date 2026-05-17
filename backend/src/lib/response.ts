// src/lib/response.ts
import { Response }       from "express";
import { PaginationMeta } from "../types";

export const ok = <T>(res: Response, data: T, meta?: PaginationMeta, status = 200) =>
  res.status(status).json({ success: true, data, ...(meta && { meta }) });

export const created   = <T>(res: Response, data: T) =>
  res.status(201).json({ success: true, data });

export const noContent = (res: Response) =>
  res.status(204).send();

export const badRequest  = (res: Response, error: string) =>
  res.status(400).json({ success: false, error });

export const unauthorized = (res: Response, error = "Non autorisé") =>
  res.status(401).json({ success: false, error });

export const forbidden = (res: Response, error = "Accès refusé") =>
  res.status(403).json({ success: false, error });

export const notFound  = (res: Response, error = "Ressource introuvable") =>
  res.status(404).json({ success: false, error });

export const conflict  = (res: Response, error: string) =>
  res.status(409).json({ success: false, error });

export const serverError = (res: Response, error = "Erreur serveur") =>
  res.status(500).json({ success: false, error });

export const paginate = (total: number, page: number, limit: number): PaginationMeta => ({
  total,
  page,
  limit,
  pages: Math.ceil(total / limit),
});