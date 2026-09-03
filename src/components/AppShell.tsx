import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bot,
  LayoutDashboard,
  ListChecks,
  Menu,
  NotebookPen,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, hint: "Workflow overview" },
  { to: "/meetings", label: "Meeting Notes", icon: NotebookPen, hint: "Summarize & extract" },
  { to: "/research", label: "Research", icon: Search, hint: "Insights on key points" },
  { to: "/planner", label: "Task Planner", icon: ListChecks, hint: "Prioritize & schedule" },
  { to: "/assistant", label: "Assistant", icon: Bot, hint: "Ask anything" },
] as const;

export function Disclaimer({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
    >
      <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
      AI-generated content may require human review
    </p>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon, hint }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <span
              className={cn(
                "absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full transition-opacity bg-chameleon",
                active ? "opacity-100" : "opacity-0",
              )}
              aria-hidden
            />
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="flex flex-col">
              <span className="font-medium">{label}</span>
              <span className="text-[11px] text-muted-foreground/80">{hint}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="grid size-9 place-items-center rounded-xl bg-chameleon text-primary-foreground shadow-[var(--shadow-glass)]">
        <Sparkles className="size-4" aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-base font-semibold tracking-tight">
          Unity Task
        </span>
        <span className="block text-[11px] text-muted-foreground">AI workflow copilot</span>
      </span>
    </Link>
  );
}

export function AppShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:flex">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col justify-between border-r border-sidebar-border bg-sidebar/70 p-5 backdrop-blur-xl lg:flex">
        <div className="flex flex-col gap-8">
          <Brand />
          <NavList />
        </div>
        <div className="glass-panel p-4">
          <p className="font-display text-sm font-semibold">Workflow order</p>
          <ol className="mt-2 space-y-1 text-xs text-muted-foreground">
            <li>1. Summarize meeting notes</li>
            <li>2. Research the key points</li>
            <li>3. Prioritize & schedule tasks</li>
          </ol>
          <Disclaimer className="mt-3" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-4 py-3 lg:px-8">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
              className="grid size-9 place-items-center rounded-xl border border-border bg-card/70 lg:hidden"
            >
              <Menu className="size-4" aria-hidden />
            </button>
            <div className="lg:hidden">
              <Brand />
            </div>
            <div className="hidden min-w-0 lg:block">
              <h1 className="truncate text-lg font-semibold">{title}</h1>
              <p className="truncate text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="ml-auto hidden items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground sm:flex">
              <span className="size-1.5 rounded-full bg-teal" aria-hidden />
              AI online
            </div>
          </div>
        </header>

        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            />
            <div className="absolute inset-y-0 left-0 flex w-72 flex-col gap-8 border-r border-sidebar-border bg-sidebar p-5">
              <div className="flex items-center justify-between">
                <Brand />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation"
                  className="grid size-8 place-items-center rounded-lg border border-border"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
              <NavList onNavigate={() => setOpen(false)} />
            </div>
          </div>
        )}

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 lg:px-8 lg:py-10">
          <div className="mb-6 lg:hidden">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </main>

        <footer className="border-t border-border/60 px-4 py-5 lg:px-8">
          <Disclaimer />
        </footer>
      </div>
    </div>
  );
}
