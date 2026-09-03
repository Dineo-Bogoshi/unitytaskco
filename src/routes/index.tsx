import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bot, ListChecks, NotebookPen, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/ui-bits";
import { useWorkspace } from "@/lib/workspace-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Unity Task — AI Workflow Copilot for Professionals" },
      {
        name: "description",
        content:
          "Unity Task turns meeting notes into researched insights and a prioritized, scheduled task plan — powered by AI.",
      },
      { property: "og:title", content: "Unity Task — AI Workflow Copilot for Professionals" },
      {
        property: "og:description",
        content:
          "Summarize meetings, research key points, and auto-schedule your day with Unity Task AI.",
      },
    ],
  }),
  component: Dashboard,
});

const STEPS = [
  {
    to: "/meetings" as const,
    step: "Step 1",
    icon: NotebookPen,
    title: "Meeting Notes Summarizer",
    body: "Paste raw notes and get key points, decisions, owners and deadlines.",
  },
  {
    to: "/research" as const,
    step: "Step 2",
    icon: Search,
    title: "AI Research Assistant",
    body: "Dig into the key points that came out of the meeting for real insight.",
  },
  {
    to: "/planner" as const,
    step: "Step 3",
    icon: ListChecks,
    title: "AI Task Planner",
    body: "Prioritize every action and drop it into a realistic schedule.",
  },
];

function Dashboard() {
  const { summary, research, plan } = useWorkspace();

  const progress = [
    { label: "Meeting summarized", done: Boolean(summary) },
    { label: "Key points researched", done: Boolean(research) },
    { label: "Tasks scheduled", done: Boolean(plan) },
  ];
  const completed = progress.filter((p) => p.done).length;

  return (
    <AppShell
      title="Dashboard"
      description="Your AI workflow: notes in, researched insight out, schedule ready."
    >
      <div className="space-y-6">
        <Panel reflective className="overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Unity Task
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              Automate the busywork around <span className="text-chameleon">every meeting</span>.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Turn scattered notes into a researched brief and a prioritized schedule in three
              guided steps — then ask the assistant anything about it.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/meetings"
                className="inline-flex items-center gap-2 rounded-xl bg-chameleon px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glass)] transition-transform hover:-translate-y-0.5"
              >
                Start with meeting notes
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                to="/assistant"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/70 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                <Bot className="size-4" aria-hidden />
                Open assistant
              </Link>
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Workflow progress</h2>
              <p className="text-sm text-muted-foreground">
                {completed} of 3 stages complete for this session.
              </p>
            </div>
            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted sm:w-56">
              <div
                className="h-full rounded-full bg-chameleon transition-all"
                style={{ width: `${(completed / 3) * 100}%` }}
              />
            </div>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-3">
            {progress.map((p) => (
              <li
                key={p.label}
                className="flex items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-3 py-2 text-sm"
              >
                <span
                  className={
                    p.done
                      ? "size-2 rounded-full bg-teal"
                      : "size-2 rounded-full border border-border bg-transparent"
                  }
                  aria-hidden
                />
                {p.label}
              </li>
            ))}
          </ul>
        </Panel>

        <div className="grid gap-4 lg:grid-cols-3">
          {STEPS.map(({ to, step, icon: Icon, title, body }) => (
            <Link key={to} to={to} className="glass-panel lift block p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-chameleon text-primary-foreground">
                <Icon className="size-5" aria-hidden />
              </span>
              <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {step}
              </p>
              <h3 className="mt-1 text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                Open <ArrowRight className="size-3.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>

        {summary && (
          <Panel>
            <h2 className="text-base font-semibold">Latest meeting brief</h2>
            <p className="mt-1 text-sm text-muted-foreground">{summary.title}</p>
            <p className="mt-3 text-sm text-foreground/90">{summary.overview}</p>
            <Link
              to="/meetings"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
            >
              View full brief <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </Panel>
        )}
      </div>
    </AppShell>
  );
}
