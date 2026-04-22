// src/lib/api-client.ts
import type { ApiResponse, ApiSuccess } from "@/types/api";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface NextFetchRequestConfig {
  revalidate?: number | false;
  tags?: string[];
}

async function request<T>(
  path: string,
  init: RequestInit & { next?: NextFetchRequestConfig } = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  const { next, ...fetchInit } = init;
  try {
    const res  = await fetch(url, {
      ...fetchInit,
      headers,
      ...(next !== undefined ? { next } : {}),
    });
    const json = (await res.json()) as ApiResponse<T>;
    return json;
  } catch {
    return { success: false, error: "Impossible de contacter le serveur." };
  }
}

export function get<T>(
  path: string,
  next?: NextFetchRequestConfig
): Promise<ApiResponse<T>> {
  return request<T>(path, { method: "GET", next });
}

export function post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  return request<T>(path, {
    method: "POST",
    body:   JSON.stringify(body),
    cache:  "no-store",
  });
}

export async function unwrapOrThrow<T>(p: Promise<ApiResponse<T>>): Promise<T> {
  const res = await p;
  if (!res.success) throw new Error(res.error);
  // Cast to ApiSuccess<T> after the guard — data is guaranteed to be T
  return (res as ApiSuccess<T>).data;
}