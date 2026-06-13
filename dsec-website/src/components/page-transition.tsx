"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Pixel page transition with a true cover/reveal sequence - modelled on the old
 * site's TransitionLink + PageTransition (which used GSAP + sessionStorage);
 * here it's one self-contained component using CSS animations:
 *
 *   1. click an internal link -> pink pixel blocks blast IN and fully cover the
 *      screen (each block snaps on, on a random scattered stagger)
 *   2. once covered           -> the route actually changes underneath
 *   3. new page committed      -> the pink blocks blast OUT to reveal it
 *
 * We intercept internal link clicks at the document (capture phase) so header
 * and footer links transition too - no need to swap every <Link> for a custom
 * component like the old site did.
 *
 * Honours prefers-reduced-motion: the global CSS rule collapses the block
 * animations to ~0ms, so cover/reveal happen effectively instantly.
 */
const BLOCK = 56; // px - fixed block size (old site used 60), so pixels stay a
//                   consistent size on every screen
const MAX_DELAY = 0.32; // s - random scatter window for the stagger
const SHARD_DUR = 0.06; // s - matches the CSS animation duration
const COVER_MS = (MAX_DELAY + SHARD_DUR) * 1000 + 40;
const REVEAL_MS = (MAX_DELAY + SHARD_DUR) * 1000 + 80;

type Phase = "idle" | "cover" | "reveal";

// Deterministic pseudo-random in [0,1) from an index - stable across renders so
// the scatter is consistent within a transition.
function rand(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [grid, setGrid] = useState({ cols: 0, rows: 0 });
  const pending = useRef<string | null>(null);
  const navigating = useRef(false);

  // Intercept internal link clicks: size the grid to the viewport and cover-in.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      if (!href || (target && target !== "_self")) return;
      if (
        href.startsWith("http") ||
        href.startsWith("//") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        anchor.hasAttribute("download")
      ) {
        return;
      }
      const url = new URL(href, window.location.origin);
      if (url.pathname === window.location.pathname) return; // same page

      e.preventDefault();
      setGrid({
        cols: Math.ceil(window.innerWidth / BLOCK),
        rows: Math.ceil(window.innerHeight / BLOCK),
      });
      pending.current = url.pathname + url.search + url.hash;
      navigating.current = true;
      setPhase("cover");
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Once the cover is solid, perform the actual navigation.
  useEffect(() => {
    if (phase !== "cover" || !pending.current) return;
    const t = setTimeout(() => {
      if (pending.current) router.push(pending.current);
    }, COVER_MS);
    return () => clearTimeout(t);
  }, [phase, router]);

  // After the route commits (under the cover), play the reveal-out.
  useEffect(() => {
    if (!navigating.current) return;
    navigating.current = false;
    pending.current = null;
    setPhase("reveal");
    const t = setTimeout(() => setPhase("idle"), REVEAL_MS);
    return () => clearTimeout(t);
  }, [pathname]);

  const count = grid.cols * grid.rows;

  return (
    <div className="page-transition">
      {phase !== "idle" && count > 0 && (
        <div
          className="pixel-shatter"
          aria-hidden="true"
          style={{
            gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
            gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
          }}
        >
          {Array.from({ length: count }).map((_, i) => (
            <span
              key={i}
              className={phase === "cover" ? "pixel-shard-in" : "pixel-shard-out"}
              style={{ animationDelay: `${(rand(i) * MAX_DELAY).toFixed(3)}s` }}
            />
          ))}
        </div>
      )}
      {children}
    </div>
  );
}
