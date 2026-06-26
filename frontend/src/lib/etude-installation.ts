export function normalizeEtudeInstallationText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function isEtudeInstallationCategory(input: {
  nom?: string | null;
  slug?: string | null;
}) {
  const label = normalizeEtudeInstallationText(`${input.nom ?? ""} ${input.slug ?? ""}`);
  return label.includes("etude") && label.includes("installation");
}

export function getEtudeInstallationHref(activitySlug: string) {
  return `/activites/${activitySlug}/etude-installation`;
}
