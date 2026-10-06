import { build } from "vite";
import {
  mkdir,
  readFile,
  writeFile,
  cp,
  readdir,
  stat,
  rm,
} from "node:fs/promises";
import { resolve, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = resolve(process.argv[2] || join(root, "outputs/xeven-offline"));
if (output === root || root.startsWith(output + "/"))
  throw new Error("Export must be outside the source root or inside outputs.");
const bundleDir = join(root, "outputs/offline-bundle");
await mkdir(output, { recursive: true });
// Remove only prior generated trees so superseded code/assets never survive an export.
for (const name of [
  "source",
  "assets",
  "brand",
  "licenses",
  "CHANGES.patch",
  "BUILD-INFO.json",
])
  await rm(join(output, name), { recursive: true, force: true });
const packageRoots = new Set();
// NOTE (Windows fix): Vite module ids always use forward slashes while
// fileURLToPath returns backslashes here — compare normalized paths or the
// rewrite below silently never runs and the export keeps absolute URLs.
const rootPosix = root.replace(/\\/g, "/");
const assetPrefix = {
  name: "xeven-file-safe-assets",
  transform(code, id) {
    const marker = "/node_modules/";
    const index = id.lastIndexOf(marker);
    if (index >= 0) {
      const prefix = id.slice(0, index + marker.length);
      const parts = id.slice(index + marker.length).split("/");
      packageRoots.add(
        prefix + parts.slice(0, parts[0].startsWith("@") ? 2 : 1).join("/"),
      );
    }
    const normId = id.replace(/\\/g, "/");
    if (
      !normId.startsWith(rootPosix) ||
      normId.includes("node_modules") ||
      !/\.[jt]sx?$/.test(normId)
    )
      return;
    return { code: code.replaceAll("/xeven/", "./assets/xeven/"), map: null };
  },
};
await build({
  root,
  configFile: false,
  base: "./",
  publicDir: false,
  plugins: [assetPrefix],
  resolve: {
    alias: {
      "next/link": join(root, "offline/link.tsx"),
      "next/navigation": join(root, "offline/navigation.ts"),
      "@": root,
    },
  },
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: bundleDir,
    emptyOutDir: true,
    target: "es2020",
    sourcemap: false,
    minify: true,
    cssCodeSplit: false,
    lib: {
      entry: join(root, "offline/entry.tsx"),
      name: "XevenOffline",
      formats: ["iife"],
      fileName: () => "app.js",
      cssFileName: "style",
    },
  },
});
let css = await readFile(join(bundleDir, "style.css"), "utf8");
for (const name of ["space-regular.woff", "space-semibold.woff"]) {
  const font = await readFile(join(root, "public/fonts", name));
  css = css.replaceAll(
    `/fonts/${name}`,
    `data:font/woff;base64,${font.toString("base64")}`,
  );
}
if (/@import\s|url\(["']?\/(?!\/)/.test(css))
  throw new Error("Offline CSS retains a server-relative dependency.");
await mkdir(join(output, "assets"), { recursive: true });
await writeFile(join(output, "assets/style.css"), css);
await cp(join(bundleDir, "app.js"), join(output, "assets/app.js"));
await cp(join(root, "public/xeven"), join(output, "assets/xeven"), {
  recursive: true,
});
for (const name of ["favicon.svg", "favicon-32.png", "apple-touch-icon.png"])
  await cp(join(root, "public", name), join(output, "assets", name));
// The prior model is an archived design study, not a runtime dependency.
await rm(join(output, "assets/xeven/console.glb"), { force: true });
const routes = [
  ["/", "index.html", "XEVEN — Conversations beyond the screen"],
  ["/platform", "platform.html", "The platform · XEVEN"],
  ["/about", "about.html", "Connected by design · XEVEN"],
  ["/plans", "plans.html", "Plans · XEVEN"],
  ["/demo", "demo.html", "Guided demo · XEVEN"],
  ["/contact", "contact.html", "Talk to XEVEN"],
];
for (const [route, file, title] of routes) {
  await writeFile(
    join(output, file),
    `<!doctype html>
<html lang="en" data-page="${route}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark light"><meta name="description" content="XEVEN connects business knowledge, customer context, and next steps."><title>${title}</title><link rel="icon" href="./assets/favicon.svg"><link rel="stylesheet" href="./assets/style.css"></head><body><div id="app"></div><noscript><p style="padding:40px;color:white;background:#030507;font:18px Arial">Enable JavaScript to explore XEVEN. For commercial access, email hello@xeven.world.</p></noscript><script defer src="./assets/app.js"></script></body></html>\n`,
  );
}
const readme = `XEVEN — COMPLETE OFFLINE WEBSITE

1. Extract the entire ZIP first. Do not open HTML inside a ZIP viewer.
2. Open index.html in an up-to-date browser.
3. Keep the assets folder alongside all six HTML pages.

No installation, server, internet connection, account, API key or build step is required to explore the website. Fonts, images, the dimensional spider geometry, page code and animations are local.

The ready-to-open edition uses the same React components, content, styles, console artwork and motion choreography as the hosted site. It uses a classic script, with no dynamic imports or fetch requests. Ordinary page clicks use smooth app-style transitions and file-safe fragment history; the address can contain #/contact or another route. Browser Back/Forward work. Links also name real HTML files for direct entry or opening in a new tab. Plan, billing and scenario details are retained.

The website is silent and full motion is always enabled. The spider entrance plays on every fresh homepage load, even after earlier visits. Skip, Escape and Replay remain available. WebGL2 renders the actual articulated model; if graphics initialization fails, a transparent vector projection of that same geometry is shown. No white backing field is used for the spider.

The guided chatbot is a labelled scripted demonstration, not a live AI service. Enquiries can be downloaded as text offline. Opening email uses your mail app; sending needs connectivity. Clipboard permissions vary for local files, so manual copy and download remain available.

Responsive layouts, GPU capabilities, browser lighting/font rendering and performance vary between computers. All source assets/styles are included; pixel-identical rendering across every device is not guaranteed.

BRAND
The brand folder contains transparent SVG logo masters, the standalone 3D spider GLB, dimension/animation notes, geometry validation and an asset preview. REBUILD-NOTES.md lists the changes and rebuild steps.

SOURCE
The source folder contains the complete editable project, original references/assets, package lock, build scripts, licenses and design notes. It is optional for viewing. To develop it, use Node.js 22.13+ and the package manager in source/package.json, install dependencies and follow the documented scripts. Runtime dependencies are already bundled in assets/app.js; node_modules and credentials are excluded from editable source.

To rebuild the offline edition from source:
node scripts/export-offline.mjs /absolute/output/folder

The original hosted Site identity and account access controls are not part of the portable copy.
`;
await writeFile(join(output, "START-HERE.txt"), readme);
await cp(join(root, "docs/rebuild-notes.md"), join(output, "REBUILD-NOTES.md"));
await mkdir(join(output, "brand"), { recursive: true });
for (const name of [
  "spider-engraved.svg",
  "spider-3d.svg",
  "spider-front.svg",
  "xeven-spider.glb",
  "spider-flat.svg",
  "logo-spider.svg",
  "logo-lockup.svg",
  "spider-silhouette.svg",
])
  await cp(join(root, "public/xeven", name), join(output, "brand", name));
for (const name of [
  "spider-identity.md",
  "spider-design-preview.png",
  "spider-model-validation.json",
])
  await cp(join(root, "docs", name), join(output, "brand", name));
// Retain notices for compiled dependencies, without shipping node_modules.
await mkdir(join(output, "licenses"), { recursive: true });
for (const directory of packageRoots) {
  let metadata;
  try {
    metadata = JSON.parse(
      await readFile(join(directory, "package.json"), "utf8"),
    );
  } catch {
    continue;
  }
  for (const name of await readdir(directory)) {
    if (!/^(license|licence|copying|notice)(\.|$)/i.test(name)) continue;
    const path = join(directory, name);
    if (!(await stat(path)).isFile()) continue;
    await cp(
      path,
      join(
        output,
        "licenses",
        `${metadata.name.replaceAll("/", "__")}__${name}`,
      ),
    );
  }
}
await cp(
  join(root, "public/fonts/OFL.txt"),
  join(output, "licenses/Space-Grotesk-OFL.txt"),
);

// Editable source accompanies the ready-to-open files. No identity or local state.
const source = join(output, "source");
await mkdir(source, { recursive: true });
for (const name of [
  "app",
  "components",
  "lib",
  "hooks",
  "db",
  "build",
  "scripts",
  "public",
  "offline",
  "vendor",
  "docs",
]) {
  await cp(join(root, name), join(source, name), { recursive: true });
}
for (const name of [
  "README.md",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "tsconfig.json",
  "components.json",
  "postcss.config.mjs",
  "next.config.ts",
  "vite.config.ts",
  "eslint.config.mjs",
  "drizzle.config.ts",
  "cloudflare-env.d.ts",
  ".gitignore",
]) {
  await cp(join(root, name), join(source, name));
}
await mkdir(join(source, ".openai"), { recursive: true });
await writeFile(
  join(source, ".openai/hosting.json"),
  JSON.stringify({ d1: null, r2: null }, null, 2) + "\n",
);
const hashes = {};
async function inventory(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "source") await inventory(path);
    else if (entry.isDirectory()) continue;
    else if (entry.name !== "asset-checksums.json")
      hashes[relative(output, path)] = createHash("sha256")
        .update(await readFile(path))
        .digest("hex");
  }
}
await inventory(output);
await writeFile(
  join(output, "asset-checksums.json"),
  JSON.stringify(hashes, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    output,
    pages: routes.length,
    files: Object.keys(hashes).length,
    bundleBytes: (await stat(join(output, "assets/app.js"))).size,
  }),
);
