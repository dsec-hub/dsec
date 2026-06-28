import type { Metadata } from "next";

import { CodleBoard } from "@/components/codle-board";

export const metadata: Metadata = { title: "Codle" };

export default function CodlePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-6 text-center">
        <p className="eyebrow">Daily puzzle</p>
        <h1 className="text-3d-pink font-display text-2xl sm:text-3xl">CODLE</h1>
        <p className="mt-2 text-sm text-paper/70">
          Guess the hidden coding keyword. Green is right spot, yellow is wrong spot. Same word as Discord.
        </p>
      </header>
      <CodleBoard />
    </div>
  );
}
