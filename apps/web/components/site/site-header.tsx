import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link
          href="/"
          className="flex items-center gap-2 text-[15px] font-semibold tracking-tight"
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary font-bold text-primary-foreground">
            a
          </span>
          appCN
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/components" className="transition-colors hover:text-foreground">
            Components
          </Link>
          <Link
            href="/components/stream-bubble"
            className="transition-colors hover:text-foreground"
          >
            AI
          </Link>
          <a
            href="https://github.com/your-org/appcn"
            className="transition-colors hover:text-foreground"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
