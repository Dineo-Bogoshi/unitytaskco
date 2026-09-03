import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.7-flash";

type Msg = { role: "system" | "user" | "assistant"; content: string };

async function callGateway(messages: Msg[]) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured (missing API key).");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({ model: MODEL, messages, stream: false }),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Rate limited. Please retry in a moment.");
    if (res.status === 402)
      throw new Error("AI credits are exhausted. The workspace owner needs to add credits.");
    if (res.status === 403)
      throw new Error("AI access is blocked by workspace policy. Contact the workspace admin.");
    throw new Error(`AI request failed (${res.status}): ${text.slice(0, 300)}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content ?? "";
}

function extractJson<T>(raw: string): T {
  const cleaned = raw
    .replace(/^```(?:json)?/gm, "")
    .replace(/```$/gm, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.search(/[[{]/);
    const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    }
    throw new Error("The AI response could not be parsed. Please try again.");
  }
}

const ANALYST_STYLE = `Write in a precise, professional, executive-ready tone.
Never invent facts that are not supported by the input. Prefer concrete nouns over filler.
Return ONLY raw JSON with no markdown fences and no commentary.`;

/* ---------------------------------- Meeting notes --------------------------------- */

export type MeetingSummary = {
  title: string;
  overview: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: Array<{ task: string; owner: string; deadline: string; priority: string }>;
  risks: string[];
  researchTopics: string[];
};

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ notes: z.string().min(20), context: z.string().optional() }).parse(input),
  )
  .handler(async ({ data }): Promise<MeetingSummary> => {
    const raw = await callGateway([
      {
        role: "system",
        content: `You are Unity Task's meeting analyst. ${ANALYST_STYLE}

TASK: Convert raw meeting notes into a structured brief.
RULES:
- keyPoints: 3-6 items, each one sentence, decision-relevant.
- decisions: only explicit decisions. Empty array if none.
- actionItems: every commitment. owner = named person or "Unassigned". deadline = explicit date/relative date, else "Not specified". priority = one of "High" | "Medium" | "Low" inferred from urgency and impact.
- risks: blockers, dependencies, or open questions. Empty array if none.
- researchTopics: 2-4 short topics worth researching further, phrased as searchable subjects.
SCHEMA:
{"title":string,"overview":string,"keyPoints":string[],"decisions":string[],"actionItems":[{"task":string,"owner":string,"deadline":string,"priority":string}],"risks":string[],"researchTopics":string[]}`,
      },
      {
        role: "user",
        content: `${data.context ? `Context: ${data.context}\n\n` : ""}Meeting notes:\n${data.notes}`,
      },
    ]);
    return extractJson<MeetingSummary>(raw);
  });

/* ------------------------------------ Research ------------------------------------ */

export type ResearchBrief = {
  topic: string;
  summary: string;
  insights: Array<{ heading: string; detail: string }>;
  considerations: string[];
  recommendedActions: string[];
  openQuestions: string[];
};

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ topic: z.string().min(3), background: z.string().optional() }).parse(input),
  )
  .handler(async ({ data }): Promise<ResearchBrief> => {
    const raw = await callGateway([
      {
        role: "system",
        content: `You are Unity Task's research assistant. ${ANALYST_STYLE}

TASK: Produce a decision-grade research brief on the topic.
RULES:
- summary: 2-3 sentences of the state of play.
- insights: 3-5 items; heading is a short label, detail is 1-2 sentences of substance.
- considerations: trade-offs, constraints, or risks a professional must weigh.
- recommendedActions: 3-5 concrete next steps that could become tasks.
- openQuestions: what still needs verification. Flag uncertainty honestly rather than guessing.
SCHEMA:
{"topic":string,"summary":string,"insights":[{"heading":string,"detail":string}],"considerations":string[],"recommendedActions":string[],"openQuestions":string[]}`,
      },
      {
        role: "user",
        content: `Topic: ${data.topic}${data.background ? `\n\nBackground from meeting:\n${data.background}` : ""}`,
      },
    ]);
    return extractJson<ResearchBrief>(raw);
  });

/* ------------------------------------- Planner ------------------------------------ */

export type TaskPlan = {
  strategy: string;
  tasks: Array<{
    task: string;
    owner: string;
    priority: "High" | "Medium" | "Low" | string;
    effort: string;
    scheduledFor: string;
    rationale: string;
  }>;
  schedule: Array<{ block: string; focus: string; items: string[] }>;
  watchOuts: string[];
};

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        tasks: z.string().min(5),
        horizon: z.string().optional(),
        workingHours: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<TaskPlan> => {
    const raw = await callGateway([
      {
        role: "system",
        content: `You are Unity Task's planning engine. ${ANALYST_STYLE}

TASK: Prioritise and schedule the supplied tasks.
RULES:
- Prioritise by impact, deadline pressure, and dependency order (blockers first).
- Order the tasks array from first to last execution.
- effort: a realistic duration such as "45 min" or "2 h".
- scheduledFor: a concrete slot within the planning horizon, e.g. "Today 09:00-09:45" or "Wed morning".
- rationale: one sentence explaining the placement.
- schedule: 3-5 time blocks grouping the tasks; items reference task names.
- watchOuts: overload, conflicts, or missing information.
SCHEMA:
{"strategy":string,"tasks":[{"task":string,"owner":string,"priority":string,"effort":string,"scheduledFor":string,"rationale":string}],"schedule":[{"block":string,"focus":string,"items":string[]}],"watchOuts":string[]}`,
      },
      {
        role: "user",
        content: `Planning horizon: ${data.horizon || "the next 3 working days"}
Working hours: ${data.workingHours || "09:00-17:00, Mon-Fri"}

Tasks and notes:
${data.tasks}`,
      },
    ]);
    return extractJson<TaskPlan>(raw);
  });

/* ------------------------------------- Chatbot ------------------------------------ */

export const chatWithAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        messages: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            }),
          )
          .min(1),
        workspaceContext: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<{ reply: string }> => {
    const reply = await callGateway([
      {
        role: "system",
        content: `You are Unity Task Assistant, an AI colleague for busy professionals.
Style: clear, concise, professional. Use markdown-free plain text with short paragraphs and "-" bullet lists.
Behaviour:
- Lead with the answer, then the reasoning.
- When the user asks for work output (emails, plans, summaries), produce it directly.
- Reference the workspace context when relevant; never fabricate details that are not in it.
- If information is missing, ask one focused clarifying question.
- Keep answers under 200 words unless the user asks for depth.${
          data.workspaceContext ? `\n\nWorkspace context:\n${data.workspaceContext}` : ""
        }`,
      },
      ...data.messages.map((m) => ({ role: m.role, content: m.content }) as Msg),
    ]);
    return { reply };
  });
