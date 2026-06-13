import type { Metadata } from "next";
import { Silkscreen, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageTransition } from "@/components/page-transition";

// Silkscreen: a chunky, blocky bitmap face. Reads clearly at large display
// sizes (Pixelify Sans was too thin/illegible when small), so we lean into it
// for big headings. Only ships 400/700 - we use 700 for headings.
const display = Silkscreen({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const body = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dsec.club"),
  title: {
    default: "DSEC - Deakin Software Engineering Club",
    template: "%s · DSEC",
  },
  description:
    "DSEC is a project-led student tech club at Deakin University. We build real, portfolio-worthy software, not passive workshops.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "DSEC - Deakin Software Engineering Club",
    description:
      "A project-led student tech club at Deakin. ~190 members building real software.",
    url: "https://dsec.club",
    siteName: "DSEC",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DSEC - Deakin Software Engineering Club",
    description:
      "A project-led student tech club at Deakin. ~190 members building real software.",
  },
  // Set NEXT_PUBLIC_GSC_VERIFICATION once Google Search Console is connected (§2.3).
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-AU"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full`}
    >
      <body className="bg-bg text-paper font-body antialiased min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
