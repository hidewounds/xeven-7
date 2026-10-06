import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { Pose } from "./scene-choreography";
import type { ScreenContent } from "./workflows";

export type SpatialScene = {
  animating: () => boolean;
  lowerResolution: () => void;
  resize: (width: number, height: number) => void;
  pose: (pose: Pose, pointer: { x: number; y: number }) => void;
  screen: (content: ScreenContent) => void;
  hit: (x: number, y: number) => "next" | "previous" | "demo" | null;
  press: (action: "next" | "previous" | "demo", pressed: boolean) => void;
  dispose: () => void;
};

/** Deferred renderer. The HTML story and poster work independently of this module. */
export async function createSpatialScene(
  canvas: HTMLCanvasElement,
  quality: "full" | "light",
  signal: AbortSignal,
): Promise<SpatialScene> {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: quality === "full",
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, quality === "full" ? 1.5 : 1),
  );
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
  camera.position.z = 8.8;
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentMap = pmrem.fromScene(environment, 0.035);
  scene.environment = environmentMap.texture;
  scene.environmentIntensity = 0.8;
  environment.dispose();
  pmrem.dispose();
  const key = new THREE.DirectionalLight(0xf1f5ff, 3.2);
  key.position.set(-3, 5, 7);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x79dbff, 1.1);
  rim.position.set(6, 1, 2);
  scene.add(rim);
  const pink = new THREE.DirectionalLight(0xf296c4, 0.6);
  pink.position.set(-5, -3, 2);
  scene.add(pink);
  scene.add(new THREE.HemisphereLight(0x9cadc2, 0x171c26, 1.6));
  let root: THREE.Group | null = null,
    disposed = false;
  const screenCanvas = document.createElement("canvas");
  screenCanvas.width = 1024;
  screenCanvas.height = 708;
  const texture = new THREE.CanvasTexture(screenCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const screenMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    toneMapped: false,
  });
  function dispose() {
    if (disposed) return;
    disposed = true;
    const geometries = new Set<THREE.BufferGeometry>(),
      materials = new Set<THREE.Material>();
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        geometries.add(object.geometry);
        const list = Array.isArray(object.material)
          ? object.material
          : [object.material];
        list.forEach((material) => materials.add(material));
      }
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    texture.dispose();
    screenMaterial.dispose();
    environmentMap.dispose();
    renderer.dispose();
  }
  signal.addEventListener("abort", dispose, { once: true });
  try {
    const response = await fetch("/xeven/console.glb", { signal });
    if (!response.ok) throw new Error("Console asset unavailable");
    const data = await response.arrayBuffer();
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    const model = await new GLTFLoader().parseAsync(data, "");
    root = model.scene;
    scene.add(root);
    if (signal.aborted) {
      // Parsing can finish after abort; release its newly-created resources too.
      root.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          (Array.isArray(object.material)
            ? object.material
            : [object.material]
          ).forEach((material) => material.dispose());
        }
      });
      throw new DOMException("Aborted", "AbortError");
    }
    const display = root.getObjectByName("ScreenSurface");
    if (!(display instanceof THREE.Mesh))
      throw new Error("Screen surface missing");
    (Array.isArray(display.material)
      ? display.material
      : [display.material]
    ).forEach((material) => material.dispose());
    display.material = screenMaterial;
    if (quality === "light")
      root.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        for (const material of Array.isArray(object.material)
          ? object.material
          : [object.material]) {
          if (
            material instanceof THREE.MeshPhysicalMaterial &&
            material.transmission > 0
          ) {
            material.transmission = 0;
            material.transparent = true;
            material.opacity = 0.19;
            material.depthWrite = false;
            material.roughness = 0.14;
            material.needsUpdate = true;
          }
        }
      });
  } catch (error) {
    dispose();
    throw error;
  }

  let width = 1,
    height = 1;
  let screenFadeStarted = -Infinity;
  const render = () => {
    if (!disposed && !document.hidden) {
      screenMaterial.color.setScalar(
        0.35 +
          0.65 * Math.min(1, (performance.now() - screenFadeStarted) / 220),
      );
      renderer.render(scene, camera);
    }
  };
  const raycaster = new THREE.Raycaster();
  const pressOrigins = new Map<THREE.Object3D, number>();
  return {
    animating: () => performance.now() - screenFadeStarted < 220,
    lowerResolution() {
      if (!disposed)
        renderer.setPixelRatio(Math.min(1, window.devicePixelRatio || 1));
    },
    resize(w, h) {
      if (width === w && height === h) return;
      width = w;
      height = h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    },
    pose(pose, pointer) {
      if (!root || disposed) return;
      const span =
        2 *
        Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
        camera.position.z;
      root.position.set(
        (pose.x - 0.5) * span * camera.aspect,
        (0.5 - pose.y) * span,
        0,
      );
      root.scale.setScalar((span * pose.height) / 5.6);
      root.rotation.set(
        pose.rx + pointer.y * 0.035,
        pose.ry + pointer.x * 0.055,
        pose.rz + pointer.x * 0.013,
      );
      root.updateMatrixWorld();
      render();
    },
    screen(content) {
      screenFadeStarted = performance.now();
      drawScreen(screenCanvas, content);
      texture.needsUpdate = true;
      render();
    },
    hit(x, y) {
      if (!root || disposed) return null;
      raycaster.setFromCamera(
        new THREE.Vector2((x / width) * 2 - 1, 1 - (y / height) * 2),
        camera,
      );
      for (const intersection of raycaster.intersectObject(root, true)) {
        let node: THREE.Object3D | null = intersection.object;
        while (node && node !== root) {
          if (node.name === "ControlA") return "demo";
          if (node.name === "ControlDPad") return "previous";
          if (/^Control(?:Stick|B|X|Y)/.test(node.name)) return "next";
          node = node.parent;
        }
      }
      return null;
    },
    press(action, pressed) {
      const control = root?.getObjectByName(
        action === "demo"
          ? "ControlA"
          : action === "previous"
            ? "ControlDPad"
            : "ControlX",
      );
      if (!control) return;
      if (!pressOrigins.has(control))
        pressOrigins.set(control, control.position.z);
      control.position.z = pressOrigins.get(control)! - (pressed ? 0.045 : 0);
      render();
    },
    dispose() {
      signal.removeEventListener("abort", dispose);
      dispose();
    },
  };
}

