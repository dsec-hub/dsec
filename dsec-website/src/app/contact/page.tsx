import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";
import { PixelDuck } from "@/components/pixel-duck";
import { JsonLd } from "@/components/json-ld";
import { organizationSchema } from "@/lib/schema";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact DSEC - Get in Touch",
  description:
    "Reach the Deakin Software Engineering Club committee. Email, Discord, Instagram and LinkedIn.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact DSEC - Get in Touch",
    description:
      "Questions about joining, membership or sponsoring? Reach the DSEC committee.",
    url: "/contact",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact DSEC - Get in Touch",
    description: "Reach the DSEC committee at Deakin Burwood.",
  },
};

const channels = [
  {
    h: "Email",
    p: "Best for membership questions, partnerships and anything official.",
    label: site.email,
    href: `mailto:${site.email}`,
    accent: "bg-pink",
  },
  {
    h: "Discord",
    p: "Where the club actually lives. Say hi, find a team, start shipping.",
    label: "Join the server",
    href: site.discord,
    accent: "bg-blue",
  },
  {
    h: "Instagram",
    p: "Event announcements, photos and what we are up to this term.",
    label: "Follow us",
    href: site.instagram,
    accent: "bg-yellow",
  },
  {
    h: "LinkedIn",
    p: "For companies and alumni who want to keep in touch.",
    label: "Connect",
    href: site.linkedin,
    accent: "bg-mint",
  },
];

export default function ContactPage() {
  return (
    <div>
      <JsonLd data={organizationSchema()} />
      <section className="border-b-[3px] border-paper bg-panel-2">
        <div className="mx-auto grid max-w-6xl items-stretch gap-8 px-4 py-14 sm:px-6 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <p className="eyebrow">Say hello</p>
            <h1 className="mt-2 font-display text-4xl font-bold leading-[1.05] sm:text-6xl">
              Get in touch.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-paper/80">
              Questions about joining, the $5 DUSA / $7.50 external membership, an
              event or a partnership? The committee reads everything. Pick whichever
              channel suits you.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <PixelDuck name="duck-wave" alt="" size={260} priority bob />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1fr_1.1fr]">
          <div className="flex flex-col">
            <SectionHeading eyebrow="Send a message" title="Drop us a line.">
              Fill this in and it lands straight with the committee. We usually reply
              within a couple of days.
            </SectionHeading>
            <div className="mt-6 hidden md:flex md:flex-1 md:items-center md:justify-center">
              <PixelDuck name="duck-mail" alt="" size={340} bob />
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <SectionHeading eyebrow="Channels" title="Or reach us where it suits." />
        <div className="stagger mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((c) => (
            <a
              key={c.h}
              href={c.href}
              target="_blank"
              rel="noreferrer noopener"
              className="pixel-card pixel-hover group flex flex-col p-6"
            >
              <div
                className={`mb-3 h-2 w-12 transition-[width] duration-300 ease-[var(--ease-out-strong)] group-hover:w-20 ${c.accent}`}
              />
              <h2 className="font-display text-2xl font-bold">{c.h}</h2>
              <p className="mt-2 flex-1 text-paper/75">{c.p}</p>
              <span className="mt-4 font-mono text-sm font-bold text-blue">
                {c.label}{" "}
                <span className="inline-block transition-transform duration-150 ease-[var(--ease-out-strong)] group-hover:translate-x-1">
                  →
                </span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="border-[3px] border-paper bg-void p-8 text-center text-paper shadow-[8px_8px_0_0_var(--color-pink)]">
          <p className="font-display text-2xl font-bold sm:text-3xl">
            Want to sponsor DSEC instead?
          </p>
          <p className="mx-auto mt-3 max-w-md text-paper/75">
            We are affiliated with DUSA, so sponsorship is invoiced properly (+GST).
          </p>
          <div className="mt-5">
            <Link href="/sponsor" className="btn btn-pink !px-7 !py-4 !text-lg">
              See sponsorship
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
