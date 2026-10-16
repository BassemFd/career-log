"use client";

import { useEffect, useRef, useState } from "react";
import { CrazyScene } from "./CrazyScene";

const HUES = [330, 25, 48, 275, 185]; // hot pink, orange, mustard, purple, teal
const MAX_BLOBS = 9;
const MIN_SPLIT_SIZE = 34; // below this, a blob just bounces — no more splitting
const SPLIT_CHANCE = 0.5;

type Blob = {
  el: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  flip: number;
};

function makeBlobEl(size: number, hue: number) {
  const el = document.createElement("div");
  el.className = "absolute left-0 top-0 grid place-items-center shadow-lg";
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.background = `hsl(${hue} 88% 62%)`;
  el.style.borderRadius = "46% 54% 58% 42% / 54% 46% 54% 46%";
  el.style.animation = `crazy-blob-wobble ${2.2 + Math.random() * 1.4}s ease-in-out infinite`;

  const face = document.createElement("div");
  face.style.display = "flex";
  face.style.gap = `${Math.max(2, size * 0.06)}px`;
  const eyeSize = Math.max(3, size * 0.13);
  for (let i = 0; i < 2; i++) {
    const eye = document.createElement("span");
    eye.style.display = "block";
    eye.style.width = `${eyeSize}px`;
    eye.style.height = `${eyeSize}px`;
    eye.style.borderRadius = "9999px";
    eye.style.background = "white";
    face.appendChild(eye);
  }
  el.appendChild(face);

  const mouth = document.createElement("span");
  mouth.style.position = "absolute";
  mouth.style.bottom = `${size * 0.26}px`;
  mouth.style.width = `${size * 0.25}px`;
  mouth.style.height = `${size * 0.08}px`;
  mouth.style.borderBottom = "2px solid white";
  mouth.style.borderBottomLeftRadius = "9999px";
  mouth.style.borderBottomRightRadius = "9999px";
  el.appendChild(mouth);

  return el;
}

// Crazy-mode chrome: the ambient three.js backdrop (CrazyScene) plus a swarm
// of blob creatures that multiply — every wall hit has a chance to split one
// into two smaller, faster-diverging blobs, up to a cap. Mounted only while
// theme === "crazy" (ThemeProvider unmounts it on exit, tearing this down).
export function CrazyMode() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Give every jittering block/card/row its own randomized duration + a
  // negative delay (so it starts mid-cycle instead of all in lockstep) —
  // set once via CSS custom properties, then the animation itself is pure
  // CSS, no per-frame JS needed.
  useEffect(() => {
    if (reduced) return;
    const items = document.querySelectorAll<HTMLElement>(".crazy-item");
    items.forEach((el) => {
      el.style.setProperty("--crazy-dur", `${1.8 + Math.random() * 1.8}s`);
      el.style.setProperty("--crazy-delay", `${-Math.random() * 3}s`);
    });
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    const container = containerRef.current;
    if (!container) return;

    const blobs: Blob[] = [];
    let hueIndex = 0;

    function spawn(x: number, y: number, size: number, vx: number, vy: number) {
      const el = makeBlobEl(size, HUES[hueIndex++ % HUES.length]);
      container!.appendChild(el);
      blobs.push({ el, x, y, vx, vy, size, flip: 0 });
    }

    const initialSize = 96;
    spawn(
      Math.random() * (window.innerWidth - initialSize),
      Math.random() * (window.innerHeight - initialSize),
      initialSize,
      2.4,
      1.8
    );

    let raf = 0;

    function step() {
      for (const b of blobs) {
        const maxX = window.innerWidth - b.size;
        const maxY = window.innerHeight - b.size;
        b.x += b.vx;
        b.y += b.vy;

        let squashX = 1;
        let squashY = 1;
        let hit = false;

        if (b.x <= 0 || b.x >= maxX) {
          b.vx = -b.vx;
          b.x = Math.max(0, Math.min(maxX, b.x));
          squashX = 0.7;
          hit = true;
        }
        if (b.y <= 0 || b.y >= maxY) {
          b.vy = -b.vy;
          b.y = Math.max(0, Math.min(maxY, b.y));
          squashY = 0.7;
          hit = true;
        }

        if (hit && Math.random() < 0.4) b.flip = 30;

        if (
          hit &&
          b.size > MIN_SPLIT_SIZE &&
          blobs.length < MAX_BLOBS &&
          Math.random() < SPLIT_CHANCE
        ) {
          const speed = Math.hypot(b.vx, b.vy);
          const angle = Math.atan2(b.vy, b.vx) + (Math.random() - 0.5) * 1.6;
          const splitAngle = angle + Math.PI / 2 + (Math.random() - 0.5) * 0.8;

          b.size *= 0.72;
          b.el.style.width = `${b.size}px`;
          b.el.style.height = `${b.size}px`;
          b.vx = Math.cos(angle) * speed;
          b.vy = Math.sin(angle) * speed;

          spawn(
            b.x,
            b.y,
            b.size,
            Math.cos(splitAngle) * speed,
            Math.sin(splitAngle) * speed
          );
        }

        const roll = b.flip > 0 ? (30 - b.flip) * 12 : 0;
        if (b.flip > 0) b.flip--;

        b.el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${roll}deg) scale(${squashX}, ${squashY})`;
      }
      raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      for (const b of blobs) b.el.remove();
    };
  }, [reduced]);

  return (
    <>
      <CrazyScene />

      <div
        ref={containerRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[40] overflow-hidden"
      >
        {/* Single static blob under reduced motion — no swarm, no splitting. */}
        {reduced && (
          <div
            className="absolute grid h-24 w-24 place-items-center bg-accent shadow-lg"
            style={{
              transform: "translate(24px, 120px)",
              borderRadius: "46% 54% 58% 42% / 54% 46% 54% 46%",
            }}
          >
            <div className="flex gap-2">
              <span className="block h-3 w-3 rounded-full bg-white" />
              <span className="block h-3 w-3 rounded-full bg-white" />
            </div>
            <span className="absolute bottom-6 h-2 w-6 rounded-b-full border-b-2 border-white" />
          </div>
        )}
      </div>
    </>
  );
}
