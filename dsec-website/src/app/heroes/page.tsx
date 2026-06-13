import type { Metadata } from "next";
import { heroes } from "@/components/heroes";

export const metadata: Metadata = {
  title: "Hero explorations",
  description: "Five hero treatments for the DSEC home switchboard.",
};

export default function HeroesPage() {
  return (
    <div>
      <div className="border-b-[3px] border-paper bg-void text-paper">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="eyebrow !text-yellow">Design exploration</p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
            5 hero directions
          </h1>
          <p className="mt-3 max-w-2xl text-paper/75">
            Each forks the two audiences (students → Join, companies → Sponsor) and
            keeps their CTAs from competing. Pick one for the home page. It&apos;s
            wired into{" "}
            <code className="font-mono text-mint">src/app/page.tsx</code>.
          </p>
        </div>
      </div>

      <div className="divide-y-[3px] divide-paper">
        {heroes.map(({ id, name, Component }, i) => (
          <section key={id} id={id} className="scroll-mt-20">
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 pt-10 sm:px-6">
              <span className="grid h-9 w-9 place-items-center border-[3px] border-paper bg-yellow font-display text-lg font-bold shadow-[3px_3px_0_0_var(--color-paper)]">
                {i + 1}
              </span>
              <h2 className="font-display text-2xl font-bold">{name}</h2>
              <span className="pixel-tag ml-auto">hero/{id}</span>
            </div>
            <Component />
          </section>
        ))}
      </div>
    </div>
  );
}
