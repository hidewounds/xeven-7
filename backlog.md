# XEVEN — Phase 1 Backlog (frozen 2026-09-12, steps 1–9 evidence)

Scope frozen: map-only phase found zero blank routes, zero dead links, zero console errors; fixes belong to their numbered steps, nothing else.

# XEVEN 1→100 — run record 2026-09-13 (steps 51–100, gateless: no .git in tree)
- Phase 6 (51–60) CLOSED: hero balanced 4 widths; StageScene scroll-link verified by frame pair; mani 16/16 + pins monotonic; caps 0.93/0.55 never-filter; reel exact full travel + resize re-measure; proc 0→1; counters exact + reverse; tier hover mint + nav; foot line-height fix (24→124px box).
- Phase 7 (61–70) CLOSED: pill-ghost filter system + aria-pressed; accordion single-open first-default; pricing CTAs → #/contact; contact required-states + named success; rhythm/mono identical; actives + burger stagger; 390 overflow 0; 2-click reachability.
- Phase 8 (71–80) CLOSED: 390/768/1920 verified; touch targets ≥44px (burger/logo/links/mnav/mailto/skip/inputs); 100svh hero; landscape intact; 60fps mobile rAF; type floor 11px mono system; media preload-none + 16/10.
- Phase 9 (81–90) CLOSED: OG/Twitter + real og.jpg (103KB, 1/50) + JSON-LD Organization; fonts-blocked sane.
- Phase 10 (91–100): keyboard/ARIA/contrast(≥6.03)/reduced-motion/final-set(12+10)/chunks-traced CLOSED; commit+push+deploy BLOCKED (no .git, no remote/auth); live smoke BLOCKED (no live URL).
- Post-100 founder direction (cursor calm, round 2 — executed fully): ribbon paint REMOVED (CursorTrail is aura-only; sole remaining paint call is the debug red dot); StageScene DELETED (`src/three/` gone) so enter background = subpage background (void + lattice); three/R3F/postprocessing uninstalled (71→39 modules, 979kB chunk gone, >500kB warning gone); package.json matches reality; og.jpg re-captured lattice-only (~58KB). Rechecked twice: sweep frame pair (zero streak, hero intact) + fresh-browser structural/smoke pass (no .gl-fixed, 6/6 routes full copy, aura tracks exact, debug pipeline alive, zero errors).

- [x] Step 11: `src/three/CityScene.tsx` (776 lines) has zero imports — DELETED (+ empty `audio/`, `shaders/` dirs).
- [x] Step 11: `src/audio/sound.ts` has zero imports — DELETED.
- [x] Step 11: `src/shaders/trail.vert/frag.glsl` have zero imports (CursorTrail v2 is 2D canvas) — DELETED.
- [x] Step 14: `lucide-react`, `valtio`, `clsx` installed but zero `src/` imports — KEPT per standing rule (import only when a step requires); `@react-three/drei` (also zero imports, not reserved) UNINSTALLED; `npm ls` sane, 21 pkgs.
- [x] Step 21: all 8 route chunks PASS (<15KB raw, <6KB gzip; EnterStage largest at 13.83/5.80) — 7 lazy boundaries already split, no action.
- [x] Step 29: re-measured vs Step-3 baseline — CSS −3456B; 5 route chunks byte-identical; 4 deltas all traced to approved step work (VideoCard +239 Step 24, Gate +329 Step 23, EnterStage +29 Steps 17/28, index +1847 Steps 18/19/27, StageScene +300 Step 23). Vendor split REJECTED with reason: route splitting already optimal (all route chunks <6kB gzip), further splits add requests for zero byte savings, three.js must stay whole in its lazy never-first-paint chunk.
- [x] Step 22: verified already correct — `display=swap` present (CSS2 serves `font-display:swap` ×24), preconnect ×2 (gstatic +crossorigin), `document.fonts.ready→ScrollTrigger.refresh()` wired; live: fonts.status=loaded, H1=Anton stack, overflowX=0. No edit.
- [x] Step 18: tapping current-route link in mobile menu left overlay open (`navBus.go` guard) — FIXED: mnav links now `setOpen(false)` on tap; verified same-route closes + cross-route navigates-and-closes, zero errors.
- [x] Step 61: Worlds filter pill active-state READ FIXED (Phase 7): quiet ghost idle + mint active (new `.pill-ghost`), aria-pressed; verified 6/2/2/2 cells + hover scale 1.02.
- [x] Step 28: reduced-motion kills ALL loops — GraphBg draws one static frame (1008 lit dot samples, then silent); EnterStage skips SplitText/pins/scrubs (pinSpacers 0) with CSS final states (mani 16/16, proc line identity, reel column) + final counter values; still-frame 3s apart = 0/90000 pixels differ. Full-motion scrub re-verified 16/16.
- [ ] Step 31–39: baseline captures at 2.5s settle caught mid-intro wash on mobile-enter — use longer settle for index baselines.
- [x] Step 15: `reference-mockup/` file renamed to canonical `jera-ref.jpg`; ASSET_MANIFEST (CityScene→StageScene, verify/dev-only rule) + REFERENCES (geometry-lock note, Phase-2 record) updated.
- [ ] Step 10-note: `Temp\opencode\shots` + `Temp\butter` archives absent — no prior-evidence regression possible.
- [x] Step 64-note (Phase 7): Pricing tiers FIXED with per-tier "Begin with X →" CTA → #/contact; tops equal, FAQ works.
- [x] Step 17: zero step-5 console errors confirmed still zero; fixed real warning found en route — `ScrollTrigger.create({trigger:'.st-scroll'})` never attached inside `gsap.context` (root isn't its own descendant) so the StageScene scroll/velocity mirror was dead → `trigger: root.current`, warning gone, manifesto scrub verified 16/16 lit.
- [ ] Step 52-note: `THREE.Clock` deprecation warning comes from inside `@react-three/fiber` (three r186 prefers `Timer`) — needs three/R3F upgrade, approval first.
- [ ] Step 100-note: headless Edge ORB-blocks the Google sample videos (`ERR_BLOCKED_BY_ORB`, test-env artifact; fallback covers it) — confirm real media loads on the live URL.
- [x] Step 59 (Phase 6): `.st-foot h2` FIXED with `line-height: 0.95` — box 24→124px, 24px clear gap to mailto.
