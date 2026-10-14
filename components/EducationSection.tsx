import type { Education, Certification } from "@/lib/types";
import type { STRINGS } from "@/lib/strings";
import { SectionLabel } from "./StatsSection";

export default function EducationSection({
  education,
  certifications,
  t,
}: {
  education: Education[];
  certifications: Certification[];
  t: (typeof STRINGS)["en"];
}) {
  return (
    <section id="formation" className="border-b border-rule">
      <div className="max-w-3xl px-6 py-14 lg:px-16">
        <SectionLabel title={t.sectionFormation} />

        <ul className="mt-8 space-y-5">
          {education.map((e) => (
            <li key={e.school} className="crazy-item">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="font-display text-lg font-semibold tracking-tight">
                  {e.school}
                </h3>
                <span className="ml-auto font-mono text-xs text-muted">
                  {e.period}
                </span>
              </div>
              <p className="mt-0.5 font-mono text-xs text-accent">{e.degree}</p>
              {e.note && (
                <p className="mt-1 text-[14px] leading-relaxed text-ink/75">
                  {e.note}
                </p>
              )}
            </li>
          ))}
        </ul>

        {certifications.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-3">
              <h3 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-ink">
                {t.certifications}
              </h3>
              <span className="h-px flex-1 bg-rule" />
            </div>

            <ul className="mt-6 space-y-3">
              {certifications.map((c) => (
                <li
                  key={c.credentialId}
                  className="crazy-item flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-lg border border-rule bg-card px-5 py-4"
                >
                  <div>
                    <div className="text-sm font-medium text-ink">{c.name}</div>
                    <div className="mt-0.5 font-mono text-xs text-muted">
                      {c.issuer} · {t.certIssued} {c.issued} · {t.certExpires} {c.expires}
                    </div>
                  </div>
                  <span className="font-mono text-xs text-muted">
                    {t.credentialId}: {c.credentialId}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
