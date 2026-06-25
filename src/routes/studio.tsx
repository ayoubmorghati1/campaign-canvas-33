import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  ChevronDown,
  LayoutGrid,
  Plus,
  Search,
  Settings,
  Wand2,
} from "lucide-react";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/studio/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Studio · Campaign Studio" },
      { name: "description", content: "Plan, generate, and ship marketing campaigns inside the Campaign Studio workspace." },
    ],
  }),
  component: StudioLayout,
});

function StudioLayout() {
  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] bg-paper text-ink">
      <StudioSidebar />
      <div className="flex min-h-screen flex-col">
        <StudioTopbar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function StudioSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (p: string) => (p === "/studio" ? pathname === "/studio" : pathname.startsWith(p));

  const sections: { label: string; items: { l: string; to: string; icon: ReactNode; pill?: string }[] }[] = [
    {
      label: "Workspace",
      items: [
        { l: "Projects", to: "/studio", icon: <LayoutGrid className="size-4" /> },
        { l: "New campaign", to: "/studio/new", icon: <Plus className="size-4" />, pill: "⌘N" },
      ],
    },
  ];

  return (
    <aside className="sticky top-0 flex h-screen flex-col border-r border-border bg-paper/80 backdrop-blur-xl">
      <div className="px-5 pt-5">
        <Link to="/" className="block">
          <LogoMark />
        </Link>
      </div>

      {/* brand switcher */}
      <button className="mx-4 mt-6 flex items-center justify-between rounded-xl border border-border bg-white p-2.5 text-left shadow-soft transition-all hover:border-ink/20">
        <div className="flex items-center gap-2.5">
          <div className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-violet via-clay to-lime text-[10px] font-bold text-white">N</div>
          <div>
            <div className="text-sm font-medium leading-none">NORDH</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">workspace · 3 brands</div>
          </div>
        </div>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>

      <nav className="mt-6 flex-1 overflow-y-auto px-3">
        {sections.map((sec) => (
          <div key={sec.label} className="mb-5">
            <div className="px-3 pb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{sec.label}</div>
            <div className="space-y-0.5">
              {sec.items.map((i) => (
                <Link
                  key={i.to}
                  to={i.to}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive(i.to) ? "bg-ink text-paper" : "text-foreground/80 hover:bg-white hover:text-ink",
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    {i.icon}
                    {i.l}
                  </span>
                  {i.pill && (
                    <span className={cn("font-mono text-[10px]", isActive(i.to) ? "text-paper/60" : "text-muted-foreground")}>{i.pill}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-6 rounded-2xl border border-border bg-white p-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Free plan</div>
          <div className="text-sm">2 of 3 campaigns this month</div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-2/3 bg-gradient-to-r from-violet to-clay" />
          </div>
          <Link to="/pricing" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-violet hover:underline">
            Upgrade to Studio <ArrowRight className="size-3" />
          </Link>
        </div>
      </nav>

      <div className="m-3 flex items-center justify-between rounded-xl border border-border bg-white p-2.5">
        <div className="flex items-center gap-2.5">
          <div className="grid size-7 place-items-center rounded-full bg-ink font-mono text-[11px] text-paper">AM</div>
          <div className="text-xs">
            <div className="font-medium">Amelia Marsh</div>
            <div className="text-muted-foreground">founder · NORDH</div>
          </div>
        </div>
        <Settings className="size-4 text-muted-foreground" />
      </div>
    </aside>
  );
}

function StudioTopbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const crumbs = buildCrumbs(pathname);
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-paper/80 px-6 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {pathname !== "/studio" && (
          <Link to="/studio" className="grid size-8 place-items-center rounded-lg border border-border bg-white text-muted-foreground transition hover:text-ink">
            <ArrowLeft className="size-4" />
          </Link>
        )}
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="opacity-40">/</span>}
              {c.to ? (
                <Link to={c.to} className="hover:text-ink">{c.label}</Link>
              ) : (
                <span className="text-ink">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-sm text-muted-foreground md:flex">
          <Search className="size-3.5" /> Search campaigns
          <span className="ml-3 rounded bg-muted px-1.5 font-mono text-[10px]">⌘K</span>
        </div>
        <button className="grid size-9 place-items-center rounded-full border border-border bg-white text-muted-foreground hover:text-ink">
          <Bell className="size-4" />
        </button>
        <Link to="/studio/new" className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90">
          <Wand2 className="size-4" /> New campaign
        </Link>
      </div>
    </div>
  );
}

function buildCrumbs(pathname: string): { label: string; to?: string }[] {
  if (pathname === "/studio") return [{ label: "NORDH" }, { label: "Projects" }];
  if (pathname === "/studio/new") return [{ label: "NORDH", to: "/studio" }, { label: "New campaign" }];
  if (pathname.startsWith("/studio/c/")) return [{ label: "NORDH", to: "/studio" }, { label: "Campaign" }];
  return [{ label: "Studio" }];
}