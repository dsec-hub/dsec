export function SiteFooter() {
  const website = process.env.NEXT_PUBLIC_WEBSITE_URL ?? "https://dsec.club";
  return (
    <footer className="border-t border-paper/15 bg-void/60">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-center font-mono text-xs text-paper/50 sm:flex-row sm:text-left">
        <p>Built by the Deakin Software Engineering Club.</p>
        <p>
          Members play free and unlimited. The monthly gift-card draw is members only, highest points wins.{" "}
          <a href={website} className="text-pink hover:underline">
            dsec.club
          </a>
        </p>
      </div>
    </footer>
  );
}
