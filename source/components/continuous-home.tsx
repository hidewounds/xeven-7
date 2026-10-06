"use client";

import Link from "@/components/transition-link";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { Footer, Header, useExperience, XevenMark } from "./experience-shell";
import { FLOWS } from "./handheld";
import { SpiderView } from "./spider-view";
import { SpatialWorld } from "./spatial-world";
import { screenContent } from "@/lib/workflows";
import SpiderIntro from "./spider-intro";
import { HARDWARE_NOTE } from "@/lib/xeven-content";

export default function ContinuousHome() {
  const { ready } = useExperience();
  const [intro, setIntro] = useState(false),
    [chapter, setChapter] = useState(0),
    [flow, setFlow] = useState(0),
    [reader, setReader] = useState(false),
    [chosenFlow, setChosenFlow] = useState(false);
  const journey = useRef<HTMLDivElement>(null),
    heading = useRef<HTMLHeadingElement>(null),
    returnFocus = useRef<HTMLElement | null>(null),
    checkedIntro = useRef(false);
  const finishIntro = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setIntro(false);
    requestAnimationFrame(() =>
      heading.current?.focus({ preventScroll: true }),
    );
  }, []);
  useEffect(() => {
    if (!ready || checkedIntro.current) return;
    checkedIntro.current = true;
    window.scrollTo({ top: 0, behavior: "instant" });
    setIntro(true);
  }, [ready]);
  function replay() {
    window.scrollTo({ top: 0, behavior: "instant" });
    setIntro(true);
  }
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
                  <span className="status-dot" /> THE NEXT INTERFACE
                </p>
                <h1 id="hero-title" ref={heading} tabIndex={-1}>
                  Conversations
                  <br />
                  beyond
                  <br />
                  <span>the screen.</span>
                </h1>
                <p>
                  An AI agent that connects your business knowledge, customer
                  context, and next steps. A better conversation starts here.
                </p>
                <Link href="#controls" className="outline-pill">
                  <ArrowDown size={17} />
                  Discover XEVEN
                </Link>
                <p className="concept-caption">{HARDWARE_NOTE}</p>
              </div>

              <div className="hero-side-note">
                <span>
                  Your knowledge.
                  <br />A new perspective.
                </span>
                <i />
              </div>
              <button className="screen-reader-button" onClick={openReader}>
                Read the screen <ArrowUpRight size={15} />
              </button>
              <Link href="#controls" className="story-scroll">
                <span className="scroll-track">
                  <i />
                </span>
                Scroll to explore <ArrowDown size={14} />
              </Link>
              <span className="product-edition">CONNECTION STUDY / 007</span>
            </section>

            <div className="screen-chapters">
              <section
                className="story-chapter chapter-controls"
                id="controls"
                aria-labelledby="controls-title"
              >
                <div className="chapter-copy">
                  <p className="eyebrow">
                    <b>01</b> THE CONVERSATION
                  </p>
                  <h2 id="controls-title">
                    A more
                    <br />
                    human way
                    <br />
                    <span>to interact.</span>
                  </h2>
                  <p>
                    Your customer asks a question. XEVEN brings the right
                    business information into the moment, then asks for what is
                    missing.
                  </p>
                  <Link className="outline-pill" href="/demo?scenario=support">
                    Try the guided demo <ArrowUpRight size={17} />
                  </Link>
                  <div className="context-caption">
                    <span>SAMPLE POLICY</span>
                    <p>
                      Unworn. Within 30 days.
                      <br />
                      Order details still needed.
                    </p>
                  </div>
                </div>

                <div className="immersed-chat">
                  <div className="immersed-chat-top">
                    <XevenMark />
                    <span>XEVEN / CONVERSATION</span>
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
                    A little more context <ArrowUpRight size={18} />
                  </button>
                  <p className="immersed-sample">
                    Scripted preview / sample information
                  </p>
                </div>
                <div className="detail-callout">
                  <span>THE CONTEXT MAKES THE DIFFERENCE</span>
                  <span>KNOWLEDGE / MEMORY / NEXT STEP</span>
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
                    <b>02</b> FIND YOUR FLOW
                  </p>
                  <h2 id="flow-title">
                    Four things
                    <br />
                    that move
                    <br />
                    <span>you forward.</span>
                  </h2>
                  <p>
                    Find an answer. Shape a response. Explore a time. Choose
                    what happens next. One connected conversation, grounded in
                    your business.
                  </p>
                  <Link className="text-link" href="/platform">
                    Explore the technology <ArrowUpRight size={17} />
                  </Link>
                </div>

                <div className="flow-system">
                  <div className="flow-system-top">
                    <span>CHOOSE A DIRECTION</span>
                    <span>0{flow + 1} / 04</span>
                  </div>
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
                        <item.icon size={24} strokeWidth={1.25} />
                        <span className="flow-number">0{index + 1}</span>
                        <h3>{item.name}</h3>
                        <p>{item.copy}</p>
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
                    <p>{FLOWS[flow].answer}</p>
                    <Link href={`/demo?scenario=${FLOWS[flow].scenario}`}>
                      Try this conversation <ArrowUpRight size={15} />
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
                    <b>03</b> BUILT FOR CONTINUITY
                  </p>
                  <h2 id="companion-title">
                    A little context.
                    <br />
                    <span>
                      A stronger
                      <br />
                      connection.
                    </span>
                  </h2>
                  <p>
                    The next conversation can start with more understanding.
                    Bring useful knowledge and permitted preferences together,
                    with controls for what stays.
                  </p>
                  <Link className="outline-pill" href="/contact">
                    Make it yours <ArrowUpRight size={17} />
                  </Link>
                </div>

                <div className="companion-details">
                  {[
                    {
                      icon: Layers3,
                      title: "Your knowledge",
                      copy: "Business information, at the right moment.",
                    },
                    {
                      icon: Fingerprint,
                      title: "A little continuity",
                      copy: "Preferences the customer has allowed.",
                    },
                    {
                      icon: ShieldCheck,
                      title: "Memory with controls",
                      copy: "Choose what stays. Forget what doesn’t.",
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
                <div className="continuity-emblem">
                  <SpiderView
                    mode="idle"
                    className="home-spider"
                    active={!intro}
                  />
                  <Link href="/about" className="text-link">
                    Connected by design <ArrowUpRight size={17} />
                  </Link>
                </div>
              </section>
            </div>
            <section
              className="console-return"
              aria-label="Returning to the console"
            >
              <div className="return-copy">
                <p className="eyebrow">THE CONNECTION CONTINUES</p>
                <h2>
                  Back to
                  <br />
                  <span>possibility.</span>
                </h2>
                <p>
                  One intelligence. Every conversation.
                  <br />
                  Your next chapter starts here.
                </p>
              </div>
              <span className="landing-label">XEVEN / RETURNING TO DOCK</span>
            </section>
          </div>
        </main>
        <Footer onReplay={replay} cinematic />
      </div>
      {intro && <SpiderIntro onComplete={finishIntro} />}
      <Dialog open={reader} onOpenChange={setReader}>
        <DialogContent
          className="screen-reader-dialog"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocus.current?.focus();
          }}
        >
          <p className="eyebrow">THE CONVERSATION / IN FOCUS</p>
          <DialogTitle>A little more context.</DialogTitle>
          <DialogDescription>
            Illustrative conversation. This is a scripted preview of the AI
            platform.
          </DialogDescription>
          <div className="reader-conversation">
            <span>YOU</span>
            <p>{shown.question}</p>
            <span>
              <XevenMark /> XEVEN
            </span>
            <p>{shown.answer}</p>
            <small>{shown.tag}</small>
          </div>
          <Link
            className="primary-button"
            href={`/demo?scenario=${FLOWS[flow].scenario}`}
          >
            Open the guided demo <ArrowUpRight size={17} />
          </Link>
        </DialogContent>
      </Dialog>
    </>
  );
}
