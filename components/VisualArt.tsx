import type { CSSProperties, ReactNode } from "react";
import type { VisualArt as ArtName } from "@/lib/types";

// The drawn scenes behind each SiteVisual thumbnail. Every shape takes its
// colour from a design token (Tailwind fill-* / stroke-* utilities), so a scene
// follows light, dark and crazy without a single hard-coded colour. Motion
// comes from the .va-* classes in app/globals.css; each element only passes its
// own timing in as CSS custom properties:
//   --d    delay before it starts (staggers the sequence)
//   --dur  loop length (the elements of one scene share it, so it replays whole)
//   --dx / --dy   travel distance for the moving classes
//   --origin      transform origin (fill-box), when it isn't the centre
const sv = (vars: Record<string, string>): CSSProperties => vars as CSSProperties;
const delay = (d: number, extra: Record<string, string> = {}) =>
  sv({ "--d": `${d}s`, ...extra });

// Full class strings, so Tailwind can see them.
const TONE = {
  accent: { soft: "fill-accent-soft", strong: "fill-accent", line: "stroke-accent" },
  teal: { soft: "fill-teal-soft", strong: "fill-teal", line: "stroke-teal" },
  violet: { soft: "fill-violet-soft", strong: "fill-violet", line: "stroke-violet" },
  manual: { soft: "fill-manual-soft", strong: "fill-manual", line: "stroke-manual" },
  live: { soft: "fill-live-soft", strong: "fill-live", line: "stroke-live" },
} as const;
type Tone = keyof typeof TONE;

const SPARKLE = "M0 -5 L1.3 -1.3 L5 0 L1.3 1.3 L0 5 L-1.3 1.3 L-5 0 L-1.3 -1.3 Z";

// Planity: a beauty-salon agenda fills up, a cursor taps the last free slot and
// it books itself.
function Booking() {
  const cols = [24, 68, 112];
  const heads: Tone[] = ["accent", "teal", "violet"];
  const blocks: { col: number; y: number; h: number; tone: Tone; d: number }[] = [
    { col: 0, y: 24, h: 24, tone: "accent", d: 0.2 },
    { col: 0, y: 54, h: 20, tone: "teal", d: 1.1 },
    { col: 1, y: 36, h: 26, tone: "violet", d: 0.6 },
    { col: 1, y: 68, h: 20, tone: "manual", d: 1.6 },
    { col: 2, y: 22, h: 18, tone: "live", d: 0.9 },
    { col: 2, y: 44, h: 16, tone: "accent", d: 1.9 },
  ];
  return (
    <>
      <rect width="160" height="14" className="fill-card" />
      <line x1="0" y1="14" x2="160" y2="14" className="stroke-rule stroke-1" />
      {cols.map((x, i) => (
        <g key={x}>
          <circle cx={x + 8} cy="7" r="3.2" className={TONE[heads[i]].strong} />
          <rect x={x + 14} y="5.7" width="16" height="2.6" rx="1.3" className="fill-rule" />
        </g>
      ))}
      {[22, 36, 50, 64, 78, 92].map((y) => (
        <line key={y} x1="22" y1={y} x2="156" y2={y} className="stroke-rule stroke-1" />
      ))}
      {[27, 41, 55, 69, 83].map((y) => (
        <rect key={y} x="5" y={y} width="11" height="2" rx="1" className="fill-rule" />
      ))}

      {blocks.map((b) => {
        const x = cols[b.col];
        const tone = TONE[b.tone];
        return (
          <g key={`${b.col}-${b.y}`} className="va-pop" style={delay(b.d)}>
            <rect x={x} y={b.y} width="42" height={b.h} rx="3" className={`${tone.soft} ${tone.line} stroke-1`} />
            <rect x={x} y={b.y} width="3.5" height={b.h} rx="1.5" className={tone.strong} />
            <rect x={x + 8} y={b.y + 5} width="22" height="3" rx="1.5" className={`${tone.strong} opacity-60`} />
            <rect x={x + 8} y={b.y + 11} width="14" height="3" rx="1.5" className={`${tone.strong} opacity-40`} />
          </g>
        );
      })}

      {/* the last free slot, waiting for a tap */}
      <rect x="112" y="64" width="42" height="24" rx="3" fill="none" strokeDasharray="3 2" className="va-pulse stroke-accent stroke-1" />
      <g className="va-pop" style={delay(4.2)}>
        <rect x="112" y="64" width="42" height="24" rx="3" className="fill-violet-soft stroke-violet stroke-1" />
        <rect x="112" y="64" width="3.5" height="24" rx="1.5" className="fill-violet" />
        <rect x="120" y="69" width="22" height="3" rx="1.5" className="fill-violet opacity-60" />
        <rect x="120" y="75" width="14" height="3" rx="1.5" className="fill-violet opacity-40" />
      </g>
      <circle cx="134" cy="70" r="3" fill="none" className="va-ripple stroke-accent stroke-2" style={delay(4.05)} />
      <g transform="translate(112 12)">
        <g className="va-travel" style={delay(0.6, { "--dx": "22px", "--dy": "58px" })}>
          <path d="M0 0 L0 12 L3.2 9 L5.6 14.4 L8 13.3 L5.6 8 L9.6 8 Z" strokeLinejoin="round" className="fill-ink stroke-card stroke-1" />
        </g>
      </g>
      <g transform="translate(150 66)">
        <g className="va-pop" style={delay(4.5)}>
          <circle r="6" className="fill-live stroke-ink stroke-1" />
          <path d="M-3 0.3 L-0.8 2.6 L3.2 -2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="stroke-card stroke-2" />
        </g>
      </g>
      <g transform="translate(108 62)">
        <path d={SPARKLE} className="va-pulse fill-manual" style={delay(4.6)} />
      </g>
      <g transform="translate(154 90)">
        <path d={SPARKLE} className="va-pulse fill-accent" style={delay(5)} />
      </g>
    </>
  );
}

