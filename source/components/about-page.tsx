"use client";
import Link from "@/components/transition-link";
import { ArrowUpRight } from "lucide-react";
import { PageShell, Reveal } from "./experience-shell";
import { ConnectionField } from "./connection-field";
export default function AboutPage() {
  return (
    <PageShell active="/about">
      <section className="about-hero page-section">
        <div className="page-title">
          <p className="eyebrow">02 / ABOUT XEVEN</p>
          <h1>
            Built around
            <br />
            <span>understanding.</span>
          </h1>
          <p>
            One AI agent. Your business knowledge, customer context, and next
            steps.
          </p>
          <Link href="/platform" className="text-link">
            Explore the platform <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="about-connection" aria-hidden="true">
          <ConnectionField />
          <span>CONNECTED BY DESIGN</span>
        </div>
      </section>
      <section className="about-section page-section">
        <Reveal>
          <p className="eyebrow">THE IDEA</p>
          <h2>
            Closer to
            <br />
            <span>what matters.</span>
          </h2>
        </Reveal>
        <div className="about-story">
          <p>
            A policy becomes a useful answer. A preference makes a
            recommendation relevant. Availability turns a question into a plan.
          </p>
          <p>
            You provide the knowledge. XEVEN connects it to the conversation.
          </p>
          <Link href="/demo" className="text-link">
            See it in action <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <section className="brand-logic page-section" aria-label="Our approach">
        {[
          {
            number: "01 / KNOWLEDGE",
            title: "Grounded in your world.",
            copy: "Products, policies, and guidance shape each answer.",
          },
          {
            number: "02 / CONTINUITY",
            title: "Context with control.",
            copy: "Allowed preferences help the next conversation pick up naturally.",
          },
          {
            number: "03 / PURPOSE",
            title: "A useful next step.",
            copy: "Support, recommend, qualify, or schedule. Keep things moving.",
          },
        ].map((item) => (
          <Reveal key={item.number}>
            <span>{item.number}</span>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </Reveal>
        ))}
      </section>
      <section className="page-section">
        <div className="concept-note">
          <strong>An interface for an idea.</strong>
          <div>
            <p>
              The console is a visual concept. XEVEN is commercial AI software
              for your website.
            </p>
            <p>The demo uses fictional data and scripted responses.</p>
          </div>
        </div>
      </section>
      <section className="page-cta">
        <p className="eyebrow">YOUR BUSINESS. YOUR XEVEN.</p>
        <h2>
          Start something
          <br />
          <span>connected.</span>
        </h2>
        <Link href="/contact" className="primary-button">
          Talk to XEVEN <ArrowUpRight size={17} />
        </Link>
      </section>
    </PageShell>
  );
}
