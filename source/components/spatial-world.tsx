"use client";
import { useEffect, useRef, type RefObject } from "react";
import { consoleFrame, lerp, type JourneyMetrics } from "@/lib/console-journey";
import { Handheld } from "./handheld";

type Props = {
  journey: RefObject<HTMLDivElement | null>;
  chapter: number;
  flow: number;
  onChapter: (chapter: number) => void;
  onControl: (action: "next" | "previous" | "demo") => void;
};
export function SpatialWorld({
  journey,
  chapter,
  flow,
  onChapter,
  onControl,
}: Props) {
  const world = useRef<HTMLDivElement>(null),
    device = useRef<HTMLDivElement>(null),
    projection = useRef<HTMLDivElement>(null);
  const changed = useRef(onChapter);
  changed.current = onChapter;
  useEffect(() => {
    const root = journey.current,
      layer = world.current,
      consoleNode = device.current,
      panel = projection.current;
    if (!root || !layer || !consoleNode || !panel) return;
    const hero = root.querySelector<HTMLElement>(".chapter-product");
    const content = root.querySelector<HTMLElement>(".screen-chapters");
    const footer = root.querySelector<HTMLElement>(".footer-content");
    const returnCopy = root.querySelector<HTMLElement>(".return-copy");
    const controls =
      consoleNode.querySelector<HTMLElement>(".hardware-controls");
    const chapters = [...root.querySelectorAll<HTMLElement>(".story-chapter")];
    const chapterProgress = chapters.map(() => 0);
    let width = window.innerWidth,
      height = window.innerHeight,
      metrics: JourneyMetrics = {
        heroEnd: height * 1.25,
        returnStart: height * 4.8,
        footerStart: height * 6.5,
      };
    let starts: number[] = [],
      target = window.scrollY,
      current = target,
      raf = 0,
      previous = 0,
      last = -1,
      disposed = false;
    let pointer = { x: 0, y: 0 },
      eased = { x: 0, y: 0 };
    const schedule = () => {
      if (!raf && !document.hidden && !disposed)
        raf = requestAnimationFrame(tick);
    };
    const update = () => {
      target = window.scrollY;
      schedule();
    };
    const measure = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const at = (selector: string, fallback: number) => {
        const el = root.querySelector<HTMLElement>(selector);
        return el ? el.getBoundingClientRect().top + window.scrollY : fallback;
      };
      metrics = {
        heroEnd: at("#controls", height * 1.25),
        returnStart: at(".console-return", height * 4.8),
        footerStart: at("[data-console-footer]", height * 6.5),
      };
      starts = chapters.map(
        (el) => el.getBoundingClientRect().top + window.scrollY,
      );
      update();
    };
    const tick = (time: number) => {
      raf = 0;
      if (document.hidden || disposed) return;
      const dt = previous ? Math.min(0.05, (time - previous) / 1000) : 0.016;
      previous = time;
      const ease = 1 - Math.exp(-dt * 13);
      current = lerp(current, target, ease);
      eased.x = lerp(eased.x, pointer.x, ease);
      eased.y = lerp(eased.y, pointer.y, ease);
      const f = consoleFrame(current, width, height, metrics),
        p = f.pose;
      const depth = (1 - f.entry) * (1 - f.returning);
      consoleNode.style.width = `${p.width}px`;
      consoleNode.style.left = `${p.x}px`;
      consoleNode.style.top = `${p.y}px`;
      consoleNode.style.transform = `translate(-50%,-50%) perspective(1600px) rotateX(${p.rx + eased.y * 3 * depth}deg) rotateY(${p.ry + eased.x * 4 * depth}deg) rotateZ(${p.rz}deg)`;
      layer.dataset.phase = f.phase;
      layer.style.setProperty("--inside", String(f.inside));
      layer.style.setProperty(
        "--interface-opacity",
        String(Math.max(0, 1 - f.entry * 2.5) * (1 - f.returning)),
      );
      layer.style.setProperty("--brand-opacity", String(f.returning));
      layer.style.setProperty("--projection-opacity", String(f.docking));
      const r = f.projection;
      Object.assign(panel.style, {
        left: `${r.x}px`,
        top: `${r.y}px`,
        width: `${r.width}px`,
        height: `${r.height}px`,
        borderRadius: `${lerp(14, 20, f.expansion)}px`,
      });
      if (hero) hero.style.setProperty("--hero-opacity", String(f.heroOpacity));
      if (content) content.style.opacity = String(f.contentOpacity);
      chapters.forEach((element, index) => {
        const progress = Math.max(
          0,
          Math.min(
            1,
            (current + height - starts[index]) /
              (height + element.offsetHeight),
          ),
        );
        if (Math.abs(progress - chapterProgress[index]) > 0.001) {
          element.style.setProperty("--scene-progress", String(progress));
          chapterProgress[index] = progress;
        }
      });
      if (footer) {
        footer.style.setProperty("--footer-reveal", String(f.footerOpacity));
        footer.style.setProperty(
          "--footer-lift",
          `${(1 - f.footerOpacity) * 24}px`,
        );
      }
      if (returnCopy)
        returnCopy.style.opacity = String(
          Math.sin(f.returning * Math.PI * 0.5) * (1 - f.docking),
        );
      if (controls) controls.inert = f.entry > 0.25 || f.returning > 0;
      const stage = Math.min(
        3,
        Math.max(
          0,
          starts.filter((s) => target + height * 0.3 >= s).length - 1,
        ),
      );
      if (stage !== last) {
        last = stage;
        changed.current(stage);
      }
      if (
        Math.abs(current - target) > 0.08 ||
        Math.abs(eased.x - pointer.x) > 0.002 ||
        Math.abs(eased.y - pointer.y) > 0.002
      )
        schedule();
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer = {
        x: event.clientX / width - 0.5,
        y: event.clientY / height - 0.5,
      };
      schedule();
    };
    const leave = () => {
      pointer = { x: 0, y: 0 };
      schedule();
    };
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else {
        previous = 0;
        update();
      }
    };
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    chapters.forEach((el) => observer.observe(el));
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", visibility);
    measure();
    current = target;
    void document.fonts.ready.then(() => {
      if (!disposed) measure();
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [journey]);
  return (
    <div ref={world} className="persistent-world portal-world">
      <div ref={projection} className="footer-projection">
        <i />
        <span>XEVEN</span>
      </div>
      <div ref={device} className="console-poster">
        <Handheld
          chapter={chapter}
          flow={flow}
          decorative
          priority
          onControl={onControl}
        />
      </div>
    </div>
  );
}