// eXalt-IT: one hub (the firm), missions orbiting it, work flowing in.
function Consulting() {
  const hub = { x: 80, y: 48 };
  const sats: { x: number; y: number; tone: Tone }[] = [
    { x: 28, y: 20, tone: "teal" },
    { x: 132, y: 20, tone: "violet" },
    { x: 24, y: 74, tone: "manual" },
    { x: 136, y: 74, tone: "live" },
    { x: 80, y: 10, tone: "accent" },
  ];
  return (
    <>
      {sats.map((s, i) => (
        <line
          key={`l${i}`}
          x1={hub.x}
          y1={hub.y}
          x2={s.x}
          y2={s.y}
          strokeDasharray="3 3"
          className="va-dash stroke-rule stroke-2"
        />
      ))}
      {sats.map((s, i) => (
        <circle
          key={`p${i}`}
          cx={s.x}
          cy={s.y}
          r="2.4"
          className={`va-packet ${TONE[s.tone].strong}`}
          style={delay(i * 0.55, {
            "--dur": "3.2s",
            "--dx": `${hub.x - s.x}px`,
            "--dy": `${hub.y - s.y}px`,
          })}
        />
      ))}
      {sats.map((s, i) => (
        <g key={`s${i}`} transform={`translate(${s.x} ${s.y})`}>
          <g className="va-float" style={delay(i * 0.6, { "--dur": "4.5s" })}>
            <circle r="7.5" className={`${TONE[s.tone].soft} ${TONE[s.tone].line} stroke-2`} />
            <circle r="2.6" className={TONE[s.tone].strong} />
          </g>
        </g>
      ))}
      <circle cx={hub.x} cy={hub.y} r="16" fill="none" strokeDasharray="4 3" className="va-spin stroke-accent stroke-1" style={sv({ "--dur": "16s" })} />
      <circle cx={hub.x} cy={hub.y} r="11" fill="none" className="va-ripple stroke-accent stroke-2" style={sv({ "--dur": "3.2s" })} />
      <g className="va-pulse" style={sv({ "--dur": "3.2s" })}>
        <circle cx={hub.x} cy={hub.y} r="11" className="fill-accent stroke-ink stroke-2" />
        <text x={hub.x} y={hub.y + 3.3} textAnchor="middle" fontSize="9" fontWeight="700" className="fill-card font-mono">
          {"</>"}
        </text>
      </g>
    </>
  );
}

