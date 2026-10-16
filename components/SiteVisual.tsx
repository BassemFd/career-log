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

// A clickable browser-window thumbnail for a public site: a comic panel (ink
// border, hard offset shadow, slight tilt) around a real screenshot of the page
// (`image`, a 1:2 capture that slowly scrolls up and down inside the window) or,
// without one, a drawn looping scene. It slams in the first time it scrolls into
// view, bobs while on screen, and pops a "GO!" burst on hover.
// Everything is CSS (see "Site visuals" in globals.css); the effect only tells
// the stylesheet when the panel is armed, revealed and on screen. Without
// JavaScript, or with reduced motion, the panel simply renders static.
export function SiteVisual({
  visual,
  t,
  className = "",
}: {
  visual: Visual;
  t: (typeof STRINGS)["en"];
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [armed, setArmed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setArmed(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        setOnScreen(entry.isIntersecting);
        if (entry.isIntersecting) setRevealed(true);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Stable per-site tilt and loop phase, so neighbours don't move in lockstep.
  const seed = parseInt(shortHash(visual.domain).slice(0, 4), 16);
  const style = {
    "--tilt": `${TILTS[seed % TILTS.length]}deg`,
    "--phase": `-${(seed % 50) / 10}s`,
  } as CSSProperties;

  return (
    <a
      ref={ref}
      href={visual.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.visitSite(visual.domain)}
      data-armed={armed}
      data-in={revealed}
      data-live={onScreen}
      style={style}
      className={`site-visual group relative z-10 block w-full max-w-56 shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:max-w-none ${className}`}
    >
      <span className="site-visual-frame">
        <span className="site-visual-bob">
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
      <span className="mt-3 flex items-start gap-1.5 font-mono text-xs text-muted transition-colors group-hover:text-accent group-focus-visible:text-accent">
        <span className="min-w-0 break-words">
          {/* a line break may fall after any dot, never mid-word */}
          {visual.domain.split(".").map((part, i, parts) => (
            <Fragment key={i}>
              {part}
              {i < parts.length - 1 && (
                <>
                  .<wbr />
                </>
              )}
            </Fragment>
          ))}
        </span>
        <span
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        >
          ↗
        </span>
      </span>
    </a>
  );
}
