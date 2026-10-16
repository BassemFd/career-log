import { NextResponse, type NextRequest } from "next/server";
import { isLocale, type Locale } from "@/lib/strings";

// The bare root has no content of its own: it redirects to /en or /fr. A choice
// made with the language toggle (cookie) wins, then the browser's preferred
// language; English is the fallback. Search engines get the same answer every
// time for a given header, and find both versions through hreflang anyway.
function preferredLocale(req: NextRequest): Locale {
  const saved = req.cookies.get("locale")?.value;
  if (saved && isLocale(saved)) return saved;
  const accept = req.headers.get("accept-language") ?? "";
  const first = accept.split(",")[0]?.trim().toLowerCase() ?? "";
  return first.startsWith("fr") ? "fr" : "en";
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = `/${preferredLocale(req)}`;
  const res = NextResponse.redirect(url, 307);
  res.headers.set("Vary", "Accept-Language, Cookie");
  return res;
}

export const config = { matcher: "/" };
