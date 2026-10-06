"use client";
import { pageSearchParams } from "@/lib/page-location";
import Link from "@/components/transition-link";
import { useEffect, useReducer, useRef, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Fingerprint,
  MessageCircle,
  RotateCcw,
  Send,
  ShoppingBag,
  Users,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { PageShell, useExperience, XevenMark } from "./experience-shell";
import { SCENARIOS, PREVIEW_NOTE, type ScenarioId } from "@/lib/xeven-content";
import { demoReducer, initialDemo, type DemoIntent } from "@/lib/demo-machine";

export default function DemoPage() {
  const { reduced } = useExperience();
  const [state, dispatch] = useReducer(demoReducer, undefined, () =>
    initialDemo(),
  );
  const [draft, setDraft] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    log = useRef<HTMLDivElement>(null),
    composer = useRef<HTMLTextAreaElement>(null),
    sequence = useRef(0),
    sending = useRef(false);
  const example = SCENARIOS.find((item) => item.id === state.scenario)!;
  const busy = Boolean(state.pending);
  useEffect(() => {
    const scenario = pageSearchParams().get("scenario");
    if (SCENARIOS.some((item) => item.id === scenario))
      dispatch({ type: "scenario", scenario: scenario as ScenarioId });
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  useEffect(() => {
    log.current?.scrollTo({
      top: log.current.scrollHeight,
      behavior: reduced ? "instant" : "smooth",
    });
  }, [state.messages, busy, reduced]);
  function clearPending() {
    if (timer.current) clearTimeout(timer.current);
    sending.current = false;
    setDraft("");
  }
  function reset() {
    clearPending();
    dispatch({ type: "reset" });
    composer.current?.focus({ preventScroll: true });
  }
  function scenarioChanged(value: string) {
    clearPending();
    dispatch({ type: "scenario", scenario: value as ScenarioId });
  }
  function memoryChanged(enabled: boolean) {
    clearPending();
    dispatch({ type: "memory", enabled });
  }
  function send(text: string, intent?: DemoIntent) {
    if (!text.trim() || sending.current) return;
    sending.current = true;
    const id = ++sequence.current;
    dispatch({ type: "send", id, text, intent });
    setDraft("");
    timer.current = setTimeout(
      () => {
        dispatch({ type: "reply", id });
        sending.current = false;
        timer.current = null;
      },
      reduced ? 80 : 420,
    );
  }
  return (
    <PageShell active="/demo">
      <section className="demo-intro page-section">
        <div>
          <p className="eyebrow">03 / GUIDED DEMO</p>
          <h1>
            Take the
            <br />
            <span>controls.</span>
          </h1>
        </div>
        <p>
          Explore a conversation with a fictional store. Change the context and
          see how the sample response changes.
        </p>
      </section>
      <section className="demo-workspace page-section">
        <div className="console-body">
          <div className="console-bezel">
            <span>XEVEN CONVERSATION SYSTEM</span>
            <span>UNIT / 007</span>
          </div>
          <div className="demo-console-screen">
            <div className="demo-screen-head">
              <XevenMark />
              <div>
                <strong>XEVEN</strong>
                <span>GUIDED SAMPLE</span>
              </div>
              <button
                aria-label="Reset conversation and restore sample memory"
                title="Reset conversation and sample memory"
                onClick={reset}
              >
                <RotateCcw size={18} />
              </button>
            </div>
            <p className="scripted-preview-pill">
              <span aria-hidden="true" />
              {PREVIEW_NOTE}
            </p>
            <Tabs
              value={state.scenario}
              onValueChange={scenarioChanged}
              className="scenario-tabs"
            >
              <TabsList aria-label="Choose a demo scenario">
                <TabsTrigger value="shopping">
                  <ShoppingBag size={15} />
                  Shopping
                </TabsTrigger>
                <TabsTrigger value="support">
                  <MessageCircle size={15} />
                  Support
                </TabsTrigger>
                <TabsTrigger value="booking">
                  <CalendarDays size={15} />
                  Booking
                </TabsTrigger>
                <TabsTrigger value="lead-qual">
                  <Users size={15} />
                  Lead qualification
                </TabsTrigger>
              </TabsList>
              <TabsContent value={state.scenario} tabIndex={-1}>
                <div
                  className="chat-log"
                  ref={log}
                  role="log"
                  aria-label="Sample conversation"
                  aria-live="polite"
                  aria-relevant="additions text"
                >
                  {state.messages.length === 0 ? (
                    <div className="chat-welcome">
                      <h2>
                        {state.scenario === "shopping"
                          ? "A little context changes the answer."
                          : state.scenario === "support"
                            ? "Let’s work it out."
                            : state.scenario === "booking"
                              ? "Make time for what’s next."
                              : "Start with the right questions."}
                      </h2>
                      <p>{example.title}</p>
                      <button
                        className="suggested-prompt"
                        onClick={() =>
                          send(example.question, { type: "example" })
                        }
                      >
                        {example.question}
                        <span>TRY THIS SAMPLE QUESTION ↗</span>
                      </button>
                      <p className="scenario-outcome">
                        <strong>EXAMPLE OUTCOME</strong>
                        {example.outcome}
                      </p>
                    </div>
                  ) : (
                    state.messages.map((message, index) => (
                      <div
                        className={`demo-message ${message.role}`}
                        key={index}
                      >
                        <span>
                          {message.role === "agent" ? "XEVEN" : "YOU"}
                        </span>
                        <p>{message.text}</p>
                        {message.role === "agent" && (
                          <p className="scenario-outcome">
                            <strong>THIS SCENARIO SHOWS</strong>
                            {example.outcome}
                          </p>
                        )}
                        {message.tag && <small>{message.tag}</small>}
                        {message.slots && (
                          <div className="slot-buttons">
                            {(["14:00", "15:30"] as const).map((time) => (
                              <button
                                key={time}
                                disabled={busy}
                                onClick={() =>
                                  send(`Choose ${time} UTC`, {
                                    type: "time",
                                    time,
                                  })
                                }
                                aria-pressed={state.slot === time}
                              >
                                {state.slot === time && <Check size={13} />}
                                Friday {time} UTC
                              </button>
                            ))}
                          </div>
                        )}
                        {message.suggestions && (
                          <div className="example-actions">
                            <button
                              disabled={busy}
                              onClick={() =>
                                send(example.question, { type: "example" })
                              }
                            >
                              Try the {example.label.toLowerCase()} example
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {busy && (
                  <div className="typing-indicator" role="status">
                    Preparing a sample response…
                  </div>
                )}
                {state.stage === "awaiting_size" && !busy && (
                  <div
                    className="example-actions"
                    style={{ padding: "0 20px 15px" }}
                  >
                    <button
                      onClick={() =>
                        send("I wear size 9", { type: "size", size: "9" })
                      }
                    >
                      I wear size 9
                    </button>
                  </div>
                )}
                {state.stage === "awaiting_order" && !busy && (
                  <div
                    className="example-actions"
                    style={{ padding: "0 20px 15px" }}
                  >
                    <button
                      onClick={() =>
                        send("They arrived 14 days ago and are unworn", {
                          type: "exchange_details",
                        })
                      }
                    >
                      Unworn · arrived 14 days ago
                    </button>
                  </div>
                )}
                {state.stage === "awaiting_handoff" && !busy && (
                  <div className="example-actions handoff-actions">
                    <button
                      onClick={() =>
                        send(
                          "Our sample team works 09:00–17:00. Handoff to sales.",
                          { type: "lead_details" },
                        )
                      }
                    >
                      Use sample hours + sales handoff
                    </button>
                  </div>
                )}
                <form
                  className="chat-composer"
                  onSubmit={(event) => {
                    event.preventDefault();
                    send(draft);
                  }}
                >
                  <textarea
                    ref={composer}
                    aria-label="Message the scripted demo"
                    aria-describedby="demo-limits"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    maxLength={500}
                    rows={2}
                    placeholder={`Ask about the ${state.scenario === "shopping" ? "sample sneakers" : state.scenario === "support" ? "sample exchange policy" : state.scenario === "booking" ? "Friday consultation" : "sample lead qualification"}…`}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        !event.shiftKey &&
                        !event.nativeEvent.isComposing
                      ) {
                        event.preventDefault();
                        send(draft);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={busy || !draft.trim()}
                    aria-label="Send to scripted demo"
                  >
                    <Send size={17} />
                  </button>
                </form>
                <div className="demo-disclaimer" id="demo-limits">
                  Sample data only. Please do not enter customer or confidential
                  information.
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <div className="console-chin">
            <span>KNOWLEDGE / MEMORY / CONTEXT</span>
            <div className="hardware-indicator" />
          </div>
        </div>
        <aside className="demo-context">
          <div className="context-heading">
            <h2>
              The context
              <br />
              <span>behind the sample.</span>
            </h2>
            <span>
              {state.messages.length
                ? "SAMPLE IN PROGRESS"
                : "READY TO EXPLORE"}
            </span>
          </div>
          {example.facts.map((fact, index) => (
            <div className="context-evidence" key={fact.title}>
              <span>
                0{index + 1} / {fact.type}
              </span>
              <h3>{fact.title}</h3>
              <p>
                {index === 0 && state.scenario === "shopping" && !state.memory
                  ? state.statedSize
                    ? `Size ${state.statedSize}, shared in this conversation. No saved sample preferences.`
                    : "No saved sample preferences. XEVEN will ask for a size."
                  : fact.detail}
              </p>
            </div>
          ))}
          <div className="context-evidence">
            <span>LAST RESPONSE / INFORMATION USED</span>
            <p>{state.lastSource}</p>
          </div>
          <div className="memory-switch">
            <label htmlFor="sample-memory">
              <Fingerprint size={17} />
              Use sample memory
            </label>
            <Switch
              id="sample-memory"
              checked={state.memory}
              onCheckedChange={memoryChanged}
            />
          </div>
          <p className="context-footnote">
            Changing this switch restarts the current sample. “Forget” clears
            memory in the conversation. Reset restores the original sample
            profile. Nothing you type is sent to a server.
          </p>
        </aside>
      </section>
      <div className="demo-bottom-note">
        <p>Give XEVEN your business’s own knowledge.</p>
        <Link href="/plans" className="primary-button">
          Explore the plans <ArrowUpRight size={17} />
        </Link>
      </div>
    </PageShell>
  );
}
