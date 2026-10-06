"use client";
import Link from "@/components/transition-link";
import { useState } from "react";
import {
  ArrowUpRight,
  AudioLines,
  BookOpen,
  CalendarDays,
  Check,
  Fingerprint,
  Layers3,
} from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { PageShell, Reveal, XevenMark } from "./experience-shell";
import { FAQ, SALES_EMAIL } from "@/lib/xeven-content";

const MODULES = [
  {
    id: "knowledge",
    plan: "All plans · 50 / 200 / 500 items",
    name: "Knowledge",
    icon: BookOpen,
    eyebrow: "THE FOUNDATION",
    title: "Answers from your world.",
    description:
      "Give XEVEN the information that makes your business yours: products, policies, FAQs, and guidance. Relevant business knowledge helps shape the response.",
    features: [
      "Business-specific information",
      "Relevant knowledge retrieval",
      "A configurable agent personality",
    ],
    limit:
      "Knowledge capacity depends on the selected plan. The information below is a sample store policy.",
    screen: [
      "INFORMATION SUPPLIED",
      "Unworn items · exchanges within 30 days",
      "CUSTOMER QUESTION",
      "The shoes don’t fit. Can I exchange them?",
      "USEFUL NEXT QUESTION",
      "When did your order arrive?",
    ],
  },
  {
    id: "memory",
    plan: "All plans · allowed fields",
    name: "Memory",
    icon: Fingerprint,
    eyebrow: "THE CONTINUITY",
    title: "A useful detail, remembered.",
    description:
      "Keep allowed customer facts separate from inferred behavior. The next conversation can pick up with a preference the customer has chosen to share.",
    features: [
      "Explicit customer preferences",
      "Behavior signals kept separate",
      "Remember and forget controls",
    ],
    limit:
      "Configure allowed memory fields and retention for your business. The demo uses fictional preferences.",
    screen: [
      "PREFERENCE SHARED",
      "Alex · size 9 · prefers black sneakers",
      "CONTROL",
      "Use the preference only when permitted",
      "CUSTOMER EXPERIENCE",
      "Welcome back. Here’s a relevant option.",
    ],
  },
  {
    id: "chrono",
    plan: "Growth+ · scheduling",
    name: "Chrono",
    icon: CalendarDays,
    eyebrow: "THE NEXT MOMENT",
    title: "Make time for the next step.",
    description:
      "Bring business hours, availability, buffers, and booking rules into the conversation. Ask for a time and the information needed before confirmation.",
    features: [
      "Schedule-based availability",
      "Slot holds and bookings",
      "Business-specific timing rules",
    ],
    limit:
      "Included in Growth and Scale profiles. Setup is required; this website does not check a live calendar.",
    screen: [
      "SAMPLE AVAILABILITY",
      "Friday · 14:00 or 15:30 UTC",
      "MEETING TYPE",
      "A 30-minute product consultation",
      "BEFORE CONFIRMATION",
      "Select a time and provide contact details",
    ],
  },
  {
    id: "echo",
    plan: "Growth+ · English voice / Scale · multilanguage",
    name: "Echo",
    icon: AudioLines,
    eyebrow: "THE HUMAN FREQUENCY",
    title: "Another way to connect.",
    description:
      "Extend the conversation through configured speech services: transcribe voice, synthesize a response, and capture useful notes and action items.",
    features: [
      "Speech transcription",
      "Synthesized voice responses",
      "Conversation notes and next steps",
    ],
    limit:
      "Voice language and channel support depend on the plan and configured services. No microphone is used in this preview.",
    screen: [
      "VOICE INPUT",
      "Transcribe the customer’s conversation",
      "CONFIGURED RESPONSE",
      "Speak through the selected voice service",
      "AFTER THE CONVERSATION",
      "Keep useful notes and action items",
    ],
  },
];
const EXPERTISE = [
  [
    "Customer support",
    "Bring the relevant policy into a support conversation, then ask for missing information before suggesting the next step.",
  ],
  [
    "Sales",
    "Explain the business’s offering and guide an interested customer toward a relevant commercial next step.",
  ],
  [
    "Shopping assistance",
    "Connect product information with customer preferences to make it easier to explore suitable options.",
  ],
  [
    "Product advice",
    "Answer product questions using the information the business provides, rather than inventing unavailable specifications.",
  ],
  [
    "Lead qualification",
    "Ask useful questions about the customer’s needs to help the business understand the enquiry.",
  ],
  [
    "General assistance",
    "Maintain a coherent conversation while drawing on the agent’s configured knowledge and instructions.",
  ],
];
export default function PlatformPage() {
  const [module, setModule] = useState(0),
    selected = MODULES[module];
  return (
    <PageShell active="/platform">
      <section className="technology-hero page-section">
        <div className="page-title">
          <p className="eyebrow">01 / TECHNOLOGY</p>
          <h1>
            One conversation.
            <br />
            <span>More context.</span>
          </h1>
          <p>
            Knowledge, permitted memory, and relevant signals come together in a
            configurable AI agent for your business.
          </p>
          <Link className="primary-button" href="/demo">
            Explore a conversation <ArrowUpRight size={17} />
          </Link>
        </div>
        <div
          className="layer-diagram"
          aria-label="Business knowledge, permitted memory, and relevant context inform a response or next step"
        >
          {[
            {
              icon: BookOpen,
              label: "01 / FOUNDATION",
              title: "Business knowledge",
              copy: "Policies, products, and useful detail.",
            },
            {
              icon: Fingerprint,
              label: "02 / CONTINUITY",
              title: "Permitted memory",
              copy: "Facts the customer has shared.",
            },
            {
              icon: Layers3,
              label: "03 / RELEVANCE",
              title: "Context into conversation",
              copy: "A response. A question. A next step.",
            },
          ].map((layer) => (
            <div key={layer.title} className="layer-card">
              <layer.icon size={24} strokeWidth={1.25} />
              <div>
                <span>{layer.label}</span>
                <h3>{layer.title}</h3>
                <p>{layer.copy}</p>
              </div>
            </div>
          ))}
          <p className="diagram-caption">
            CONCEPTUAL SYSTEM VIEW / NOT A LIVE TRACE
          </p>
        </div>
      </section>
      <section className="module-section page-section">
        <div className="section-heading">
          <Reveal>
            <p className="eyebrow">FOUR CONNECTED CAPABILITIES</p>
            <h2>
              Built around
              <br />
              <span>understanding.</span>
            </h2>
          </Reveal>
          <p>
            Inspect the information each capability uses, the experience it
            supports, and what needs configuring.
          </p>
        </div>
        <div className="module-layout">
          <div
            className="module-tabs"
            role="group"
            aria-label="Choose a capability"
          >
            {MODULES.map((item, index) => (
              <button
                key={item.id}
                aria-pressed={module === index}
                aria-controls="capability-detail"
                onClick={() => setModule(index)}
              >
                <span>0{index + 1}</span>
                <item.icon size={20} />
                <strong>{item.name}</strong>
              </button>
            ))}
          </div>
          <div
            className="module-detail"
            id="capability-detail"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="module-copy">
              <span className="module-plan-tag">{selected.plan}</span>
              <p className="eyebrow">{selected.eyebrow}</p>
              <h3>{selected.title}</h3>
              <p>{selected.description}</p>
              <ul>
                {selected.features.map((feature) => (
                  <li key={feature}>
                    <Check size={15} />
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="module-limit">{selected.limit}</p>
            </div>
            <div className="mini-terminal">
              <div className="terminal-top">
                <XevenMark />
                <span>XEVEN / {selected.name.toUpperCase()}</span>
              </div>
              {[0, 2, 4].map((index, count) => (
                <div className="terminal-entry" key={index}>
                  <span>
                    0{count + 1} / {selected.screen[index]}
                  </span>
                  <p>{selected.screen[index + 1]}</p>
                </div>
              ))}
              <div className="terminal-bottom">
                ILLUSTRATIVE EXAMPLE / CONFIGURATION REQUIRED
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="trust-section page-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CLEAR BOUNDARIES</p>
            <h2>
              A detail shared.
              <br />
              <span>A choice retained.</span>
            </h2>
          </div>
          <p>
            A configuration guide for business memory. Confirm your allowed
            fields, handling rules, and data terms before setup.
          </p>
        </div>
        <div className="retention-table-wrap">
          <table className="retention-table">
            <caption className="sr-only">Memory and retention controls</caption>
            <thead>
              <tr>
                <th scope="col">Field</th>
                <th scope="col">Kept</th>
                <th scope="col">Control</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Explicit preference</th>
                <td>Until Forget</td>
                <td>Allowed fields only; remember / forget commands.</td>
              </tr>
              <tr>
                <th scope="row">Behavior signal</th>
                <td>Session only</td>
                <td>
                  Separate from explicit facts; no automatic promotion to a
                  remembered preference.
                </td>
              </tr>
              <tr>
                <th scope="row">Data processing terms</th>
                <td>Agreed at setup</td>
                <td>
                  DPA on request:{" "}
                  <a
                    href={`mailto:${SALES_EMAIL}?subject=XEVEN%20DPA%20request`}
                  >
                    {SALES_EMAIL}
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="retention-footnote">
          The offline preview holds sample state only while its page is open.
          Its memory switch demonstrates the choice; it does not store customer
          records.
        </p>
        <div className="sample-policy-box">
          <span>ILLUSTRATIVE BUSINESS DATA</span>
          <p>
            <strong>Sample policy:</strong> unworn 30-day exchange.
            <br />
            <strong>Sample schedule:</strong> Fri 14:00 / 15:30 UTC.
          </p>
          <Link href="/demo?scenario=support">
            Explore the sample <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
      <section className="expertise-section page-section">
        <Reveal>
          <p className="eyebrow">SIX AREAS OF EXPERTISE</p>
          <h2 className="editorial-heading">
            A change of subject.
            <br />
            <span>Still the same conversation.</span>
          </h2>
        </Reveal>
        <div className="expertise-list">
          {EXPERTISE.map(([title, description], index) => (
            <details className="expertise-row" key={title}>
              <summary>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
              </summary>
              <p>{description}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="faq-section page-section">
        <div>
          <p className="eyebrow">A LITTLE MORE CONTEXT</p>
          <h2>
            Good
            <br />
            <span>questions.</span>
          </h2>
        </div>
        <Accordion type="single" collapsible className="faq-list">
          {FAQ.map((item, index) => (
            <AccordionItem value={`faq-${index}`} key={item.question}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
      <section className="page-cta">
        <p className="eyebrow">YOUR KNOWLEDGE. YOUR VOICE.</p>
        <h2>
          Build a connection
          <br />
          <span>around your business.</span>
        </h2>
        <Link className="primary-button" href="/plans">
          Find your XEVEN plan <ArrowUpRight size={17} />
        </Link>
      </section>
    </PageShell>
  );
}
