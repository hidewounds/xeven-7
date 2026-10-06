import { useSyncExternalStore } from "react";
import { ROUTES, localHref, type Route } from "./routes";
export const subscribeRoute = (notify: () => void) => {
  window.addEventListener("popstate", notify);
  window.addEventListener("hashchange", notify);
  return () => {
    window.removeEventListener("popstate", notify);
    window.removeEventListener("hashchange", notify);
  };
};
export function currentRoute(): Route {
  if (typeof window === "undefined") return "/";
  const override = window.location.hash.startsWith("#/")
    ? (new URL(window.location.hash.slice(1), "https://xeven.invalid")
        .pathname as Route)
    : null;
  if (override && override in ROUTES) return override;
  const file = window.location.pathname.split("/").pop();
  return (
    (Object.keys(ROUTES) as Route[]).find(
      (route) => ROUTES[route].file === file,
    ) || "/"
  );
}
export function usePathname() {
  return useSyncExternalStore(subscribeRoute, currentRoute, () => "/");
}
const router = {
  push(href: string) {
    const destination = new URL(localHref(href), window.location.href);
    const file = destination.pathname.split("/").pop();
    const route = (Object.keys(ROUTES) as Route[]).find(
      (key) => ROUTES[key].file === file,
    );
    if (!route) return;
    // Native fragment navigation works without a server and preserves Back/Forward.
    window.location.hash = route + destination.search + destination.hash;
    document.documentElement.dataset.page = route;
    document.title = "XEVEN";
  },
  back() {
    window.history.back();
  },
  forward() {
    window.history.forward();
  },
  prefetch() {},
  refresh() {
    window.location.reload();
  },
};
export function useRouter() {
  return router;
}
