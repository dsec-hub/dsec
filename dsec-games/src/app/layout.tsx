import type { Metadata } from "next";
import { Silkscreen, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { auth } from "@/auth";

// Same three faces as the rest of DSEC so the arcade reads as one brand.
const display = Silkscreen({ variable: "--font-display", subsets: ["latin"], weight: ["400", "700"] });
const body = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://games.dsec.club"),
  title: { default: "DSEC Games", template: "%s · DSEC Games" },
  description: "Play Flappy Duck and Codle, climb the leaderboard, win the monthly draw.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  return (
    <html
      lang="en-AU"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full`}
    >
      <body className="bg-bg text-paper font-body antialiased min-h-full flex flex-col">
        <a
          href="#main"
          className="absolute left-[-9999px] z-[200] font-mono text-sm focus:left-4 focus:top-4 focus:bg-pink focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <SiteNav email={session?.user?.email ?? null} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
