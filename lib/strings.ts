import type { MilestoneType } from "./types";

export type Locale = "en" | "fr";

export const LOCALES: readonly Locale[] = ["en", "fr"];

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

// UI chrome only — actual content (bios, project blurbs, experience text)
// lives in content/fr/*.json via lib/content.ts's contentByLocale. Git/
// terminal command tokens (log, shortlog, ls, whoami, open, top, clear,
// "git log --oneline") stay untranslated on purpose — they're literal
// commands you type, not prose.
export const STRINGS: Record<Locale, {
  sectionReleases: string;
  sectionShortlog: string;
  sectionWorklog: string;
  sectionFormation: string;
  sectionMilestones: string;
  milestoneTypes: Record<MilestoneType, string>;
  filterAll: string;
  filterPersonal: string;
  filterClient: string;
  filterTraining: string;
  flagship: string;
  underNda: string;
  contributor: string;
  visitSite: (domain: string) => string;
  present: string;
  certifications: string;
  credentialId: string;
  certIssued: string;
  certExpires: string;
  activityMix: string;
  numberLocale: string;
  statContributions: string;
  statContributionsNote: string;
  statRepos: string;
  statReposNote: string;
  statMergedPRs: string;
  statMergedPRsLive: (count: number) => string;
  statMergedPRsBaseline: (count: number) => string;
  statYearsShipping: string;
  statYearsShippingNote: (year: string) => string;
  liveFiguresNote: (date: string) => string;
  manualLabel: string;
  liveLabel: string;
  footerBuiltWith: string;
  footerContentLives: string;
  footerSource: string;
  footerMadeWith: string;
  footerBy: string;
  footerEmail: string;
  introSkip: string;
  terminalLabel: string;
  terminalOpen: string;
  terminalClose: string;
  ctaContact: string;
  ctaCv: string;
  themeLabel: string;
  langLabel: string;
  crazyLight: string;
  crazyDark: string;
  typeHelp: string;
  help: string;
  crazyHelp: string;
  monsterLabel: string;
  monsterChomp: string;
  gameOverTitle: string;
  gameOverText: string;
  gameOverRestart: string;
  topFeedback: string;
  openingFeedback: (target: string) => string;
  goToFeedback: (label: string) => string;
  commandNotFound: (raw: string) => string;
}> = {
  en: {
    sectionReleases: "Releases",
    sectionShortlog: "Shortlog",
    sectionWorklog: "Work log",
    sectionFormation: "Formation",
    sectionMilestones: "Tags",
    milestoneTypes: {
      role: "role",
      mission: "mission",
      promotion: "promotion",
      certification: "cert",
      figure: "figure",
      education: "training",
    },
    filterAll: "All",
    filterPersonal: "Personal",
    filterClient: "Client",
    filterTraining: "Training",
    flagship: "Flagship",
    underNda: "Under NDA",
    contributor: "Contributor",
    visitSite: (domain) => `Open ${domain} in a new tab`,
    present: "present",
    certifications: "Certifications",
    credentialId: "id",
    certIssued: "issued",
    certExpires: "expires",
    activityMix: "Activity mix",
    numberLocale: "en-US",
    statContributions: "Contributions",
    statContributionsNote: "since 2021, public + private",
    statRepos: "Repositories",
    statReposNote: "public + private",
    statMergedPRs: "PRs merged",
    statMergedPRsLive: (count) => `${count} on GitHub`,
    statMergedPRsBaseline: (count) => `${count}+ at work`,
    statYearsShipping: "Years shipping software",
    statYearsShippingNote: (year) => `since ${year}`,
    liveFiguresNote: (date) =>
      `GitHub API figures, last full refresh on ${date}; contributions update weekly, years to today.`,
    manualLabel: "manual",
    liveLabel: "live",
    footerBuiltWith: "Built with Next.js · content lives in",
    footerContentLives: "/content/*.json",
    footerSource: "source",
    footerMadeWith: "made with",
    footerBy: "by",
    footerEmail: "email",
    introSkip: "skip",
    terminalLabel: "Terminal",
    terminalOpen: "Open the terminal",
    terminalClose: "Close the terminal",
    ctaContact: "Get in touch",
    ctaCv: "Download CV",
    themeLabel: "theme:",
    langLabel: "lang:",
    crazyLight: "Light",
    crazyDark: "Dark",
    typeHelp: "type `help`",
    help: "commands: log, tag, shortlog, ls, formation, whoami, open <github|linkedin|email>, top, clear",
    crazyHelp: "PRESS LIGHT OR DARK THEME",
    monsterLabel: "Poke the monster",
    monsterChomp: "CHOMP!",
    gameOverTitle: "GAME OVER",
    gameOverText: "The monster ate you.",
    gameOverRestart: "Restart",
    topFeedback: "↑ top",
    openingFeedback: (target) => `opening ${target}…`,
    goToFeedback: (label) => `→ ${label}`,
    commandNotFound: (raw) => `command not found: ${raw} — try \`help\``,
  },
  fr: {
    sectionReleases: "Versions",
    sectionShortlog: "Bilan",
    sectionWorklog: "Journal de travail",
    sectionFormation: "Formation",
    sectionMilestones: "Jalons",
    milestoneTypes: {
      role: "poste",
      mission: "mission",
      promotion: "promotion",
      certification: "certif",
      figure: "chiffre",
      education: "formation",
    },
    filterAll: "Tous",
    filterPersonal: "Personnel",
    filterClient: "Client",
    filterTraining: "Entraînement",
    flagship: "Phare",
    underNda: "Confidentiel",
    contributor: "Contributeur",
    visitSite: (domain) => `Ouvrir ${domain} dans un nouvel onglet`,
    present: "présent",
    certifications: "Certifications",
    credentialId: "id",
    certIssued: "délivré",
    certExpires: "expire",
    activityMix: "Répartition de l'activité",
    numberLocale: "fr-FR",
    statContributions: "Contributions",
    statContributionsNote: "depuis 2021, public + privé",
    statRepos: "Dépôts",
    statReposNote: "public + privé",
    statMergedPRs: "PR fusionnées",
    statMergedPRsLive: (count) => `${count} sur GitHub`,
    statMergedPRsBaseline: (count) => `${count}+ en pro`,
    statYearsShipping: "Années à livrer du logiciel",
    statYearsShippingNote: (year) => `depuis ${year}`,
    liveFiguresNote: (date) =>
      `Chiffres de l'API GitHub, dernière mise à jour complète le ${date} ; contributions chaque semaine, années à ce jour.`,
    manualLabel: "manuel",
    liveLabel: "live",
    footerBuiltWith: "Construit avec Next.js · le contenu vit dans",
    footerContentLives: "/content/*.json",
    footerSource: "source",
    footerMadeWith: "fait avec",
    footerBy: "par",
    footerEmail: "e-mail",
    introSkip: "passer",
    terminalLabel: "Terminal",
    terminalOpen: "Ouvrir le terminal",
    terminalClose: "Fermer le terminal",
    ctaContact: "Me contacter",
    ctaCv: "Télécharger le CV",
    themeLabel: "thème :",
    langLabel: "langue :",
    crazyLight: "Clair",
    crazyDark: "Sombre",
    typeHelp: "tapez `help`",
    help: "commandes : log, tag, shortlog, ls, formation, whoami, open <github|linkedin|email>, top, clear",
    crazyHelp: "APPUYEZ SUR LE THÈME CLAIR OU SOMBRE",
    monsterLabel: "Toucher le monstre",
    monsterChomp: "CHOMP !",
    gameOverTitle: "GAME OVER",
    gameOverText: "Le monstre t'a mangé.",
    gameOverRestart: "Recommencer",
    topFeedback: "↑ haut",
    openingFeedback: (target) => `ouverture de ${target}…`,
    goToFeedback: (label) => `→ ${label}`,
    commandNotFound: (raw) => `commande introuvable : ${raw} — essayez \`help\``,
  },
};
