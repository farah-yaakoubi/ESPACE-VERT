import { Request, Response } from "express";
import { badRequest, created, notFound, ok, serverError } from "../../lib/response";
import { tutorialVideoService } from "./tutorial-video.service";
import { TutorialVideoQuerySchema, TutorialVideoSchema, UpdateTutorialVideoSchema } from "./tutorial-video.schema";

const parseId = (p: string) => {
  const n = Number(p);
  return Number.isNaN(n) ? null : n;
};

const handle = (res: Response, err: unknown) => {
  const e = err as any;
  if (e?.status === 404) return notFound(res, e.message);
  if (e?.name === "ZodError") return badRequest(res, JSON.stringify(e.errors));
  console.error("[tutorial-video.controller]", err);
  return serverError(res);
};

export const listPublic = async (req: Request, res: Response) => {
  try {
    const page = typeof req.query.page === "string" ? req.query.page : "pulvert";
    ok(res, await tutorialVideoService.listPublic(page));
  } catch (e) {
    handle(res, e);
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    ok(res, await tutorialVideoService.list(TutorialVideoQuerySchema.parse(req.query)));
  } catch (e) {
    handle(res, e);
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return badRequest(res, "ID invalide");
    ok(res, await tutorialVideoService.getById(id));
  } catch (e) {
    handle(res, e);
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    created(res, await tutorialVideoService.create(TutorialVideoSchema.parse(req.body), req.admin!.id_admin));
  } catch (e) {
    handle(res, e);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return badRequest(res, "ID invalide");
    ok(res, await tutorialVideoService.update(id, UpdateTutorialVideoSchema.parse(req.body), req.admin!.id_admin));
  } catch (e) {
    handle(res, e);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return badRequest(res, "ID invalide");
    await tutorialVideoService.delete(id, req.admin!.id_admin);
    ok(res, { message: "Vidéo supprimée" });
  } catch (e) {
    handle(res, e);
  }
};
