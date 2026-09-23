export type Locale = "en" | "fr";

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
  filterAll: string;
  filterPersonal: string;
  filterClient: string;
  filterTraining: string;
  flagship: string;
  underNda: string;
  contributor: string;
  present: string;
  certifications: string;
  credentialId: string;
  certIssued: string;
  certExpires: string;
  activityMix: string;
  statPublicRepos: string;
  statPublicPRs: string;
  statPublicPRsNote: string;
  statStarsEarned: string;
  statStarsNote: string;
  liveFiguresNote: (date: string) => string;
  manualLabel: string;
  liveLabel: string;
  footerBuiltWith: string;
  footerContentLives: string;
  footerSource: string;
  themeLabel: string;
  langLabel: string;
  crazyLight: string;
  crazyDark: string;
  typeHelp: string;
  help: string;
  crazyHelp: string;
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
    filterAll: "All",
    filterPersonal: "Personal",
    filterClient: "Client",
    filterTraining: "Training",
    flagship: "Flagship",
    underNda: "Under NDA",
    contributor: "Contributor",
    present: "present",
    certifications: "Certifications",
    credentialId: "id",
    certIssued: "issued",
    certExpires: "expires",
    activityMix: "Activity mix",
    statPublicRepos: "Public repositories",
    statPublicPRs: "Public PRs merged",
    statPublicPRsNote: "authored, public repos only",
    statStarsEarned: "Stars earned",
    statStarsNote: "on own projects",
    liveFiguresNote: (date) =>
      `Live figures fetched from the GitHub API on ${date}. Aggregate production figures are recorded manually from private employer codebases.`,
    manualLabel: "manual",
    liveLabel: "live",
    footerBuiltWith: "Built with Next.js · content lives in",
    footerContentLives: "/content/*.json",
    footerSource: "source",
    themeLabel: "theme:",
    langLabel: "lang:",
    crazyLight: "Light",
    crazyDark: "Dark",
    typeHelp: "type `help`",
    help: "commands: log, shortlog, ls, formation, whoami, open <github|linkedin|email>, top, clear",
    crazyHelp: "PRESS LIGHT OR DARK THEME",
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
    filterAll: "Tous",
    filterPersonal: "Personnel",
    filterClient: "Client",
    filterTraining: "Entraînement",
    flagship: "Phare",
    underNda: "Confidentiel",
    contributor: "Contributeur",
    present: "présent",
    certifications: "Certifications",
    credentialId: "id",
    certIssued: "délivré",
    certExpires: "expire",
    activityMix: "Répartition de l'activité",
    statPublicRepos: "Dépôts publics",
    statPublicPRs: "PR publiques fusionnées",
    statPublicPRsNote: "auteur, dépôts publics uniquement",
    statStarsEarned: "Étoiles obtenues",
    statStarsNote: "sur projets personnels",
    liveFiguresNote: (date) =>
      `Chiffres en direct récupérés depuis l'API GitHub le ${date}. Les chiffres de production agrégés sont enregistrés manuellement à partir de bases de code d'employeurs privées.`,
    manualLabel: "manuel",
    liveLabel: "live",
    footerBuiltWith: "Construit avec Next.js · le contenu vit dans",
    footerContentLives: "/content/*.json",
    footerSource: "source",
    themeLabel: "thème :",
    langLabel: "langue :",
    crazyLight: "Clair",
    crazyDark: "Sombre",
    typeHelp: "tapez `help`",
    help: "commandes : log, shortlog, ls, formation, whoami, open <github|linkedin|email>, top, clear",
    crazyHelp: "APPUYEZ SUR LE THÈME CLAIR OU SOMBRE",
    topFeedback: "↑ haut",
    openingFeedback: (target) => `ouverture de ${target}…`,
    goToFeedback: (label) => `→ ${label}`,
    commandNotFound: (raw) => `commande introuvable : ${raw} — essayez \`help\``,
  },
};
