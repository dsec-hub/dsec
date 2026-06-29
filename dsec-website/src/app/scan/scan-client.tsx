"use client";

import { useState, useEffect, useCallback } from "react";
import { accentBg } from "@/lib/content";

type Accent = "blue" | "pink" | "yellow" | "mint";

export type ScanTarget = {
  label: string;
  caption: string;
  href: string;
  pretty: string;
  accent: Accent;
};

type CardData = { target: ScanTarget; svg: string };

function QrCard({
  target,
  svg,
  onClick,
}: {
  target: ScanTarget;
  svg: string;
  onClick: () => void;
}) {
  return (
    <article
      className="pixel-card pixel-hover flex cursor-pointer flex-col"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`Expand QR code for ${target.label}`}
    >
      <div
        className={`flex items-center justify-between gap-2 border-b-[3px] border-paper ${accentBg[target.accent]} px-3 py-2.5 text-ink sm:px-4`}
      >
        <h2 className="font-display text-sm font-bold leading-none sm:text-base">
          {target.label}
        </h2>
        <span className="font-mono text-[0.6rem] font-bold uppercase tracking-wide opacity-70">
          tap ↗
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4">
        <div
          role="img"
          aria-label={`QR code linking to DSEC ${target.label}`}
          className="aspect-square w-full select-none border-[3px] border-paper bg-paper p-2.5 shadow-[4px_4px_0_0_rgba(5,5,5,0.6)] [&>svg]:h-full [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <p className="text-center text-sm leading-tight text-paper/75">
          {target.caption}
        </p>
        <p className="font-mono text-[0.65rem] text-paper/50">{target.pretty}</p>
      </div>
    </article>
  );
}

function QrModal({
  card,
  onClose,
}: {
  card: CardData;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label={`QR code for ${card.target.label}`}
    >
      <div
        className="pixel-card flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "min(90vw, 380px)" }}
      >
        <div
          className={`flex items-center justify-between gap-2 border-b-[3px] border-paper ${accentBg[card.target.accent]} px-4 py-3 text-ink`}
        >
          <h2 className="font-display text-xl font-bold leading-none">
            {card.target.label}
          </h2>
          <button
            onClick={onClose}
            className="font-mono text-xs font-bold uppercase tracking-wide opacity-70 hover:opacity-100"
            aria-label="Close"
          >
            ✕ close
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 p-6">
          <div
            role="img"
            aria-label={`QR code linking to DSEC ${card.target.label}`}
            className="h-56 w-56 select-none border-[3px] border-paper bg-paper p-3 shadow-[6px_6px_0_0_rgba(5,5,5,0.6)] [&>svg]:h-full [&>svg]:w-full sm:h-64 sm:w-64"
            dangerouslySetInnerHTML={{ __html: card.svg }}
          />
          <p className="text-center text-sm text-paper/80">{card.target.caption}</p>
          <p className="font-mono text-xs text-paper/55">{card.target.pretty}</p>
        </div>
      </div>
    </div>
  );
}

export function ScanGrid({ cards }: { cards: CardData[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);

  const active = activeIndex !== null ? cards[activeIndex] : null;

  // Lay the wall out by card count: a single stacked column on a phone, a 2-up
  // grid on a tablet, and one row of up to 4 across on desktop. Tailwind needs
  // literal class names, so the per-count classes are looked up, not built.
  const n = Math.min(cards.length, 4);
  const lgCols: Record<number, string> = {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
  };
  const lgMax: Record<number, string> = {
    1: "lg:max-w-xs",
    2: "lg:max-w-2xl",
    3: "lg:max-w-4xl",
    4: "lg:max-w-none",
  };
  const gridClass = `mx-auto grid w-full max-w-sm grid-cols-1 gap-3 sm:max-w-xl sm:grid-cols-2 sm:gap-4 ${lgMax[n] ?? "lg:max-w-none"} ${lgCols[n] ?? "lg:grid-cols-4"}`;

  return (
    <>
      <div className={gridClass}>
        {cards.map(({ target, svg }, i) => (
          <QrCard
            key={target.label}
            target={target}
            svg={svg}
            onClick={() => setActiveIndex(i)}
          />
        ))}
      </div>

      {active && <QrModal card={active} onClose={close} />}
    </>
  );
}
