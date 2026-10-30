"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "./ThemeProvider";

const CHARS = "!<>-_\\/[]{}=+*^?#$%&01";
const SCRAMBLE_MS = 500;

// Wraps a piece of text so it decrypts itself from noise once when the WTF
// theme turns on — used on the career content (name, tagline, company names).
export function GlitchText({ text }: { text: string }) {
  const { theme } = useTheme();
  const [display, setDisplay] = useState(text);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const rafRef = useRef(0);

  useEffect(() => {
    if (theme !== "crazy") {
      setDisplay(text);
      return;
    }

    let cancelled = false;

    function scramble() {
      const start = performance.now();
      function tick(now: number) {
        if (cancelled) return;
        const t = Math.min(1, (now - start) / SCRAMBLE_MS);
        const revealCount = Math.floor(t * text.length);
        let out = "";
        for (let i = 0; i < text.length; i++) {
          if (text[i] === " ") {
            out += " ";
          } else if (i < revealCount) {
            out += text[i];
          } else {
            out += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }
        setDisplay(out);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setDisplay(text);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    scramble();
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [theme, text]);

  return <>{display}</>;
}
