import type { Metadata } from "next";

import { FlappyGame } from "@/components/flappy-game";
import { resolvePlayer } from "@/lib/player";
import { portalLoginUrl } from "@/lib/login-url";

export const metadata: Metadata = { title: "Flappy Duck" };

export default async function FlappyDuckPage() {
  const player = await resolvePlayer();
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-6 text-center">
        <p className="eyebrow">Arcade</p>
        <h1 className="text-3d-pink font-display text-2xl sm:text-3xl">FLAPPY DUCK</h1>
        <p className="mt-2 text-sm text-paper/70">
          Same daily pipe layout for everyone. Members play unlimited, points cap at 50 a day.
        </p>
      </header>

      {!player && (
        <div className="pixel-card mb-6 p-4 text-center text-sm">
          <p className="text-paper/80">You can play, but you need to be signed in to save a score.</p>
          <a href={portalLoginUrl("/flappy-duck")} className="btn-yellow mt-3 inline-block px-4 py-2 text-xs">
            Sign in at the portal
          </a>
        </div>
      )}

      <FlappyGame />
    </div>
  );
}
