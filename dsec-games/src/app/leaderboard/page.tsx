import type { Metadata } from "next";

import { LeaderboardView } from "@/components/leaderboard-view";

export const metadata: Metadata = { title: "Leaderboard" };

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <header className="mb-6 text-center">
        <p className="eyebrow">Standings</p>
        <h1 className="text-3d-pink font-display text-2xl sm:text-3xl">LEADERBOARD</h1>
        <p className="mt-2 text-sm text-paper/70">
          Points across both games. The monthly gift-card draw goes to the member with the most points,
          highest score wins. Not a random draw.
        </p>
      </header>
      <LeaderboardView />
    </div>
  );
}
