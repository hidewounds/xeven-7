import Link from "@/components/transition-link";
import { PageShell } from "@/components/experience-shell";
export default function NotFound() {
  return (
    <PageShell active="">
      <section className="error-page">
        <p className="eyebrow">404 / A LOOSE THREAD</p>
        <h1>Let’s reconnect.</h1>
        <p>
          This page is not part of the XEVEN experience. Return to the product
          or explore a guided conversation.
        </p>
        <Link className="primary-button" href="/">
          Back to XEVEN ↗
        </Link>{" "}
        <Link className="secondary-button" href="/demo">
          Try the demo
        </Link>
      </section>
    </PageShell>
  );
}
