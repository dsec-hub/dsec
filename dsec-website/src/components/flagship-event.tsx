import { Banner, Gallery, LeadBadge, Speakers, SponsorLogos } from "@/components/media";
import { Markdown } from "@/components/markdown";
import { SectionHeading } from "@/components/ui";
import { FlagshipCountdown, NotifyFunnel, ShareButton, SponsorFunnel } from "@/components/flagship-client";
import type { ClubEvent } from "@/lib/content";
import { formatTicketPrice } from "@/lib/content";
import styles from "./flagship.module.css";

type Theme = NonNullable<ClubEvent["flagshipTheme"]>;

/** Per-theme copy + flavour. The structure is shared; only the voice + accents
 *  change, driven by `data-theme` on the .root wrapper (see flagship.module.css). */
const THEME: Record<Theme, {
  eyebrow: string;
  countdownTitle: string;
  stamp: string;
  withheld: string;
  artAlt: string;
  headlineExtra: string; // extra global class for the headline
  shareText: string;
}> = {
  arena: {
    eyebrow: "✦ DSEC Flagship · Main Event ✦",
    countdownTitle: "Time left on the clock",
    stamp: "MAIN EVENT",
    withheld: "COMING SOON",
    artAlt: "A crowned pixel rubber-duck flexing on a neon pedestal under a spotlight",
    headlineExtra: "text-3d-pink",
    shareText: "Something BIG is coming from DSEC 🦆🏆 Get on the list.",
  },
  blueprint: {
    eyebrow: "Classified engineering schematic",
    countdownTitle: "Build ETA",
    stamp: "REV 0.9",
    withheld: "[ SPEC WITHHELD ]",
    artAlt: "A glowing cyan isometric blueprint of an arcade cabinet with an architect pixel-duck",
    headlineExtra: "",
    shareText: "DSEC is engineering something big 🦆📐 Specs drop soon.",
  },
  nightrun: {
    eyebrow: "DSEC Flagship // after dark",
    countdownTitle: "Lights on in",
    stamp: "AFTER DARK",
    withheld: "░ ENCRYPTED ░",
    artAlt: "A pixel rubber-duck on a glowing neon synthwave grid under a pink-and-cyan horizon",
    headlineExtra: "",
    shareText: "DSEC after dark — something ignites soon 🦆🌃",
  },
};

/** Countdown target: explicit reveal datetime, else the event's start date at 6pm. */
function countdownTarget(event: ClubEvent): string | undefined {
  if (event.flagshipRevealAt) return event.flagshipRevealAt;
  if (event.isoDate) return `${event.isoDate}T18:00:00`;
  return undefined;
}

function Fact({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="border-l-4 border-paper/20 pl-3">
      <dt className="font-mono text-xs uppercase tracking-wide text-paper/50">{label}</dt>
      <dd className="mt-0.5 font-bold">{value}</dd>
    </div>
  );
}

