"use client";
import { useEffect, useRef } from "react";

/** A light, open sculpture of signals, shared by Home and About. */
export function ConnectionField() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = host.current,
      canvas = root?.querySelector("canvas");
    if (!root || !canvas || !("CanvasRenderingContext2D" in window)) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame = 0,
      visible = false,
      disposed = false,
      w = 500,
      h = 400,
      time = 0,
      last = 0;
    const resize = () => {
      const box = root.getBoundingClientRect();
      w = Math.max(1, box.width);
      h = Math.max(1, box.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const tick = (stamp: number) => {
      frame = 0;
      if (!visible || document.hidden || disposed) return;
      time += last ? Math.min(stamp - last, 50) / 1000 : 0;
      last = stamp;
      ctx.clearRect(0, 0, w, h);
      const scroll = root.getBoundingClientRect().top / window.innerHeight,
        angle = time * 0.055 + scroll * 0.11;
      for (let band = 0; band < 3; band++)
        for (let i = 0; i < 430; i++) {
          const u = (i / 429) * Math.PI * 2,
            phase = u + band * 2.094;
          const x = Math.sin(u) * 1.28,
            y = Math.cos(u) * 0.38 + Math.sin(u * 2 + time * 0.17) * 0.19,
            z = Math.cos(phase) * 0.65;
          const xx = x * Math.cos(angle) + z * Math.sin(angle),
            zz = z * Math.cos(angle) - x * Math.sin(angle),
            depth = 2.7 / (2.7 - zz),
            px = w * 0.5 + xx * w * 0.28 * depth,
            py = h * 0.48 + y * h * 0.35 * depth;
          const alpha = (0.14 + (zz + 0.8) * 0.19) * (i % 7 === 0 ? 1.6 : 1);
          ctx.fillStyle =
            band === 2
              ? `rgba(230,160,201,${alpha * 0.75})`
              : `rgba(156,211,225,${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, (i % 13 === 0 ? 1.45 : 0.65) * depth, 0, Math.PI * 2);
          ctx.fill();
        }
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      last = 0;
      if (visible && !document.hidden && !frame)
        frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: "80px" },
    );
    observer.observe(root);
    const size = new ResizeObserver(resize);
    size.observe(root);
    resize();
    root.dataset.rendered = "true";
    const visibility = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      start();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      size.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return (
    <div ref={host} className="connection-field" aria-hidden="true">
      <svg className="connection-fallback" viewBox="0 0 600 450" fill="none">
        <g stroke="#98cfdf" strokeWidth=".7" opacity=".45">
          <path d="M70 255C160 80 450 55 540 245S155 345 70 255Z" />
          <path d="M65 235C135 355 470 365 535 205S160 98 65 235Z" />
          <path d="M80 270C170 330 430 80 515 180S210 400 80 270Z" />
        </g>
      </svg>
      <canvas />
      <span className="connection-label label-knowledge">KNOWLEDGE</span>
      <span className="connection-label label-context">CONTEXT</span>
      <span className="connection-label label-action">NEXT STEP</span>
      <i className="connection-core" />
    </div>
  );
}
