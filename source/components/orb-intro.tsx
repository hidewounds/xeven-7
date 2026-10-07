"use client";
import { useEffect, useRef, type MutableRefObject } from "react";
import { Dialog } from "radix-ui";
import * as THREE from "three";
import {
  createOrb,
  orbPhase,
  orbSize,
  particleSeed,
  sampleOrbParticles,
} from "@/lib/orb-model";
import { ORB_DURATION } from "@/lib/intro-session";
import orbImage from "@/assets/orb-surface.webp?inline";

type RenderFrame = (seconds: number) => void;
const fallbackSeeds = Array.from({ length: 420 }, (_, i) =>
  particleSeed(i + 1),
);
function OrbSurface({
  renderFrame,
}: {
  renderFrame: MutableRefObject<RenderFrame | null>;
}) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const poster = node.querySelector<HTMLElement>(".orb-intact-poster"),
      veil = node.querySelector<HTMLElement>(".orb-particle-veil");
    const dots = [
      ...node.querySelectorAll<SVGCircleElement>(".orb-fallback-particle"),
    ];
    let width = window.innerWidth,
      height = window.innerHeight,
      renderGPU: RenderFrame | null = null,
      disposeGPU: (() => void) | null = null,
      disposed = false;
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
    };
    const fallbackFrame = (time: number) => {
      const p = orbPhase(time),
        size = orbSize(width, height),
        radius = p.reveal * (Math.hypot(width, height) * 0.5 + 100);
      if (poster) {
        poster.style.width = `${size}px`;
        poster.style.opacity = String(1 - p.dissolve);
        poster.style.filter = `blur(${p.dissolve * 2}px)`;
        poster.style.transform = `translate(-50%,-50%) rotate(${Math.sin(time * 0.4) * 3}deg) scale(${1 + Math.sin(time * 1.3) * 0.012})`;
      }
      if (veil) {
        veil.style.opacity = String(p.cover);
        const mask =
          p.reveal < 0.001
            ? "none"
            : `radial-gradient(circle at center,transparent ${Math.max(0, radius - 14)}px,#000 ${radius + 16}px)`;
        veil.style.maskImage = mask;
        veil.style.webkitMaskImage = mask;
      }
      dots.forEach((dot, i) => {
        const [a, b, c] = fallbackSeeds[i],
          angle = a * Math.PI * 2,
          r = Math.sqrt(b) * size * 0.38,
          ox = Math.cos(angle) * r,
          oy = Math.sin(angle) * r,
          dx = (b - 0.5) * width * 1.16,
          dy = (c - 0.5) * height * 1.16;
        const x =
            ox +
            (dx - ox) * p.spread -
            dy * Math.sin(p.spread * Math.PI) * 0.18,
          y =
            oy +
            (dy - oy) * p.spread +
            dx * Math.sin(p.spread * Math.PI) * 0.18;
        dot.setAttribute("cx", String(((width * 0.5 + x) / width) * 1000));
        dot.setAttribute("cy", String(((height * 0.5 + y) / height) * 1000));
        dot.style.opacity = String(
          p.dissolve *
            (0.35 + a * 0.55) *
            (p.reveal > 0.001 && Math.hypot(x, y) < radius ? 0 : 1),
        );
      });
    };
    if ("WebGL2RenderingContext" in window) {
      let renderer: THREE.WebGLRenderer | null = null;
      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
        });
        const dpr = Math.min(
          window.devicePixelRatio || 1,
          width < 700 ? 1.4 : 1.7,
        );
        renderer.setPixelRatio(dpr);
        renderer.setClearColor(0, 0);
        const scene = new THREE.Scene(),
          camera = new THREE.Camera(),
          image = new Image(),
          texture = new THREE.Texture(image);
        texture.colorSpace = THREE.SRGBColorSpace;
        let orb: ReturnType<typeof createOrb> | null = null,
          lost = false;
        renderer.debug.onShaderError = () => {
          lost = true;
          delete node.dataset.rendered;
        };
        image.onload = () => {
          if (disposed) return;
          try {
            const sampler = document.createElement("canvas");
            sampler.width = sampler.height = 192;
            const context = sampler.getContext("2d");
            if (!context) throw new Error("Texture sampling unavailable");
            context.drawImage(image, 0, 0, 192, 192);
            const data = context.getImageData(0, 0, 192, 192);
            texture.needsUpdate = true;
            orb = createOrb(
              texture,
              sampleOrbParticles(data, width < 700 ? 10500 : 21000),
            );
            scene.add(orb.group);
          } catch {
            lost = true;
          }
        };
        image.src = orbImage;
        renderer.domElement.setAttribute("aria-hidden", "true");
        node.appendChild(renderer.domElement);
        const resizeGPU = () => {
          resize();
          renderer!.setSize(width, height, false);
        };
        const loss = (event: Event) => {
          event.preventDefault();
          lost = true;
          delete node.dataset.rendered;
        };
        renderer.domElement.addEventListener("webglcontextlost", loss);
        window.addEventListener("resize", resizeGPU);
        resizeGPU();
        renderGPU = (time) => {
          if (!orb || lost || disposed) return;
          orb.update(time, width, height, dpr);
          renderer!.render(scene, camera);
          if (!lost) node.dataset.rendered = "true";
        };
        disposeGPU = () => {
          image.onload = null;
          orb?.dispose();
          texture.dispose();
          window.removeEventListener("resize", resizeGPU);
          renderer!.domElement.removeEventListener("webglcontextlost", loss);
          renderer!.dispose();
          renderer!.domElement.remove();
        };
      } catch {
        renderer?.dispose();
      }
    }
    renderFrame.current = (time) => {
      if (node.dataset.rendered !== "true") fallbackFrame(time);
      try {
        renderGPU?.(time);
      } catch {
        renderGPU = null;
        disposeGPU?.();
        disposeGPU = null;
        delete node.dataset.rendered;
        fallbackFrame(time);
      }
    };
    window.addEventListener("resize", resize);
    fallbackFrame(0);
    return () => {
      disposed = true;
      renderFrame.current = null;
      window.removeEventListener("resize", resize);
      disposeGPU?.();
    };
  }, [renderFrame]);
  return (
    <div ref={host} className="orb-surface" aria-hidden="true">
      <img
        className="orb-intact-poster"
        src="/xeven/orb-poster.webp"
        width="1254"
        height="1254"
        alt=""
        fetchPriority="high"
      />
      <div className="orb-particle-veil" />
      <svg
        className="orb-particle-fallback"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        {fallbackSeeds.map(([a], i) => (
          <circle
            key={i}
            className="orb-fallback-particle"
            r={0.6 + a * 1.2}
            fill={a > 0.8 ? "#c4d8e3" : a > 0.5 ? "#98657f" : "#53727f"}
          />
        ))}
      </svg>
    </div>
  );
}
export default function OrbIntro({ onComplete }: { onComplete: () => void }) {
  const skip = useRef<HTMLButtonElement>(null),
    root = useRef<HTMLDivElement>(null),
    renderFrame = useRef<RenderFrame | null>(null),
    done = useRef(onComplete);
  done.current = onComplete;
  useEffect(() => {
    document.documentElement.dataset.entering = "true";
    let frame = 0,
      last = 0,
      elapsed = 0,
      finished = false;
    function tick(stamp: number) {
      frame = 0;
      if (document.hidden || finished) return;
      elapsed += last ? Math.min(stamp - last, 50) : 0;
      last = stamp;
      const time = elapsed / 1000,
        p = orbPhase(time);
      renderFrame.current?.(time);
      root.current?.style.setProperty(
        "--entry-shade",
        String(1 - THREE.MathUtils.smoothstep(time, 3.9, 4.17)),
      );
      root.current?.style.setProperty(
        "--word-opacity",
        String(
          THREE.MathUtils.smoothstep(time, 0.25, 0.7) *
            (1 - THREE.MathUtils.smoothstep(time, 1.35, 2.1)),
        ),
      );
      document.documentElement.style.setProperty(
        "--entry-reveal",
        String(p.reveal),
      );
      if (elapsed >= ORB_DURATION) {
        finished = true;
        done.current();
        return;
      }
      frame = requestAnimationFrame(tick);
    }
    const visibility = () => {
      cancelAnimationFrame(frame);
      last = 0;
      if (!document.hidden && !finished) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      finished = true;
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", visibility);
      delete document.documentElement.dataset.entering;
      document.documentElement.style.removeProperty("--entry-reveal");
    };
  }, []);
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) done.current();
      }}
    >
      <Dialog.Portal>
        <Dialog.Content
          ref={root}
          className="orb-entrance"
          aria-describedby="orb-intro-description"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            skip.current?.focus();
          }}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <Dialog.Title className="sr-only">Enter XEVEN</Dialog.Title>
          <p id="orb-intro-description" className="sr-only">
            A small fibrous orb dissolves into a field of particles. The field
            opens continuously into XEVEN.
          </p>
          <OrbSurface renderFrame={renderFrame} />
          <div className="orb-entry-word" aria-hidden="true">
            XEVEN<span>EVERYTHING IS CONNECTED</span>
          </div>
          <button
            className="orb-skip"
            ref={skip}
            onClick={() => done.current()}
          >
            Skip intro ↗
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
