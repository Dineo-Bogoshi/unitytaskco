import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarClock,
  CircleCheck,
  NotebookPen,
  Search,
  TriangleAlert,
  Users,
} from "lucide-react";
import { useState } from "react";
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
import { summarizeMeeting, type MeetingSummary } from "@/lib/ai.functions";
import { setResearch, setSummary, useWorkspace } from "@/lib/workspace-store";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Unity Task" },
      {
        name: "description",
        content:
          "Turn raw meeting notes into key points, decisions, owners, deadlines and follow-up research topics.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — Unity Task" },
      {
        property: "og:description",
        content: "AI extracts key points, action items and deadlines from your meeting notes.",
      },
    ],
  }),
  component: MeetingsPage,
});

const SAMPLE = `Weekly product sync - 12 attendees, 45 min.
Priya reported the Q3 onboarding revamp is behind by a week because the design tokens weren't signed off.
Decision: we ship the simplified 3-step onboarding first, defer the personalization quiz to Q4.
Tom to run a pricing experiment on the new plan tiers, needs data by Friday.
Concern raised about churn in the SMB segment - up 2.1% month over month, cause unknown.
Legal needs the updated DPA reviewed before the EU launch on 30 Sept.
Priya will book usability sessions with 5 customers next week.`;

function MeetingsPage() {
  const { summary } = useWorkspace();
  const [notes, setNotes] = useState("");
  const [context, setContext] = useState("");

  const fn = useServerFn(summarizeMeeting);
  const mutation = useMutation<MeetingSummary, Error, void>({
    mutationFn: () => fn({ data: { notes, context: context || undefined } }),
    onSuccess: (data) => {
      setSummary(data);
      setResearch(null);
    },
  });

  return (
    <AppShell
      title="Meeting Notes Summarizer"
      description="Step 1 — paste notes, get a structured brief with actions and deadlines."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <Panel>
          <PanelTitle
            icon={<NotebookPen className="size-4" aria-hidden />}
            title="Raw meeting notes"
            subtitle="Bullet points, transcript fragments or messy shorthand all work."
          />
          <div className="space-y-4">
            <div>
              <label htmlFor="context" className="text-sm font-medium">
                Meeting context <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Weekly product sync, attendees: product + design + legal"
                className="mt-1.5 w-full rounded-xl border border-input bg-card/70 px-3 py-2.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
              />
            </div>
            <div>
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={13}
                placeholder="Paste your meeting notes here…"
                className="mt-1.5 w-full resize-y rounded-xl border border-input bg-card/70 px-3 py-2.5 text-sm leading-relaxed outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{notes.trim().length} characters</span>
                <button
                  type="button"
                  onClick={() => setNotes(SAMPLE)}
                  className="font-medium text-primary hover:underline"
                >
                  Use sample notes
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={notes.trim().length < 20 || mutation.isPending}
              onClick={() => mutation.mutate()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-chameleon px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glass)] transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mutation.isPending ? "Summarizing…" : "Summarize meeting"}
            </button>
            {notes.trim().length > 0 && notes.trim().length < 20 && (
              <p className="text-xs text-muted-foreground">
                Add at least 20 characters of notes to summarize.
              </p>
            )}
            <Disclaimer />
          </div>
        </Panel>

        <div className="space-y-6">
          {mutation.isError && <ErrorNote message={mutation.error.message} />}

          {mutation.isPending && (
            <Panel>
              <LoadingState label="Reading the notes and extracting structure…" lines={5} />
            </Panel>
          )}

          {!mutation.isPending && !summary && (
            <Panel>
              <EmptyState
                title="No brief yet"
                body="Summarize a set of notes and your structured brief — key points, decisions, action items and research topics — appears here."
              />
            </Panel>
          )}

          {!mutation.isPending && summary && <SummaryView summary={summary} />}
        </div>
      </div>
    </AppShell>
  );
}

function SummaryView({ summary }: { summary: MeetingSummary }) {
  return (
    <>
      <Panel reflective>
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Meeting brief
        </p>
        <h2 className="mt-2 font-display text-xl font-semibold">{summary.title}</h2>
        <p className="mt-2 text-sm text-foreground/90">{summary.overview}</p>
      </Panel>

      <Panel>
        <PanelTitle
          icon={<CircleCheck className="size-4" aria-hidden />}
          title="Key points"
          subtitle="The decisions-relevant substance of the conversation."
        />
        <BulletList items={summary.keyPoints} />
        {summary.decisions?.length > 0 && (
          <div className="mt-5 border-t border-border/60 pt-4">
            <h3 className="text-sm font-semibold">Decisions made</h3>
            <BulletList className="mt-2" items={summary.decisions} />
          </div>
        )}
      </Panel>

      <Panel>
        <PanelTitle
          icon={<Users className="size-4" aria-hidden />}
          title="Action items"
          subtitle="Owners, deadlines and inferred priority."
        />
        {summary.actionItems?.length ? (
          <ul className="space-y-3">
            {summary.actionItems.map((item, i) => (
              <li key={i} className="rounded-xl border border-border/70 bg-card/60 p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{item.task}</p>
                  <PriorityPill priority={item.priority} />
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-3.5" aria-hidden />
                    {item.owner}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarClock className="size-3.5" aria-hidden />
                    {item.deadline}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No action items detected.</p>
        )}
      </Panel>

      {summary.risks?.length > 0 && (
        <Panel>
          <PanelTitle
            icon={<TriangleAlert className="size-4" aria-hidden />}
            title="Risks & open questions"
          />
          <BulletList items={summary.risks} />
        </Panel>
      )}

      <Panel>
        <PanelTitle
          icon={<Search className="size-4" aria-hidden />}
          title="Next: research the key points"
          subtitle="Send a topic straight to the research assistant."
        />
        <div className="flex flex-wrap gap-2">
          {(summary.researchTopics?.length ? summary.researchTopics : summary.keyPoints).map(
            (topic, i) => (
              <Link
                key={i}
                to="/research"
                search={{ topic }}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
              >
                <span className="truncate">{topic}</span>
                <ArrowRight className="size-3.5 shrink-0" aria-hidden />
              </Link>
            ),
          )}
        </div>
        <Link
          to="/planner"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
        >
          Or skip to the task planner <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </Panel>
    </>
  );
}
