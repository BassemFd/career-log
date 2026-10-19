#!/usr/bin/env node
/**
 * Refreshes everything on the site that can be derived from the public GitHub
 * account. Run locally or by .github/workflows/refresh.yml (weekly).
 *
 * 1. Rewrites the `live` block + `liveFetchedAt` of content/stats.json and
 *    content/fr/stats.json. `manual` and `activity` are left untouched.
 * 2. Appends any new public, non-fork repo that isn't already linked from
 *    content/projects.json (EN + FR) as a draft entry built from the repo's
 *    description — polish the blurb by hand afterwards.
 *
 * Usage:  node scripts/refresh-github-stats.mjs
 *
 * Needs a token for the GraphQL contributions total (any token works — no scope
 * needed). Uses GITHUB_TOKEN, falling back to `gh auth token` locally.
 *
 * The merged-PR total counts private repos too (none is ever named), so only a
 * token that can see them can count it: yours, when run locally. The workflow's
 * GITHUB_TOKEN only sees this repo, so in CI the last local total is kept.
 */

import { readFile, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const USER = "BassemFd";
const CONTRIBUTIONS_SINCE = 2021;
// Public repos that must never become their own work-log entry: this site, and
// Stach's split backends (covered by the Stach entry).
const IGNORED_REPOS = ["career-log", "stach-app-backend", "stach-web-back-front"];

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const STATS = ["content/stats.json", "content/fr/stats.json"];
const PROJECTS = ["content/projects.json", "content/fr/projects.json"];

const token =
  process.env.GITHUB_TOKEN ||
  (() => {
    try {
      return execSync("gh auth token", { encoding: "utf8" }).trim();
    } catch {
      return "";
    }
  })();
if (!token) throw new Error("No token: set GITHUB_TOKEN or run `gh auth login`.");

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "career-log-stats",
  Authorization: `Bearer ${token}`,
};

async function gh(path, init) {
  const res = await fetch(`https://api.github.com/${path}`, { headers, ...init });
  if (!res.ok) throw new Error(`GitHub ${path} → ${res.status} ${res.statusText}`);
  const body = await res.json();
  if (body.errors) throw new Error(`GitHub ${path} → ${JSON.stringify(body.errors)}`);
  return body;
}

// contributionsCollection spans at most one year, so query one year at a time.
async function contributionsSince(year) {
  let total = 0;
  for (let y = year; y <= new Date().getUTCFullYear(); y++) {
    const query = `{ user(login: "${USER}") { contributionsCollection(from: "${y}-01-01T00:00:00Z", to: "${y}-12-31T23:59:59Z") { contributionCalendar { totalContributions } } } }`;
    const { data } = await gh("graphql", { method: "POST", body: JSON.stringify({ query }) });
    total += data.user.contributionsCollection.contributionCalendar.totalContributions;
  }
  return total;
}

// Authored merged PRs, public and private. In CI the token can't see private
// repos, so the total last counted locally is kept instead of shrinking it.
async function mergedPRs(previous) {
  if (process.env.GITHUB_ACTIONS) return previous;
  const prs = await gh(
    `search/issues?q=${encodeURIComponent(`is:pr is:merged author:${USER}`)}`,
  );
  return prs.total_count;
}

const readJson = async (p) => JSON.parse(await readFile(join(root, p), "utf8"));
const writeJson = (p, v) =>
  writeFile(join(root, p), JSON.stringify(v, null, 2) + "\n", "utf8");

async function main() {
  const user = await gh(`users/${USER}`);
  const repos = await gh(`users/${USER}/repos?per_page=100`);
  const own = repos.filter((r) => !r.fork && !r.archived);
  const previous = await readJson(STATS[0]);

  const live = {
    publicRepos: user.public_repos,
    totalStars: own.reduce((sum, r) => sum + (r.stargazers_count || 0), 0),
    mergedPRs: await mergedPRs(previous.live.mergedPRs),
    contributions: await contributionsSince(CONTRIBUTIONS_SINCE),
  };
  const liveFetchedAt = new Date().toISOString();
  for (const p of STATS) {
    const stats = await readJson(p);
    await writeJson(p, { ...stats, liveFetchedAt, live });
  }
  console.log("live:", JSON.stringify(live));

  for (const p of PROJECTS) {
    const projects = await readJson(p);
    const linked = new Set(
      projects.map((x) => x.links.github?.toLowerCase()).filter(Boolean),
    );
    const added = own
      .filter((r) => !IGNORED_REPOS.includes(r.name.toLowerCase()))
      .filter((r) => !linked.has(r.html_url.toLowerCase()))
      .map((r) => ({
        slug: r.name.toLowerCase(),
        title: r.name,
        blurb: r.description ?? "",
        role: "owner",
        stack: r.language ? [r.language] : [],
        year: r.created_at.slice(0, 4),
        links: { github: r.html_url, live: r.homepage || null },
        featured: false,
        category: "personal",
      }));
    if (added.length) {
      await writeJson(p, [...added, ...projects]);
      console.log(`${p}: added draft ${added.map((a) => a.slug).join(", ")}`);
    }
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
