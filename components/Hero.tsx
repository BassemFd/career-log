import type { Profile, Project } from "@/lib/types";
import { shortHash } from "@/lib/hash";
import CommitGraphBackdrop from "./CommitGraphBackdrop";
import GlitchText from "./GlitchText";
import HeroPaint from "./HeroPaint";
import NameHeading from "./NameHeading";

// The hero opens like the top of a `git log --oneline`: the most recent work,
// framed as HEAD. It doubles as proof-of-activity and a teaser for the log below.
export default function Hero({
  profile,
  recent,
}: {
  profile: Profile;
  recent: Project[];
}) {
  const handle = profile.socials.github.split("/").pop() ?? "";

  return (
    <header className="relative overflow-hidden border-b border-rule">
      <CommitGraphBackdrop />
      <HeroPaint />
      <div className="relative max-w-3xl px-6 pt-16 pb-12 sm:pt-24 sm:pb-16 lg:px-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          {profile.location}
        </p>

        <NameHeading className="mt-5 font-display font-semibold leading-[0.95] tracking-tight text-[clamp(2.75rem,9vw,7rem)]">
          <GlitchText text={profile.name} />
        </NameHeading>
        <p className="mt-4 font-display text-2xl text-accent sm:text-3xl">
          <GlitchText text={profile.tagline} />
        </p>

        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink/80">
          {profile.summary}
        </p>

        {/* git log teaser */}
        <div className="mt-10 overflow-hidden rounded-lg border border-rule bg-card">
          <div className="flex items-center gap-2 border-b border-rule px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rule" />
            <span className="h-2.5 w-2.5 rounded-full bg-rule" />
            <span className="h-2.5 w-2.5 rounded-full bg-rule" />
            <span className="ml-2 font-mono text-xs text-muted">
              {handle} — git log --oneline
            </span>
          </div>
          <ul className="divide-y divide-rule font-mono text-[13px]">
            {recent.map((p, i) => (
              <li
                key={p.slug}
                className="crazy-item flex items-baseline gap-3 px-4 py-2.5"
              >
                <span className="text-accent">{shortHash(p.slug)}</span>
                {i === 0 && (
                  <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-accent">
                    HEAD
                  </span>
                )}
                <span className="truncate text-ink/80">
                  {p.title.toLowerCase().replace(/\s+/g, "-")}: {p.blurb.split("—")[0].trim().toLowerCase()}
                </span>
                <span className="ml-auto shrink-0 text-muted">{p.year}</span>
              </li>
            ))}
          </ul>
        </div>

        <nav className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-sm">
          <a
            href={profile.socials.github}
            className="text-ink underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
            target="_blank"
            rel="noreferrer"
          >
            github
          </a>
          {profile.socials.linkedin && (
            <a
              href={profile.socials.linkedin}
              className="text-ink underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              target="_blank"
              rel="noreferrer"
            >
              linkedin
            </a>
          )}
          <a
            href={`mailto:${profile.socials.email}`}
            className="text-ink underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
          >
            {profile.socials.email}
          </a>
        </nav>
      </div>
    </header>
  );
}
