"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import dynamic from "next/dynamic";

// three.js only ships to visitors who actually pick crazy mode, not every
// recruiter who loads the default light/dark site.
const VortexTransition = dynamic(() => import("./VortexTransition").then((m) => m.VortexTransition), { ssr: false });
const CrazyMode = dynamic(() => import("./CrazyMode").then((m) => m.CrazyMode), { ssr: false });

export type Theme = "light" | "dark" | "crazy";

type ThemeContext = { theme: Theme; setTheme: (t: Theme) => void };

const Ctx = createContext<ThemeContext | null>(null);

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Owns the active theme, persists it, and coordinates the crazy-mode entrance:
// selecting "crazy" from another theme plays the vortex first, then commits.
export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [vortex, setVortex] = useState(false);

  // The no-flash script already stamped the real theme on <html> before paint;
  // sync React state to it so context and DOM agree.
  useEffect(() => {
    const applied = document.documentElement.dataset.theme as Theme | undefined;
    if (applied === "light" || applied === "dark" || applied === "crazy") {
      setThemeState(applied);
    }
  }, []);

  const apply = useCallback((t: Theme) => {
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem("theme", t);
    } catch {
      /* private mode / storage disabled — theme still applies for the session */
    }
    setThemeState(t);
    // Crazy mode always opens from the hero, wherever the visitor had scrolled.
    if (t === "crazy") window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const setTheme = useCallback(
    (next: Theme) => {
      if (next === theme) return;
      // Entering crazy from another theme gets the wormhole; reduced motion
      // skips straight to the theme (the click is still an explicit choice).
      if (next === "crazy" && !prefersReducedMotion()) {
        setVortex(true);
        return;
      }
      apply(next);
    },
    [theme, apply]
  );

  return (
    <Ctx.Provider value={{ theme, setTheme }}>
      {children}
      {vortex && (
        <VortexTransition
          onComplete={() => {
            setVortex(false);
            apply("crazy");
          }}
        />
      )}
      {theme === "crazy" && <CrazyMode />}
    </Ctx.Provider>
  );
}
