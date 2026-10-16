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
}

export interface Education {
  school: string;
  degree: string;
  period: string;
  note: string;
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
