export function getActivityHrefBySlug(slug: string) {
  switch (slug) {
    case "fertilisation":
      return "/marques/fertivert";
    case "pulverisation":
      return "/marques/pulvert";
    default:
      return `/activites/${slug}`;
  }
}
