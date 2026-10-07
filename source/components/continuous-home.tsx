"use client";
import Link from "@/components/transition-link";
import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Fingerprint,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Footer, Header } from "./experience-shell";
import { FLOWS } from "./handheld";
import { SpatialWorld } from "./spatial-world";
import { screenContent } from "@/lib/workflows";
import { ConnectionField } from "./connection-field";

export default function ContinuousHome() {
  const [chapter, setChapter] = useState(0),
    [flow, setFlow] = useState(0),
    [reader, setReader] = useState(false),
    [chosenFlow, setChosenFlow] = useState(false);
  const journey = useRef<HTMLDivElement>(null),
    returnFocus = useRef<HTMLElement | null>(null);
  function openReader() {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setReader(true);
  }
  function operate(action: "next" | "previous" | "demo") {
    if (action === "demo") {
      openReader();
      return;
    }
    setChosenFlow(true);
    setFlow((current) => (current + (action === "next" ? 1 : 3)) % 4);
  }
  const screenChapter = chosenFlow ? 2 : chapter;
  const shown = screenContent(screenChapter, flow);
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/xeven/console-small.webp"
        media="(max-width: 700px)"
      />
      <link
        rel="preload"
        as="image"
        href="/xeven/console.webp"
        media="(min-width: 701px)"
      />
      <div className="home-experience" ref={journey}>
        <Header cinematic />
        <SpatialWorld
          journey={journey}
          chapter={screenChapter}
          flow={flow}
          onChapter={setChapter}
          onControl={operate}
        />
        <main id="main-content" className="product-experience" tabIndex={-1}>
          <div className="continuous-journey">
            <section
              className="story-chapter chapter-product"
              id="product"
              aria-labelledby="hero-title"
            >
              <div className="chapter-copy">
                <p className="eyebrow">
                  <span className="status-dot" /> INTELLIGENCE, IN CONTEXT.
                </p>
                <h1 id="hero-title">
                  Beyond
                  <br />
                  <span>the ordinary.</span>
                </h1>
                <p>Your knowledge. A conversation that moves things forward.</p>
                <Link href="#controls" className="outline-pill">
                  <ArrowDown size={17} /> Enter the experience
                </Link>
                <p className="concept-caption">AI software. Console concept.</p>
              </div>
              <button className="screen-reader-button" onClick={openReader}>
                Open conversation <ArrowUpRight size={15} />
              </button>
              <Link href="#controls" className="story-scroll">
                <span className="scroll-track">
                  <i />
                </span>
                Scroll to enter <ArrowDown size={14} />
              </Link>
              <span className="product-edition">XEVEN / 007</span>
            </section>
            <div className="screen-chapters">
              <div className="screen-atmosphere" aria-hidden="true">
                <i />
                <i />
              </div>
              <section
                className="story-chapter chapter-controls"
                id="controls"
                aria-labelledby="controls-title"
              >
                <div className="chapter-copy">
                  <p className="eyebrow">
                    <b>01</b> UNDERSTAND
                  </p>
                  <h2 id="controls-title">
                    Your world.
                    <br />
                    <span>Understood.</span>
                  </h2>
                  <p>The right answer starts with your business knowledge.</p>
                  <Link className="outline-pill" href="/demo?scenario=support">
                    Try a conversation <ArrowUpRight size={17} />
                  </Link>
                </div>
                <div className="immersed-chat">
                  <div className="immersed-chat-top">
                    <span>XEVEN</span>
                    <i />
                  </div>
                  <div className="immersed-message user">
                    <small>YOU</small>
                    <p>{shown.question}</p>
                  </div>
                  <div className="immersed-message agent">
                    <small>XEVEN</small>
                    <p>{shown.answer}</p>
                    <span>{shown.tag}</span>
                  </div>
                  <button className="immersed-compose" onClick={openReader}>
                    Continue the conversation <ArrowUpRight size={18} />
                  </button>
                  <p className="immersed-sample">Scripted preview</p>
                </div>
                <div className="scene-controls">
                  <button
                    aria-label="Previous workflow"
                    onClick={() => operate("previous")}
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <button onClick={openReader}>
                    A <span>Open conversation</span>
                  </button>
                  <button
                    aria-label="Next workflow"
                    onClick={() => operate("next")}
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </section>
              <section
                className="story-chapter chapter-flow"
                id="flow"
                aria-labelledby="flow-title"
              >
                <div className="chapter-copy">
                  <p className="eyebrow">
                    <b>02</b> MOVE FORWARD
                  </p>
                  <h2 id="flow-title">
                    One conversation.
                    <br />
                    <span>Every next step.</span>
                  </h2>
                  <p>From the first question to a useful outcome.</p>
                  <Link className="text-link" href="/platform">
                    Inside the platform <ArrowUpRight size={17} />
                  </Link>
                </div>
                <div className="flow-system">
                  <div className="flow-cards">
                    {FLOWS.map((item, index) => (
                      <button
                        key={item.name}
                        className={`flow-card ${flow === index ? "selected" : ""}`}
                        onClick={() => {
                          setChosenFlow(true);
                          setFlow(index);
                        }}
                        aria-pressed={flow === index}
                        aria-controls="workflow-example"
                      >
                        <item.icon size={25} strokeWidth={1.25} />
                        <span className="flow-number">0{index + 1}</span>
                        <h3>{item.name}</h3>
                        <span className="flow-card-line" />
                      </button>
                    ))}
                  </div>
                  <div
                    className="workflow-example"
                    id="workflow-example"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <span>{FLOWS[flow].tag}</span>
                    <p className="example-question">“{FLOWS[flow].question}”</p>
                    <Link href={`/demo?scenario=${FLOWS[flow].scenario}`}>
                      Explore this flow <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </div>
              </section>
              <section
                className="story-chapter chapter-companion"
                id="companion"
                aria-labelledby="companion-title"
              >
                <div className="chapter-copy">
                  <p className="eyebrow">
                    <b>03</b> STAY CONNECTED
                  </p>
                  <h2 id="companion-title">
                    A little context.
                    <br />
                    <span>A closer connection.</span>
                  </h2>
                  <p>Remember what matters. Keep the customer in control.</p>
                  <Link className="outline-pill" href="/about">
                    Meet XEVEN <ArrowUpRight size={17} />
                  </Link>
                </div>
                <div className="companion-details">
                  {[
                    {
                      icon: Layers3,
                      title: "Your knowledge",
                      copy: "Answers with a foundation.",
                    },
                    {
                      icon: Fingerprint,
                      title: "Their preferences",
                      copy: "Only what they allow.",
                    },
                    {
                      icon: ShieldCheck,
                      title: "Clear controls",
                      copy: "Remember. Update. Forget.",
                    },
                  ].map((item) => (
                    <div key={item.title}>
                      <item.icon size={23} strokeWidth={1.2} />
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.copy}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="continuity-emblem" aria-hidden="true">
                  <ConnectionField />
                  <span>KNOWLEDGE × CONTEXT</span>
                </div>
              </section>
            </div>
            <section
              className="console-return"
              aria-label="Returning to the console"
            >
              <div className="return-copy">
                <p className="eyebrow">YOUR NEXT CHAPTER</p>
                <h2>
                  Make it
                  <br />
                  <span>yours.</span>
                </h2>
              </div>
            </section>
          </div>
        </main>
        <Footer cinematic />
      </div>
      <Dialog open={reader} onOpenChange={setReader}>
        <DialogContent
          className="screen-reader-dialog"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocus.current?.focus();
          }}
        >
          <DialogTitle>A better conversation.</DialogTitle>
          <DialogDescription>Scripted preview of XEVEN.</DialogDescription>
          <div className="reader-conversation">
            <span>YOU</span>
            <p>{shown.question}</p>
            <span>XEVEN</span>
            <p>{shown.answer}</p>
            <small>{shown.tag}</small>
          </div>
          <Link
            className="primary-button"
            href={`/demo?scenario=${FLOWS[flow].scenario}`}
          >
            Try the demo <ArrowUpRight size={17} />
          </Link>
        </DialogContent>
      </Dialog>
    </>
  );
}
