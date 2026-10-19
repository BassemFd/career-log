export interface Profile {
  name: string;
  tagline: string;
  summary: string;
  location: string;
  // Public path of the CV PDF under /public (e.g. "/cv-bassem-fayed.pdf").
  // Optional: the hero's "Download CV" button only renders when it's set.
  cv?: string;
  socials: {
    github: string;
    linkedin: string;
    email: string;
  };
}

// The drawn scene shown inside a SiteVisual thumbnail when no real image is set.
export type VisualArt =
  | "booking"
  | "consulting"
  | "bootcamp"
  | "inspection"
  | "briefing"
  | "palette"
  | "movies";

// A clickable thumbnail shown beside an entry. It only ever points at a public
// web page (never a private repo or client system) and opens in a new tab.
export interface Visual {
  // Public page the thumbnail opens (https only).
  url: string;
  // Host shown under the thumbnail, as typed in the address bar.
  domain: string;
  // Which animated scene to draw. Kept in sync across content/ and content/fr/.
  art: VisualArt;
  // Optional real screenshot under /public (e.g. "/visuals/ai-watch.webp"), only
  // for the owner's own sites (a client, employer or school site uses `art`): a 1:2
  // capture (640x1280) of the page's first screens, which the window scrolls
  // through slowly. Without it, the drawn `art` scene plays instead.
  image?: string;
}

export type ProjectRole = "owner" | "contributor";
export type ProjectCategory = "personal" | "dojo" | "client";

export interface Project {
  slug: string;
  title: string;
  blurb: string;
  role: ProjectRole;
  stack: string[];
  year: string;
  links: {
    github: string | null;
    live: string | null;
  };
  featured: boolean;
  category: ProjectCategory;
  visual?: Visual;
}

export interface Experience {
  company: string;
  role: string;
  start: string;
  end: string;
  location: string;
  summary: string;
  stack: string[];
  confidential: boolean;
  // Curated emphasis — renders a "Flagship" badge and a filled node. Order is
  // still driven by dates; this only changes visual weight.
  flagship: boolean;
  visual?: Visual;
}

export interface Education {
  school: string;
  degree: string;
  period: string;
  note: string;
  visual?: Visual;
}

export interface Certification {
  name: string;
  issuer: string;
  issued: string;
  expires: string;
  credentialId: string;
}

export type MilestoneType =
  | "role"
  | "mission"
  | "promotion"
  | "certification"
  | "figure"
  | "education";

export interface Milestone {
  // "YYYY-MM", or "YYYY" when the month isn't known. Never translated in
  // content/fr — the display label is formatted per locale at render time.
  date: string;
  type: MilestoneType;
  title: string;
  detail: string;
}

export interface ManualStat {
  label: string;
  value: string;
  note: string;
  source: "manual";
}

export interface LiveStats {
  publicRepos: number;
  totalStars: number;
  // Authored merged PRs, public + private repos (none named). Only a local run
  // sees private repos, so CI keeps the last local total.
  mergedPRs: number;
  // Calendar total since CONTRIBUTIONS_SINCE, private included (the profile shows
  // private contributions, so restrictedContributionsCount is visible to any token).
  contributions: number;
}

export interface ActivityShare {
  label: string;
  pct: number;
}

export interface ActivityMix {
  note: string;
  breakdown: ActivityShare[];
}

export interface Stats {
  manual: ManualStat[];
  activity: ActivityMix;
  liveFetchedAt: string;
  live: LiveStats;
}
