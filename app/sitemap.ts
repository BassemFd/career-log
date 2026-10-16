import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// One page, both locales on the same URL (the language switch is client-side).
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, changeFrequency: "weekly", priority: 1 }];
}
