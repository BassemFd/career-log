"use client";

import { useEffect } from "react";
import { CrazyScene } from "./CrazyScene";

// WTF-theme chrome: the interactive shader backdrop (CrazyScene) and a
// pointer spotlight on cards — the cursor position is published as --mx/--my
// on each .crazy-item, which the CSS turns into a soft glow under the cursor.
// Mounted only while theme === "crazy" (ThemeProvider unmounts it on exit).
export function CrazyMode() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let x = 0;
    let y = 0;
    function paint() {
      raf = 0;
      document.querySelectorAll<HTMLElement>(".crazy-item").forEach((el) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${x - r.left}px`);
        el.style.setProperty("--my", `${y - r.top}px`);
      });
    }
    function onMove(e: PointerEvent) {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <CrazyScene />
    </>
  );
}