// La Capsule: code types itself into a terminal, ten weeks fill up, a capsule
// bobs on the corner.
function Bootcamp() {
  const lines: { y: number; segs: [number, number, string][] }[] = [
    { y: 30, segs: [[18, 28, "fill-gutter-accent"], [50, 40, "fill-gutter-muted"]] },
    { y: 38, segs: [[26, 20, "fill-live"], [50, 52, "fill-gutter-muted"], [106, 18, "fill-manual"]] },
    { y: 46, segs: [[26, 34, "fill-gutter-muted"], [64, 30, "fill-gutter-accent"]] },
    { y: 54, segs: [[18, 22, "fill-manual"], [44, 46, "fill-gutter-muted"]] },
    { y: 62, segs: [[18, 16, "fill-gutter-accent"], [38, 26, "fill-live"]] },
  ];
  return (
    <>
      <rect x="10" y="14" width="140" height="56" rx="4" className="fill-gutter stroke-ink stroke-2" />
      {[18, 24, 30].map((x) => (
        <circle key={x} cx={x} cy="21" r="1.8" className="fill-gutter-muted" />
      ))}
      {lines.map((l, i) =>
        l.segs.map(([x, w, tone], j) => (
          <rect
            key={`${i}-${j}`}
            x={x}
            y={l.y}
            width={w}
            height="3.6"
            rx="1.8"
            className={`va-grow ${tone}`}
            style={delay(0.3 + i * 0.5 + j * 0.15, { "--origin": "0% 50%" })}
          />
        )),
      )}
      <rect x="68" y="60.6" width="3" height="6.4" className="va-blink fill-gutter-accent" style={sv({ "--dur": "1s" })} />

      {Array.from({ length: 10 }, (_, i) => {
        const x = 16 + i * 13.4;
        return (
          <g key={i}>
            <rect x={x} y="78" width="11" height="8" rx="2" className="fill-card stroke-rule stroke-1" />
            <rect x={x} y="78" width="11" height="8" rx="2" className="va-pop fill-accent stroke-ink stroke-1" style={delay(0.4 + i * 0.35)} />
          </g>
        );
      })}

      <g transform="translate(134 12)">
        <g className="va-float" style={sv({ "--dur": "3.4s" })}>
          <g className="va-wiggle" style={sv({ "--dur": "3.4s" })}>
            <rect x="-12" y="-5" width="24" height="10" rx="5" className="fill-card" />
            <path d="M0 -5 H-7 A5 5 0 0 0 -7 5 H0 Z" className="fill-accent" />
            <rect x="-12" y="-5" width="24" height="10" rx="5" fill="none" className="stroke-ink stroke-2" />
            <line x1="0" y1="-5" x2="0" y2="5" className="stroke-ink stroke-2" />
          </g>
        </g>
      </g>
    </>
  );
}