/* ============================== TEASER STATE ============================== */
function TeaserFlagship({ event, theme }: { event: ClubEvent; theme: Theme }) {
  const t = THEME[theme];
  const headline = event.flagshipTeaserTitle || event.title;
  const dateKnown = Boolean(event.isoDate);

  return (
    <div className={styles.root} data-theme={theme}>
      {/* ---- HERO ---- */}
      <section className={styles.hero}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className={styles.heroGrid}>
            <div className="animate-rise">
              <span className="eyebrow">{t.eyebrow}</span>
              <h1 className={`${styles.headline} ${t.headlineExtra}`}>{headline}</h1>

              <div className={styles.blurb}>
                {event.flagshipTeaserBody ? (
                  <Markdown content={event.flagshipTeaserBody} />
                ) : (
                  <p>
                    Something big is being assembled. The biggest event DSEC has attempted — and
                    the details stay under wraps until we’re ready. Get on the list to be first in.
                  </p>
                )}
              </div>

              <div className={styles.metaRow}>
                <span className="pixel-tag">⬡ Flagship event</span>
                <span className="pixel-tag">
                  ⬡ {dateKnown ? event.date : "Date TBA"}
                </span>
                <span className="pixel-tag">
                  ⬡ <span className={styles.withheld}>{t.withheld}</span>
                </span>
              </div>

              <div className={styles.cdBlock}>
                <div className={`${styles.cdTitle} caret`}>{t.countdownTitle}</div>
                <FlagshipCountdown target={countdownTarget(event)} />
              </div>

              <div className={styles.ctaRow}>
                <a href="#enlist" className="btn btn-pink btn-start">▶ Get notified</a>
                <a href="#sponsor" className="btn btn-ghost">Sponsor it →</a>
              </div>
            </div>

            <div className="pixel-hover">
              <div className={styles.heroArt}>
                <span className={styles.heroStamp}>{t.stamp}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/flagship/hero-${theme}.webp`} alt={t.artAlt} />
                {theme === "blueprint" && (
                  <>
                    <span className={styles.crosshair} style={{ top: 8, left: 8 }} />
                    <span className={styles.crosshair} style={{ top: 8, right: 8 }} />
                    <span className={styles.crosshair} style={{ bottom: 8, left: 8 }} />
                    <span className={styles.crosshair} style={{ bottom: 8, right: 8 }} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {theme === "nightrun" && (
          <div className={styles.neonGrid} aria-hidden>
            <div className={styles.neonGridInner} />
          </div>
        )}
      </section>

      {/* ---- ARENA marquee ---- */}
      {theme === "arena" && (
        <div className={styles.marquee} aria-hidden>
          <div className={styles.marqueeTrack}>
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i}>
                ● FLAGSHIP ● 36 HOURS ● BIG PRIZE POOL ● SOMETHING BIG IS COMING ● GET ON THE LIST ●
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="skyline my-2" />
      </div>

      {/* ---- THE BRIEF ---- */}
      <section className={styles.brief}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="The brief" title="Most of it stays secret.">
            What we can say about {event.title} — and what stays classified until reveal.
          </SectionHeading>
          <div className={`${styles.briefGrid} mt-6`}>
            <div className={styles.fileCard}>
              <div className={styles.fileLine}>
                <span className={styles.fileKey}>When</span>
                <span className={styles.fileVal}>
                  {dateKnown ? event.date : <span className={styles.withheld}>{t.withheld}</span>}
                </span>
              </div>
              <div className={styles.fileLine}>
                <span className={styles.fileKey}>Tracks</span>
                <span className={styles.fileVal}><span className={styles.withheld}>{t.withheld}</span></span>
              </div>
              <div className={styles.fileLine}>
                <span className={styles.fileKey}>Prize pool</span>
                <span className={styles.fileVal}><span className={styles.withheld}>{t.withheld}</span></span>
              </div>
              <div className={styles.fileLine}>
                <span className={styles.fileKey}>Partners</span>
                <span className={styles.fileVal}><span className={styles.withheld}>{t.withheld}</span></span>
              </div>
              <div className={styles.fileLine}>
                <span className={styles.fileKey}>Venue</span>
                <span className={styles.fileVal}><span className={styles.withheld}>{t.withheld}</span></span>
              </div>
            </div>
            <div className={styles.fileCard} style={{ background: "var(--color-void)" }}>
              <span className="pixel-tag !bg-yellow text-ink">⬡ What we CAN tell you</span>
              <div className="mt-4 text-paper/80">
                {event.flagshipTeaserBody ? (
                  <Markdown content={event.flagshipTeaserBody} />
                ) : (
                  <p>It’s a flagship. It’s big. There will be ducks, real prizes, and names you’ll know. Stand by.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- FUNNELS (the email marketing capture) ---- */}
      <section className={styles.funnelSection} id="enlist">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="Get on the list" title="Be first through the door.">
            Drop your email and we’ll ping you the moment intel is declassified.
          </SectionHeading>
          <div className={`${styles.funnelGrid} mt-6`}>
            <div className={styles.funnel}>
              <span className="pixel-tag !bg-pink text-paper">◆ First contact</span>
              <h3 className={styles.funnelHead}>Notify me on reveal</h3>
              <p className="text-paper/70 text-sm">
                Date drops, partner reveals, registration opening — straight to your inbox. No spam.
              </p>
              <NotifyFunnel slug={event.slug} cta="Get notified" />
              <div className="mt-4">
                <div className={styles.perk}>▸ <span>Early-bird registration <b>before everyone else</b></span></div>
                <div className={styles.perk}>▸ <span>Every reveal <b>straight to your inbox</b></span></div>
              </div>
            </div>

            <div className={styles.funnel} id="sponsor">
              <span className="pixel-tag !bg-yellow text-ink">◆ For companies</span>
              <h3 className={styles.funnelHead}>Back the event</h3>
              <p className="text-paper/70 text-sm">
                Sponsor slots are open — and a flagship is the loudest stage we’ve got. We’ll send
                the prospectus before it’s public.
              </p>
              <SponsorFunnel slug={event.slug} />
              <div className="mt-4">
                <div className={styles.perk}>▸ <span>Logo on the <b>hero reveal</b></span></div>
                <div className={styles.perk}>▸ <span>First pick of <b>tier &amp; tracks</b></span></div>
              </div>
            </div>
          </div>

          <div className={styles.shareRow}>
            <span className="eyebrow">Spread the word</span>
            <ShareButton text={t.shareText} />
            <span className="text-paper/60 text-sm">the teaser art becomes the preview card</span>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============================= REVEALED STATE ============================= */
function RevealedFlagship({ event, theme }: { event: ClubEvent; theme: Theme }) {
  const t = THEME[theme];
  const isUpcoming = event.status === "upcoming";
  const ticket = isUpcoming ? event.ticketUrl ?? event.registerUrl : undefined;
  const ticketExternal = ticket ? /^https?:\/\//i.test(ticket) : false;
  const tiers = (isUpcoming ? event.ticketTiers ?? [] : []).filter((x) => x.price != null);

  return (
    <div className={styles.root} data-theme={theme}>
      {/* themed flagship hero band */}
      <section className={styles.hero}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className={styles.heroGrid}>
            <div className="animate-rise">
              <span className="eyebrow">{t.eyebrow} · declassified</span>
              <h1 className={`${styles.headline} ${t.headlineExtra}`}>{event.title}</h1>
              <p className={styles.blurb}>{event.blurb}</p>

              <div className={styles.metaRow}>
                <span className={`pixel-tag ${isUpcoming ? "!bg-mint text-ink" : "!bg-panel-2"}`}>
                  {isUpcoming ? "● now live" : "✓ wrapped"}
                </span>
                {event.date && <span className="pixel-tag">⬡ {event.date}</span>}
                {event.venue && <span className="pixel-tag">⬡ {event.venue}</span>}
              </div>

              {isUpcoming && countdownTarget(event) && (
                <div className={styles.cdBlock}>
                  <div className={`${styles.cdTitle} caret`}>Kicks off in</div>
                  <FlagshipCountdown target={countdownTarget(event)} />
                </div>
              )}

              <div className={styles.ctaRow}>
                {ticket ? (
                  <a
                    href={ticket}
                    target={ticketExternal ? "_blank" : undefined}
                    rel={ticketExternal ? "noreferrer noopener" : undefined}
                    className="btn btn-pink btn-start"
                  >
                    ▶ Register now{ticketExternal && " ↗"}
                  </a>
                ) : null}
                <ShareButton text={`${event.title} — it's on. 🦆`} className="btn btn-ghost">Share →</ShareButton>
              </div>

              {event.lead && (
                <div className="mt-6">
                  <LeadBadge lead={event.lead} label="Event lead" />
                </div>
              )}
            </div>

            <div className="pixel-hover">
              <div className={styles.heroArt}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={event.bannerUrl || event.posterUrl || `/flagship/hero-${theme}.webp`} alt={event.title} />
              </div>
            </div>
          </div>
        </div>
        {theme === "nightrun" && (
          <div className={styles.neonGrid} aria-hidden><div className={styles.neonGridInner} /></div>
        )}
      </section>

      {event.bannerUrl && <Banner src={event.bannerUrl} alt={event.title} />}

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <dl className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          <Fact label="When" value={event.date} />
          <Fact label="Venue" value={event.venue} />
          <Fact label="Format" value={event.format} />
          <Fact label="Catering" value={event.foodIncluded ? "Food included" : undefined} />
        </dl>

        {tiers.length > 0 && (
          <div className="mt-6 inline-block border-[3px] border-paper bg-panel p-4">
            <p className="font-mono text-xs uppercase tracking-wide text-paper/50">Ticket pricing</p>
            <dl className="mt-2 space-y-1.5">
              {tiers.map((x) => (
                <div key={x.label} className="flex items-center justify-between gap-6 text-sm">
                  <dt className="text-paper/80">{x.label}</dt>
                  <dd className="font-bold">{formatTicketPrice(x.price)}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {event.description && (
          <div className="mt-14">
            <SectionHeading eyebrow="About" title="What's happening.">
              The full rundown for {event.title}.
            </SectionHeading>
            <div className="mt-6 max-w-3xl text-lg"><Markdown content={event.description} /></div>
          </div>
        )}

        {event.speakers && event.speakers.length > 0 && (
          <div className="mt-14">
            <SectionHeading eyebrow="Speakers" title="Who's presenting.">
              The people sharing what they know at {event.title}.
            </SectionHeading>
            <div className="mt-6"><Speakers speakers={event.speakers} /></div>
          </div>
        )}

        {event.sponsors && event.sponsors.length > 0 && (
          <div className="mt-14">
            <SectionHeading eyebrow="Sponsors" title="Thanks to our sponsors.">
              {event.title} is made possible with the support of these partners.
            </SectionHeading>
            <div className="mt-6"><SponsorLogos sponsors={event.sponsors} /></div>
          </div>
        )}

        {event.partners && event.partners.length > 0 && (
          <div className="mt-14">
            <SectionHeading eyebrow="Partners" title="In collaboration with.">
              {event.title} is run together with these clubs and organisations.
            </SectionHeading>
            <div className="mt-6"><SponsorLogos sponsors={event.partners} /></div>
          </div>
        )}

        {event.gallery && event.gallery.length > 0 && (
          <div className="mt-14">
            <SectionHeading eyebrow="Gallery" title="From the event.">
              Photos and content from {event.title}.
            </SectionHeading>
            <div className="mt-6"><Gallery items={event.gallery} /></div>
          </div>
        )}
      </section>
    </div>
  );
}

/* ================================ ENTRY ================================== */
export function FlagshipEvent({ event }: { event: ClubEvent }) {
  const theme: Theme = event.flagshipTheme ?? "arena";
  if (event.flagshipState === "revealed") return <RevealedFlagship event={event} theme={theme} />;
  return <TeaserFlagship event={event} theme={theme} />;
}