function drawScreen(canvas: HTMLCanvasElement, content: ScreenContent) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const { width, height } = canvas;
  context.fillStyle = "#050a10";
  context.fillRect(0, 0, width, height);
  const glow = context.createLinearGradient(0, 0, width, height);
  glow.addColorStop(0, "#152230");
  glow.addColorStop(1, "#070b12");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#f0f5fb";
  context.font = "600 37px Space, Arial, sans-serif";
  context.fillText("XEVEN", 54, 68);
  context.font = "22px Space, Arial, sans-serif";
  context.fillStyle = "#a7b6c6";
  context.fillText("CONVERSATION / 007", 662, 65);
  context.strokeStyle = "#354251";
  context.beginPath();
  context.moveTo(52, 98);
  context.lineTo(972, 98);
  context.stroke();
  context.fillStyle = "#a4b6c9";
  context.font = "24px Space, Arial, sans-serif";
  context.fillText("YOU", 55, 152);
  context.fillStyle = "#edf3fb";
  context.font = "35px Space, Arial, sans-serif";
  const qEnd = wrap(context, content.question, 54, 199, 900, 46);
  context.fillStyle = "#8ad6ea";
  context.font = "24px Space, Arial, sans-serif";
  context.fillText("XEVEN", 55, qEnd + 65);
  context.fillStyle = "#e6edf7";
  context.font = "34px Space, Arial, sans-serif";
  wrap(context, content.answer, 54, qEnd + 112, 898, 47);
  context.fillStyle = "#9db0c5";
  context.font = "19px Space, Arial, sans-serif";
  context.fillText(content.tag, 54, 628);
  context.strokeStyle = "#344455";
  context.beginPath();
  context.moveTo(52, 651);
  context.lineTo(972, 651);
  context.stroke();
  context.font = "19px Space, Arial, sans-serif";
  context.fillText("SCRIPTED PREVIEW", 54, 684);
  context.fillText("A  /  VIEW CHAT", 786, 684);
}
function wrap(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (context.measureText(next).width > maxWidth && line) {
      context.fillText(line, x, y);
      y += lineHeight;
      line = word;
    } else line = next;
  }
  context.fillText(line, x, y);
  return y;
}
