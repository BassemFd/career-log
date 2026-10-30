import { useId } from "react";

// What jumps out from behind a site thumbnail when it is hovered in the WTF
// theme: a kraken for the consulting firm, sparkles for the booking app, and so
// on. Pure SVG + CSS (see "Hover extras" in globals.css), drawn in a box that
// extends past the panel on every side so the creatures can poke out of it.
// Hidden unless the WTF theme is on and motion is allowed.

const gear = (cx: number, cy: number, r: number, teeth: number) => {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? r : r * 0.78;
    const a2 = a + Math.PI / (teeth * 2) / 2;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
    pts.push(`${(cx + Math.cos(a2) * rr).toFixed(1)},${(cy + Math.sin(a2) * rr).toFixed(1)}`);
  }
  return pts.join(" ");
};

const star = (cx: number, cy: number, r: number) =>
  `M${cx},${cy - r} Q${cx},${cy} ${cx + r},${cy} Q${cx},${cy} ${cx},${cy + r} Q${cx},${cy} ${cx - r},${cy} Q${cx},${cy} ${cx},${cy - r}Z`;

// [path, tentacle base x, base y] — each grows out from behind the panel.
const TENTACLES: [string, number, number][] = [
  ["M72,140 C44,150 24,114 10,126 C2,134 8,150 20,144", 72, 140],
  ["M68,78 C36,82 22,50 8,60 C-2,68 6,84 18,78", 68, 78],
  ["M228,140 C256,150 276,114 290,126 C298,134 292,150 280,144", 228, 140],
  ["M232,78 C264,82 278,50 292,60 C300,68 294,84 282,78", 232, 78],
  ["M112,166 C106,188 90,196 80,186", 112, 166],
  ["M188,166 C194,188 210,196 220,186", 188, 166],
  ["M120,52 C112,22 138,12 152,30", 120, 52],
  ["M184,54 C194,24 170,14 160,32", 184, 54],
];

function Kraken({ uid }: { uid: string }) {
  return (
    <>
      <defs>
        {TENTACLES.map(([d], i) => (
          <mask key={i} id={`${uid}m${i}`}>
            <path
              d={d}
              pathLength={1}
              className="sx-grow"
              style={{ ["--i" as string]: i }}
              fill="none"
              stroke="#fff"
              strokeWidth={30}
              strokeLinecap="round"
            />
          </mask>
        ))}
      </defs>
      {TENTACLES.map(([d, bx, by], i) => (
        <g
          key={i}
          className="sx-wiggle"
          style={{ transformOrigin: `${bx}px ${by}px`, ["--i" as string]: i }}
        >
          <g mask={`url(#${uid}m${i})`}>
            <path d={d} fill="none" stroke="#04281c" strokeWidth={19} strokeLinecap="round" />
            <path d={d} fill="none" stroke="#1ea972" strokeWidth={13} strokeLinecap="round" />
            <path
              d={d}
              fill="none"
              stroke="#c9ffe0"
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray="0.1 10"
            />
          </g>
        </g>
      ))}
    </>
  );
}

function Sparkles() {
  const spots: [number, number, number][] = [
    [30, 40, 16], [270, 36, 18], [26, 160, 11], [274, 166, 13], [150, 14, 9], [150, 188, 10],
  ];
  return (
    <>
      {spots.map(([x, y, r], i) => (
        <path
          key={i}
          d={star(x, y, r)}
          className="sx-pop sx-twinkle"
          style={{ ["--i" as string]: i }}
          fill={i % 2 ? "#e8ff9a" : "#8dffc0"}
          stroke="#04281c"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      ))}
    </>
  );
}

function Gears() {
  return (
    <>
      <g className="sx-pop" style={{ ["--i" as string]: 0 }}>
        <polygon
          points={gear(36, 150, 22, 9)}
          className="sx-spin"
          fill="#1ea972"
          stroke="#04281c"
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <circle cx={36} cy={150} r={7} fill="#04281c" />
      </g>
      <g className="sx-pop" style={{ ["--i" as string]: 1 }}>
        <polygon
          points={gear(268, 56, 18, 8)}
          className="sx-spin sx-spin-rev"
          fill="#c8e85a"
          stroke="#04281c"
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <circle cx={268} cy={56} r={5} fill="#04281c" />
      </g>
    </>
  );
}

