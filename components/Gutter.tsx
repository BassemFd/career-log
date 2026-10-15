"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useTheme, type Theme } from "./ThemeProvider";
import { useLocale } from "./LocaleProvider";
import { contentByLocale } from "@/lib/content";
import { STRINGS, type Locale } from "@/lib/strings";

const THEMES: { id: Theme; label: string }[] = [
  { id: "light", label: "lgt" },
  { id: "dark", label: "drk" },
  { id: "crazy", label: "???" },
];

// Terminal-styled theme switch — mono, muted until active. "???" is the hidden
// crazy-mode easter egg; picking it plays the vortex before the palette lands.
// While crazy is active, "lgt"/"drk" grow and glow — they're the only way
// out, and the gutter itself sits above every chaos layer so they stay
// clickable and calm.
// `large` = the mobile sheet's version: 44px tap targets instead of 24px.
const toggleSize = (large: boolean) => (large ? "px-2 py-3 text-sm" : "px-1.5 py-1");

function ThemeToggle({ t, large = false }: { t: (typeof STRINGS)["en"]; large?: boolean }) {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex items-center gap-1.5 font-mono text-xs">
      <span className="text-gutter-muted">{t.themeLabel}</span>
      {THEMES.map((th) => {
        const isExit = theme === "crazy" && th.id !== "crazy";
        const isActive = theme === th.id;
        return (
          <button
            key={th.id}
            onClick={() => setTheme(th.id)}
            aria-pressed={isActive}
            className={
              isExit
                ? "exit-glow rounded px-2.5 py-1 text-base font-bold text-white"
                : isActive
                ? `rounded ${toggleSize(large)} text-gutter-accent`
                : `rounded ${toggleSize(large)} text-gutter-muted transition-colors hover:text-white`
            }
          >
            {th.label}
          </button>
        );
      })}
    </div>
  );
}

const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "en" },
  { id: "fr", label: "fr" },
];

