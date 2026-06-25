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
          <a href="#features" className="hover:text-ink">Product</a>
          <a href="#how" className="hover:text-ink">How it works</a>
          <a href="#inside" className="hover:text-ink">Studio</a>
          <Link to="/pricing" className="hover:text-ink">Pricing</Link>
          <a href="#customers" className="hover:text-ink">Customers</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/sign-in" className="hidden text-sm text-muted-foreground hover:text-ink md:inline">Sign in</Link>
          <ViolePillButton to="/studio">Start free</ViolePillButton>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-5">
          <div className="col-span-2">
            <LogoMark />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              The AI Creative Director for product marketing. Built for founders, shipped by teams.
            </p>
            <div className="mt-6 flex gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="rounded-full bg-muted px-2 py-1">SOC 2 · in progress</span>
              <span className="rounded-full bg-muted px-2 py-1">v 0.9 · beta</span>
            </div>
          </div>
          {[
            { title: "Product", links: ["Studio", "Inspiration Inspector", "Campaign DNA"] },
            { title: "Resources", links: ["Changelog", "Playbook", "Templates", "API", "Status"] },
            { title: "Company", links: ["About", "Customers", "Careers", "Press", "Contact"] },
          ].map((col) => (
            <div key={col.title}>
              <div className="mb-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{col.title}</div>
              <ul className="space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l}><a className="text-ink hover:text-violet" href="#">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <span>© 2026 Campaign Studio · Made with intention.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-ink">Privacy</a>
            <a href="#" className="hover:text-ink">Terms</a>
            <a href="#" className="hover:text-ink">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}