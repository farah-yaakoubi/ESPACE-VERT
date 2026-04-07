// src/modules/audit/audit.service.ts
import { auditRepository } from "./audit.repository";
import { paginate } from "../../lib/response";
import { AuditQueryDto } from "./audit.schema";

export const auditService = {
  async list(params: AuditQueryDto) {
    const { logs, total } = await auditRepository.findAll(params);
    return { data: logs, meta: paginate(total, params.page, params.limit) };
  },
};
