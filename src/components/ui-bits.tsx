import { AlertTriangle, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  className,
  children,
  reflective,
}: {
  className?: string;
  children: ReactNode;
  reflective?: boolean;
}) {
  return (
    <section className={cn("glass-panel p-5 lg:p-6", reflective && "reflective", className)}>
      {children}
    </section>
  );
}

export function PanelTitle({
  icon,
  title,
  subtitle,
  action,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      {icon && (
        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-border/70 bg-card/70 text-primary">
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-semibold leading-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PriorityPill({ priority }: { priority: string }) {
  const p = priority.toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        /^(high|critical|urgent|p0|p1)/.test(p) &&
          "border-destructive/30 bg-destructive/10 text-destructive",
        /^(med|normal|p2)/.test(p) && "border-amber/40 bg-amber/15 text-foreground",
        /^(low|p3)/.test(p) && "border-teal/40 bg-teal/15 text-foreground",
        !/^(high|critical|urgent|p0|p1|med|normal|p2|low|p3)/.test(p) &&
          "border-border bg-muted text-muted-foreground",
      )}
    >
      {priority}
    </span>
  );
}


export function LoadingState({ label, lines = 3 }: { label: string; lines?: number }) {
  return (
    <div className="space-y-4" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
        {label}
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/3 shimmer-bar rounded-full" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 animate-pulse rounded-full bg-muted"
            style={{ width: `${92 - i * 12}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  );
}

export function BulletList({ items, className }: { items: string[]; className?: string }) {
  if (!items?.length) return <p className="text-sm text-muted-foreground">None identified.</p>;
  return (
    <ul className={cn("space-y-2 text-sm", className)}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-chameleon" aria-hidden />
          <span className="text-foreground/90">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-6 text-center">
      <p className="font-display text-sm font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
