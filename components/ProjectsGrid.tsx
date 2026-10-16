"use client";

import { useState } from "react";
import type { Project, ProjectCategory } from "@/lib/types";
import type { STRINGS } from "@/lib/strings";
import { shortHash } from "@/lib/hash";
import { SectionLabel } from "./StatsSection";
import { SiteVisual } from "./SiteVisual";

// Each category gets its own hue — carried through the filter pill, the spine
// node, and the short-hash color on the card, so color encodes what kind of
// work it is rather than just decorating it.
const CATEGORY_COLOR: Record<ProjectCategory, { text: string; border: string; bg: string }> = {
  personal: { text: "text-accent", border: "border-accent", bg: "bg-accent-soft" },
  client: { text: "text-teal", border: "border-teal", bg: "bg-teal-soft" },
  dojo: { text: "text-violet", border: "border-violet", bg: "bg-violet-soft" },
};

// Projects as commit nodes on a branch line: each card hangs off the spine with
// its short hash, so the section reads as a log of shipped work.
export function ProjectsGrid({
  projects,
  t,
}: {
  projects: Project[];
  t: (typeof STRINGS)["en"];
}) {
  const [filter, setFilter] = useState<ProjectCategory | "all">("all");
  const shown =
    filter === "all"
      ? projects
      : projects.filter((p) => p.category === filter);

  const filters: { key: ProjectCategory | "all"; label: string }[] = [
    { key: "all", label: t.filterAll },
    { key: "personal", label: t.filterPersonal },
    { key: "client", label: t.filterClient },
    { key: "dojo", label: t.filterTraining },
  ];

  return (
    <section id="work" className="border-b border-rule">
      <div className="max-w-3xl px-6 py-14 lg:px-16">
        <SectionLabel title={t.sectionWorklog} />

        <div className="mt-6 flex flex-wrap gap-2 font-mono text-xs">
          {filters.map((f) => {
            const color = f.key === "all" ? null : CATEGORY_COLOR[f.key];
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`inline-flex min-h-11 items-center rounded-full border px-4 transition-colors sm:min-h-8 sm:px-3 ${
                  active
                    ? `${color?.border ?? "border-accent"} ${color?.bg ?? "bg-accent-soft"} ${color?.text ?? "text-accent"}`
                    : "border-rule text-muted hover:border-accent hover:text-accent"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* the branch line */}
        <div className="relative mt-8 pl-8">
          <span className="spine-line absolute left-[7px] top-2 bottom-2 w-px bg-rule" />
          <ol className="space-y-4">
            {shown.map((p) => (
              <li key={p.slug} className="crazy-item relative">
                <span
                  className={`absolute -left-[27px] top-6 h-3.5 w-3.5 rounded-full border-2 bg-card ${CATEGORY_COLOR[p.category].border}`}
                />
                <ProjectCard project={p} t={t} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// The whole card stays clickable (a stretched link on the title), while the
// side thumbnail is its own link sitting above it — never nested anchors.
function ProjectCard({
  project: p,
  t,
}: {
  project: Project;
  t: (typeof STRINGS)["en"];
}) {
  const href = p.links.live ?? p.links.github;

  return (
    <div
      className={`relative rounded-lg border border-rule bg-card p-5 transition-colors ${
        href ? "hover:border-accent focus-within:border-accent" : ""
      }`}
    >
      <div className="sm:flex sm:items-start sm:gap-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-3">
            <span className={`font-mono text-xs ${CATEGORY_COLOR[p.category].text}`}>
              {shortHash(p.slug)}
            </span>
            <h3 className="font-display text-lg font-semibold tracking-tight">
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="after:absolute after:inset-0 focus-visible:outline-none"
                >
                  {p.title}
                </a>
              ) : (
                p.title
              )}
            </h3>
            {p.role === "contributor" && (
              <span className="rounded bg-accent-soft px-1.5 py-0.5 font-mono text-xs uppercase tracking-wider text-accent">
                {t.contributor}
              </span>
            )}
            <span className="ml-auto font-mono text-xs text-muted">{p.year}</span>
          </div>

          <p className="mt-2 text-[14px] leading-relaxed text-ink/75">{p.blurb}</p>

          {p.stack.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5 font-mono text-xs text-muted">
              {p.stack.map((s) => (
                <li key={s} className="rounded border border-rule px-1.5 py-0.5">
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {p.visual && (
          <SiteVisual visual={p.visual} t={t} className="mt-5 sm:mt-1 sm:w-40" />
        )}
      </div>
    </div>
  );
}
