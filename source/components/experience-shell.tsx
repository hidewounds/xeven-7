"use client";

import Link from "@/components/transition-link";
import { SALES_EMAIL } from "@/lib/xeven-content";
import { PageTransitionProvider } from "./page-transition";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, Mail, GitFork } from "lucide-react";
import { SocialIcon } from "./social-icon";
import { SOCIAL_PROFILES } from "@/lib/social-links";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { usePathname } from "next/navigation";
import { SpaceScene } from "./space-scene";
import OrbIntro from "./orb-intro";
import { createIntroSession, INTRO_TIMEOUT } from "@/lib/intro-session";

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
  const path = usePathname() || "/";
  const [ready, setReady] = useState(false);
  const [intro, setIntro] = useState(path === "/");
  const session = useRef<ReturnType<typeof createIntroSession> | null>(null);
  const currentPath = useRef(path);
  const playing = useRef(intro);
  currentPath.current = path;
  playing.current = intro;
  const begin = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setIntro(true);
  };
  const finish = () => {
    session.current?.finish(Date.now());
    setIntro(false);
    requestAnimationFrame(() =>
      document
        .querySelector<HTMLElement>("#main-content")
        ?.focus({ preventScroll: true }),
    );
  };
  useEffect(() => {
    session.current ??= createIntroSession(path, Date.now());
    if (session.current.enter(path, Date.now())) begin();
    else if (path !== "/") setIntro(false);
  }, [path]);
  useEffect(() => {
    document.documentElement.dataset.motion = "full";
    setReady(true);
    let timer: ReturnType<typeof setTimeout>;
    let lastEvent = 0;
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(activity, INTRO_TIMEOUT + 20);
    };
    function activity() {
      if (document.hidden) return;
      const now = Date.now();
      if (now - lastEvent < 800) return;
      lastEvent = now;
      if (
        !playing.current &&
        session.current?.activity(currentPath.current, now)
      )
        begin();
      schedule();
    }
    schedule();
    const events = ["pointerdown", "pointermove", "keydown", "scroll"] as const;
    events.forEach((event) =>
      window.addEventListener(event, activity, { passive: true }),
    );
    document.addEventListener("visibilitychange", activity);
    return () => {
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, activity));
      document.removeEventListener("visibilitychange", activity);
    };
  }, []);
  return (
    <ExperienceContext.Provider
      value={{ ready, reduced: false, quality: "full" }}
    >
      <div className={`experience-root ${intro ? "intro-active" : ""}`}>
        <SpaceScene />
        <PageTransitionProvider>{children}</PageTransitionProvider>
        {intro && <OrbIntro onComplete={finish} />}
      </div>
    </ExperienceContext.Provider>
  );
}
export const useExperience = () => useContext(ExperienceContext);
export function XevenMark() {
  return (
    <img
      className="spider-mark"
      src="/xeven/logo-spider-light.svg"
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
    const update = () => setScrolled(window.scrollY > 40);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <>
      <Link className="skip-link" href="#main-content">
        Skip to content
      </Link>
      <header
        className={`global-header ${cinematic ? "story-header" : ""} ${scrolled ? "header-scrolled" : ""}`}
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
export function Footer({ cinematic = false }: { cinematic?: boolean }) {
  return (
    <footer
      id="site-footer"
      className={`global-footer ${cinematic ? "console-footer" : ""}`}
      data-console-footer={cinematic || undefined}
    >
      <div className="footer-stage">
        {!cinematic && (
          <picture>
            <source
              media="(max-width: 700px)"
              srcSet="/xeven/horizon-small.webp"
            />
            <img
              className="footer-horizon"
              src="/xeven/horizon.webp"
              width="1916"
              height="821"
              alt=""
              loading="lazy"
            />
          </picture>
        )}
        <div className="footer-content">
          <div className="footer-top">
            <div className="footer-identity">
              <div className="brand" aria-label="XEVEN">
                <Wordmark />
              </div>
              <p>
                Stay in
                <br />
                the loop.
              </p>
            </div>
            <div className="footer-social">
              <p className="eyebrow">SOCIALS</p>
              <div className="social-links">
                {SOCIAL_PROFILES.map((profile) =>
                  profile.url ? (
                    <a
                      key={profile.name}
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <SocialIcon name={profile.icon} />
                      <span>{profile.name}</span>
                      <ArrowUpRight size={14} />
                    </a>
                  ) : (
                    <span
                      className="social-pending"
                      key={profile.name}
                      aria-label={`${profile.name} — coming soon`}
                    >
                      <SocialIcon name={profile.icon} />
                      <span>{profile.name}</span>
                      <small>Soon</small>
                    </span>
                  ),
                )}
                <a
                  href="https://github.com/hidewounds/xeven-7"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GitFork size={18} />
                  <span>GitHub</span>
                  <ArrowUpRight size={14} />
                </a>
                <a href={`mailto:${SALES_EMAIL}`}>
                  <Mail size={18} />
                  <span>Email</span>
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
            <form
              className="footer-newsletter"
              onSubmit={(event) => {
                event.preventDefault();
                const email = new FormData(event.currentTarget).get("email");
                window.location.href = `mailto:${SALES_EMAIL}?subject=${encodeURIComponent("XEVEN newsletter")}&body=${encodeURIComponent(`Please send the XEVEN newsletter to ${email}.`)}`;
              }}
            >
              <label htmlFor={`updates-${cinematic ? "home" : "page"}`}>
                Newsletter.
              </label>
              <div className="footer-email-field">
                <input
                  id={`updates-${cinematic ? "home" : "page"}`}
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Your email"
                  required
                  maxLength={254}
                />
                <button type="submit" aria-label="Request updates by email">
                  <ArrowUpRight size={20} />
                </button>
              </div>
              <small>Opens an email request.</small>
            </form>
          </div>
          <div className="footer-bottom">
            <span>© 2026 XEVEN</span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Back to top ↑
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
