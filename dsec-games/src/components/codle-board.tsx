"use client";

import { useCallback, useEffect, useState } from "react";

type Mark = "correct" | "present" | "absent";
type Guess = { guess: string; marks: Mark[] };

type State = {
  length: number;
  max_guesses: number;
  period_key?: string;
  started?: boolean;
  finished?: boolean;
  solved?: boolean;
  answer?: string | null;
  guesses?: Guess[];
  points?: number;
  signedIn?: boolean;
};

const MARK_BG: Record<Mark, string> = {
  correct: "bg-mint text-ink",
  present: "bg-yellow text-ink",
  absent: "bg-panel-2 text-paper/60",
};
const MARK_EMOJI: Record<Mark, string> = { correct: "🟩", present: "🟨", absent: "⬛" };

export function CodleBoard() {
  const [state, setState] = useState<State | null>(null);
  const [guess, setGuess] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load today's round + the player's resumable board on mount. State is only
  // set after the awaits (never synchronously in the effect body).
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [roundRes, stateRes] = await Promise.all([
          fetch("/api/games/codle/round", { cache: "no-store" }),
          fetch("/api/games/codle/state", { cache: "no-store" }),
        ]);
        const round = (await roundRes.json()) as State;
        const st = (await stateRes.json()) as State;
        if (!active) return;
        setState({ ...round, ...st });
      } catch {
        if (active) setError("could not load today's Codle");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const submitGuess = useCallback(async () => {
    if (!state) return;
    const g = guess.trim().toUpperCase();
    if (g.length !== state.length) {
      setError(`enter a ${state.length}-letter word`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/games/codle/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission: { guess: g } }),
      });
      const data = (await res.json()) as State & { detail?: State; error?: string };
      if (!res.ok) {
        setError(data.error ?? "that guess was not accepted");
        return;
      }
      const detail = data.detail ?? {};
      setState((prev) => ({ ...(prev as State), ...detail }));
      setGuess("");
    } catch {
      setError("could not submit your guess");
    } finally {
      setBusy(false);
    }
  }, [guess, state]);

  if (!state) {
    return <p className="text-center font-mono text-sm text-paper/60">{error ?? "Loading…"}</p>;
  }

  const length = state.length ?? 5;
  const maxGuesses = state.max_guesses ?? 6;
  const guesses = state.guesses ?? [];
  const finished = !!state.finished;
  const rowsLeft = Math.max(0, maxGuesses - guesses.length - (finished ? 0 : 1));

  const shareText = buildShare(state, guesses);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="grid gap-1.5">
        {guesses.map((row, i) => (
          <Row key={`g${i}`} letters={row.guess} marks={row.marks} length={length} />
        ))}
        {!finished && <Row letters={guess.padEnd(length, " ")} marks={null} length={length} active />}
        {Array.from({ length: rowsLeft }).map((_, i) => (
          <Row key={`e${i}`} letters={" ".repeat(length)} marks={null} length={length} />
        ))}
      </div>

      {!finished && (
        <div className="flex w-full max-w-xs flex-col items-center gap-2">
          <input
            value={guess}
            onChange={(e) => setGuess(e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, length).toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submitGuess();
            }}
            placeholder={`${length}-letter keyword`}
            aria-label="Your guess"
            maxLength={length}
            className="pixel-input w-full text-center font-mono uppercase tracking-[0.3em]"
            autoFocus
          />
          <button onClick={submitGuess} disabled={busy} className="btn-mint w-full px-4 py-2 text-sm">
            {busy ? "Checking…" : "Guess"}
          </button>
          {state.signedIn === false && (
            <p className="font-mono text-xs text-paper/50">Playing as a guest. Sign in to keep your streak.</p>
          )}
        </div>
      )}

      {finished && (
        <div className="pixel-card flex w-full max-w-sm flex-col items-center gap-3 p-5 text-center">
          {state.solved ? (
            <p className="font-display text-lg text-mint">Solved! +{state.points ?? 0} points</p>
          ) : (
            <p className="font-display text-lg text-pink">
              The word was <span className="text-yellow">{state.answer}</span>
            </p>
          )}
          <pre className="font-mono text-base leading-tight">{shareText}</pre>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(shareText);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch {
                /* clipboard blocked */
              }
            }}
            className="btn-pink px-4 py-2 text-sm"
          >
            {copied ? "Copied!" : "Share result"}
          </button>
          <p className="font-mono text-xs text-paper/50">Back tomorrow for a new word.</p>
        </div>
      )}

      {error && <p className="font-mono text-xs text-coral">{error}</p>}
    </div>
  );
}

function Row({
  letters,
  marks,
  length,
  active = false,
}: {
  letters: string;
  marks: Mark[] | null;
  length: number;
  active?: boolean;
}) {
  const chars = letters.padEnd(length, " ").slice(0, length).split("");
  return (
    <div className="flex gap-1.5">
      {chars.map((ch, i) => {
        const mark = marks?.[i];
        const cls = mark
          ? MARK_BG[mark]
          : active && ch.trim()
            ? "bg-panel text-paper border border-pink"
            : "bg-panel text-paper border border-paper/20";
        return (
          <div
            key={i}
            className={`flex h-12 w-12 items-center justify-center font-display text-xl ${cls}`}
          >
            {ch.trim()}
          </div>
        );
      })}
    </div>
  );
}

function buildShare(state: State, guesses: Guess[]): string {
  const day = state.period_key ?? "";
  const tries = state.solved ? `${guesses.length}/${state.max_guesses ?? 6}` : `X/${state.max_guesses ?? 6}`;
  const grid = guesses.map((g) => g.marks.map((m) => MARK_EMOJI[m]).join("")).join("\n");
  return `DSEC Codle ${day} ${tries}\n${grid}`;
}
