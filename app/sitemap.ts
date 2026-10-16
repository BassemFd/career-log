import type { MetadataRoute } from "next";
import { LOCALES, SITE_URL } from "@/lib/strings";

// One entry per locale, each listing the other as its translation.
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}`]));
  return LOCALES.map((l) => ({
    url: `${SITE_URL}/${l}`,
    alternates: { languages },
  }));
}
