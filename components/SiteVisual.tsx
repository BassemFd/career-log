"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { Visual } from "@/lib/types";
import type { STRINGS } from "@/lib/strings";
import { shortHash } from "@/lib/hash";
import { VisualArt } from "./VisualArt";

// Starburst behind the hover "GO!", precomputed (10 spikes, 64x64 box).
const BURST =
  "32,2 38.2,13 49.6,7.7 48.2,20.2 60.5,22.7 52,32 60.5,41.3 48.2,43.8 49.6,56.3 38.2,51 32,62 25.8,51 14.4,56.3 15.8,43.8 3.5,41.3 12,32 3.5,22.7 15.8,20.2 14.4,7.7 25.8,13";

const TILTS = [-2.2, 1.8, -1.4, 2.4];

// How many characters of the mono caption fit on one line under a panel (11rem).
// The caption keeps as much of the domain together as fits that, plus its arrow.
const CAPTION_FIT = 22;

// Hue of the panel's shadow and arrow: the entry's accent by default, or the
// category colour on a project card.
export type VisualTone = "accent" | "teal" | "violet";

// A clickable browser-window thumbnail for a public site: a comic panel (ink
// border, hard offset shadow, slight tilt) around a real screenshot of the page
// (`image`, a 1:2 capture) or, without one, a drawn scene. It slams in the first
// time it scrolls into view and then rests; hovering or focusing it wakes it up
// (the page scrolls, the scene plays, a "GO!" burst pops). Without a hover (touch)
// the screenshot scrolls once on arrival instead.
// Everything is CSS (see "Site visuals" in globals.css); the effect only tells
// the stylesheet when the panel is armed and has been revealed. Without
// JavaScript, or with reduced motion, the panel simply renders static.
export function SiteVisual({
  visual,
  t,
  tone = "accent",
  className = "",
}: {
  visual: Visual;
  t: (typeof STRINGS)["en"];
  tone?: VisualTone;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [armed, setArmed] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setArmed(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRevealed(true);
        observer.disconnect();
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Stable per-site tilt, so neighbours don't all lean the same way.
  const seed = parseInt(shortHash(visual.domain).slice(0, 4), 16);
  const style = { "--tilt": `${TILTS[seed % TILTS.length]}deg` } as CSSProperties;

  // Lines may wrap after a dot, never mid-word, and the arrow never ends up alone:
  // the tail of the domain (its name and extension when they fit) stays whole.
  const parts = visual.domain.split(".");
  let glued = 1;
  while (glued < parts.length && parts.slice(-(glued + 1)).join(".").length <= CAPTION_FIT) {
    glued++;
  }
  const head = parts.slice(0, parts.length - glued);
  const tail = parts.slice(parts.length - glued).join(".");

  return (
    <a
      ref={ref}
      href={visual.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.visitSite(visual.domain)}
      data-armed={armed}
      data-in={revealed}
      data-tone={tone}
      style={style}
      className={`site-visual group relative z-10 block w-full max-w-56 shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:max-w-none ${className}`}
    >
      <span className="site-visual-frame">
        <span className="site-visual-window">
          <span className="site-visual-bar" aria-hidden="true">
            <i />
            <i />
            <i />
            <b />
          </span>
          <span className="site-visual-screen">
            {visual.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={visual.image}
                alt=""
                width={640}
                height={1280}
                loading="lazy"
                decoding="async"
                className="site-visual-shot"
              />
            ) : (
              <VisualArt art={visual.art} />
            )}
          </span>
        </span>
        <svg
          viewBox="0 0 64 64"
          className="site-visual-burst"
          aria-hidden="true"
          focusable="false"
        >
          <polygon
            points={BURST}
            strokeLinejoin="round"
            className="fill-manual stroke-ink stroke-2"
          />
          <text
            x="32"
            y="36"
            textAnchor="middle"
            fontSize="15"
            fontWeight="700"
            className="fill-card font-display"
          >
            GO!
          </text>
        </svg>
      </span>
      <span className="site-visual-caption mt-3 block min-w-0 break-words font-mono text-xs">
        <span className="site-visual-domain">
          {head.map((part, i) => (
            <Fragment key={i}>
              {part}.<wbr />
            </Fragment>
          ))}
          <span className="whitespace-nowrap">
            {tail}
            <span className="site-visual-arrow" aria-hidden="true">
              ↗
            </span>
          </span>
        </span>
      </span>
    </a>
  );
}
