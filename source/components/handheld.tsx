"use client";
import Link from "@/components/transition-link";
import {
  ArrowUpRight,
  CalendarDays,
  Globe2,
  Sparkles,
  Zap,
} from "lucide-react";
import { WORKFLOWS, screenContent } from "@/lib/workflows";
const icons = [Globe2, Sparkles, CalendarDays, Zap];
export const FLOWS = WORKFLOWS.map((flow, index) => ({
  ...flow,
  icon: icons[index],
}));

/** The original transparent console artwork with a live HTML conversation screen. */
export function Handheld({
  chapter = 0,
  flow = 0,
  className = "",
  decorative = false,
  onControl,
  priority = false,
}: {
  chapter?: number;
  flow?: number;
  className?: string;
  decorative?: boolean;
  priority?: boolean;
  onControl?: (action: "previous" | "next" | "demo") => void;
}) {
  const content = screenContent(chapter, flow);
  return (
    <div className={`handheld ${className}`}>
      <picture>
        <source media="(max-width: 700px)" srcSet="/xeven/console-small.webp" />
        <img
          className="handheld-body"
          src="/xeven/console.webp"
          width="1024"
          height="1536"
          alt={decorative ? "" : "Transparent XEVEN handheld interface concept"}
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
        />
      </picture>
      <div className="handheld-screen" aria-hidden={decorative || undefined}>
        <div className="screen-interface">
          <div className="device-status">
            <span>XEVEN</span>
            <span>09:41 ▰</span>
          </div>
          <div className="device-conversation">
            <span className="device-role">YOU</span>
            <p>{content.question}</p>
            <span className="device-role">XEVEN</span>
            <p>{content.answer}</p>
          </div>
          <span className="device-context">SAMPLE CONVERSATION</span>
          {decorative ? (
            <span className="device-input">A / OPEN DEMO ↗</span>
          ) : (
            <Link href="/demo" className="device-input">
              Open the guided demo <ArrowUpRight />
            </Link>
          )}
        </div>
        <div className="device-brand" aria-hidden="true">
          <strong>XEVEN</strong>
          <span>CONNECTED BY DESIGN</span>
        </div>
      </div>
      {onControl && (
        <div className="hardware-controls">
          <button
            className="hardware-previous"
            aria-label="Previous console workflow"
            onClick={() => onControl("previous")}
          />
          <button
            className="hardware-next"
            aria-label="Next console workflow"
            onClick={() => onControl("next")}
          />
          <button
            className="hardware-open"
            aria-label="Read the console conversation"
            onClick={() => onControl("demo")}
          />
        </div>
      )}
    </div>
  );
}
