// src/modules/audit/audit.repository.ts
import { prisma } from "../../lib/prisma";
import { AuditQueryDto } from "./audit.schema";

export const auditRepository = {

  async findAll(params: AuditQueryDto) {
    const { page, limit, entity_name, action, id_admin } = params;
    const where: any = {};
    if (entity_name) where.entity_name = entity_name;
    if (action)      where.action      = action;
    if (id_admin)    where.id_admin    = id_admin;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: { date_action: "desc" },
        include: { admin: { select: { nom: true, email: true } } },
      }),
    ]);
    return { logs, total };
  },
};
