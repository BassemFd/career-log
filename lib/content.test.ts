import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { projects, experience, contentByLocale } from "./content";

describe("content ordering", () => {
  it("sorts projects newest year first", () => {
    const years = projects.map((p) => p.year);
    const sorted = [...years].sort((a, b) => b.localeCompare(a));
    expect(years).toEqual(sorted);
  });

  it("floats the present role to the top of experience", () => {
    const presentIndex = experience.findIndex((e) => e.end === "present");
    if (presentIndex !== -1) expect(presentIndex).toBe(0);
  });
});

describe("milestones", () => {
  it("sorts milestones newest date first", () => {
    const dates = contentByLocale.en.milestones.map((m) => m.date);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
  });

  it("keeps EN and FR milestones in sync (same dates and types)", () => {
    const shape = (l: "en" | "fr") =>
      contentByLocale[l].milestones.map((m) => `${m.date}:${m.type}`);
    expect(shape("fr")).toEqual(shape("en"));
  });

  it("uses YYYY or YYYY-MM dates", () => {
    for (const m of contentByLocale.en.milestones) {
      expect(m.date).toMatch(/^\d{4}(-(0[1-9]|1[0-2]))?$/);
    }
  });
});

describe("site visuals", () => {
  const entries = (l: "en" | "fr") => {
    const c = contentByLocale[l];
    return [
      ...c.experience.map((e) => ({ key: `experience:${e.company}`, visual: e.visual })),
      ...c.education.map((e) => ({ key: `education:${e.school}`, visual: e.visual })),
      ...c.projects.map((p) => ({ key: `project:${p.slug}`, visual: p.visual })),
    ];
  };
  const withVisual = (l: "en" | "fr") =>
    entries(l).filter((e): e is { key: string; visual: NonNullable<typeof e.visual> } =>
      Boolean(e.visual),
    );

  it("only links public https pages, and shows the host it links to", () => {
    for (const { key, visual } of withVisual("en")) {
      const url = new URL(visual.url);
      expect(url.protocol, key).toBe("https:");
      expect(url.hostname.replace(/^www\./, ""), key).toBe(visual.domain);
    }
  });

  it("keeps EN and FR visuals in sync (same entries, scene, domain and image)", () => {
    const shape = (l: "en" | "fr") =>
      withVisual(l).map(
        ({ key, visual }) => `${key}:${visual.art}:${visual.domain}:${visual.image ?? ""}`,
      );
    expect(shape("fr")).toEqual(shape("en"));
  });

  it("points images at files that exist under public/visuals", () => {
    for (const l of ["en", "fr"] as const) {
      for (const { key, visual } of withVisual(l)) {
        if (!visual.image) continue;
        expect(visual.image, key).toMatch(/^\/visuals\/[\w-]+\.(webp|png|jpe?g)$/);
        expect(existsSync(join(process.cwd(), "public", visual.image)), key).toBe(true);
      }
    }
  });

  it("uses real screenshots for the owner's own sites only (clients get the drawn scene)", () => {
    for (const l of ["en", "fr"] as const) {
      for (const { key, visual } of withVisual(l)) {
        if (!visual.image) continue;
        const host = new URL(visual.url).hostname;
        expect(host.endsWith(".bassemfayed.com"), `${l} ${key}: ${host}`).toBe(true);
      }
    }
  });

  it("shows each screenshot once per locale (a site's drawn scene covers its second entry)", () => {
    for (const l of ["en", "fr"] as const) {
      const images = withVisual(l).flatMap(({ visual }) => (visual.image ? [visual.image] : []));
      expect(new Set(images).size, l).toBe(images.length);
    }
  });

  it("has at least one visual so the feature is exercised", () => {
    expect(withVisual("en").length).toBeGreaterThan(0);
  });
});
