import { describe, it, expect, vi } from "vitest";
import { startTabTitle, formatDuration, TAB_MESSAGES } from "./tab-title";

function setup(reducedMotion = false, locale: "en" | "fr" = "en") {
  let listener: () => void = () => {};
  const doc = {
    title: "Bassem Fayed",
    hidden: false,
    addEventListener: (_: "visibilitychange", cb: () => void) => (listener = cb),
    removeEventListener: vi.fn(),
  };
  let t = 0;
  const stop = startTabTitle({ doc, locale, reducedMotion, now: () => t });
  const toggle = (hidden: boolean) => {
    doc.hidden = hidden;
    listener();
  };
  return { doc, stop, toggle, advance: (ms: number) => { t += ms; vi.advanceTimersByTime(ms); } };
}

describe("tab title wink", () => {
  it("formats durations", () => {
    expect(formatDuration(7.9)).toBe("7s");
    expect(formatDuration(125)).toBe("2m05s");
  });

  it("animates while hidden, greets on return, then restores the real title", () => {
    vi.useFakeTimers();
    const { doc, toggle, advance } = setup();
    toggle(true);
    expect(doc.title).toBe(TAB_MESSAGES.en.away[0]);
    advance(1500);
    expect(doc.title).toBe("away 1s");
    advance(1500);
    expect(doc.title).toBe(TAB_MESSAGES.en.away[1]);
    toggle(false);
    expect(doc.title).toBe("Welcome back!");
    advance(2500);
    expect(doc.title).toBe("Bassem Fayed");
    vi.useRealTimers();
  });

  it("counts returns and speaks French", () => {
    vi.useFakeTimers();
    const { doc, toggle, advance } = setup(false, "fr");
    toggle(true); toggle(false); advance(2500);
    toggle(true); toggle(false);
    expect(doc.title).toBe("Re-bienvenue ! (retour n°2)");
    vi.useRealTimers();
  });

  it("keeps a static title with reduced motion", () => {
    vi.useFakeTimers();
    const { doc, toggle, advance } = setup(true);
    toggle(true);
    const away = doc.title;
    advance(10000);
    expect(doc.title).toBe(away);
    vi.useRealTimers();
  });

  it("restores the title on cleanup", () => {
    vi.useFakeTimers();
    const { doc, stop, toggle } = setup();
    toggle(true);
    stop();
    expect(doc.title).toBe("Bassem Fayed");
    vi.useRealTimers();
  });
});
