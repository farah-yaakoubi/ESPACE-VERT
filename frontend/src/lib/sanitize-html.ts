/**
 * Sanitizer léger pour les descriptions produits saisies avec l'éditeur
 * riche de l'admin (`@/components/admin/RichTextEditor`).
 *
 * Ne dépend d'aucune librairie externe : on retire les balises et
 * attributs dangereux (scripts, iframes, gestionnaires d'événements,
 * `javascript:`) et on ne garde qu'une liste blanche d'attributs de
 * style autorisés sur les balises de mise en forme (couleur, taille,
 * police, alignement). Fonctionne aussi bien côté serveur (RSC) que
 * client, sans DOM.
 */

const ALLOWED_TAGS = new Set([
  "b", "strong", "i", "em", "u", "s", "strike", "span", "font",
  "p", "div", "br", "ul", "ol", "li", "a",
]);

const ALLOWED_STYLE_PROPS = new Set([
  "color", "background-color", "font-size", "font-family",
  "text-align", "font-weight", "font-style", "text-decoration",
]);

function sanitizeStyleAttr(styleValue: string): string {
  return styleValue
    .split(";")
    .map((decl) => decl.trim())
    .filter(Boolean)
    .filter((decl) => {
      const prop = decl.split(":")[0]?.trim().toLowerCase();
      return prop && ALLOWED_STYLE_PROPS.has(prop);
    })
    .filter((decl) => !/url\s*\(|expression\s*\(|javascript:/i.test(decl))
    .join("; ");
}

function sanitizeAttrs(tag: string, attrString: string): string {
  const attrs: string[] = [];
  const attrRegex = /([a-zA-Z-]+)\s*=\s*"([^"]*)"|([a-zA-Z-]+)\s*=\s*'([^']*)'/g;
  let m: RegExpExecArray | null;
  while ((m = attrRegex.exec(attrString))) {
    const name = (m[1] || m[3] || "").toLowerCase();
    const rawValue = m[2] ?? m[4] ?? "";
    if (name.startsWith("on")) continue; // onclick, onerror, …
    if (name === "style") {
      const clean = sanitizeStyleAttr(rawValue);
      if (clean) attrs.push(`style="${clean}"`);
      continue;
    }
    if (tag === "a" && name === "href") {
      if (/^\s*javascript:/i.test(rawValue)) continue;
      attrs.push(`href="${rawValue}" target="_blank" rel="noopener noreferrer"`);
      continue;
    }
    if (tag === "font" && (name === "color" || name === "size" || name === "face")) {
      attrs.push(`${name}="${rawValue}"`);
    }
  }
  return attrs.length ? " " + attrs.join(" ") : "";
}

/** Nettoie un fragment HTML produit par l'éditeur riche avant affichage public. */
export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return "";

  // Retire d'emblée les balises intrinsèquement dangereuses (et leur
  // contenu) : <script>, <style>, <iframe>, <object>, <embed>, <link>, <meta>.
  let html = input.replace(
    /<\/?(script|style|iframe|object|embed|link|meta|form|input|button)\b[^>]*>/gi,
    ""
  );

  html = html.replace(/<!--([\s\S]*?)-->/g, "");

  // Reconstruit chaque balise restante en ne gardant que la liste blanche.
  html = html.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (full, rawTag: string, attrString: string) => {
    const tag = rawTag.toLowerCase();
    const isClosing = full.startsWith("</");
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (isClosing) return `</${tag}>`;
    const selfClosing = tag === "br";
    const attrs = sanitizeAttrs(tag, attrString);
    return selfClosing ? `<br/>` : `<${tag}${attrs}>`;
  });

  return html.trim();
}

/**
 * Retire toutes les balises HTML d'une description enrichie, pour les
 * usages où seul du texte brut a du sens (aperçus de carte produit,
 * balises meta SEO, exports…).
 */
export function stripHtml(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/<(br|\/p|\/div|\/li)\s*\/?>(?!$)/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
/**
 * Convertit une ancienne description texte brut (sans balises) en HTML
 * équivalent, pour garder l'affichage identique (retours à la ligne) après
 * l'introduction de l'éditeur riche. Si le contenu contient déjà des
 * balises HTML, il est retourné tel quel (sera nettoyé par `sanitizeHtml`).
 */
export function toDisplayHtml(input: string | null | undefined): string {
  if (!input) return "";
  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(input);
  if (looksLikeHtml) return sanitizeHtml(input);
  const escaped = input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(/\n/g, "<br/>");
}