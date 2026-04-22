import { unwrapOrThrow } from "@/lib/api-client";

export async function getDashboardStats() {
  return unwrapOrThrow(
    fetch("http://localhost:3000/api/admin/dashboard").then((r) => r.json())
  );
}

export async function getUsers() {
  return unwrapOrThrow(
    fetch("http://localhost:3000/api/admin/users").then((r) => r.json())
  );
}