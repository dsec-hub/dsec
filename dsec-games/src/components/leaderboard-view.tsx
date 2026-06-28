"use client";

import { useEffect, useState } from "react";

type Entry = { rank: number; display_name: string; points: number; account_id: number | null };

const WINDOWS = [
  { key: "daily", label: "Today" },
  { key: "weekly", label: "This week" },
  { key: "cycle", label: "This month" },
];
const GAMES = [
  { key: "", label: "Overall" },
  { key: "codle", label: "Codle" },
  { key: "flappy-duck", label: "Flappy Duck" },
];

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export function LeaderboardView() {
  const [window, setWindow] = useState("weekly");
  const [game, setGame] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reload whenever the window/game toggles change. All state updates happen
  // AFTER the await (never synchronously in the effect body).
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const qs = new URLSearchParams({ window });
        if (game) qs.set("game", game);
        const res = await fetch(`/api/games/leaderboard?${qs.toString()}`, { cache: "no-store" });
        const data = (await res.json()) as { entries?: Entry[]; error?: string };
        if (!active) return;
        if (!res.ok) throw new Error(data.error ?? "could not load the leaderboard");
        setEntries(data.entries ?? []);
        setError(null);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "could not load the leaderboard");
        setEntries([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [window, game]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {WINDOWS.map((w) => (
          <Toggle key={w.key} active={window === w.key} onClick={() => setWindow(w.key)}>
            {w.label}
          </Toggle>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {GAMES.map((g) => (
          <Toggle key={g.key} active={game === g.key} onClick={() => setGame(g.key)} subtle>
            {g.label}
          </Toggle>
        ))}
      </div>

      <div className="pixel-card divide-y divide-paper/10 p-0">
        {loading && <p className="p-6 text-center font-mono text-sm text-paper/60">Loading…</p>}
        {!loading && error && <p className="p-6 text-center font-mono text-sm text-coral">{error}</p>}
        {!loading && !error && entries.length === 0 && (
          <p className="p-6 text-center font-mono text-sm text-paper/60">No points yet. Be the first.</p>
        )}
        {!loading &&
          !error &&
          entries.map((e) => (
            <div key={`${e.rank}-${e.account_id ?? e.display_name}`} className="flex items-center gap-3 px-4 py-3">
              <span className="w-8 text-center font-display text-sm text-yellow">
                {MEDAL[e.rank] ?? e.rank}
              </span>
              <span className="flex-1 truncate text-sm text-paper">{e.display_name}</span>
              <span className="font-mono text-sm text-mint">{e.points}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

function Toggle({
  active,
  onClick,
  children,
  subtle = false,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  subtle?: boolean;
}) {
  const base = "px-3 py-1.5 font-mono text-xs transition-colors";
  const on = subtle ? "bg-mint text-ink" : "bg-pink text-paper";
  const off = "bg-panel text-paper/70 hover:text-paper";
  return (
    <button onClick={onClick} className={`${base} ${active ? on : off}`}>
      {children}
    </button>
  );
}
