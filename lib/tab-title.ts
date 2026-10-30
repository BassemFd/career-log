import type { Locale } from "./strings";

// A wink for visitors who switch tabs: while the page is hidden the tab title
// cycles a short message plus a running "away" counter, and on return it says
// hello briefly before restoring the real title. Everything stays in the
// browser — nothing is sent anywhere — and the real <title> is only swapped
// while hidden, so SEO and link previews always see the normal one.

export const TAB_MESSAGES: Record<
  Locale,
  { away: string[]; back: (returns: number) => string; awayFor: (s: number) => string }
> = {
  en: {
    away: ["Psst, come back 👀", "I saw that tab switch…", "Still compiling without you"],
    back: (n) => (n > 1 ? `Welcome back! (visit #${n})` : "Welcome back!"),
    awayFor: (s) => `away ${formatDuration(s)}`,
  },
  fr: {
    away: ["Psst, reviens 👀", "J'ai vu ce changement d'onglet…", "Ça compile encore sans toi"],
    back: (n) => (n > 1 ? `Re-bienvenue ! (retour n°${n})` : "Re-bienvenue !"),
    awayFor: (s) => `absent ${formatDuration(s)}`,
  },
};

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m${String(s % 60).padStart(2, "0")}s` : `${s}s`;
}

type Doc = {
  title: string;
  hidden: boolean;
  addEventListener: (type: "visibilitychange", cb: () => void) => void;
  removeEventListener: (type: "visibilitychange", cb: () => void) => void;
};

type Options = {
  doc: Doc;
  locale: Locale;
  reducedMotion: boolean;
  now?: () => number;
  setIntervalFn?: (cb: () => void, ms: number) => unknown;
  clearIntervalFn?: (id: unknown) => void;
  setTimeoutFn?: (cb: () => void, ms: number) => unknown;
  clearTimeoutFn?: (id: unknown) => void;
  onAwayChange?: (away: boolean, returns: number) => void;
};

export function startTabTitle(opts: Options): () => void {
  const {
    doc,
    locale,
    reducedMotion,
    now = Date.now,
    setIntervalFn = (cb, ms) => setInterval(cb, ms),
    clearIntervalFn = (id) => clearInterval(id as ReturnType<typeof setInterval>),
    setTimeoutFn = (cb, ms) => setTimeout(cb, ms),
    clearTimeoutFn = (id) => clearTimeout(id as ReturnType<typeof setTimeout>),
    onAwayChange,
  } = opts;
  const msgs = TAB_MESSAGES[locale];

  let original = doc.title;
  let hiddenAt: number | null = null;
  let returns = 0;
  let ticker: unknown = null;
  let welcome: unknown = null;

  const stopTicker = () => {
    if (ticker !== null) clearIntervalFn(ticker);
    ticker = null;
  };
  const stopWelcome = () => {
    if (welcome !== null) clearTimeoutFn(welcome);
    welcome = null;
  };

  const render = (tick: number) => {
    const secs = (now() - (hiddenAt ?? now())) / 1000;
    // Reduced motion: one fixed title, no cycling and no ticking counter.
    if (reducedMotion) {
      doc.title = msgs.away[0];
      return;
    }
    doc.title =
      tick % 2 === 0
        ? msgs.away[Math.floor(tick / 2) % msgs.away.length]
        : msgs.awayFor(secs);
  };

  const onChange = () => {
    if (doc.hidden) {
      stopWelcome();
      // Don't capture our own welcome/away text as the "real" title.
      if (ticker === null) original = doc.title;
      hiddenAt = now();
      onAwayChange?.(true, returns);
      let tick = 0;
      render(tick++);
      if (!reducedMotion) {
        stopTicker();
        ticker = setIntervalFn(() => render(tick++), 1500);
      }
    } else if (hiddenAt !== null) {
      stopTicker();
      hiddenAt = null;
      returns += 1;
      onAwayChange?.(false, returns);
      doc.title = msgs.back(returns);
      welcome = setTimeoutFn(() => {
        doc.title = original;
        welcome = null;
      }, 2500);
    }
  };

  doc.addEventListener("visibilitychange", onChange);
  return () => {
    doc.removeEventListener("visibilitychange", onChange);
    stopTicker();
    stopWelcome();
    if (hiddenAt !== null || welcome !== null) doc.title = original;
  };
}
