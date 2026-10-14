import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { profile } from "@/lib/content";
import Gutter from "@/components/Gutter";
import ScrollSkew from "@/components/ScrollSkew";
import ThemeProvider from "@/components/ThemeProvider";
import LocaleProvider from "@/components/LocaleProvider";

// Applies the saved (or system-preferred) theme before first paint, so there's
// no flash of the wrong palette. Never resolves to crazy from the system pref.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'&&t!=='crazy'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}})();`;

// Applies the saved language before first paint (content itself still needs
// a client render to swap, but <html lang> is correct from the start).
const localeScript = `(function(){try{var l=localStorage.getItem('locale');if(l!=='en'&&l!=='fr'){l='en';}document.documentElement.lang=l;}catch(e){document.documentElement.lang='en';}})();`;

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

export const metadata: Metadata = {
  title: `${profile.name} — ${profile.tagline}`,
  description: profile.summary,
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: localeScript }} />
      </head>
      <body className="font-sans antialiased pb-28 lg:pb-0">
        <LocaleProvider>
          <ThemeProvider>
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
