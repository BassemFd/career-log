import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/strings";
import { SITE_URL } from "@/lib/site";

// One entry per locale, each listing the other as its translation.
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}`]));
  return LOCALES.map((l) => ({
    url: `${SITE_URL}/${l}`,
    changeFrequency: "weekly",
    priority: 1,
    alternates: { languages },
  }));
}
