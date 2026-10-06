export const ROUTES = {
  "/": { file: "index.html", title: "XEVEN — Conversations beyond the screen" },
  "/platform": { file: "platform.html", title: "The platform · XEVEN" },
  "/about": { file: "about.html", title: "Connected by design · XEVEN" },
  "/plans": { file: "plans.html", title: "Plans · XEVEN" },
  "/demo": { file: "demo.html", title: "Guided demo · XEVEN" },
  "/contact": { file: "contact.html", title: "Talk to XEVEN" },
} as const;
export type Route = keyof typeof ROUTES;
export function localHref(href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const match = href.match(/^([^?#]*)(.*)$/)!;
  const route = (match[1].replace(/\/$/, "") || "/") as Route;
  if (!(route in ROUTES)) throw new Error(`Unknown offline page: ${route}`);
  return `./${ROUTES[route].file}${match[2]}`;
}
