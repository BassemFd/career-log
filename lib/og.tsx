import { ImageResponse } from "next/og";
import { profile, projects } from "@/lib/content";
import { shortHash } from "@/lib/hash";

// Shared link-preview card for opengraph-image and twitter-image. Satori can't
// read CSS variables or Tailwind, so the colors are the light/gutter tokens
// from app/globals.css written out as rgb().
const gutter = "rgb(15 17 21)";
const gutterLine = "rgb(36 40 51)";
const gutterMuted = "rgb(145 153 166)";
const gutterAccent = "rgb(91 124 255)";
const paper = "rgb(246 247 249)";
const live = "rgb(52 211 153)";

export const ogSize = { width: 1200, height: 630 };
export const ogAlt = `${profile.name} — ${profile.tagline}`;
export const ogContentType = "image/png";

export function renderOgImage(): ImageResponse {
  const head = shortHash(profile.name);
  const recent = projects.slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: gutter,
          color: paper,
          borderLeft: `16px solid ${gutterAccent}`,
        }}
      >
        <div style={{ display: "flex", fontSize: 26, color: gutterMuted }}>
          <span style={{ color: gutterAccent }}>$</span>
          <span style={{ marginLeft: 14 }}>git log --oneline</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 24, color: live }}>
            {`commit ${head} (HEAD -> main)`}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 12,
              fontSize: 84,
              fontWeight: 700,
              letterSpacing: -2,
            }}
          >
            {profile.name}
          </div>
          <div style={{ display: "flex", marginTop: 8, fontSize: 38, color: gutterMuted }}>
            {profile.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingTop: 24,
            borderTop: `2px solid ${gutterLine}`,
            fontSize: 22,
            color: gutterMuted,
          }}
        >
          {recent.map((p) => (
            <div key={p.slug} style={{ display: "flex", marginTop: 6 }}>
              <span style={{ color: gutterAccent, width: 120 }}>{shortHash(p.slug)}</span>
              <span>{`${p.year} · ${p.title}`}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
            <span>{profile.location}</span>
            <span style={{ color: paper }}>bassemfayed.com</span>
          </div>
        </div>
      </div>
    ),
    ogSize,
  );
}
