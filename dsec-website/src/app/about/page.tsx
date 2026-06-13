import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/ui";
import { PixelDuck } from "@/components/pixel-duck";
import { JsonLd } from "@/components/json-ld";
import { organizationSchema } from "@/lib/schema";
import { team, accentBg, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "About DSEC - The Committee & What We Stand For",
  description:
    "The committee behind DSEC, our DUSA affiliation, and what the club stands for.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About DSEC - The Committee & What We Stand For",
    description:
      "DSEC is the Deakin Software Engineering Club, a project-led, DUSA-affiliated club run by students who ship.",
    url: "/about",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About DSEC - The Committee & What We Stand For",
    description: "A project-led, DUSA-affiliated club at Deakin Burwood, run by students who ship.",
  },
};

const values = [
  {
    h: "Build, don't just attend",
    p: "Every term ends with software that exists. Passive workshops aren't the point.",
  },
  {
    h: "In public",
    p: "Repos, commits and demos. We share what we make and how we made it.",
  },
  {
    h: "Everyone ships",
    p: "First-years to final-years. If you turn up and try, you leave with something real.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <JsonLd data={organizationSchema()} />
      <section className="border-b-[3px] border-paper bg-panel-2">
        <div className="mx-auto grid max-w-6xl items-stretch gap-8 px-4 py-14 sm:px-6 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <p className="eyebrow">Who we are</p>
            <h1 className="mt-2 font-display text-4xl font-bold leading-[1.05] sm:text-6xl">
              Run by students who ship.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-paper/80">
              DSEC is the Deakin Software Engineering Club, a project-led student
              club at Burwood affiliated with DUSA. We exist so members leave
              Deakin with real software and real people behind them.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <PixelDuck name="duck-coffee" alt="" size={220} priority bob />
          </div>
        </div>
      </section>

      {/* What we stand for */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionHeading eyebrow="What we stand for" title="Three things, no fluff." />
        <div className="stagger mt-8 grid gap-5 md:grid-cols-3">
          {values.map((v, i) => (
            <div key={v.h} className="pixel-card pixel-hover group p-6">
              <div
                className={`mb-3 h-2 w-12 transition-[width] duration-300 ease-[var(--ease-out-strong)] group-hover:w-20 ${["bg-yellow", "bg-pink", "bg-mint"][i]}`}
              />
              <h3 className="font-display text-2xl font-bold">{v.h}</h3>
              <p className="mt-2 text-paper/75">{v.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Committee */}
      <section className="border-t-[3px] border-paper bg-panel-2">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeading eyebrow="Who runs DSEC" title="Meet the exec team.">
            DSEC is led by a volunteer executive committee of Deakin students who
            handle everything from event planning and sponsorship to Discord
            moderation and code-review nights. Execs are elected at our AGM each
            year, following DUSA club rules.
          </SectionHeading>
          <div className="stagger mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {team.map((m) => (
              <div
                key={m.name}
                className="pixel-card pixel-hover group flex flex-col overflow-hidden"
              >
                <div
                  className={`relative aspect-square overflow-hidden border-b-[3px] border-paper ${accentBg[m.accent]}`}
                >
                  {m.image ? (
                    <Image
                      src={m.image}
                      alt={m.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-300 ease-[var(--ease-out-strong)] group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="grid h-full place-items-center">
                      <PixelDuck name="duck-mascot" alt="" size={88} />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="font-display text-lg font-bold leading-tight">
                    {m.name}
                  </div>
                  <div className="font-mono text-xs text-paper/60">{m.role}</div>
                  {m.description && (
                    <p className="mt-2 text-sm leading-snug text-paper/70">
                      {m.description}
                    </p>
                  )}
                  {(m.instagram || m.linkedin) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.linkedin && (
                        <a
                          href={`https://linkedin.com${m.linkedin}`}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="pixel-tag !bg-panel !text-blue hover:!text-paper"
                        >
                          LinkedIn
                        </a>
                      )}
                      {m.instagram && (
                        <a
                          href={`https://instagram.com/${m.instagram.replace("@", "")}`}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="pixel-tag !bg-panel !text-pink hover:!text-paper"
                        >
                          Instagram
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <p className="mx-auto max-w-2xl text-paper/75">
              If you are a Deakin student who cares about building communities,
              joining the committee is one of the best ways to grow your leadership
              and project skills while you study.
            </p>
            <a
              href="https://dsec.notion.site/dsec-committee-hiring-2026?source=copy_link"
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-pink mt-5"
            >
              See open volunteer roles
            </a>
          </div>
        </div>
      </section>

      {/* Affiliation + contact */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="pixel-card p-7">
            <h3 className="font-display text-2xl font-bold">DUSA affiliated</h3>
            <p className="mt-2 text-paper/75">
              DSEC is an affiliated club of the Deakin University Student Association.
              Sponsorship is invoiced through DUSA with GST, so everything is above
              board and properly handled.
            </p>
          </div>
          <div className="pixel-card flex flex-col justify-between p-7">
            <div>
              <h3 className="font-display text-2xl font-bold">Get in touch</h3>
              <p className="mt-2 text-paper/75">
                Questions, ideas, or want to work with us?
              </p>
              <a
                href={`mailto:${site.email}`}
                className="mt-2 inline-block font-mono font-bold text-blue hover:underline"
              >
                {site.email}
              </a>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/join" className="btn btn-pink !py-2.5 !text-sm">
                Students: join
              </Link>
              <Link href="/sponsor" className="btn btn-ghost !py-2.5 !text-sm">
                Companies: sponsor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
