"use client";
import { useEffect, useRef } from "react";
import { Dialog } from "radix-ui";
import { SpiderView } from "./spider-view";

export const INTRO_DURATION = 5200;
export default function SpiderIntro({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const skip = useRef<HTMLButtonElement>(null);
  const complete = useRef(onComplete);
  complete.current = onComplete;
  useEffect(() => {
    const deadline = window.setTimeout(
      () => complete.current(),
      INTRO_DURATION,
    );
    return () => window.clearTimeout(deadline);
  }, []);
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) complete.current();
      }}
    >
      <Dialog.Portal>
        <Dialog.Content
          className="spider-intro"
          aria-describedby="intro-description"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            skip.current?.focus();
          }}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <Dialog.Title className="sr-only">Welcome to XEVEN</Dialog.Title>
          <p className="sr-only" id="intro-description">
            The dimensional black-metal XEVEN spider descends on silk to the
            centre. Its articulated legs settle as light catches the recessed X
            on its back. The letters EVEN emerge from behind it to form XEVEN.
            The introduction finishes automatically.
          </p>
          <div className="intro-header" aria-hidden="true">
            <span className="intro-edition">X / 007</span>
            <span className="eyebrow">ONE THREAD. A NEW CONNECTION.</span>
          </div>
          <div className="intro-registration" aria-hidden="true">
            <span>01 — CONNECTION</span>
            <i />
            <span>ESTABLISHED</span>
          </div>
          <div className="intro-thread" aria-hidden="true" />
          <div className="intro-mark-position" aria-hidden="true">
            <div className="intro-spider-drop">
              <div className="intro-name-reveal">
                <span>EVEN</span>
              </div>
              <SpiderView mode="intro" className="intro-reference-spider" />
            </div>
          </div>
          <div className="intro-caption" aria-hidden="true">
            CONNECTED BY DESIGN
          </div>
          <div className="intro-progress" aria-hidden="true">
            <i />
          </div>
          <div className="intro-footer">
            <button ref={skip} onClick={() => complete.current()}>
              Skip introduction ↗
            </button>
            <span>KNOWLEDGE × CONTEXT</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
