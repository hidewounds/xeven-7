"use client";
import { useEffect, useRef } from "react";

/** The original nebula, orbital lines and floating mineral fragments. */
export function SpaceScene() {
  const world = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = world.current;
    if (!node) return;
    let frame = 0,
      x = 0,
      y = 0,
      aimX = 0,
      aimY = 0;
    const update = () => {
      frame = 0;
      x += (aimX - x) * 0.065;
      y += (aimY - y) * 0.065;
      node.style.setProperty("--space-x", `${x * 14}px`);
      node.style.setProperty("--space-y", `${y * 10}px`);
      if (Math.abs(aimX - x) + Math.abs(aimY - y) > 0.002 && !document.hidden)
        frame = requestAnimationFrame(update);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      aimX = event.clientX / window.innerWidth - 0.5;
      aimY = event.clientY / window.innerHeight - 0.5;
      if (!frame) frame = requestAnimationFrame(update);
    };
    const leave = () => {
      aimX = aimY = 0;
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);
  return (
    <div ref={world} className="space-world" aria-hidden="true">
      <div className="world-nebula" />
      <div className="world-stars" />
      <div className="world-orbit orbit-one" />
      <div className="world-orbit orbit-two" />
      {[0, 1, 2, 3].map((index) => (
        <div key={index} className={`space-fragment fragment-${index}`}>
          <picture>
            <source
              media="(max-width: 700px)"
              srcSet="/xeven/fragment-small.webp"
            />
            <img
              src="/xeven/fragment.webp"
              width="1254"
              height="1254"
              alt=""
              loading="eager"
            />
          </picture>
        </div>
      ))}
      <div className="world-vignette" />
    </div>
  );
}
