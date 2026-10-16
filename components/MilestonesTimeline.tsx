import type { Milestone, MilestoneType } from "@/lib/types";
import type { STRINGS } from "@/lib/strings";
import { SectionLabel } from "./StatsSection";

// Badge colour per milestone type, design tokens only.
const TYPE_STYLE: Record<MilestoneType, string> = {
  role: "bg-accent-soft text-accent",
  mission: "bg-teal-soft text-teal",
  promotion: "bg-live-soft text-live",
  certification: "bg-violet-soft text-violet",
  figure: "bg-manual-soft text-manual",
  education: "border border-rule text-muted",
};

// "2022-06" → "Jun 2022" / "juin 2022"; a bare "2021" stays as is.
function formatDate(date: string, numberLocale: string): string {
  const [year, month] = date.split("-");
  if (!month) return year;
  return new Date(Date.UTC(Number(year), Number(month) - 1, 1)).toLocaleDateString(
    numberLocale,
    { month: "short", year: "numeric", timeZone: "UTC" },
  );
}

// Dated career milestones read as `git tag -n`: one annotated tag per line,
// newest first. Ordering comes from lib/content.ts.
export default function MilestonesTimeline({
  milestones,
  t,
}: {
  milestones: Milestone[];
  t: (typeof STRINGS)["en"];
}) {
  if (milestones.length === 0) return null;

  return (
    <section id="milestones" className="border-b border-rule">
      <div className="max-w-3xl px-6 py-14 lg:px-16">
        <SectionLabel title={t.sectionMilestones} />

        <ol className="mt-8 space-y-4">
          {milestones.map((m, i) => (
            <li
              key={`${m.date}-${i}`}
              className="crazy-item grid gap-x-5 gap-y-1 sm:grid-cols-[6.5rem_1fr]"
            >
              <time
                dateTime={m.date}
                className="pt-0.5 font-mono text-xs text-muted"
              >
                {formatDate(m.date, t.numberLocale)}
              </time>
              <div>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-xs uppercase tracking-wider ${TYPE_STYLE[m.type]}`}
                  >
                    {t.milestoneTypes[m.type]}
                  </span>
                  <h3 className="text-sm font-medium text-ink">{m.title}</h3>
                </div>
                {m.detail && (
                  <p className="mt-1 text-[14px] leading-relaxed text-ink/75">
                    {m.detail}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
