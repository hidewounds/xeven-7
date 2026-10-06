"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createSpider, SPIDER_DIMENSIONS } from "@/lib/spider-model";

/** Actual articulated geometry, with the matching projected SVG as a no-WebGL fallback. */
export function SpiderView({
  mode = "idle",
  className = "",
  active = true,
}: {
  mode?: "intro" | "idle";
  className?: string;
  active?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = host.current;
    if (!node || !active || !("WebGL2RenderingContext" in window)) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
    camera.position.set(0, 0, 10.7);
    const spider = createSpider();
    scene.add(spider.group);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.65;
    const pmrem = new THREE.PMREMGenerator(renderer),
      room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    scene.environmentIntensity = 1.25;
    room.dispose();
    pmrem.dispose();
    const key = new THREE.DirectionalLight(0xe7f6ff, 4.2);
    key.position.set(-3, 4, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x79d8ff, 4.8);
    rim.position.set(4, 1, 1.5);
    scene.add(rim);
    const edge = new THREE.DirectionalLight(0xe6a1c8, 1.2);
    edge.position.set(-4, -2, 2);
    scene.add(edge);
    scene.add(new THREE.HemisphereLight(0xc7e5ef, 0x070b13, 1.0));
    renderer.domElement.setAttribute("aria-hidden", "true");
    node.appendChild(renderer.domElement);
    let frame = 0,
      visible = true,
      disposed = false,
      lost = false,
      begin = 0,
      last = 0,
      time = 0;
    let pointer = { x: 0, y: 0 },
      smooth = { x: 0, y: 0 };
    const resize = () => {
      const w = Math.max(1, node.clientWidth),
        h = Math.max(1, node.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = 10.7 / Math.min(1, camera.aspect);
      camera.updateProjectionMatrix();
    };
    const tick = (stamp: number) => {
      frame = 0;
      if (disposed || lost || document.hidden || !visible) return;
      if (!begin) begin = stamp;
      const dt = last ? Math.min(0.05, (stamp - last) / 1000) : 0.016;
      last = stamp;
      time += dt;
      const settle = Math.min(1, (stamp - begin) / 1700),
        eased = 1 - Math.pow(1 - settle, 3);
      smooth.x += (pointer.x - smooth.x) * Math.min(1, dt * 4);
      smooth.y += (pointer.y - smooth.y) * Math.min(1, dt * 4);
      if (mode === "intro") {
        spider.group.rotation.set(
          (1 - eased) * -0.28,
          (1 - eased) * 0.65,
          Math.sin(time * 1.8) * 0.012,
        );
      } else {
        spider.group.rotation.set(
          Math.sin(time * 0.6) * 0.07 + smooth.y * 0.16,
          Math.sin(time * 0.45) * 0.22 + smooth.x * 0.27,
          Math.sin(time * 0.4) * 0.035,
        );
        spider.group.position.y = Math.sin(time * 0.85) * 0.045;
      }
      spider.legs.forEach((leg, index) => {
        const side = index < 4 ? -1 : 1;
        leg.rotation.z =
          side *
          ((mode === "intro" ? (1 - eased) * 0.2 : 0) +
            Math.sin(time * 1.2 + index * 0.65) * 0.016);
        leg.rotation.x = Math.sin(time * 0.95 + index * 0.55) * 0.018;
      });
      if (mode === "intro") {
        spider.group.updateMatrixWorld(true);
        camera.updateMatrixWorld(true);
        const anchor = (point: { x: number; y: number; z: number }) =>
          new THREE.Vector3(point.x, point.y, point.z)
            .applyMatrix4(spider.group.matrixWorld)
            .project(camera);
        const center = anchor(SPIDER_DIMENSIONS.engraving.center);
        const top = anchor({
          ...SPIDER_DIMENSIONS.engraving.center,
          y: SPIDER_DIMENSIONS.engraving.center.y + 0.275,
        });
        const bottom = anchor({
          ...SPIDER_DIMENSIONS.engraving.center,
          y: SPIDER_DIMENSIONS.engraving.center.y - 0.275,
        });
        const silk = anchor(SPIDER_DIMENSIONS.silkAttachment);
        const container = node.parentElement;
        container?.style.setProperty("--spider-x-y", `${(1 - center.y) * 50}%`);
        container?.style.setProperty(
          "--spider-x-font",
          `${(Math.abs(top.y - bottom.y) * node.clientHeight * 0.5) / 0.71}px`,
        );
        node
          .closest<HTMLElement>(".spider-intro")
          ?.style.setProperty(
            "--silk-offset",
            `${silk.y * node.clientHeight * 0.5}px`,
          );
        const highlight = spider.materials.find(
          (material) => material.name === "xeven-engraving-lip",
        ) as THREE.MeshStandardMaterial | undefined;
        if (highlight)
          highlight.emissiveIntensity =
            0.35 + Math.max(0, 1 - Math.abs(time - 1.85) / 0.5) * 2.2;
      }
      renderer.render(scene, camera);
      node.dataset.rendered = "true";
      frame = requestAnimationFrame(tick);
    };
    const schedule = () => {
      if (!frame && !disposed && !lost && !document.hidden && visible) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };
    const move = (e: PointerEvent) => {
      const bounds = node.getBoundingClientRect();
      pointer = {
        x: (e.clientX - bounds.left) / bounds.width - 0.5,
        y: (e.clientY - bounds.top) / bounds.height - 0.5,
      };
    };
    const leave = () => {
      pointer = { x: 0, y: 0 };
    };
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else schedule();
    };
    const contextLost = (e: Event) => {
      e.preventDefault();
      lost = true;
      cancelAnimationFrame(frame);
      frame = 0;
      delete node.dataset.rendered;
    };
    const contextRestored = () => {
      lost = false;
      schedule();
    };
    const size = new ResizeObserver(resize);
    size.observe(node);
    const intersection = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? false;
        if (visible) schedule();
        else {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: "100px" },
    );
    intersection.observe(node);
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", visibility);
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    renderer.domElement.addEventListener(
      "webglcontextrestored",
      contextRestored,
    );
    resize();
    schedule();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      size.disconnect();
      intersection.disconnect();
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        contextRestored,
      );
      spider.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      delete node.dataset.rendered;
    };
  }, [mode, active]);
  return (
    <div
      ref={host}
      className={`spider-view spider-view-${mode} ${className}`}
      role="img"
      aria-label="XEVEN’s dimensional black-metal spider, with eight articulated legs and an engraved X"
    >
      <img
        className="spider-poster"
        src={
          mode === "intro" ? "/xeven/spider-front.svg" : "/xeven/spider-3d.svg"
        }
        width="720"
        height="760"
        alt=""
        aria-hidden="true"
      />
    </div>
  );
}
