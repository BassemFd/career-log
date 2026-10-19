import type { Experience } from "@/lib/types";
import type { STRINGS } from "@/lib/strings";
import { SectionLabel } from "./StatsSection";
import { GlitchText } from "./GlitchText";
import { SiteVisual } from "./SiteVisual";

// Experience on the same spine metaphor: each role is a tagged release on the
// branch. Confidential roles render narrative only — no repo names, no links —
// except the company's public website, shown as a side thumbnail.
export function ExperienceTimeline({
  experience,
  t,
}: {
  experience: Experience[];
  t: (typeof STRINGS)["en"];
}) {
  return (
    <section id="experience" className="border-b border-rule">
      <div className="max-w-3xl px-6 py-14 lg:px-16">
        <SectionLabel title={t.sectionReleases} />

        <div className="relative mt-8 pl-8">
          <span className="spine-line absolute left-[7px] top-2 bottom-2 w-px bg-rule" />
          <ol className="space-y-6">
            {experience.map((e, i) => (
              <li key={`${e.company}-${i}`} className="crazy-item relative">
                <span
                  className={`absolute -left-[27px] top-1.5 h-3.5 w-3.5 rotate-45 border-2 border-accent ${
                    e.flagship ? "bg-accent" : "bg-card"
                  }`}
                />
                <div className={e.visual ? "visual-row" : undefined}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3
                        className={`font-display font-semibold tracking-tight ${
                          e.flagship ? "text-xl" : "text-lg"
                        }`}
                      >
                        <GlitchText text={e.company} />
                      </h3>
                      {e.flagship && (
                        <span className="rounded bg-accent px-1.5 py-0.5 font-mono text-xs uppercase tracking-wider text-card">
                          {t.flagship}
                        </span>
                      )}
                      {e.confidential && (
                        <span className="rounded bg-manual-soft px-1.5 py-0.5 font-mono text-xs uppercase tracking-wider text-manual">
                          {t.underNda}
                        </span>
                      )}
                      <span className="ml-auto font-mono text-xs text-muted">
                        {e.start} — {e.end === "present" ? t.present : e.end}
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-accent">{e.role}</p>
                  </div>
                  {e.visual && <SiteVisual visual={e.visual} t={t} className="sm:w-44" />}
                  <div className="min-w-0">
                    <p className="mt-2 text-[14px] leading-relaxed text-ink/75">
                      {e.summary}
                    </p>
                    {e.stack.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-1.5 font-mono text-xs text-muted">
                        {e.stack.map((s) => (
                          <li
                            key={s}
                            className="rounded border border-rule px-1.5 py-0.5"
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
