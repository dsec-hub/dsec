"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav, site } from "@/lib/content";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-paper bg-panel/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="grid h-9 w-9 place-items-center border-[3px] border-paper shadow-[3px_3px_0_0_var(--color-paper)] transition-transform duration-150 ease-[var(--ease-out-strong)] group-hover:-translate-y-0.5 group-active:translate-y-0.5">
            <Image src="/logo-s.svg" alt="" width={22} height={56} className="h-6 w-auto" aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            {site.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-3 md:flex lg:gap-4">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 font-mono text-sm font-bold uppercase tracking-wide transition-colors ${
                  active ? "text-blue" : "text-paper hover:text-blue"
                }`}
              >
                {active ? `[${item.label}]` : item.label}
              </Link>
            );
          })}
          <a href={site.app} className="btn btn-ghost ml-3 !py-2.5 !text-sm">
            Sign in
          </a>
          <Link href="/join" className="btn btn-pink !py-2.5 !text-sm">
            Join
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center border-[3px] border-paper bg-panel shadow-[3px_3px_0_0_var(--color-paper)] transition-transform duration-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none md:hidden"
        >
          <span className="font-mono text-lg font-bold leading-none">
            {open ? "×" : "≡"}
          </span>
        </button>
      </div>

      {open && (
        <div className="menu-drop border-t-[3px] border-paper bg-panel md:hidden">
          <nav className="stagger mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="slide-link py-1 font-mono text-sm font-bold uppercase tracking-wide"
              >
                › {item.label}
              </Link>
            ))}
            <a
              href={site.app}
              onClick={() => setOpen(false)}
              className="btn btn-ghost mt-2 justify-center"
            >
              Sign in
            </a>
            <Link
              href="/join"
              onClick={() => setOpen(false)}
              className="btn btn-pink justify-center"
            >
              Join
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

