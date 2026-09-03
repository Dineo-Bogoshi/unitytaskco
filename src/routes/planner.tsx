import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, CalendarClock, Clock, ListChecks, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell, Disclaimer } from "@/components/AppShell";
import {
  BulletList,
  EmptyState,
  ErrorNote,
  LoadingState,
  Panel,
  PanelTitle,
  PriorityPill,
} from "@/components/ui-bits";
import { planTasks, type TaskPlan } from "@/lib/ai.functions";
import { planSeedFromWorkspace, setPlan, useWorkspace } from "@/lib/workspace-store";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Unity Task" },
      {
        name: "description",
        content:
          "Prioritize meeting actions and research follow-ups, then schedule them into realistic focus blocks.",
      },
      { property: "og:title", content: "AI Task Planner — Unity Task" },
      {
        property: "og:description",
        content: "AI prioritization and scheduling for your day, built from your meeting actions.",
      },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const workspace = useWorkspace();
  const { plan } = workspace;
  const [tasks, setTasks] = useState("");
  const [horizon, setHorizon] = useState("the next 3 working days");
  const [workingHours, setWorkingHours] = useState("09:00-17:00, Mon-Fri");
  const [seeded, setSeeded] = useState(false);

  const seed = planSeedFromWorkspace(workspace);
  useEffect(() => {
    if (!seeded && seed && tasks.trim() === "") {
      setTasks(seed);
      setSeeded(true);
    }
  }, [seed, seeded, tasks]);

  const fn = useServerFn(planTasks);
  const mutation = useMutation<TaskPlan, Error, void>({
    mutationFn: () => fn({ data: { tasks, horizon, workingHours } }),
    onSuccess: (data) => setPlan(data),
  });

  return (
    <AppShell
      title="AI Task Planner"
      description="Step 3 — prioritize every action and drop it into a realistic schedule."
    >
      <div className="space-y-6">
        <Panel>
          <PanelTitle
            icon={<ListChecks className="size-4" aria-hidden />}
            title="Tasks to plan"
            subtitle={
              seed
                ? "Pre-filled from your meeting brief and research. Edit freely."
                : "One task per line. Include owners and deadlines where you know them."
            }
          />
          <textarea
            value={tasks}
            onChange={(e) => setTasks(e.target.value)}
            rows={10}
            placeholder={"- Review updated DPA before EU launch (Legal, 30 Sept)\n- Run pricing experiment (Tom, Friday)"}
            className="w-full resize-y rounded-xl border border-input bg-card/70 px-3 py-2.5 text-sm leading-relaxed outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="horizon" className="text-sm font-medium">
                Planning horizon
              </label>
              <input
                id="horizon"
                value={horizon}
                onChange={(e) => setHorizon(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-input bg-card/70 px-3 py-2.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
              />
            </div>
            <div>
              <label htmlFor="hours" className="text-sm font-medium">
                Working hours
              </label>
              <input
                id="hours"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-input bg-card/70 px-3 py-2.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
              />
            </div>
          </div>
          <button
            type="button"
            disabled={tasks.trim().length < 5 || mutation.isPending}
            onClick={() => mutation.mutate()}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-chameleon px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glass)] transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {mutation.isPending ? "Planning…" : "Prioritize & schedule"}
          </button>
          {!seed && (
            <p className="mt-3 text-xs text-muted-foreground">
              No meeting actions loaded yet —{" "}
              <Link to="/meetings" className="font-medium text-primary hover:underline">
                summarize a meeting
              </Link>{" "}
              to prefill this list.
            </p>
          )}
          <Disclaimer className="mt-4" />
        </Panel>

        {mutation.isError && <ErrorNote message={mutation.error.message} />}

        {mutation.isPending && (
          <Panel>
            <LoadingState label="Ranking by impact, deadlines and dependencies…" lines={6} />
          </Panel>
        )}

        {!mutation.isPending && !plan && (
          <Panel>
            <EmptyState
              title="No plan yet"
              body="Once planned, you'll see an ordered task list with priority, effort and time slots, plus grouped focus blocks."
            />
          </Panel>
        )}

        {!mutation.isPending && plan && (
          <>
            <Panel reflective>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Strategy
              </p>
              <p className="mt-2 text-sm text-foreground/90">{plan.strategy}</p>
            </Panel>

            <Panel>
              <PanelTitle
                icon={<ListChecks className="size-4" aria-hidden />}
                title="Prioritized tasks"
                subtitle="Ordered from first to last execution."
              />
              <ol className="space-y-3">
                {plan.tasks?.map((t, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-border/70 bg-card/60 p-4 transition-colors hover:border-ring/50"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-chameleon text-xs font-semibold text-primary-foreground">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="text-sm font-medium">{t.task}</p>
                          <PriorityPill priority={t.priority} />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarClock className="size-3.5" aria-hidden />
                            {t.scheduledFor}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="size-3.5" aria-hidden />
                            {t.effort}
                          </span>
                          <span>{t.owner}</span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">{t.rationale}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </Panel>

            <div className="grid gap-6 lg:grid-cols-2">
              <Panel>
                <PanelTitle
                  icon={<CalendarClock className="size-4" aria-hidden />}
                  title="Focus blocks"
                />
                <ul className="space-y-3">
                  {plan.schedule?.map((b, i) => (
                    <li key={i} className="rounded-xl border border-border/70 bg-card/60 p-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm font-semibold">{b.block}</p>
                        <p className="text-xs text-muted-foreground">{b.focus}</p>
                      </div>
                      <BulletList className="mt-2" items={b.items ?? []} />
                    </li>
                  ))}
                </ul>
              </Panel>

              <Panel>
                <PanelTitle
                  icon={<TriangleAlert className="size-4" aria-hidden />}
                  title="Watch-outs"
                />
                <BulletList items={plan.watchOuts ?? []} />
                <Link
                  to="/assistant"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                >
                  Discuss this plan with the assistant{" "}
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </Panel>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
