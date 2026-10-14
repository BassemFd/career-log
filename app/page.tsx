"use client";

import Hero from "@/components/Hero";
import StatsSection from "@/components/StatsSection";
import ProjectsGrid from "@/components/ProjectsGrid";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import EducationSection from "@/components/EducationSection";
import { contentByLocale } from "@/lib/content";
import { STRINGS } from "@/lib/strings";
import { useLocale } from "@/components/LocaleProvider";

export default function Home() {
  const { locale } = useLocale();
  const { profile, projects, experience, stats, education, certifications } =
    contentByLocale[locale];
  const t = STRINGS[locale];

  return (
    <main>
      <Hero profile={profile} recent={projects.slice(0, 4)} />
      <ExperienceTimeline experience={experience} t={t} />
      <StatsSection stats={stats} t={t} />
      <ProjectsGrid projects={projects} t={t} />
      <EducationSection education={education} certifications={certifications} t={t} />

      <footer className="max-w-3xl px-6 py-10 lg:px-16">
        <div className="flex flex-col gap-3 font-mono text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            {t.footerMadeWith} <span role="img" aria-label="love">❤️‍🔥</span> {t.footerBy}{" "}
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="font-semibold text-accent hover:underline"
            >
              BF
            </a>
          </p>
          <nav aria-label="Author links" className="flex flex-wrap gap-x-4 gap-y-1">
            {[
              { label: "GitHub", href: profile.socials.github },
              { label: "LinkedIn", href: profile.socials.linkedin },
              { label: t.footerSource, href: `${profile.socials.github}/career-log` },
              { label: t.footerEmail, href: `mailto:${profile.socials.email}` },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                {...(l.href.startsWith("http") && { target: "_blank", rel: "noreferrer" })}
                className="underline decoration-rule underline-offset-4 hover:text-accent"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <p className="mt-4 font-mono text-xs text-muted">
          {t.footerBuiltWith} <span className="text-ink">{t.footerContentLives}</span>
        </p>
      </footer>
    </main>
  );
}
