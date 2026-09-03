import { useSyncExternalStore } from "react";
import type { MeetingSummary, ResearchBrief, TaskPlan } from "./ai.functions";

export type WorkspaceState = {
  summary: MeetingSummary | null;
  research: ResearchBrief | null;
  plan: TaskPlan | null;
};

const KEY = "unity-task-workspace-v1";
let state: WorkspaceState = { summary: null, research: null, plan: null };
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...state, ...(JSON.parse(raw) as WorkspaceState) };
  } catch {
    /* ignore corrupt storage */
  }
}

function emit() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  listener();
  return () => listeners.delete(listener);
}

const serverSnapshot: WorkspaceState = { summary: null, research: null, plan: null };

export function useWorkspace(): WorkspaceState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => serverSnapshot,
  );
}

export function setSummary(summary: MeetingSummary | null) {
  state = { ...state, summary };
  emit();
}

export function setResearch(research: ResearchBrief | null) {
  state = { ...state, research };
  emit();
}

export function setPlan(plan: TaskPlan | null) {
  state = { ...state, plan };
  emit();
}

export function resetWorkspace() {
  state = { summary: null, research: null, plan: null };
  emit();
}

export function planSeedFromWorkspace(s: WorkspaceState): string {
  const lines: string[] = [];
  if (s.summary) {
    lines.push(`From meeting "${s.summary.title}":`);
    s.summary.actionItems.forEach((a) =>
      lines.push(`- ${a.task} (owner: ${a.owner}, deadline: ${a.deadline}, priority: ${a.priority})`),
    );
    if (s.summary.risks.length) lines.push(`Known risks: ${s.summary.risks.join("; ")}`);
  }
  if (s.research) {
    lines.push(`\nFrom research on "${s.research.topic}":`);
    s.research.recommendedActions.forEach((a) => lines.push(`- ${a}`));
  }
  return lines.join("\n");
}

export function chatContextFromWorkspace(s: WorkspaceState): string | undefined {
  const parts: string[] = [];
  if (s.summary) {
    parts.push(
      `Meeting brief "${s.summary.title}": ${s.summary.overview}\nKey points: ${s.summary.keyPoints.join(" | ")}\nActions: ${s.summary.actionItems
        .map((a) => `${a.task} (${a.owner}, ${a.deadline})`)
        .join(" | ")}`,
    );
  }
  if (s.research) {
    parts.push(`Research on "${s.research.topic}": ${s.research.summary}`);
  }
  if (s.plan) {
    parts.push(
      `Current plan strategy: ${s.plan.strategy}\nScheduled: ${s.plan.tasks
        .map((t) => `${t.task} → ${t.scheduledFor}`)
        .join(" | ")}`,
    );
  }
  return parts.length ? parts.join("\n\n") : undefined;
}
