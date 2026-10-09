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
const assetPrefix = {
  name: "xeven-file-safe-assets",
  transform(code, rawId) {
    const id = rawId.replaceAll("\\", "/");
    const marker = "/node_modules/";
    const index = id.lastIndexOf(marker);
    if (index >= 0) {
      const prefix = id.slice(0, index + marker.length);
      const parts = id.slice(index + marker.length).split("/");
      packageRoots.add(
        prefix + parts.slice(0, parts[0].startsWith("@") ? 2 : 1).join("/"),
      );
    }
    if (
      !id.startsWith(root.replaceAll("\\", "/")) ||
      id.includes("node_modules") ||
      !/\.[jt]sx?$/.test(id)
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
// Only current runtime imagery is distributed to the viewer.
const runtimeAssets = new Set([
  "orb-poster.webp",
  "fragment.webp",
  "fragment-small.webp",
  "horizon.webp",
  "horizon-small.webp",
  "console.webp",
  "console-small.webp",
  "logo-spider.svg",
  "logo-lockup.svg",
  "logo-spider-light.svg",
  "social-preview.png",
  "social-preview.svg",
]);
for (const name of await readdir(join(output, "assets/xeven"))) {
  if (!runtimeAssets.has(name))
    await rm(join(output, "assets/xeven", name), { force: true });
}
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
<html lang="en" data-page="${route}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark light"><meta name="description" content="XEVEN connects business knowledge, customer context, and next steps."><title>XEVEN</title><link rel="icon" href="./assets/favicon.svg"><link rel="stylesheet" href="./assets/style.css"></head><body><div id="app"></div><noscript><p style="padding:40px;color:white;background:#030507;font:18px Arial">Enable JavaScript to explore XEVEN. For commercial access, email hello@xeven.world.</p></noscript><script defer src="./assets/app.js"></script><script src="https://xeven-ai-hidewounds-9658.vercel.app/widget/xeven-tracker.js" data-public-key="xeven_pk_pub_2d74e3ed98639ffd4972f702ec338e93" defer></script><script src="https://xeven-ai-hidewounds-9658.vercel.app/widget/xeven-widget.js" data-public-key="xeven_pk_pub_2d74e3ed98639ffd4972f702ec338e93" defer></script></body></html>\n`,
  );
}
const readme = `XEVEN — COMPLETE OFFLINE WEBSITE / PARTICLE EDITION

1. Extract the entire ZIP first.
2. Open index.html in a current browser.
3. Keep all six HTML files beside the assets folder.

No server, installation, network connection, account, API key, or build step is needed for viewing. Fonts, console imagery, React, Three.js, geometry, styles, and animations are bundled locally.

The 6.25-second entrance starts with a compact intact fibrous orb, dissolves it into particles, spreads them across the viewport, and clears their field continuously into Home. No four-part breakup or stretch is used. It plays on a fresh Home load/reload and after 25 minutes of inactivity, never on ordinary page changes. Skip and Escape are available. No sound is used; motion is always enabled.

Ordinary page links swipe within the same document using file-safe hash history. Back/Forward work. New tabs can open the six physical HTML files. The space background continues behind the transparent console display. WebGL2 renders the orb; its reference-based texture is embedded directly to avoid local-file texture restrictions. Animated image/vector fallbacks handle unsupported graphics.

The footer contains socials and a newsletter field, with no page-navigation links. Instagram, X, and LinkedIn are marked Soon until official profile URLs are entered in source/lib/social-links.ts. GitHub opens the existing project repository. Email and the newsletter request open your mail application. Sending requires connectivity; the newsletter has no automatic subscription backend. The chatbot demo is scripted and labelled. It does not call a live AI service or create bookings. Enquiries can be reviewed, copied or downloaded locally. No form silently sends data.

Runtime assets and source code match the hosted edition. Browser/GPU support, font rasterization, viewport dimensions, and performance can still differ across computers; identical pixels on every device cannot be guaranteed.

brand/ contains the new flat angular spider logo masters with a transparent X cut-out. The spider is no longer an animated scene or illustration. source/ contains the editable project and archived design studies, package lock, references, scripts and documentation. licenses/ contains dependency notices.

For editing, use Node.js 22.13+ and the package manager in source/package.json. The viewer already includes its runtime dependencies; source/node_modules is intentionally excluded. No credentials, account permissions, or original hosting identity are included.

Rebuild: node scripts/export-offline.mjs /absolute/output/folder
See REBUILD-NOTES.md for details.
`;
await writeFile(join(output, "START-HERE.txt"), readme);
await cp(join(root, "docs/rebuild-notes.md"), join(output, "REBUILD-NOTES.md"));
await mkdir(join(output, "brand"), { recursive: true });
for (const name of [
  "logo-spider.svg",
  "logo-lockup.svg",
  "logo-spider-light.svg",
]) {
  await cp(join(root, "public/xeven", name), join(output, "brand", name));
}
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
  "assets",
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
      hashes[relative(output, path).split("\\").join("/")] = createHash(
        "sha256",
      )
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
