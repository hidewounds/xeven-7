"use client";
import NativeLink from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";
import { usePageTransition } from "./page-transition";
import { pageSearchParams } from "@/lib/page-location";
export default function Link({
  href,
  onClick,
  ...props
}: ComponentProps<typeof NativeLink>) {
  const navigate = usePageTransition();
  const path = usePathname();
  function click(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      props.target === "_blank" ||
      props.download ||
      typeof href !== "string" ||
      !href.startsWith("/") ||
      href.startsWith("//")
    )
      return;
    const destination = new URL(href, window.location.href);
    if (destination.pathname === path) {
      if (destination.search.slice(1) === pageSearchParams().toString()) {
        event.preventDefault();
        const target =
          destination.hash &&
          document.getElementById(destination.hash.slice(1));
        if (target) target.scrollIntoView({ behavior: "smooth" });
        else window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }
    event.preventDefault();
    navigate(href);
  }
  return <NativeLink {...props} href={href} onClick={click} />;
}
