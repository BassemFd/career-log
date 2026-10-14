import type { Stats, ActivityMix } from "@/lib/types";
import type { STRINGS } from "@/lib/strings";

// Stats rendered as a shortlog-style datasheet: label on the left, value on the
// right, hairline rows. Live GitHub numbers carry a small "fetched" timestamp so
// their freshness is honest; manual numbers are marked as aggregates.
export default function StatsSection({
  stats,
  t,
}: {
  stats: Stats;
  t: (typeof STRINGS)["en"];
}) {
  const fetched = new Date(stats.liveFetchedAt).toLocaleDateString("en-CA");

  const live: { label: string; value: string; note: string }[] = [
    {
      label: t.statContributions,
      value: stats.live.contributions.toLocaleString(t.numberLocale),
      note: t.statContributionsNote,
    },
    {
      label: t.statPublicRepos,
      value: String(stats.live.publicRepos),
      note: "github.com/BassemFd",
    },
    {
      label: t.statPublicPRs,
      value: String(stats.live.mergedPRs),
      note: t.statPublicPRsNote,
    },
    {
      label: t.statStarsEarned,
      value: String(stats.live.totalStars),
      note: t.statStarsNote,
    },
  ];

  return (
    <section id="stats" className="border-b border-rule">
      <div className="max-w-3xl px-6 py-14 lg:px-16">
        <SectionLabel title={t.sectionShortlog} />

        <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-rule bg-rule sm:grid-cols-2">
          {stats.manual.map((s) => (
            <StatRow
              key={s.label}
              label={s.label}
              value={s.value}
              note={s.note}
              source="manual"
              t={t}
            />
          ))}
          {live.map((s) => (
            <StatRow
              key={s.label}
              label={s.label}
              value={s.value}
              note={s.note}
              source="live"
              t={t}
            />
          ))}
        </div>

        <p className="mt-3 font-mono text-xs text-muted">
          {t.liveFiguresNote(fetched)}
        </p>

        <ActivityMixBlock activity={stats.activity} t={t} />
      </div>
    </section>
  );
}

// Contribution-type split (PRs / reviews / commits / issues) as ranked horizontal
// bars — a single-series composition, so one accent hue carries magnitude and each
// row is directly labeled. Sourced manually: GitHub's API does not expose the
// per-type breakdown of private contributions, so it can't be fetched live.
function ActivityMixBlock({
  activity,
  t,
}: {
  activity: ActivityMix;
  t: (typeof STRINGS)["en"];
}) {
  return (
    <div className="mt-12">
      <div className="flex items-center gap-3">
        <h3 className="font-display text-base font-semibold text-ink">
          {t.activityMix}
        </h3>
        <span className="h-px flex-1 bg-rule" />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {activity.breakdown.map((a) => (
          <div key={a.label} className="crazy-item flex items-center gap-4">
            <div className="w-32 shrink-0 text-sm font-medium text-ink">
              {a.label}
            </div>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-rule">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${a.pct}%` }}
              />
            </div>
            <div className="w-12 shrink-0 text-right font-display text-lg font-semibold tabular-nums tracking-tight">
              {a.pct}%
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 flex items-center gap-2 font-mono text-xs text-muted">
        <span className="text-manual">○ {t.manualLabel}</span>
        <span>{activity.note}</span>
      </p>
    </div>
  );
}

function StatRow({
  label,
  value,
  note,
  source,
  t,
}: {
  label: string;
  value: string;
  note: string;
  source: "manual" | "live";
  t: (typeof STRINGS)["en"];
}) {
  return (
    <div className="crazy-item flex items-baseline justify-between gap-4 bg-card px-5 py-5">
      <div>
        <div className="text-sm font-medium text-ink">{label}</div>
        <div className="mt-0.5 flex items-center gap-2 font-mono text-xs text-muted">
          <span className={source === "live" ? "text-live" : "text-manual"}>
            {source === "live" ? `● ${t.liveLabel}` : `○ ${t.manualLabel}`}
          </span>
          <span>{note}</span>
        </div>
      </div>
      <div className="font-display text-3xl font-semibold tabular-nums tracking-tight">
        {value}
      </div>
    </div>
  );
}

export function SectionLabel({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <span className="h-px flex-1 bg-rule" />
    </div>
  );
}
