import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { profile } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import Gutter from "@/components/Gutter";
import IntroCurtain from "@/components/IntroCurtain";
import ScrollSkew from "@/components/ScrollSkew";
import ThemeProvider from "@/components/ThemeProvider";
import LocaleProvider from "@/components/LocaleProvider";

// Applies the saved (or system-preferred) theme before first paint, so there's
// no flash of the wrong palette. Never resolves to crazy from the system pref.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'&&t!=='crazy'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}})();`;

// Applies the saved language before first paint (content itself still needs
// a client render to swap, but <html lang> is correct from the start).
const localeScript = `(function(){try{var l=localStorage.getItem('locale');if(l!=='en'&&l!=='fr'){l='en';}document.documentElement.lang=l;}catch(e){document.documentElement.lang='en';}})();`;

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

const title = `${profile.name} — ${profile.tagline}`;

// The preview image itself comes from app/opengraph-image.tsx and
// app/twitter-image.tsx; metadataBase makes its URL absolute.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description: profile.summary,
  icons: { icon: "/favicon.svg" },
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: profile.name,
    title,
    description: profile.summary,
    locale: "en_US",
    alternateLocale: ["fr_FR"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: profile.summary,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: localeScript }} />
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body className="font-sans antialiased pb-20 lg:pb-0">
        <LocaleProvider>
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
