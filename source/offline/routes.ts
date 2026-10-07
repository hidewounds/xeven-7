export const ROUTES = {
  "/": { file: "index.html", title: "XEVEN" },
  "/platform": { file: "platform.html", title: "XEVEN" },
  "/about": { file: "about.html", title: "XEVEN" },
  "/plans": { file: "plans.html", title: "XEVEN" },
  "/demo": { file: "demo.html", title: "XEVEN" },
  "/contact": { file: "contact.html", title: "XEVEN" },
} as const;
export type Route = keyof typeof ROUTES;
export function localHref(href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const match = href.match(/^([^?#]*)(.*)$/)!;
  const route = (match[1].replace(/\/$/, "") || "/") as Route;
  if (!(route in ROUTES)) throw new Error(`Unknown offline page: ${route}`);
  return `./${ROUTES[route].file}${match[2]}`;
}
