"use client";

import Link from "@/components/transition-link";
import { HARDWARE_NOTE, SALES_EMAIL } from "@/lib/xeven-content";
import { PageTransitionProvider } from "./page-transition";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type Experience = { ready: boolean; reduced: false; quality: "full" };
const ExperienceContext = createContext<Experience>({
  ready: false,
  reduced: false,
  quality: "full",
});

/** Full spatial motion is the fixed experience; no audio is created. */
export function ExperienceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    document.documentElement.dataset.motion = "full";
    setReady(true);
  }, []);
  return (
    <ExperienceContext.Provider
      value={{ ready, reduced: false, quality: "full" }}
    >
      <PageTransitionProvider>{children}</PageTransitionProvider>
    </ExperienceContext.Provider>
  );
}
export const useExperience = () => useContext(ExperienceContext);
export function XevenMark() {
  return (
    <img
      className="spider-mark"
      src="/xeven/logo-spider.svg"
      width="40"
      height="40"
      alt=""
      aria-hidden="true"
    />
  );
}
export function Wordmark() {
  return (
    <>
      <XevenMark />
      <span className="wordmark-letters">XEVEN</span>
    </>
  );
}
const links = [
  { href: "/", label: "Product" },
  { href: "/platform", label: "Technology" },
  { href: "/about", label: "About" },
  { href: "/plans", label: "Plans" },
];
export function Header({
  active = "/",
  cinematic = false,
}: {
  active?: string;
  cinematic?: boolean;
}) {
  const [menu, setMenu] = useState(false);
  return (
    <>
      <Link className="skip-link" href="#main-content">
        Skip to content
      </Link>
      <header className={`global-header ${cinematic ? "story-header" : ""}`}>
        <Link href="/" className="brand" aria-label="Xeven home">
          <Wordmark />
        </Link>
        <nav aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-end">
          <Link
            href="/demo"
            className="header-demo"
            aria-current={active === "/demo" ? "page" : undefined}
          >
            Try the demo <ArrowUpRight size={15} />
          </Link>
          <Link className="access-button" href="/contact">
            Get XEVEN
          </Link>
          <button
            className="menu-button"
            aria-label="Open navigation"
            onClick={() => setMenu(true)}
          >
            <Menu size={22} />
          </button>
        </div>
      </header>
      <Dialog open={menu} onOpenChange={setMenu}>
        <DialogContent className="nav-dialog">
          <DialogTitle className="eyebrow">Explore XEVEN</DialogTitle>
          {links.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenu(false)}
            >
              <small>0{index + 1}</small>
              {link.label}
            </Link>
          ))}
          <Link href="/demo" onClick={() => setMenu(false)}>
            <small>05</small>Guided demo
          </Link>
          <Link
            href="/contact"
            className="nav-contact"
            onClick={() => setMenu(false)}
          >
            Get XEVEN <ArrowUpRight />
          </Link>
        </DialogContent>
      </Dialog>
    </>
  );
}
export function Footer({
  onReplay,
  cinematic = false,
}: {
  onReplay?: () => void;
  cinematic?: boolean;
}) {
  return (
    <footer
      id="site-footer"
      className={`global-footer ${cinematic ? "console-footer" : ""}`}
      data-console-footer={cinematic || undefined}
    >
      <div className="footer-stage">
        <picture>
          <source
            media="(max-width: 700px)"
            srcSet="/xeven/horizon-small.webp"
          />
          <img
            className="footer-horizon"
            src="/xeven/horizon.webp"
            alt=""
            width="1916"
            height="821"
            loading="lazy"
          />
        </picture>
        <div className="footer-content">
          <div className="footer-top">
            <div>
              <Link className="brand" href="/" aria-label="Xeven home">
                <Wordmark />
              </Link>
              <p>
                A little context.
                <br />A better conversation.
              </p>
              <Link href="/contact" className="outline-pill">
                Make it yours <ArrowUpRight size={17} />
              </Link>
            </div>
            <nav aria-label="Footer navigation">
              {links.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
              <Link href="/demo">Guided demo</Link>
              <Link href="/contact">Contact sales</Link>
            </nav>
            <div
              className="footer-signature"
              aria-hidden={cinematic || undefined}
            >
              <XevenMark />
              <span>
                CONNECTED
                <br />
                BY DESIGN.
              </span>
            </div>
          </div>
          <div className="footer-replay">
            {onReplay && (
              <button className="setting-button" onClick={onReplay}>
                Replay introduction ↗
              </button>
            )}
          </div>
          <div className="footer-product-note">
            <p>{HARDWARE_NOTE}</p>
            <div>
              <a href={`mailto:${SALES_EMAIL}`}>{SALES_EMAIL}</a>
              <span>No payment taken here.</span>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 XEVEN</span>
            <span>AI PLATFORM · HANDHELD INTERFACE CONCEPT</span>
            <span>ONE THREAD. MORE POSSIBILITY.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
export function PageShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  return (
    <div className="inner-page">
      <Header active={active} />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
export function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useExperience();
  useEffect(() => {
    const node = ref.current;
    if (!node || reduced || !("IntersectionObserver" in window)) return;
    node.classList.add("will-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          node.classList.add("revealed");
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      node.classList.remove("will-reveal");
    };
  }, [reduced]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
