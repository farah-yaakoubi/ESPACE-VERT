// src/modules/auth/auth.controller.ts
import { Request, Response } from "express";
import { authService } from "./auth.service";
import { LoginSchema, RefreshSchema, ChangePasswordSchema } from "./auth.schema";
import { ok, created, badRequest, unauthorized, serverError } from "../../lib/response";

const handle = (res: Response, err: unknown) => {
  const e = err as any;
  if (e?.status === 401) return unauthorized(res, e.message);
  if (e?.status === 400) return badRequest(res, e.message);
  if (e?.name === "ZodError") return badRequest(res, JSON.stringify(e.errors));
  console.error("[auth.controller]", err);
  return serverError(res);
};

export const login = async (req: Request, res: Response) => {
  try {
    const dto  = LoginSchema.parse(req.body);
    const ip   = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.ip;
    const data = await authService.login(dto, ip, req.headers["user-agent"]);
    ok(res, data);
  } catch (e) { handle(res, e); }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const dto  = RefreshSchema.parse(req.body);
    const data = await authService.refresh(dto);
    ok(res, data);
  } catch (e) { handle(res, e); }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) return badRequest(res, "refresh_token requis");
    await authService.logout(refresh_token, req.admin!.id_admin);
    ok(res, { message: "Déconnexion réussie" });
  } catch (e) { handle(res, e); }
};

export const me = async (req: Request, res: Response) => {
  try {
    const data = await authService.me(req.admin!.id_admin);
    ok(res, data);
  } catch (e) { handle(res, e); }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const dto = ChangePasswordSchema.parse(req.body);
    await authService.changePassword(req.admin!.id_admin, dto);
    ok(res, { message: "Mot de passe modifié. Reconnectez-vous." });
  } catch (e) { handle(res, e); }
};
