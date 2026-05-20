export function normalizePermissions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        : [];
    } catch {
      return [];
    }
  }

  return [];
}

export function mergePermissions(rolePermissions: unknown, adminPermissions: unknown): string[] {
  return Array.from(new Set([
    ...normalizePermissions(rolePermissions),
    ...normalizePermissions(adminPermissions),
  ]));
}
