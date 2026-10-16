import type { MilestoneType } from "./types";

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
  sectionMilestones: string;
  milestoneTypes: Record<MilestoneType, string>;
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
  numberLocale: string;
  statContributions: string;
  statContributionsNote: string;
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
    present: "present",
    certifications: "Certifications",
    credentialId: "id",
    certIssued: "issued",
    certExpires: "expires",
    activityMix: "Activity mix",
    numberLocale: "en-US",
    statContributions: "Contributions",
    statContributionsNote: "since 2021, public + private",
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
    present: "présent",
    certifications: "Certifications",
    credentialId: "id",
    certIssued: "délivré",
    certExpires: "expire",
    activityMix: "Répartition de l'activité",
    numberLocale: "fr-FR",
    statContributions: "Contributions",
    statContributionsNote: "depuis 2021, public + privé",
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
    topFeedback: "↑ haut",
    openingFeedback: (target) => `ouverture de ${target}…`,
    goToFeedback: (label) => `→ ${label}`,
    commandNotFound: (raw) => `commande introuvable : ${raw} — essayez \`help\``,
  },
};
