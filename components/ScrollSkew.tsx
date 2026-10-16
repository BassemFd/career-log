"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "./ThemeProvider";

// Content tilts with scroll velocity and eases back to flat at rest — a small
// vanilla version of the Locomotive/Lenis skew effect, driven by native
// scroll events rather than a scroll-hijacking library, so keyboard/wheel/
// touch scrolling stays untouched. Crazy mode only — light/dark stay flat.
export function ScrollSkew({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (theme !== "crazy") {
      if (ref.current) ref.current.style.transform = "";
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lastY = window.scrollY;
    let skew = 0;
    let raf = 0;

    function frame() {
      const y = window.scrollY;
      const velocity = y - lastY;
      lastY = y;

      const target = Math.max(-14, Math.min(14, velocity * 0.4));
      skew += (target - skew) * 0.35;
      skew *= 0.93;

      if (ref.current) {
        ref.current.style.transform = `skewY(${skew.toFixed(3)}deg)`;
      }
      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [theme]);

  return (
    <div ref={ref} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
