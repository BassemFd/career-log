import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "@/app/globals.css";
import { contentByLocale } from "@/lib/content";
import { LOCALES, SITE_URL, isLocale } from "@/lib/strings";
import Gutter from "@/components/Gutter";
import IntroCurtain from "@/components/IntroCurtain";
import ScrollSkew from "@/components/ScrollSkew";
import ThemeProvider from "@/components/ThemeProvider";
import LocaleProvider from "@/components/LocaleProvider";

// Applies the saved (or system-preferred) theme before first paint, so there's
// no flash of the wrong palette. Never resolves to crazy from the system pref.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'&&t!=='crazy'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}})();`;

// Decides before first paint whether the intro curtain plays: once per browser
// session, never for reduced motion or crazy mode (which has its own vortex).
// Runs after themeScript so data-theme is already set. Without JS nothing plays.
// `?intro` in the URL replays it regardless (handy to show it off).
const introScript = `(function(){try{var d=document.documentElement;if(d.dataset.theme==='crazy')return;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;if(sessionStorage.getItem('introSeen')&&!new URLSearchParams(location.search).has('intro'))return;sessionStorage.setItem('introSeen','1');d.dataset.intro='play';}catch(e){}})();`;

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

// Each locale is its own URL (/en, /fr), so both versions are server-rendered
// and indexable. hreflang alternates tell search engines they're translations
// of one page; x-default is the bare root, which redirects by preference.
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { profile } = contentByLocale[locale];
  return {
    metadataBase: new URL(SITE_URL),
    title: `${profile.name} — ${profile.tagline}`,
    description: profile.summary,
    icons: { icon: "/favicon.svg" },
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", fr: "/fr", "x-default": "/" },
    },
    openGraph: {
      title: `${profile.name} — ${profile.tagline}`,
      description: profile.summary,
      url: `/${locale}`,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      alternateLocale: locale === "fr" ? "en_US" : "fr_FR",
      type: "profile",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Params }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body className="font-sans antialiased pb-20 lg:pb-0">
        <LocaleProvider locale={locale}>
          <ThemeProvider>
            <IntroCurtain />
            <div className="lg:flex lg:min-h-screen">
              <Gutter />
              <div className="content-column relative z-[30] lg:min-w-0 lg:flex-1">
                <ScrollSkew>{children}</ScrollSkew>
              </div>
            </div>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
