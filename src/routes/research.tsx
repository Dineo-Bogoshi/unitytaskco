import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, HelpCircle, Lightbulb, Scale, Search } from "lucide-react";
import { useState } from "react";
import { AppShell, Disclaimer } from "@/components/AppShell";
import {
  BulletList,
  EmptyState,
  ErrorNote,
  LoadingState,
  Panel,
  PanelTitle,
} from "@/components/ui-bits";
import { researchTopic, type ResearchBrief } from "@/lib/ai.functions";
import { setResearch, useWorkspace } from "@/lib/workspace-store";

export const Route = createFileRoute("/research")({
  validateSearch: (search: Record<string, unknown>) => ({
    topic: typeof search["topic"] === "string" ? (search["topic"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Unity Task" },
      {
        name: "description",
        content:
          "Research the key points from your meeting: insights, trade-offs, recommended actions and open questions.",
      },
      { property: "og:title", content: "AI Research Assistant — Unity Task" },
      {
        property: "og:description",
        content: "Decision-grade research briefs on the topics your meeting surfaced.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const { topic: initialTopic } = Route.useSearch();
  const { summary, research } = useWorkspace();
  const [topic, setTopic] = useState(initialTopic ?? "");

  const background = summary
    ? `Meeting "${summary.title}": ${summary.overview}\nKey points: ${summary.keyPoints.join(" | ")}`
    : undefined;

  const fn = useServerFn(researchTopic);
  const mutation = useMutation<ResearchBrief, Error, string>({
    mutationFn: (t: string) => fn({ data: { topic: t, background } }),
    onSuccess: (data) => setResearch(data),
  });

  const suggestions = summary?.researchTopics ?? [];

  return (
    <AppShell
      title="AI Research Assistant"
      description="Step 2 — go deeper on the key points your meeting surfaced."
    >
      <div className="space-y-6">
        <Panel>
          <PanelTitle
            icon={<Search className="size-4" aria-hidden />}
            title="What should we research?"
            subtitle={
              background
                ? "Your latest meeting brief is used as background context."
                : "Tip: summarize a meeting first so research inherits its context."
            }
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Reducing SMB churn in B2B SaaS onboarding"
              className="flex-1 rounded-xl border border-input bg-card/70 px-3 py-2.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
            />
            <button
              type="button"
              disabled={topic.trim().length < 3 || mutation.isPending}
              onClick={() => mutation.mutate(topic.trim())}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-chameleon px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glass)] transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mutation.isPending ? "Researching…" : "Research"}
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                From your meeting
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setTopic(s);
                      mutation.mutate(s);
                    }}
                    className="rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Disclaimer className="mt-4" />
        </Panel>

        {mutation.isError && <ErrorNote message={mutation.error.message} />}

        {mutation.isPending && (
          <Panel>
            <LoadingState label="Gathering insights and weighing trade-offs…" lines={6} />
          </Panel>
        )}

        {!mutation.isPending && !research && (
          <Panel>
            <EmptyState
              title="No research brief yet"
              body="Pick a topic from your meeting or type your own. You'll get insights, considerations, recommended actions and open questions."
            />
          </Panel>
        )}

        {!mutation.isPending && research && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel reflective className="lg:col-span-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Research brief
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold">{research.topic}</h2>
              <p className="mt-2 text-sm text-foreground/90">{research.summary}</p>
            </Panel>

            <Panel className="lg:col-span-2">
              <PanelTitle icon={<Lightbulb className="size-4" aria-hidden />} title="Key insights" />
              <ul className="grid gap-3 sm:grid-cols-2">
                {research.insights?.map((ins, i) => (
                  <li key={i} className="rounded-xl border border-border/70 bg-card/60 p-4">
                    <p className="text-sm font-semibold">{ins.heading}</p>
                    <p className="mt-1.5 text-sm text-muted-foreground">{ins.detail}</p>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel>
              <PanelTitle
                icon={<Scale className="size-4" aria-hidden />}
                title="Considerations"
                subtitle="Trade-offs and constraints to weigh."
              />
              <BulletList items={research.considerations ?? []} />
            </Panel>

            <Panel>
              <PanelTitle
                icon={<HelpCircle className="size-4" aria-hidden />}
                title="Open questions"
                subtitle="Verify these before acting."
              />
              <BulletList items={research.openQuestions ?? []} />
            </Panel>

            <Panel className="lg:col-span-2">
              <PanelTitle
                icon={<ArrowRight className="size-4" aria-hidden />}
                title="Recommended actions"
                subtitle="Carry these into the planner to be prioritized and scheduled."
              />
              <BulletList items={research.recommendedActions ?? []} />
              <Link
                to="/planner"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-chameleon px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glass)] transition hover:-translate-y-0.5"
              >
                Send to task planner <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Panel>
          </div>
        )}
      </div>
    </AppShell>
  );
}
