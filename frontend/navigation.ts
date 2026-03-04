import { createSharedPathnamesNavigation } from "next-intl/navigation";

export const locales = ["fr", "en", "ar"];

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales });