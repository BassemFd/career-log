"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "./ThemeProvider";

const HEAL_TAIL_MS = 2000; // how long the canvas keeps healing after the last brush stroke
const BRUSH_RADIUS = 130;
const TRACK_MARGIN = 200; // stop tracking pointer once this far outside the hero

// Full-hero paint layer: a canvas starts painted solid in the page background
// color, hiding a gradient panel underneath. Moving the cursor anywhere over
// the hero erases a soft hole (destination-out) — like painting the
// background in — that heals back to solid once the cursor moves away.
// Tracked on window (not the layer itself, which stays pointer-events-none so
// it never blocks the hero's actual links/content) so the whole header is
// paintable, not just the text. Light theme only.
export default function HeroPaint() {
  const { theme } = useTheme();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (theme !== "light") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const paper = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-paper")
      .trim();
    const paperColor = `rgb(${paper})`;

    let width = 0;
    let height = 0;
    let raf = 0;
    let healUntil = 0;
    let pointer: { x: number; y: number } | null = null;

    function fillSolid() {
      ctx!.globalCompositeOperation = "source-over";
      ctx!.globalAlpha = 1;
      ctx!.fillStyle = paperColor;
      ctx!.fillRect(0, 0, width, height);
    }

    function resize() {
      const rect = root!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      fillSolid();
    }

    function loop() {
      // Slowly re-solidify everything — a no-op visually on already-solid
      // areas, and a gradual heal on erased ones.
      ctx!.globalCompositeOperation = "source-over";
      ctx!.globalAlpha = 0.045;
      ctx!.fillStyle = paperColor;
      ctx!.fillRect(0, 0, width, height);
      ctx!.globalAlpha = 1;

      if (pointer) {
        const gradient = ctx!.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          BRUSH_RADIUS
        );
        gradient.addColorStop(0, "rgba(0,0,0,1)");
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx!.globalCompositeOperation = "destination-out";
        ctx!.fillStyle = gradient;
        ctx!.fillRect(
          pointer.x - BRUSH_RADIUS,
          pointer.y - BRUSH_RADIUS,
          BRUSH_RADIUS * 2,
          BRUSH_RADIUS * 2
        );
      }

      if (performance.now() < healUntil) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
        pointer = null;
      }
    }

    function start() {
      healUntil = performance.now() + HEAL_TAIL_MS;
      if (!raf) raf = requestAnimationFrame(loop);
    }

    function onMove(e: PointerEvent) {
      const rect = root!.getBoundingClientRect();
      if (
        e.clientY < rect.top - TRACK_MARGIN ||
        e.clientY > rect.bottom + TRACK_MARGIN
      ) {
        return; // scrolled well past the hero — don't bother
      }
      pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      start();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(root);
    resize();

    window.addEventListener("pointermove", onMove);
    return () => {
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [theme]);

  if (theme !== "light") return null;

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-br from-accent via-teal to-violet opacity-70" />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
