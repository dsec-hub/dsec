"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Logical canvas resolution (2:3). The element scales to the viewport via CSS
// (image-rendering: pixelated), so everything stays crisp and big on any screen.
const W = 400;
const H = 600;
const DUCK_X = 96;
const DUCK_SIZE = 46;
const PIPE_W = 76; // obstacle "building" width
const JUMP = -7.0;
const OVER_COOLDOWN_MS = 450; // ignore taps right after a crash

type RoundConfig = {
  seed: number;
  gravity: number;
  pipe_gap: number;
  pipe_spacing: number;
  speed: number;
  session: string;
};

type Result = {
  points: number;
  raw_score: number;
  leaderboard_position: number | null;
  is_member_play: boolean;
};

type Phase = "loading" | "ready" | "playing" | "over";
type Pipe = { x: number; gapY: number; scored: boolean; id: number };

// Deterministic PRNG so a daily seed gives everyone the same pipe layout.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function FlappyGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const duckImg = useRef<HTMLImageElement | null>(null);
  const cityImg = useRef<HTMLImageElement | null>(null);

  const [phase, setPhase] = useState<Phase>("loading");
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mutable game state in a ref so the rAF loop never re-renders.
  const game = useRef({
    config: null as RoundConfig | null,
    y: H / 2,
    vy: 0,
    pipes: [] as Pipe[],
    rng: mulberry32(1),
    distance: 0,
    score: 0,
    flaps: 0,
    nextId: 1,
    startedAt: 0,
    raf: 0,
    lastT: 0,
    bgOffset: 0,
    overAt: 0,
    phase: "loading" as Phase,
  });

  // --- networking -----------------------------------------------------------

  const fetchRound = useCallback(async () => {
    // Called from the mount effect and from input handlers. Every setState is
    // after the await, so it's safe in an effect too.
    try {
      const res = await fetch("/api/games/flappy-duck/round", { cache: "no-store" });
      const data = (await res.json()) as RoundConfig & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "could not load the round");
        return;
      }
      const g = game.current;
      g.config = data;
      g.y = H / 2;
      g.vy = 0;
      g.pipes = [];
      g.distance = 0;
      g.score = 0;
      g.flaps = 0;
      g.phase = "ready";
      setScore(0);
      setResult(null);
      setError(null);
      setPhase("ready");
    } catch {
      setError("could not load the round");
    }
  }, []);

  const submit = useCallback(async () => {
    const g = game.current;
    if (!g.config) return;
    const durationMs = Math.max(1, Math.round(performance.now() - g.startedAt));
    try {
      const res = await fetch("/api/games/flappy-duck/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission: { session: g.config.session, score: g.score, duration_ms: durationMs, flaps: g.flaps },
        }),
      });
      const data = (await res.json()) as Result & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "could not save your score");
        return;
      }
      setResult(data);
    } catch {
      setError("could not save your score");
    }
  }, []);

  // --- state transitions ----------------------------------------------------

  const startPlaying = useCallback(() => {
    const g = game.current;
    if (!g.config) return;
    g.y = H / 2;
    g.vy = 0;
    g.pipes = [];
    g.distance = 0;
    g.score = 0;
    g.flaps = 0;
    g.nextId = 1;
    g.rng = mulberry32(g.config.seed);
    g.startedAt = performance.now();
    g.lastT = performance.now();
    g.phase = "playing";
    setScore(0);
    setResult(null);
    setError(null);
    setPhase("playing");
  }, []);

  // One input handler for tap/click/key. The duck only ever moves AFTER the
  // player's first flap, so it can't fall the instant a round starts.
  const handleInput = useCallback(() => {
    const g = game.current;
    if (g.phase === "ready") {
      startPlaying();
      g.vy = JUMP;
      g.flaps += 1;
    } else if (g.phase === "playing") {
      g.vy = JUMP;
      g.flaps += 1;
    } else if (g.phase === "over") {
      if (performance.now() - g.overAt < OVER_COOLDOWN_MS) return;
      void fetchRound(); // back to a hovering "ready" duck with a fresh session
    }
  }, [startPlaying, fetchRound]);

  // --- load sprites + the first round on mount ------------------------------

  useEffect(() => {
    const duck = new Image();
    duck.src = "/pixel/duck-flap.webp";
    duckImg.current = duck;
    const city = new Image();
    city.src = "/pixel/flappy-city-bg.webp";
    cityImg.current = city;
    // Inline the initial load so every setState runs AFTER the await (lint-safe);
    // the input handler reuses fetchRound, where sync setState is fine.
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/games/flappy-duck/round", { cache: "no-store" });
        const data = (await res.json()) as RoundConfig & { error?: string };
        if (!active) return;
        if (!res.ok) {
          setError(data.error ?? "could not load the round");
          return;
        }
        const g = game.current;
        g.config = data;
        g.y = H / 2;
        g.vy = 0;
        g.pipes = [];
        g.phase = "ready";
        setPhase("ready");
      } catch {
        if (active) setError("could not load the round");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // --- input bindings -------------------------------------------------------

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "Enter") {
        e.preventDefault();
        handleInput();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleInput]);

  // --- the game loop --------------------------------------------------------

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const spawnPipe = (x: number) => {
      const g = game.current;
      const cfg = g.config!;
      const margin = 84;
      const gapY = margin + g.rng() * (H - cfg.pipe_gap - margin * 2);
      g.pipes.push({ x, gapY, scored: false, id: g.nextId++ });
    };

    // Draw an obstacle "skyscraper": dark body, lit window grid, a roof ledge on
    // the gap-facing end. `ledge` says which end faces the gap.
    const drawTower = (x: number, top: number, height: number, id: number, ledge: "top" | "bottom") => {
      ctx.fillStyle = "#15131f";
      ctx.fillRect(x, top, PIPE_W, height);
      ctx.fillStyle = "#221f36"; // left highlight edge
      ctx.fillRect(x, top, 5, height);
      // windows
      const cols = 4;
      const marginX = 13;
      const cellW = (PIPE_W - marginX * 2) / cols;
      const winW = 9;
      const winH = 11;
      let row = 0;
      for (let wy = top + 12; wy < top + height - 16; wy += 19, row++) {
        for (let c = 0; c < cols; c++) {
          const wx = x + marginX + c * cellW + (cellW - winW) / 2;
          const lit = (c * 7 + row * 13 + id * 5) % 5 < 2;
          ctx.fillStyle = lit ? ((c + row + id) % 2 ? "#ffcf33" : "#00bcd4") : "#0b0a12";
          ctx.fillRect(Math.round(wx), Math.round(wy), winW, winH);
        }
      }
      // roof ledge at the gap end
      ctx.fillStyle = "#2c2945";
      const ly = ledge === "bottom" ? top + height - 14 : top;
      ctx.fillRect(x - 4, ly, PIPE_W + 8, 14);
    };

    const tick = () => {
      const g = game.current;
      const cfg = g.config;

      // Delta-time step normalised to 60fps so the speed is identical on a 60Hz
      // or 120Hz (ProMotion) display. Clamp against tab-switch / first-frame jumps.
      const now = performance.now();
      let dt = g.lastT ? (now - g.lastT) / (1000 / 60) : 1;
      g.lastT = now;
      if (dt > 3) dt = 3;

      // --- city backdrop (generated pixel art) ---
      ctx.imageSmoothingEnabled = false;
      const city = cityImg.current;
      if (city && city.complete && city.naturalWidth) {
        ctx.drawImage(city, 0, 0, W, H);
      } else {
        ctx.fillStyle = "#0a0815";
        ctx.fillRect(0, 0, W, H);
      }

      // --- physics (only once the player has flapped) ---
      if (cfg && g.phase === "playing") {
        g.vy += cfg.gravity * dt;
        g.y += g.vy * dt;
        g.distance += cfg.speed * dt;

        const last = g.pipes[g.pipes.length - 1];
        if (!last || last.x < W - cfg.pipe_spacing) spawnPipe(W);
        for (const p of g.pipes) p.x -= cfg.speed * dt;
        g.pipes = g.pipes.filter((p) => p.x > -PIPE_W - 8);

        for (const p of g.pipes) {
          if (!p.scored && p.x + PIPE_W < DUCK_X) {
            p.scored = true;
            g.score += 1;
            setScore(g.score);
          }
          const inX = DUCK_X + DUCK_SIZE > p.x && DUCK_X < p.x + PIPE_W;
          const hit = inX && (g.y < p.gapY || g.y + DUCK_SIZE > p.gapY + cfg.pipe_gap);
          if (hit) g.phase = "over";
        }
        if (g.y + DUCK_SIZE > H || g.y < 0) g.phase = "over";

        if (g.phase === "over") {
          g.overAt = performance.now();
          setPhase("over");
          void submit();
        }
      }

      // --- obstacle towers ---
      if (cfg) {
        for (const p of g.pipes) {
          drawTower(p.x, 0, p.gapY, p.id, "bottom");
          drawTower(p.x, p.gapY + cfg.pipe_gap, H - p.gapY - cfg.pipe_gap, p.id + 1, "top");
        }
      }

      // --- ground line ---
      ctx.fillStyle = "#2ce0a3";
      ctx.fillRect(0, H - 4, W, 4);

      // --- duck (tilts with vertical speed) ---
      const img = duckImg.current;
      ctx.save();
      ctx.translate(DUCK_X + DUCK_SIZE / 2, g.y + DUCK_SIZE / 2);
      const tilt = Math.max(-0.5, Math.min(0.9, g.vy * 0.06));
      ctx.rotate(g.phase === "playing" ? tilt : 0);
      ctx.imageSmoothingEnabled = false;
      if (img && img.complete && img.naturalWidth) {
        ctx.drawImage(img, -DUCK_SIZE / 2, -DUCK_SIZE / 2, DUCK_SIZE, DUCK_SIZE);
      } else {
        ctx.fillStyle = "#ffcf33";
        ctx.fillRect(-DUCK_SIZE / 2, -DUCK_SIZE / 2, DUCK_SIZE, DUCK_SIZE);
      }
      ctx.restore();

      g.raf = requestAnimationFrame(tick);
    };

    const state = game.current;
    state.raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(state.raf);
  }, [submit]);

  // --- render ---------------------------------------------------------------

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="pixel-card-lg relative mx-auto aspect-[2/3] w-full overflow-hidden p-0"
        // Fit BOTH the width (mobile) and the height (desktop/tablet): the box is
        // as wide as it can be without its 2:3 height exceeding ~80vh.
        style={{ width: "min(94vw, calc(80vh * 0.6667))", touchAction: "none" }}
        onPointerDown={(e) => {
          e.preventDefault();
          handleInput();
        }}
        role="button"
        tabIndex={0}
        aria-label="Play Flappy Duck — tap or press space to flap"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleInput();
          }
        }}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="pixelated absolute inset-0 h-full w-full select-none"
        />

        {phase === "playing" && (
          <div className="pointer-events-none absolute left-0 top-0 w-full p-4 text-center font-display text-4xl text-paper drop-shadow-[2px_2px_0_rgba(0,0,0,0.6)]">
            {score}
          </div>
        )}

        {phase !== "playing" && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-void/55 p-6 text-center">
            {phase === "loading" && <p className="font-mono text-sm text-paper/70">Loading the duck…</p>}
            {phase === "ready" && (
              <>
                <p className="font-display text-xl text-yellow">FLAPPY DUCK</p>
                <p className="font-mono text-sm text-paper/80">Tap, click or press space to fly.</p>
                <p className="font-mono text-xs text-paper/50">The duck waits until your first flap.</p>
              </>
            )}
            {phase === "over" && (
              <>
                <p className="font-display text-2xl text-pink">Game over</p>
                <p className="font-mono text-base text-paper">Pipes passed: {score}</p>
                {result && (
                  <p className="font-mono text-sm text-mint">
                    +{result.points} points
                    {result.leaderboard_position ? ` · monthly rank #${result.leaderboard_position}` : ""}
                  </p>
                )}
                {error && <p className="font-mono text-xs text-coral">{error}</p>}
                <p className="mt-1 font-mono text-sm text-paper/80">Tap or press space to play again.</p>
              </>
            )}
          </div>
        )}
      </div>
      {error && phase === "ready" && <p className="font-mono text-xs text-coral">{error}</p>}
    </div>
  );
}
