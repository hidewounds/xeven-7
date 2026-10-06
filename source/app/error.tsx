"use client";
import Link from "@/components/transition-link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main-content" className="error-page">
      <p className="eyebrow">A CONNECTION WAS INTERRUPTED</p>
      <h1>Let’s try again.</h1>
      <p>
        This part of the experience could not load. Retry the page or return to
        the product.
      </p>
      <button className="primary-button" onClick={reset}>
        Try again
      </button>{" "}
      <Link className="secondary-button" href="/">
        Return to XEVEN
      </Link>
    </main>
  );
}
