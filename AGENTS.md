# AGENTS.md

Operating guide for AI agents working in this repo. Read this before editing.
For the human-facing narrative, see `README.md` — this file does not repeat it.

## What this is

A content-driven Next.js (App Router) portfolio for Bassem Fayed, deployed to
Cloudflare Workers via vinext. No database, no admin, no login. **Content is JSON
in `/content`.** You change the site by editing a file, committing, and running
`npm run deploy`. Most changes are data, not code.

## The core loop

1. Edit the relevant file (usually one in `/content`).
2. Run `npm run build` — it **must pass** before you commit.
3. Commit with a Conventional Commit message.
4. Push to `main`, then run `npm run deploy` to publish to Cloudflare
   Workers. There is no deploy-on-push; only the weekly refresh workflow deploys.

## Content model — where things live

| File                      | Holds                                                       |
| ------------------------- | ----------------------------------------------------------- |
| `content/profile.json`    | Name, tagline, summary, location, social links.             |
| `content/projects.json`   | The "Work log" — featured + other projects.                 |
| `content/experience.json` | Career / employment history.                                |
| `content/stats.json`      | Headline numbers — `manual` + `live` (see Stats rule).      |

- **Locales**: each JSON has a French twin in `content/fr/`. The site is served
  at `/en` and `/fr` (`app/[locale]/`), both server-rendered with their own
  `<html lang>`, canonical and hreflang tags; `/` redirects by cookie, then
  `Accept-Language` (`middleware.ts`). UI strings live in `lib/strings.ts`.
- **Types** for all content live in `lib/types.ts`. Match them exactly; extend the
  interface there rather than adding untyped fields.
- **Derivation is already done** in `lib/content.ts` (projects sort strictly
  reverse-chronological by year — the site reads as a `git log`, so no
  featured-first grouping; experience sorts newest-first, `present` floats to top).
  Don't re-sort in components.
- `lib/hash.ts` `shortHash()` produces the cosmetic git-style short SHA shown in the
  UI. It's deterministic and non-cryptographic — reuse it, don't reinvent it.

## 🛑 Confidentiality boundary

- The public GitHub identity is **`BassemFd`**. Live stats are fetched from that
  public account only.
- **Never name, link, or expose private employer codebases.** Concretely:
  - Experience entries from private/employer work stay `confidential: true`.
  - The contributions total (live, private included) is shown with **no repo named
    or linked**.
- When in doubt, leave it out. Do not surface a client/employer name, private repo
  URL, or internal project detail that isn't already public.

## Stats rule — `manual` vs `live`

`content/stats.json` has two deliberately separate blocks:

- **`manual`** — hand-recorded numbers that can't be fetched (e.g. all-time merged
  PRs, years shipping). Edit these by hand, in both `content/` and `content/fr/`.
- **`live`** — pulled from the GitHub API. **Only ever rewritten by**
  `npm run refresh-stats`, which updates `live` + `liveFetchedAt` in both locales.
  `contributions` is the contribution-calendar total since 2021 (private
  included — the profile shows private contributions publicly).

`refresh-stats` also appends any new public, non-fork repo not yet linked from
`projects.json` (EN + FR) as a draft entry from its GitHub description. Repos that
must never get their own entry go in `IGNORED_REPOS` in the script. Polish drafted
blurbs (and translate the FR one) by hand.

It runs weekly in `.github/workflows/refresh.yml` (refresh → test → build →
commit → deploy), or locally (token from `GITHUB_TOKEN` or `gh auth token`).
It is still **not** part of `npm run build`.

Rules:
- Never hand-edit the `live` block — run the script.
- Merged-PR search is restricted to `is:public`: a personal token would
  otherwise count private-repo PRs.
- The `activity` block (contribution-type breakdown: PRs / reviews / commits /
  issues) is **manual and cannot be fetched live.** GitHub lumps all private
  contributions into an untyped `restrictedContributionsCount` and never exposes
  the per-type split. Update it by hand; do not try to automate it.

## Code standards

- **TypeScript** `strict` is on. No `any`. Add/extend interfaces in `lib/types.ts`.
- **Styling** is Tailwind using the **design tokens only** — colors `paper`, `card`,
  `ink`, `rule`, `muted`, `accent`, `accent-soft`, and font families `display` /
  `sans` / `mono` (see `tailwind.config.ts`). No raw hex, no arbitrary `[...]`
  values unless genuinely unavoidable.
- **Imports** use the `@/*` alias (e.g. `@/content/projects.json`,
  `@/lib/types`), not deep relative paths.
- **Components** are server components by default (App Router). Keep them
  presentational; content flows in from `lib/content.ts`.
- **Exports**: components use named exports (`export function Hero`). Only
  Next.js route files in `app/` (`layout`, `page`, `sitemap`...) keep the
  default export the framework requires.

## Commit conventions

[Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).
Imperative, lowercase, no trailing period.

```
feat(content): add my-new-thing
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`,
`chore`, `revert`. Common scopes: `content`, `ui`, `stats`, `build`.

## Definition of done

- `npm run build` passes locally.
- The `live` stats block was changed **only** via `refresh-stats` (or not at all).
- No confidential employer/client source named or linked.
- Committed with a Conventional Commit message, pushed to `main`, and deployed
  with `npm run deploy`.
