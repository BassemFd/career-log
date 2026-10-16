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