// Mon Spécialiste Auto: a car rolls past an inspection scan, flags pop up, and
// its licence plate is pixel-blurred.
function Inspection() {
  const pins: { x: number; y: number; at: number; warn?: boolean }[] = [
    { x: 38, y: 40, at: 1.05 },
    { x: 84, y: 20, at: 2.3, warn: true },
    { x: 124, y: 38, at: 3.35 },
  ];
  return (
    <>
      <line x1="0" y1="76" x2="160" y2="76" className="stroke-ink stroke-2" />
      <line x1="0" y1="87" x2="160" y2="87" strokeDasharray="10 8" className="va-road stroke-rule stroke-2" />

      <g className="va-float" style={sv({ "--dur": "0.9s" })}>
        <path
          d="M20 66 L20 54 Q20 50 25 49 L42 46 L54 33 Q56 31 59 31 L100 31 Q104 31 106 33 L120 46 L136 49 Q142 50 142 55 L142 66 Z"
          strokeLinejoin="round"
          className="fill-card stroke-ink stroke-2"
        />
        <polygon points="60,35 78,35 78,46 50,46" className="fill-accent-soft stroke-ink stroke-1" />
        <polygon points="82,35 99,35 113,46 82,46" className="fill-accent-soft stroke-ink stroke-1" />
        <line x1="80" y1="35" x2="80" y2="62" className="stroke-ink stroke-1" />
        <line x1="42" y1="58" x2="140" y2="58" className="stroke-accent stroke-2" />
        <circle cx="138" cy="52" r="2.2" className="fill-manual" />
        <rect x="23" y="55" width="17" height="9" rx="1.5" className="fill-card stroke-ink stroke-1" />
        {[0, 1].map((r) =>
          [0, 1, 2, 3].map((c) => (
            <rect
              key={`${r}-${c}`}
              x={24.6 + c * 3.7}
              y={56.6 + r * 3.7}
              width="3.5"
              height="3.5"
              className="va-flicker fill-ink"
              style={delay(((r * 4 + c) * 0.37) % 1.4, { "--dur": "1.4s" })}
            />
          )),
        )}
        {[48, 114].map((cx) => (
          <g key={cx} transform={`translate(${cx} 67)`}>
            <circle r="10" className="fill-ink" />
            <g className="va-spin" style={sv({ "--dur": "0.7s" })}>
              <circle r="5" className="fill-card" />
              <line x1="-5" y1="0" x2="5" y2="0" className="stroke-ink stroke-1" />
              <line x1="0" y1="-5" x2="0" y2="5" className="stroke-ink stroke-1" />
            </g>
          </g>
        ))}
      </g>

      <g transform="translate(14 22)">
        <g className="va-scan" style={delay(0.5, { "--dx": "124px" })}>
          <rect width="8" height="56" className="fill-accent opacity-25" />
          <line x1="8" y1="0" x2="8" y2="56" className="stroke-accent stroke-2" />
        </g>
      </g>
      {pins.map((p) => {
        const tone = p.warn ? TONE.manual : TONE.live;
        return (
          <g key={p.x} transform={`translate(${p.x} ${p.y})`}>
            <g className="va-pop" style={delay(p.at, { "--dur": "7s" })}>
              <circle r="5" className={`${tone.soft} ${tone.line} stroke-2`} />
              {p.warn ? (
                <path d="M0 -2.4 V0.6 M0 2.4 V2.5" fill="none" strokeLinecap="round" className="stroke-manual stroke-2" />
              ) : (
                <path d="M-2.4 0.2 L-0.6 2 L2.6 -1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" className="stroke-live stroke-2" />
              )}
            </g>
          </g>
        );
      })}
    </>
  );
}

// ai/watch: a daily briefing where a quote gets found word for word, then
// stamped as verified.
function Briefing() {
  const cards = [
    { y: 26, hi: 0.7, stamp: 1.7 },
    { y: 60, hi: 2.5, stamp: 3.5 },
  ];
  return (
    <>
      <circle cx="16" cy="13" r="7.5" className="fill-accent-soft stroke-accent stroke-2" />
      <g className="va-eyes" style={sv({ "--dur": "4s" })}>
        <ellipse cx="13.4" cy="12" rx="1.2" ry="1.7" className="fill-ink" />
        <ellipse cx="18.6" cy="12" rx="1.2" ry="1.7" className="fill-ink" />
      </g>
      <line x1="13" y1="16.5" x2="19" y2="16.5" strokeLinecap="round" className="stroke-ink stroke-1" />
      <circle cx="16" cy="3.4" r="1.6" className="va-pulse fill-accent" />
      <text x="28" y="16" fontSize="8" fontWeight="500" className="fill-ink font-mono">
        ai/watch
      </text>
      <circle cx="129" cy="12" r="2.4" className="va-pulse fill-live" />
      <text x="134" y="14.4" fontSize="6.5" className="fill-live font-mono">
        LIVE
      </text>

      {cards.map((c) => (
        <g key={c.y}>
          <rect x="8" y={c.y} width="144" height="30" rx="3" className="fill-card stroke-rule stroke-1" />
          <rect x="14" y={c.y + 5} width="52" height="3.5" rx="1.75" className="fill-ink" />
          <rect x="70" y={c.y + 5} width="22" height="3.5" rx="1.75" className="fill-rule" />
          <rect x="14" y={c.y + 12} width="112" height="2.6" rx="1.3" className="fill-rule" />
          <rect x="14" y={c.y + 18} width="96" height="6.5" rx="1" className="va-grow fill-manual-soft" style={delay(c.hi, { "--origin": "0% 50%" })} />
          <rect x="16" y={c.y + 20} width="80" height="2.5" rx="1.25" className="fill-manual opacity-70" />
          <g transform={`translate(134 ${c.y + 16})`}>
            <g className="va-stamp" style={delay(c.stamp)}>
              <circle r="9" className="fill-live-soft stroke-live stroke-2" />
              <path d="M-4.2 0.2 L-1.2 3.2 L4.6 -3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" className="stroke-live stroke-2" />
            </g>
          </g>
        </g>
      ))}
    </>
  );
}

