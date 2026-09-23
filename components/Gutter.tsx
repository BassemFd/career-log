"use client";

import { useState } from "react";
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
function ThemeToggle({ t }: { t: (typeof STRINGS)["en"] }) {
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
                ? "rounded px-1.5 py-0.5 text-accent"
                : "rounded px-1.5 py-0.5 text-gutter-muted transition-colors hover:text-white"
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

function LangToggle({ t }: { t: (typeof STRINGS)["en"] }) {
  const { locale, setLocale } = useLocale();
  return (
    <div className="mt-2 flex items-center gap-1.5 font-mono text-xs">
      <span className="text-gutter-muted">{t.langLabel}</span>
      {LOCALES.map((l) => (
        <button
          key={l.id}
          onClick={() => setLocale(l.id)}
          aria-pressed={locale === l.id}
          className={
            locale === l.id
              ? "rounded px-1.5 py-0.5 text-accent"
              : "rounded px-1.5 py-0.5 text-gutter-muted transition-colors hover:text-white"
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
// On narrow screens it collapses to the same prompt as a bottom bar.
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
  }

  const outputClass = urgent
    ? "animate-pulse font-mono text-xs font-bold text-manual"
    : "font-mono text-xs text-gutter-muted";

  const prompt = (
    <div className="flex items-center gap-2 font-mono text-sm">
      <span className="text-accent">$</span>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          run(input);
          setInput("");
        }}
        placeholder="help"
        spellCheck={false}
        className="w-full min-w-0 bg-transparent text-white outline-none placeholder:text-gutter-muted"
      />
    </div>
  );

  return (
    <>
      {/* Desktop: sticky sidebar, the file's real line-number index */}
      <aside className="hidden shrink-0 lg:sticky lg:top-0 lg:z-[70] lg:flex lg:h-screen lg:w-56 lg:flex-col lg:justify-between lg:border-r lg:border-gutter-line lg:bg-gutter lg:px-6 lg:py-8">
        <nav className="flex flex-col gap-1">
          {ROUTES.map((r) => (
            <button
              key={r.id}
              onClick={() => goTo(r)}
              className="group flex items-baseline gap-3 rounded px-2 py-1.5 text-left transition-colors hover:bg-white/5"
            >
              <span className="font-mono text-xs text-accent">{r.number}</span>
              <span className="font-display text-sm text-white/70 group-hover:text-white">
                {routeLabels[r.id]}
              </span>
            </button>
          ))}
        </nav>

        <div className="border-t border-gutter-line pt-4">
          {prompt}
          <p className={`mt-2 truncate ${outputClass}`}>{output}</p>
          <div className="mt-4 border-t border-gutter-line pt-3">
            <ThemeToggle t={t} />
            <LangToggle t={t} />
          </div>
        </div>
      </aside>

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
      ) : (
        <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-gutter-line bg-gutter lg:hidden">
          <div className="flex items-center gap-3 px-6 py-3">
            {prompt}
            <span className={`hidden shrink-0 truncate sm:block ${outputClass}`}>
              {output}
            </span>
            <div className="ml-auto shrink-0 text-right">
              <ThemeToggle t={t} />
              <LangToggle t={t} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
