"use client";

import Link from "@/components/transition-link";
import { HARDWARE_NOTE, SALES_EMAIL } from "@/lib/xeven-content";
import { PageTransitionProvider } from "./page-transition";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowUp, Menu, Send } from "lucide-react";
import type { SVGProps } from "react";
function InstagramMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
function XMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.2 21H2.1l7.3-8.3L2 3h6.4l4.4 5.9L17.8 3zm-1.1 16.1h1.7L7.4 4.8H5.6l11.1 14.3z" />
    </svg>
  );
}
function YouTubeMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.5 9.8v4.4l4-2.2z" fill="currentColor" stroke="none" />
    </svg>
  );
}
function LinkedInMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6.9 8.6H3.6V21h3.3V8.6zM5.2 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM12.4 13.4c0-1.1.6-2.3 2.3-2.3 1.6 0 2.2 1.1 2.2 2.6V21h3.3v-7.9c0-3-1.6-4.7-4.3-4.7-1.7 0-2.9.9-3.5 1.9V8.6h-3.3V21h3.3v-7.6z" />
    </svg>
  );
}
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
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!cinematic) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [cinematic]);
  return (
    <>
      <Link className="skip-link" href="#main-content">
        Skip to content
      </Link>
      <header
        className={`global-header ${cinematic ? "story-header" : ""} ${cinematic && scrolled ? "scrolled" : ""}`}
      >
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
const SOCIALS = [
  { label: "Instagram", Icon: InstagramMark },
  { label: "X", Icon: XMark },
  { label: "YouTube", Icon: YouTubeMark },
  { label: "LinkedIn", Icon: LinkedInMark },
];
function Newsletter() {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  return (
    <form
      className="newsletter-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
          setNote("That email does not parse — try again.");
          return;
        }
        setNote("");
        window.location.href = `mailto:${SALES_EMAIL}?subject=${encodeURIComponent("XEVEN updates")}&body=${encodeURIComponent(`Please send XEVEN updates to ${email.trim()}.`)}`;
      }}
    >
      <label htmlFor="newsletter-email">Field notes, occasionally.</label>
      <div>
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button type="submit" aria-label="Subscribe by email">
          <Send size={16} />
        </button>
      </div>
      {note ? (
        <p role="alert">{note}</p>
      ) : (
        <p>Opens your mail app — nothing subscribes silently.</p>
      )}
    </form>
  );
}
export function Footer({
  onReplay,
  cinematic = false,
}: {
  onReplay?: () => void;
  cinematic?: boolean;
}) {
  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
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
            <div className="footer-social">
              <p className="eyebrow">Elsewhere</p>
              <div className="social-logos">
                {SOCIALS.map(({ label, Icon }) => (
                  <span key={label} title={`${label} — coming soon`}>
                    <Icon />
                    <span className="sr-only">{label} (coming soon)</span>
                  </span>
                ))}
              </div>
              <p className="social-note">Profiles open here soon.</p>
            </div>
            <Newsletter />
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
            <button
              className="setting-button"
              type="button"
              onClick={toTop}
            >
              Back to top <ArrowUp size={14} />
            </button>
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
