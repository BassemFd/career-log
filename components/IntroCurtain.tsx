"use client";

import { useEffect } from "react";
import { useLocale } from "./LocaleProvider";
import { STRINGS } from "@/lib/strings";

// Total runtime of the CSS sequence in globals.css (--intro-hold 0.5s +
// --intro-push 4.4s + 0.4s fade), plus a margin. Ends the intro even if
// animationend never fires (hidden tab). Keep it above that sum when retiming.
const FALLBACK_MS = 6000;

function finish() {
  delete document.documentElement.dataset.intro;
}

// Opening curtain: a character pushes an ink wall off the screen to reveal the
// page, stalls at a third, crouches into a harder push, and when the wall
// finally gives way he tumbles happily off the bottom of the screen ("WHEEE!"). Whether it plays is decided before first paint by the intro script in
// layout.tsx; this component only renders the markup and ends it. Decorative, so hidden from assistive tech except
// the skip button.
export default function IntroCurtain() {
  const { locale } = useLocale();
  const t = STRINGS[locale];

  useEffect(() => {
    if (document.documentElement.dataset.intro !== "play") return;
    // The reveal is of the hero; a reload would otherwise restore mid-page.
    window.scrollTo({ top: 0, behavior: "instant" });
    // Stray clicks, keys and scrolls don't end it: it plays to the end
    // (only the skip button cuts it short).
    const timer = setTimeout(finish, FALLBACK_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="intro-curtain pointer-events-auto fixed inset-0 z-[110] overflow-hidden"
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) finish();
      }}
    >
      <div aria-hidden="true">
        <div className="intro-wall" />
        <div className="intro-mover">
          <div className="intro-faller">
            <PushingDev />
            <span className="intro-scream">WHEEE!</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={finish}
        className="absolute bottom-6 right-6 font-mono text-xs text-paper/70 transition-colors hover:text-paper"
      >
        {t.introSkip} →
      </button>
    </div>
  );
}

// Line-art developer leaning into the wall (facing right, hands at the wall's
// edge at x≈118). Limbs are "tubes": a thick ink stroke with a thinner colored
// stroke on top, the usual comic line-art trick. Ink outline, accent hoodie,
// muted trousers, card skin and sneakers, so it reads in light and dark alike.
const INK = "rgb(var(--color-ink))";
const SKIN = "rgb(var(--color-card))";
const HOODIE = "rgb(var(--color-accent))";
const PANTS = "rgb(var(--color-muted))";

function Tube({ d, color }: { d: string; color: string }) {
  return (
    <>
      <path d={d} stroke={INK} strokeWidth="12" />
      <path d={d} stroke={color} strokeWidth="7" />
    </>
  );
}

function Leg({ className }: { className: string }) {
  return (
    <g className={`leg ${className}`}>
      <Tube d="M52 116 L57 151 L51 181" color={PANTS} />
      <path d="M41 182 h18 q9 0 9 7 v3 h-29 z" fill={SKIN} />
      <path d="M41 188 h27" strokeWidth="2" />
    </g>
  );
}

function PushingDev() {
  return (
    <svg
      className="intro-char"
      viewBox="0 0 120 200"
      fill="none"
      stroke={INK}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* back leg sits behind everything */}
      <Leg className="leg-back" />

      {/* lean: tilts 12° further into the wall at the stall (harder push) */}
      <g className="lean">
      <g className="body">
        {/* back arm: sleeve + hand on the wall */}
        <Tube d="M80 68 L99 71 L110 69" color={HOODIE} />
        <circle cx="114" cy="69" r="5" fill={SKIN} />

        {/* hoodie: rounded torso leaning into the push, hood behind the head */}
        <path d="M74 58 Q62 52 60 66" fill={HOODIE} />
        <path d="M37 119 Q38 133 58 131 L91 82 Q96 66 80 59 Q66 54 58 68 Z" fill={HOODIE} />
        <path d="M50 116 Q60 120 66 112" strokeWidth="2" />
        <path d="M64 96 L72 100" strokeWidth="2" opacity="0.6" />

        {/* head: big cartoon proportion, cap brim forward, gritted effort face */}
        <circle cx="88" cy="43" r="15" fill={SKIN} />
        <path d="M73 41 Q74 26 90 27 Q102 28 104 38 Z" fill={INK} />
        <path d="M101 36 Q110 35 115 40" strokeWidth="3.5" />
        <path className="grit" d="M92 44 l4 -1" strokeWidth="2.5" />
        <path className="scream" d="M90.5 45 q2.5 -3.5 5 0" strokeWidth="2" />
        <path className="grit" d="M91 51 h7" strokeWidth="2" />
        <path className="scream" d="M89 49.5 h10 q-1 7 -5 7 q-4 0 -5 -7 z" fill={INK} strokeWidth="1.5" />
        <path d="M80 47 q-3 2 0 4" strokeWidth="2" />

        {/* effort marks */}
        <g className="effort" strokeWidth="2.5">
          <path d="M67 26 l-6 -6" />
          <path d="M75 20 l-2 -8" />
          <path d="M62 34 l-8 -2" />
        </g>

        {/* front arm: sleeve + hand flat on the wall */}
        <Tube d="M78 80 L97 88 L109 84" color={HOODIE} />
        <circle cx="113" cy="84" r="5.5" fill={SKIN} />
      </g>
      </g>

      {/* front leg on top */}
      <Leg className="leg-front" />
    </svg>
  );
}
