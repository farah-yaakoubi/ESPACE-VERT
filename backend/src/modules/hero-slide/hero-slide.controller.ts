import { Request, Response } from "express";
import * as svc from "./hero-slide.service";
import { HERO_PAGES, type HeroPage } from "./hero-slide.repository";

/** GET /api/hero-slides?page=home  — public */
export const listPublic = async (req: Request, res: Response) => {
  try {
    const page = (req.query.page as HeroPage) || "home";
    res.json(await svc.listActifs(page));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
};

/** GET /api/admin/hero-slides?page=home  — admin (tous) */
export const list = async (req: Request, res: Response) => {
  try {
    const page = req.query.page as HeroPage | undefined;
    res.json(await svc.list(page));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
};

/** GET /api/admin/hero-slides/pages  — liste des pages disponibles */
export const listPages = async (_: Request, res: Response) => {
  res.json(HERO_PAGES);
};

export const getById = async (req: Request, res: Response) => {
  try {
    const slide = await svc.getById(Number(req.params.id));
    if (!slide) return res.status(404).json({ error: "Slide introuvable" });
    res.json(slide);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
};

export const create = async (req: Request, res: Response) => {
  try { res.status(201).json(await svc.create(req.body)); }
  catch (e: any) { res.status(400).json({ error: e.message }); }
};

export const update = async (req: Request, res: Response) => {
  try { res.json(await svc.update(Number(req.params.id), req.body)); }
  catch (e: any) { res.status(400).json({ error: e.message }); }
};

export const remove = async (req: Request, res: Response) => {
  try { await svc.remove(Number(req.params.id)); res.status(204).send(); }
  catch (e: any) { res.status(400).json({ error: e.message }); }
};

export const reorder = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body as { ids: number[] };
    await svc.reorder(ids);
    res.json({ ok: true });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
};