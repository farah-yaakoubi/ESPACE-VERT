
import { PaginationMeta } from "../types";
export const paginate = (
  total: number,
  page:  number,
  limit: number,
): PaginationMeta => ({
  total,
  page,
  limit,
  pages: Math.ceil(total / limit),
});
