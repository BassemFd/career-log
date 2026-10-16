"use client";

import { createContext, useCallback, useContext } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/strings";

type LocaleContext = { locale: Locale; setLocale: (l: Locale) => void };

const Ctx = createContext<LocaleContext | null>(null);

export function useLocale() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

// The locale comes from the URL (/en or /fr), so the server already renders the
// right language and <html lang>. Switching navigates to the other URL, keeping
// the scroll position and hash, and remembers the choice in a cookie so the bare
// root (/) sends returning visitors back to it (see middleware.ts).
export default function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const setLocale = useCallback(
    (l: Locale) => {
      if (l === locale) return;
      document.cookie = `locale=${l}; path=/; max-age=31536000; samesite=lax`;
      router.push(`/${l}${window.location.search}${window.location.hash}`, { scroll: false });
    },
    [locale, router],
  );

  return <Ctx.Provider value={{ locale, setLocale }}>{children}</Ctx.Provider>;
}
