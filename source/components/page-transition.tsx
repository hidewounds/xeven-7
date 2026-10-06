"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
const TransitionContext = createContext<(href: string) => void>(() => {});
export const usePageTransition = () => useContext(TransitionContext);
/** A silent desktop-window handoff shared by hosted and offline routes. */
export function PageTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const path = usePathname();
  const [phase, setPhase] = useState("idle");
  const [destination, setDestination] = useState("");
  const previous = useRef(path);
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recovery = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const navigate = useCallback(
    (href: string) => {
      if (busy.current) return;
      busy.current = true;
      setDestination(
        (
          href.split(/[?#]/)[0].split("/").filter(Boolean).pop() || "Product"
        ).replace(/\.html$/, ""),
      );
      frame.current?.style.setProperty(
        "--switch-origin",
        `${window.scrollY + window.innerHeight * 0.5}px`,
      );
      setPhase("leaving");
      timer.current = setTimeout(() => {
        router.push(href);
        recovery.current = setTimeout(() => {
          setPhase("idle");
          busy.current = false;
        }, 2200);
      }, 280);
    },
    [router],
  );
  useEffect(() => {
    if (previous.current === path) return;
    previous.current = path;
    if (recovery.current) clearTimeout(recovery.current);
    if (timer.current) clearTimeout(timer.current);
    if (busy.current) window.scrollTo({ top: 0, behavior: "instant" });
    setPhase("entering");
    frame.current?.style.setProperty(
      "--switch-origin",
      `${window.innerHeight * 0.5}px`,
    );
    timer.current = setTimeout(() => {
      setPhase("idle");
      busy.current = false;
      if (!document.querySelector(".spider-intro"))
        document
          .querySelector<HTMLElement>("#main-content")
          ?.focus({ preventScroll: true });
    }, 700);
  }, [path]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (recovery.current) clearTimeout(recovery.current);
    },
    [],
  );
  return (
    <TransitionContext.Provider value={navigate}>
      <div className={`app-switch ${phase}`} aria-hidden="true">
        <i />
        <i />
        <span>XEVEN / {destination}</span>
        <b />
      </div>
      <div ref={frame} className={`app-page-frame page-${phase}`} key={path}>
        {children}
      </div>
    </TransitionContext.Provider>
  );
}
