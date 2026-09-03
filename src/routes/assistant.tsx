import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Bot, Loader2, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppShell, Disclaimer } from "@/components/AppShell";
import { ErrorNote, Panel } from "@/components/ui-bits";
import { chatWithAssistant } from "@/lib/ai.functions";
import { chatContextFromWorkspace, useWorkspace } from "@/lib/workspace-store";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — Unity Task" },
      {
        name: "description",
        content:
          "Chat with the Unity Task assistant about your meeting brief, research and schedule — and draft work on the spot.",
      },
      { property: "og:title", content: "AI Assistant — Unity Task" },
      {
        property: "og:description",
        content: "An AI colleague that already knows your meeting, research and task plan.",
      },
    ],
  }),
  component: AssistantPage,
});

type ChatMessage = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "Draft a follow-up email summarizing the meeting",
  "What are the biggest risks in my current plan?",
  "Turn my top three tasks into a status update",
  "What should I do first tomorrow morning?",
];

function AssistantPage() {
  const workspace = useWorkspace();
  const workspaceContext = chatContextFromWorkspace(workspace);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const fn = useServerFn(chatWithAssistant);
  const mutation = useMutation<{ reply: string }, Error, ChatMessage[]>({
    mutationFn: (history: ChatMessage[]) => fn({ data: { messages: history, workspaceContext } }),
    onSuccess: (data) =>
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, mutation.isPending]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending) return;
    const history: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(history);
    setInput("");
    mutation.mutate(history);
  }

  return (
    <AppShell
      title="AI Assistant"
      description="Ask anything — the assistant already has your meeting, research and plan in context."
    >
      <Panel className="flex h-[70vh] min-h-[520px] flex-col p-0 lg:p-0">
        <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
          <span className="grid size-9 place-items-center rounded-xl bg-chameleon text-primary-foreground">
            <Bot className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold">Unity Task Assistant</p>
            <p className="text-xs text-muted-foreground">
              {workspaceContext ? "Workspace context loaded" : "No workspace context yet"}
            </p>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.length === 0 && (
            <div className="mx-auto max-w-lg text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-chameleon text-primary-foreground">
                <Bot className="size-5" aria-hidden />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold">
                How can I help with your work?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                I can draft, summarize, reprioritize and explain — grounded in what's in your
                workspace.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-xl border border-border bg-card/70 px-3 py-2.5 text-left text-xs font-medium transition-colors hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div className="flex max-w-[85%] gap-2.5">
                {m.role === "assistant" && (
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-chameleon text-primary-foreground">
                    <Bot className="size-3.5" aria-hidden />
                  </span>
                )}
                <div
                  className={
                    m.role === "user"
                      ? "rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                      : "rounded-2xl rounded-bl-md border border-border/70 bg-card/70 px-4 py-2.5 text-sm"
                  }
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
                {m.role === "user" && (
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border border-border bg-card/70">
                    <User className="size-3.5" aria-hidden />
                  </span>
                )}
              </div>
            </div>
          ))}

          {mutation.isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
              Thinking…
            </div>
          )}

          {mutation.isError && <ErrorNote message={mutation.error.message} />}
        </div>

        <div className="border-t border-border/60 px-5 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Ask the assistant…"
              className="max-h-32 min-h-11 flex-1 resize-y rounded-xl border border-input bg-card/70 px-3 py-2.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
            />
            <button
              type="submit"
              disabled={!input.trim() || mutation.isPending}
              aria-label="Send message"
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-chameleon text-primary-foreground shadow-[var(--shadow-glass)] transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="size-4" aria-hidden />
            </button>
          </form>
          <Disclaimer className="mt-3" />
        </div>
      </Panel>
    </AppShell>
  );
}
