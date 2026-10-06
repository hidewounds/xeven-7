"use client";
import { SpiderView } from "./spider-view";
import Link from "@/components/transition-link";
import { ArrowUpRight } from "lucide-react";
import { PageShell, Reveal } from "./experience-shell";

export default function AboutPage() {
  return (
    <PageShell active="/about">
      <section className="about-hero page-section">
        <div className="page-title">
          <p className="eyebrow">02 / CONNECTED BY DESIGN</p>
          <h1>
            One thread.
            <br />
            <span>More possibility.</span>
          </h1>
          <p>
            Useful information means more when it is connected to the moment.
            That is the idea at the centre of this XEVEN experience.
          </p>
        </div>
        <div className="brand-study">
          <SpiderView mode="idle" className="about-spider" />
          <span className="study-coordinate">
            IDENTITY STUDY / KNOWLEDGE × CONTEXT
          </span>
        </div>
      </section>
      <section className="about-section page-section">
        <Reveal>
          <p className="eyebrow">THE IDEA BEHIND THE INTERFACE</p>
          <h2>
            Closer to
            <br />
            <span>the conversation.</span>
          </h2>
        </Reveal>
        <div className="about-story">
          <p>
            XEVEN brings business information, customer memory, and
            conversational context into one adaptable AI agent. It is designed
            for the moments when someone needs an answer, a recommendation, or a
            useful next step.
          </p>
          <p>
            A store policy helps resolve a support question. An allowed
            preference makes a product suggestion more relevant. Availability
            turns an open-ended enquiry into a time to talk.
          </p>
          <p>
            The business provides the knowledge and configuration. The customer
            remains part of the conversation.
          </p>
          <Link href="/platform" className="text-link">
            Explore the technology <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <section
        className="brand-logic page-section"
        aria-label="The visual identity explained"
      >
        {[
          {
            number: "01 / THE THREAD",
            title: "Connection, made visible.",
            copy: "The silk line becomes the visual language for connecting separate pieces of information. It guides the entrance, scene transitions, and structural details.",
          },
          {
            number: "02 / THE SPIDER",
            title: "One recognisable centre.",
            copy: "Eight articulated, three-dimensional legs extend from one black-metal centre: connected information, held together by a single intelligence. The balanced silhouette carries from the entrance to the smallest icon.",
          },
          {
            number: "03 / THE X",
            title: "The point where things meet.",
            copy: "The X is engraved into the body, part of its structure. A fine edge catches the light before EVEN emerges from behind it. Knowledge and context meet in one connected name.",
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
          <strong>A console for an idea.</strong>
          <div>
            <p>
              The transparent handheld is an interface concept for exploring
              XEVEN. Commercial access is for the AI platform; this website does
              not sell a physical device.
            </p>
            <p>
              The guided demo uses fictional business information and scripted
              responses. It lets you explore the conversation before discussing
              a real configuration with sales.
            </p>
            <Link href="/demo" className="text-link">
              Take the controls <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>
      <section className="page-cta">
        <p className="eyebrow">WHAT WILL YOU CONNECT?</p>
        <h2>
          Your business.
          <br />
          <span>Your next conversation.</span>
        </h2>
        <Link href="/contact" className="primary-button">
          Talk to XEVEN <ArrowUpRight size={17} />
        </Link>
      </section>
    </PageShell>
  );
}
