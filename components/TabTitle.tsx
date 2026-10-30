"use client";

import { useEffect } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { startTabTitle } from "@/lib/tab-title";

// Small wink in the browser tab when the visitor switches away (see
// lib/tab-title.ts). Renders nothing; the favicon gets a dot while away.
const FAVICON = "/favicon.svg";
const AWAY_FAVICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#1F4BFF"/><text x="16" y="22" text-anchor="middle" font-family="ui-monospace, monospace" font-size="15" font-weight="600" fill="#F6F7F9">BF</text><circle cx="26" cy="6" r="5" fill="#FF4B4B"/></svg>',
  );

export function TabTitle() {
  const { locale } = useLocale();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const icon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    const normalHref = icon?.getAttribute("href") ?? FAVICON;
    const stop = startTabTitle({
      doc: document,
      locale,
      reducedMotion: reduced,
      onAwayChange: (away) => icon?.setAttribute("href", away ? AWAY_FAVICON : normalHref),
    });
    return () => {
      stop();
      icon?.setAttribute("href", normalHref);
    };
  }, [locale]);

  return null;
}
