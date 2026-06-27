import { Link } from "@tanstack/react-router";
import { LogoMark, ViolePillButton } from "./primitives";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-paper/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/">
          <LogoMark />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#product" className="hover:text-ink">Product</a>
          <a href="#how-built" className="hover:text-ink">How it was built</a>
          <a href="#code" className="hover:text-ink">Code</a>
        </nav>
        <div className="flex items-center gap-3">
          <ViolePillButton to="/studio">Open the studio</ViolePillButton>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <LogoMark />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              The AI Creative Director for product marketing. Built for founders, shipped by teams.
            </p>
          </div>
          <div>
            <div className="mb-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Product</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/studio" className="text-ink hover:text-violet">Studio</Link></li>
              <li><Link to="/studio/new" className="text-ink hover:text-violet">New campaign</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
          © 2026 Campaign Studio · Made with intention.
        </div>
      </div>
    </footer>
  );
}