// NeJa: colour swatches rise like a palette being laid out, over a few
// variant-driven components.
function Palette() {
  const swatches: { h: number; tone: Tone }[] = [
    { h: 40, tone: "accent" },
    { h: 52, tone: "teal" },
    { h: 34, tone: "violet" },
    { h: 48, tone: "manual" },
    { h: 44, tone: "live" },
  ];
  return (
    <>
      {swatches.map((s, i) => {
        const x = 12 + i * 30;
        return (
          <g key={i} className="va-rise" style={delay(i * 0.18, { "--origin": "50% 100%" })}>
            <rect x={x} y={62 - s.h} width="26" height={s.h} rx="3" className={`${TONE[s.tone].strong} stroke-ink stroke-2`} />
            <rect x={x + 4} y={62 - s.h + 5} width="18" height="3.4" rx="1.7" className="fill-card opacity-80" />
            <rect x={x + 4} y={62 - s.h + 11} width="11" height="3.4" rx="1.7" className="fill-card opacity-50" />
          </g>
        );
      })}
      <line x1="8" y1="62" x2="152" y2="62" className="stroke-ink stroke-2" />

      <g className="va-pulse" style={sv({ "--dur": "3s" })}>
        <rect x="12" y="72" width="50" height="14" rx="7" className="fill-accent stroke-ink stroke-2" />
        <rect x="24" y="77.5" width="26" height="3" rx="1.5" className="fill-card" />
      </g>
      <rect x="68" y="72" width="40" height="14" rx="7" className="fill-card stroke-ink stroke-2" />
      <rect x="79" y="77.5" width="18" height="3" rx="1.5" className="fill-ink" />
      <rect x="116" y="74" width="28" height="10" rx="5" className="fill-teal-soft stroke-teal stroke-2" />
      <circle cx="122" cy="79" r="3.4" className="va-knob fill-teal" style={sv({ "--dx": "16px" })} />
    </>
  );
}

// mymoviz: two trending rows drifting past each other.
function Movies() {
  const tones: Tone[] = ["accent", "teal", "violet", "manual", "live", "violet"];
  const row = (y: number, offset: number, reverse: boolean) => (
    <g className={reverse ? "va-marquee va-marquee-rev" : "va-marquee"} style={sv({ "--dx": "-168px" })}>
      {Array.from({ length: 13 }, (_, i) => {
        const x = -10 + i * 28;
        const tone = TONE[tones[(i + offset) % 6]];
        return (
          <g key={i}>
            <rect x={x} y={y} width="22" height="36" rx="2.5" className={`${tone.strong} stroke-ink stroke-2`} />
            <polygon points={`${x + 8.5},${y + 11} ${x + 8.5},${y + 21} ${x + 16},${y + 16}`} className="fill-card" />
            <rect x={x + 3.5} y={y + 28} width="15" height="3" rx="1.5" className="fill-card opacity-70" />
          </g>
        );
      })}
    </g>
  );
  return (
    <>
      {row(6, 0, false)}
      {row(48, 3, true)}
      <rect x="8" y="90" width="144" height="3" rx="1.5" className="fill-rule" />
      <rect x="8" y="90" width="144" height="3" rx="1.5" className="va-grow fill-accent" style={sv({ "--dur": "9s", "--origin": "0% 50%" })} />
      <g transform="translate(140 15)">
        <g className="va-pop" style={delay(1.2, { "--dur": "6s" })}>
          <path
            d="M0 -8 L2.4 -2.6 L8.2 -2.2 L3.7 1.6 L5.1 7.2 L0 4.1 L-5.1 7.2 L-3.7 1.6 L-8.2 -2.2 L-2.4 -2.6 Z"
            strokeLinejoin="round"
            className="fill-manual stroke-ink stroke-2"
          />
        </g>
      </g>
    </>
  );
}

const SCENES: Record<ArtName, ReactNode> = {
  booking: <Booking />,
  consulting: <Consulting />,
  bootcamp: <Bootcamp />,
  inspection: <Inspection />,
  briefing: <Briefing />,
  palette: <Palette />,
  movies: <Movies />,
};

export function VisualArt({ art }: { art: ArtName }) {
  return (
    <svg
      viewBox="0 0 160 96"
      className="va block h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="160" height="96" className="fill-paper" />
      {SCENES[art]}
    </svg>
  );
}
