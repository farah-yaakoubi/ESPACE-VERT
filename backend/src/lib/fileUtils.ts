// src/lib/fileUtils.ts
import fs   from "fs";
import path from "path";

export const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

/**
 * Supprime un fichier uploadé à partir de son URL publique.
 * Accepte URL absolue (http://...) ou relative (/uploads/...).
 * Retourne true si supprimé, false sinon. Ne lève jamais d'exception.
 */
export function deleteUploadedFile(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    let pathname: string;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      pathname = new URL(url).pathname;
    } else {
      pathname = url.startsWith("/") ? url : `/${url}`;
    }
    if (!pathname.startsWith("/uploads/")) return false;
    const rel  = path.normalize(pathname.replace(/^\/uploads\//, ""));
    if (rel.startsWith("..")) return false;
    const full = path.join(UPLOADS_ROOT, rel);
    if (fs.existsSync(full)) { fs.unlinkSync(full); return true; }
    return false;
  } catch { return false; }
}

export function deleteUploadedFiles(urls: (string|null|undefined)[]): number {
  return urls.filter(u => deleteUploadedFile(u)).length;
}