function Rocket() {
  return (
    <g transform="translate(262 70) rotate(35) scale(0.6)">
      <g className="sx-rocket">
        <g transform="translate(-150 -76)">
          <path d="M150,30 C170,52 170,92 164,112 H136 C130,92 130,52 150,30Z" fill="#f2fff6" stroke="#04281c" strokeWidth={3} strokeLinejoin="round" />
          <circle cx={150} cy={68} r={9} fill="#3cdcc8" stroke="#04281c" strokeWidth={3} />
          <path d="M136,96 L118,122 L136,114Z M164,96 L182,122 L164,114Z" fill="#1ea972" stroke="#04281c" strokeWidth={3} strokeLinejoin="round" />
          <path className="sx-flame" d="M142,114 Q150,150 158,114Z" fill="#ffd84a" stroke="#04281c" strokeWidth={2.5} strokeLinejoin="round" />
        </g>
      </g>
    </g>
  );
}

function Eyes() {
  return (
    <g className="sx-peek">
      {[112, 188].map((x, i) => (
        <g key={x}>
          <ellipse cx={x} cy={30} rx={18} ry={20} fill="#fff" stroke="#04281c" strokeWidth={3} />
          <circle cx={x + (i ? -4 : 4)} cy={34} r={7} fill="#04281c" className="sx-pupil" />
        </g>
      ))}
    </g>
  );
}

function Splats() {
  const dots: [number, number, number, string][] = [
    [32, 60, 14, "#8dffc0"], [270, 48, 16, "#c8e85a"], [268, 160, 12, "#3cdcc8"],
    [34, 152, 16, "#ffe45a"], [150, 188, 9, "#1ea972"], [54, 20, 8, "#c8e85a"],
  ];
  return (
    <>
      {dots.map(([x, y, r, c], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={r}
          fill={c}
          stroke="#04281c"
          strokeWidth={3}
          className="sx-pop"
          style={{ ["--i" as string]: i }}
        />
      ))}
    </>
  );
}

function Reel() {
  const holes = [0, 60, 120, 180, 240, 300];
  return (
    <>
      <g className="sx-pop" style={{ ["--i" as string]: 0 }}>
        <g className="sx-spin">
          <circle cx={40} cy={44} r={26} fill="#1ea972" stroke="#04281c" strokeWidth={3} />
          {holes.map((a) => (
            <circle
              key={a}
              cx={40 + Math.cos((a * Math.PI) / 180) * 15}
              cy={44 + Math.sin((a * Math.PI) / 180) * 15}
              r={5}
              fill="#04281c"
            />
          ))}
          <circle cx={40} cy={44} r={4} fill="#c9ffe0" />
        </g>
      </g>
      {[[262, 150], [240, 178], [278, 184]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={8} fill="#fff3b0" stroke="#04281c" strokeWidth={3} className="sx-pop" style={{ ["--i" as string]: i + 1 }} />
      ))}
    </>
  );
}

export function SiteVisualExtras({ art }: { art: string }) {
  const uid = useId().replace(/:/g, "");
  let body: React.ReactNode = null;
  switch (art) {
    case "consulting": body = <Kraken uid={uid} />; break;
    case "booking": body = <Sparkles />; break;
    case "inspection": body = <Gears />; break;
    case "bootcamp": body = <Rocket />; break;
    case "briefing": body = <Eyes />; break;
    case "palette": body = <Splats />; break;
    case "movies": body = <Reel />; break;
    default: return null;
  }
  return (
    <svg
      viewBox="0 0 300 196"
      className="site-visual-extra"
      data-extra={art}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="none"
    >
      {body}
    </svg>
  );
}
