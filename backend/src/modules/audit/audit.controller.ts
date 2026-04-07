// src/modules/audit/audit.controller.ts
import { Request, Response } from "express";
import { auditService } from "./audit.service";
import { AuditQuerySchema } from "./audit.schema";
import { ok, badRequest, serverError } from "../../lib/response";

export const list = async (req: Request, res: Response) => {
  try {
    const q = AuditQuerySchema.parse(req.query);
    const r = await auditService.list(q);
    ok(res, r.data, r.meta);
  } catch (err) {
    const e = err as any;
    if (e?.name === "ZodError") return badRequest(res, JSON.stringify(e.errors));
    console.error("[audit.controller]", err);
    serverError(res);
  }
};
