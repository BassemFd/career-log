"use client";

import { useEffect } from "react";
import { useLocale } from "./LocaleProvider";
import { STRINGS } from "@/lib/strings";

// Total runtime of the CSS sequence in globals.css (--intro-hold 0.5s +
// --intro-push 7.6s + 0.4s fade), plus a margin. Ends the intro even if
// animationend never fires (hidden tab). Keep it above that sum when retiming.
const FALLBACK_MS = 9000;

function finish() {
  delete document.documentElement.dataset.intro;
}

// Opening curtain: a character pushes an ink wall off the screen to reveal the
// page. He pushes, stalls out of breath, pushes again; at the third stall a
// comic close-up of his straining face pops up ("HNNNGH..."), then the wall
// gives way and he tumbles off the bottom of the screen, laughing. Whether it
// plays is decided before first paint by the intro script in layout.tsx; this
// component only renders the markup and ends it. Decorative, so hidden from
// assistive tech except the skip button.
export function IntroCurtain() {
  const { locale } = useLocale();
  const t = STRINGS[locale];

  useEffect(() => {
    if (document.documentElement.dataset.intro !== "play") return;
    // The reveal is of the hero; a reload would otherwise restore mid-page.
    window.scrollTo({ top: 0, behavior: "instant" });
    // Stray clicks, keys and scrolls don't end it: it plays to the end
    // (only the skip button cuts it short).
    const timer = setTimeout(finish, FALLBACK_MS);
    const stopWalk = walkWithTheWall();
    return () => {
      clearTimeout(timer);
      stopWalk();
    };
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
            <img className="intro-fallpose intro-fallpose-1" src="/intro/fall-1.webp" alt="" />
            <img className="intro-fallpose intro-fallpose-2" src="/intro/fall-2.webp" alt="" />
          </div>
        </div>
        <img className="intro-closeup" src="/intro/closeup.webp" alt="" />
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

// The developer leaning into the wall, cut from the comic sheet into a torso
// and one leg (thigh + shin) in public/intro/. Both legs are that same leg,
// the far one shaded darker, swung from the hip and bent at the knee in a
// walk cycle so they take turns. His palms sit on the right edge of the
// viewBox, which the mover keeps on the wall's edge. globals.css adds the
// sweat and breath.
const INK = "rgb(var(--color-ink))";
const TEE = "#fbfbf8";
const HIP = { x: 153, y: 240 };
const KNEE = { x: 187, y: 385 };
const THIGH_LEN = 149;
const SHIN_LEN = 111;
// How far forward each piece already leans in the drawing, in degrees.
const THIGH_LEAN = 13.2;
const SHIN_LEAN = 9.3;
const GROUND = 255; // hip to ankle when standing in the drawing
// A full cycle (two steps) covers this much ground, in viewBox units: what
// the planted foot travels back, so it stays put while the body moves on.
const CYCLE_LENGTH = 388;

type LegPose = { thigh: number; shin: number; ankleY: number };

// Leg pose at phase p (radians): the thigh swings 22° each way around a
// slight forward lean; the knee bends while the leg swings through.
function legPose(p: number): LegPose {
  const swing = 4 + 22 * Math.sin(p);
  const bend = 5 + 45 * Math.max(0, Math.cos(p));
  const rad = Math.PI / 180;
  return {
    thigh: THIGH_LEAN - swing,
    shin: bend - (THIGH_LEAN - SHIN_LEAN),
    ankleY: THIGH_LEN * Math.cos(swing * rad) + SHIN_LEN * Math.cos((swing - bend) * rad),
  };
}

function rigTransforms(p: number) {
  const near = legPose(p);
  const far = legPose(p + Math.PI);
  // Whichever foot is lower stands on the ground; the body rides on it.
  const drop = GROUND - Math.max(near.ankleY, far.ankleY);
  return {
    body: `translate(0 ${drop.toFixed(2)})`,
    legs: [far, near].map((l) => ({
      thigh: `rotate(${l.thigh.toFixed(2)} ${HIP.x} ${HIP.y})`,
      shin: `rotate(${l.shin.toFixed(2)} ${KNEE.x} ${KNEE.y})`,
    })),
  };
}

// Feet apart, both on the ground: where he stands still.
const STANCE = Math.PI / 2;

// Legs follow the ground actually covered, not a clock, so the planted foot
// stays put and fast pushes stride fast. When the push stalls he finishes
// the step and stands on both feet until it moves again. Returns a stop
// function.
function walkWithTheWall() {
  const mover = document.querySelector<HTMLElement>(".intro-mover");
  const svg = document.querySelector<SVGSVGElement>(".intro-char");
  if (!mover || !svg) return () => {};
  const body = svg.querySelector(".rig")!;
  const thighs = svg.querySelectorAll(".rig .thigh");
  const shins = svg.querySelectorAll(".rig .shin");
  const unitsPerPx = svg.viewBox.baseVal.height / mover.offsetHeight;
  let furthest = -Infinity;
  let phase = STANCE;
  let lastMove = performance.now();
  let last = performance.now();
  let raf = requestAnimationFrame(function tick(now) {
    const x = new DOMMatrix(getComputedStyle(mover).transform).m41;
    if (x > furthest) {
      if (furthest !== -Infinity) phase += ((x - furthest) * unitsPerPx / CYCLE_LENGTH) * 2 * Math.PI;
      furthest = x;
      lastMove = now;
    } else if (now - lastMove > 120) {
      // settle into the nearest stance ahead
      const target = STANCE + Math.ceil((phase - STANCE) / Math.PI - 1e-6) * Math.PI;
      phase = Math.min(target, phase + ((now - last) / 1000) * 5);
    }
    last = now;
    const r = rigTransforms(phase);
    body.setAttribute("transform", r.body);
    r.legs.forEach((l, i) => {
      thighs[i].setAttribute("transform", l.thigh);
      shins[i].setAttribute("transform", l.shin);
    });
    raf = requestAnimationFrame(tick);
  });
  return () => cancelAnimationFrame(raf);
}

function Leg({ far, pose }: { far?: boolean; pose: { thigh: string; shin: string } }) {
  return (
    <g className={far ? "leg leg-far" : "leg"}>
      <g className="thigh" transform={pose.thigh}>
        <g className="shin" transform={pose.shin}>
          <image href="/intro/shin.webp" x="155" y="378" width="108" height="142" />
        </g>
        <image href="/intro/thigh.webp" x="103" y="256" width="119" height="136" />
      </g>
    </g>
  );
}

function PushingDev() {
  const rest = rigTransforms(STANCE);
  return (
    <svg className="intro-char" viewBox="40 0 280 525" stroke={INK} strokeWidth="2" strokeLinecap="round">
      <g className="rig" transform={rest.body}>
        <Leg far pose={rest.legs[0]} />
        <Leg pose={rest.legs[1]} />
        <image href="/intro/torso.webp" x="92" y="5" width="227" height="257" />
        {/* sweat drops run off his head, breath puffs out of his mouth */}
        <g transform="translate(52 5)">
          <path className="sweat" d="M126 40 q-5 7 0 10 q5 -3 0 -10" fill={TEE} />
          <path className="sweat sweat-2" d="M184 26 q-4 6 0 9 q4 -3 0 -9" fill={TEE} />
          <path className="puff" d="M190 70 q8 -5 16 1" fill="none" />
          <path className="puff puff-2" d="M189 80 q9 1 15 7" fill="none" />
        </g>
      </g>
    </svg>
  );
}
