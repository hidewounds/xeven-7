import type { ComponentProps } from "react";
import { localHref } from "./routes";
import { currentRoute } from "./navigation";
import { pageSearchParams } from "@/lib/page-location";

/** File navigation preserves queries, anchors, browser history, and native links. */
export default function Link({ href, onClick, ...props }: ComponentProps<"a">) {
  return (
    <a
      {...props}
      href={localHref(href || "#")}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          !href?.startsWith("#")
        )
          return;
        const target = document.getElementById(href.slice(1));
        if (!target) return;
        event.preventDefault();
        const query = pageSearchParams().toString();
        const next = `#${currentRoute()}${query ? "?" + query : ""}${href}`;
        window.location.hash = next;
        target.scrollIntoView({ behavior: "smooth" });
        if (href === "#main-content") target.focus({ preventScroll: true });
      }}
    />
  );
}