function LangToggle({ t, large = false }: { t: (typeof STRINGS)["en"]; large?: boolean }) {
  const { locale, setLocale } = useLocale();
  return (
    <div className="mt-1 flex items-center gap-1.5 font-mono text-xs">
      <span className="text-gutter-muted">{t.langLabel}</span>
      {LOCALES.map((l) => (
        <button
          key={l.id}
          onClick={() => setLocale(l.id)}
          aria-pressed={locale === l.id}
          className={
            locale === l.id
              ? `rounded ${toggleSize(large)} text-gutter-accent`
              : `rounded ${toggleSize(large)} text-gutter-muted transition-colors hover:text-white`
          }
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

type Route = { cmd: string; alias: string[]; id: string; number: string };

const ROUTES: Route[] = [
  { cmd: "log", alias: ["releases", "experience"], id: "experience", number: "00" },
  { cmd: "shortlog", alias: ["stats"], id: "stats", number: "01" },
  { cmd: "ls", alias: ["work", "projects"], id: "work", number: "02" },
  { cmd: "formation", alias: ["education", "certs"], id: "formation", number: "03" },
];

// The gutter is the page's line-number column: a persistent index of the
// sections in order, plus the command prompt that actually drives navigation.
// On narrow screens it collapses to a floating "$" button that opens the same
// prompt in a bottom sheet (a permanent bar cost 15% of every phone screen).
export default function Gutter() {
  const { theme, setTheme } = useTheme();
  const { locale } = useLocale();
  const t = STRINGS[locale];
  const profile = contentByLocale[locale].profile;

  const routeLabels: Record<string, string> = {
    experience: t.sectionReleases,
    stats: t.sectionShortlog,
    work: t.sectionWorklog,
    formation: t.sectionFormation,
  };

  const [input, setInput] = useState("");
  const [output, setOutput] = useState(t.typeHelp);
  const [urgent, setUrgent] = useState(false);
  // The whole terminal area is a click target, not just the bare input.
  // The prompt renders twice (desktop sidebar + mobile bar), so each copy gets
  // its own ref — a shared one would point at whichever mounted last.
  const desktopInput = useRef<HTMLInputElement>(null);
  const mobileInput = useRef<HTMLInputElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheetOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  function run(raw: string) {
    const line = raw.trim().toLowerCase();
    if (!line) return;
    setUrgent(false);

    if (line === "help") {
      if (theme === "crazy") {
        setUrgent(true);
        setOutput(t.crazyHelp);
        return;
      }
      setOutput(t.help);
      return;
    }
    if (line === "clear") return setOutput("");
    if (line === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return setOutput(t.topFeedback);
    }
    if (line === "whoami") return setOutput(profile.summary);

    const openMatch = line.match(/^open (github|linkedin|email)$/);
    if (openMatch) {
      const key = openMatch[1] as "github" | "linkedin" | "email";
      const url =
        key === "email" ? `mailto:${profile.socials.email}` : profile.socials[key];
      window.open(url, "_blank");
      return setOutput(t.openingFeedback(key));
    }

    const route = ROUTES.find((r) => r.cmd === line || r.alias.includes(line));
    if (route) {
      goTo(route);
      return;
    }

    setOutput(t.commandNotFound(raw));
  }

  function goTo(route: Route) {
    document.getElementById(route.id)?.scrollIntoView({ behavior: "smooth" });
    setOutput(t.goToFeedback(routeLabels[route.id]));
    setSheetOpen(false); // on mobile, get out of the way so the section shows
  }

  const outputClass = urgent
    ? "animate-pulse font-mono text-xs font-bold text-manual"
    : "font-mono text-xs leading-relaxed text-white/70";

  const prompt = (inputRef: RefObject<HTMLInputElement | null>) => (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex min-w-0 flex-1 cursor-text items-center gap-2 font-mono text-sm"
    >
      <span className="text-gutter-accent">$</span>
      <input
        ref={inputRef}
        aria-label="terminal"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          run(input);
          setInput("");
        }}
        placeholder="help"
        spellCheck={false}
        className="w-full min-w-0 bg-transparent text-white caret-gutter-accent outline-none placeholder:text-white/40"
      />
    </div>
  );

  return (
    <>
      {/* Desktop: sticky sidebar, the file's real line-number index */}
      <aside className="hidden shrink-0 lg:sticky lg:top-0 lg:z-[70] lg:flex lg:h-screen lg:w-72 lg:flex-col lg:justify-between lg:border-r lg:border-gutter-line lg:bg-gutter lg:px-6 lg:py-8">
        <div>
          <nav className="flex flex-col gap-1">
            {ROUTES.map((r) => (
              <button
                key={r.id}
                onClick={() => goTo(r)}
                className="group flex items-baseline gap-3 rounded px-2 py-1.5 text-left transition-colors hover:bg-white/5"
              >
                <span className="font-mono text-xs text-gutter-accent">{r.number}</span>
                <span className="font-display text-sm text-white/70 group-hover:text-white">
                  {routeLabels[r.id]}
                </span>
              </button>
            ))}
          </nav>

          {/* Terminal window — same chrome as the hero's git-log card, right under
              the nav where the eye already is, so it reads as something to use. */}
          <div
            onClick={() => desktopInput.current?.focus()}
            className="mt-8 cursor-text overflow-hidden rounded-lg border border-gutter-accent/60 bg-white/5 transition-colors hover:border-gutter-accent focus-within:border-gutter-accent"
          >
            <div className="flex items-center gap-1.5 border-b border-gutter-line px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-white/20" />
              <span className="h-2 w-2 rounded-full bg-white/20" />
              <span className="h-2 w-2 rounded-full bg-white/20" />
              <span className="ml-2 font-mono text-xs text-gutter-muted">~/career-log</span>
            </div>
            <div className="px-3 py-3">
              {prompt(desktopInput)}
              <p className={`mt-2 max-h-48 overflow-y-auto break-words ${outputClass}`} aria-live="polite">
                {output}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gutter-line pt-3">
          <ThemeToggle t={t} />
          <LangToggle t={t} />
        </div>
      </aside>

      {/* Mobile / tablet: theme + lang in a thin strip at the top of the page,
          in the flow (scrolls away) — hidden behind the "$" sheet nobody found
          them. Crazy mode has its own fixed escape bar below instead. */}
      {theme !== "crazy" && (
        <div className="flex flex-wrap items-center justify-between gap-x-3 bg-gutter px-3 lg:hidden">
          <ThemeToggle t={t} large />
          <LangToggle t={t} large />
        </div>
      )}

      {/* Mobile / tablet crazy escape: two big theme buttons pinned to the TOP.
          A fixed-bottom bar is unreachable on iOS — Safari's bottom address bar
          sits over it until you scroll — so the way out lives at the top, clear
          of both toolbars, always tappable without scrolling. */}
      {theme === "crazy" ? (
        <div className="fixed inset-x-0 top-0 z-[70] grid grid-cols-2 gap-3 border-b border-gutter-line bg-gutter px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] lg:hidden">
          <button
            onClick={() => setTheme("light")}
            className="exit-glow flex min-h-[52px] items-center justify-center gap-2 rounded-lg bg-white text-base font-bold text-neutral-900"
          >
            <span aria-hidden="true">☀</span>
            {t.crazyLight}
          </button>
          <button
            onClick={() => setTheme("dark")}
            className="exit-glow flex min-h-[52px] items-center justify-center gap-2 rounded-lg border border-white/30 bg-neutral-900 text-base font-bold text-white"
          >
            <span aria-hidden="true">🌙</span>
            {t.crazyDark}
          </button>
        </div>
      ) : sheetOpen ? (
        <div
          role="dialog"
          aria-label={t.terminalLabel}
          className="fixed inset-x-0 bottom-0 z-[70] border-t border-gutter-line bg-gutter pb-[env(safe-area-inset-bottom)] lg:hidden"
        >
          <div className="flex items-center justify-between border-b border-gutter-line pl-6 pr-2">
            <span className="font-mono text-xs text-gutter-muted">~/career-log</span>
            <button
              onClick={() => setSheetOpen(false)}
              aria-label={t.terminalClose}
              className="flex h-11 w-11 items-center justify-center font-mono text-lg text-gutter-muted hover:text-white"
            >
              ×
            </button>
          </div>
          {output && (
            <p
              onClick={() => mobileInput.current?.focus()}
              className={`max-h-32 cursor-text overflow-y-auto break-words border-b border-gutter-line px-6 py-2 ${outputClass}`}
              aria-live="polite"
            >
              {output}
            </p>
          )}
          <div className="px-6 py-3">
            <div className="flex min-h-11 rounded border border-gutter-accent/60 bg-white/5 px-3 focus-within:border-gutter-accent">
              {prompt(mobileInput)}
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setSheetOpen(true)}
          aria-label={t.terminalOpen}
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-[70] flex h-12 w-12 items-center justify-center rounded-full border border-gutter-accent/60 bg-gutter font-mono text-lg text-gutter-accent shadow-lg transition-colors hover:border-gutter-accent lg:hidden"
        >
          $
        </button>
      )}
    </>
  );
}
