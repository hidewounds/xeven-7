"use client";
import { pageSearchParams } from "@/lib/page-location";
import Link from "@/components/transition-link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Mail,
  Pencil,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageShell, XevenMark } from "./experience-shell";
import {
  PLANS,
  SALES_EMAIL,
  formatUsd,
  type Billing,
} from "@/lib/xeven-content";
import { enquiryBody, enquiryMailto } from "@/lib/enquiry";

export default function ContactPage() {
  const [plan, setPlan] = useState("Growth"),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [business, setBusiness] = useState(""),
    [needs, setNeeds] = useState(""),
    [website, setWebsite] = useState(""),
    [monthlyChats, setMonthlyChats] = useState("");
  const [billing, setBilling] = useState<Billing>("monthly");
  const [review, setReview] = useState(false),
    [copied, setCopied] = useState(false),
    [status, setStatus] = useState("");
  const draft = useRef<HTMLPreElement>(null),
    draftDetails = useRef<HTMLDetailsElement>(null),
    reviewHeading = useRef<HTMLHeadingElement>(null),
    firstInput = useRef<HTMLInputElement>(null),
    edited = useRef(false);
  useEffect(() => {
    const query = pageSearchParams();
    const value = query.get("plan");
    if (query.get("billing") === "yearly") setBilling("yearly");
    if (PLANS.some((item) => item.name === value)) setPlan(value!);
  }, []);
  useEffect(() => {
    if (review) reviewHeading.current?.focus({ preventScroll: true });
    else if (edited.current) firstInput.current?.focus({ preventScroll: true });
  }, [review]);
  const selected = PLANS.find((item) => item.name === plan)!;
  const values = {
      plan,
      name,
      email,
      business,
      needs,
      website,
      monthlyChats,
      billing,
    },
    body = enquiryBody(values),
    mailto = enquiryMailto(values);
  async function copy() {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setStatus("Enquiry copied. Paste it into an email when you’re ready.");
    } catch {
      if (draftDetails.current) draftDetails.current.open = true;
      if (draft.current) {
        const range = document.createRange();
        range.selectNodeContents(draft.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        draft.current.focus();
      }
      setStatus(
        "Enquiry selected below. Use your browser’s Copy command, or download the text file.",
      );
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([body], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `XEVEN_${plan}_Enquiry.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(
      `Saved. No message sent — email it to ${SALES_EMAIL} when ready.`,
    );
  }
  return (
    <PageShell active="/contact">
      <section className="contact-layout page-section">
        <div className="contact-copy">
          <p className="eyebrow">05 / COMMERCIAL ACCESS</p>
          <h1>
            Let’s make
            <br />
            <span>it yours.</span>
          </h1>
          <p>Choose a plan. Tell us what your business needs.</p>
          <a href={`mailto:${SALES_EMAIL}`} className="sales-email">
            {SALES_EMAIL}
          </a>
          <div className="contact-note">
            <XevenMark />
            <h2>A conversation comes first.</h2>
            <p>
              Prepare an enquiry. Sales confirms setup, pricing, and access. No
              payment is taken here.
            </p>
            <Link href="/demo" className="text-link">
              Explore the sample first <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
        <div className="purchase-panel">
          <div className="purchase-panel-top">
            <XevenMark />
            <span>PURCHASE ENQUIRY</span>
            <span>{review ? "02 / REVIEW" : "01 / YOUR DETAILS"}</span>
          </div>
          {!review ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!name.trim() || !business.trim()) return;
                setReview(true);
                setCopied(false);
                setStatus("");
              }}
            >
              <p className="form-note">Fields marked * are required.</p>
              <label htmlFor="purchase-plan">Your XEVEN plan</label>
              <Select
                value={plan}
                onValueChange={(value) => {
                  // Native form controls may emit an empty value while syncing a query-selected plan.
                  if (PLANS.some((item) => item.name === value)) setPlan(value);
                }}
              >
                <SelectTrigger id="purchase-plan" aria-label="Your XEVEN plan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLANS.map((item) => (
                    <SelectItem key={item.name} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selected.yearly && (
                <div className="enquiry-billing">
                  <label htmlFor="contact-billing">Billing preference</label>
                  <select
                    id="contact-billing"
                    value={billing}
                    onChange={(event) =>
                      setBilling(event.target.value as Billing)
                    }
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">
                      Yearly · 20% off + setup credit
                    </option>
                  </select>
                </div>
              )}
              <div className="selected-plan-summary">
                <strong>
                  {selected.price !== null
                    ? billing === "yearly"
                      ? `$${formatUsd(selected.yearly.total)} / year`
                      : `$${selected.price} / month`
                    : "Tailored pricing"}
                </strong>
                <span>
                  {selected.setup !== null
                    ? billing === "yearly"
                      ? "$0 net setup after full setup credit"
                      : `$${selected.setup} setup, credited on annual`
                    : "From Scale + agreed scope"}
                </span>
              </div>
              <div className="form-row">
                <div>
                  <label htmlFor="contact-name">Your name *</label>
                  <Input
                    ref={firstInput}
                    id="contact-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Alex Morgan"
                    maxLength={80}
                    autoComplete="name"
                    required
                    pattern=".*\S.*"
                    title="Enter your name."
                  />
                </div>
                <div>
                  <label htmlFor="contact-email">Work email *</label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="alex@business.com"
                    maxLength={160}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
              <label htmlFor="contact-business">Business name *</label>
              <Input
                id="contact-business"
                value={business}
                onChange={(event) => setBusiness(event.target.value)}
                placeholder="Your business"
                autoComplete="organization"
                maxLength={120}
                required
                pattern=".*\S.*"
                title="Enter your business name."
              />
              <div className="form-row sizing-fields">
                <div>
                  <label htmlFor="contact-website">
                    Website <span>(optional)</span>
                  </label>
                  <Input
                    id="contact-website"
                    type="url"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    placeholder="https://yourwebsite.com"
                    autoComplete="url"
                    maxLength={240}
                  />
                </div>
                <div>
                  <label htmlFor="contact-monthly-chats">
                    Monthly chats <span>(optional)</span>
                  </label>
                  <Input
                    id="contact-monthly-chats"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={monthlyChats}
                    onChange={(event) => setMonthlyChats(event.target.value)}
                    placeholder="Approximate volume"
                  />
                </div>
              </div>
              <label htmlFor="contact-needs">
                What would you like XEVEN to help with?
              </label>
              <Textarea
                id="contact-needs"
                value={needs}
                onChange={(event) => setNeeds(event.target.value)}
                rows={4}
                maxLength={1600}
                placeholder="Customer support, product guidance, bookings…"
              />
              <button type="submit" className="primary-button">
                Review your enquiry <ArrowUpRight size={17} />
              </button>
              <p className="form-note">
                Your details stay here until you copy, download, or open an
                email draft.
              </p>
            </form>
          ) : (
            <div className="purchase-review">
              <h2 ref={reviewHeading} tabIndex={-1}>
                A good place to begin.
              </h2>
              <p>
                Review your details, then open the draft in your email app to
                send it to <strong>{SALES_EMAIL}</strong>.
              </p>
              <dl className="enquiry-summary">
                <div>
                  <dt>Selected plan</dt>
                  <dd>{plan}</dd>
                </div>
                <div>
                  <dt>Pricing guide</dt>
                  <dd>
                    {selected.price !== null
                      ? billing === "yearly"
                        ? `$${formatUsd(selected.yearly.total)}/year · $0 net setup`
                        : `$${selected.price}/month + $${selected.setup} setup`
                      : "Custom quote"}
                  </dd>
                </div>
                <div>
                  <dt>Your name</dt>
                  <dd>{name.trim()}</dd>
                </div>
                <div>
                  <dt>Work email</dt>
                  <dd>{email.trim()}</dd>
                </div>
                <div className="summary-wide">
                  <dt>Business</dt>
                  <dd>{business.trim()}</dd>
                </div>
                <div>
                  <dt>Website</dt>
                  <dd>{website.trim() || "Not provided"}</dd>
                </div>
                <div>
                  <dt>Monthly chats</dt>
                  <dd>{monthlyChats || "Not yet known"}</dd>
                </div>
                <div className="summary-wide">
                  <dt>What you need</dt>
                  <dd>
                    {needs.trim() || "Help choosing the right configuration."}
                  </dd>
                </div>
              </dl>
              <div className="review-actions">
                <a
                  className="primary-button"
                  href={mailto}
                  onClick={() =>
                    setStatus(
                      "Your email app was requested. Send the draft when ready, or copy it if no app opens. Delivery cannot be confirmed here.",
                    )
                  }
                >
                  <Mail size={17} />
                  Open email draft
                </a>
                <button className="secondary-button" onClick={copy}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copied" : "Copy enquiry"}
                </button>
                <button className="secondary-button" onClick={download}>
                  <Download size={16} />
                  Download text
                </button>
              </div>
              <p className="copy-status" role="status">
                {status}
              </p>
              <details ref={draftDetails}>
                <summary>View the full email text</summary>
                <pre ref={draft} tabIndex={-1}>
                  {body}
                </pre>
              </details>
              <button
                className="edit-enquiry"
                onClick={() => {
                  edited.current = true;
                  setReview(false);
                }}
              >
                <Pencil size={14} />
                Edit your details
              </button>
              <p className="form-note">
                Nothing has been sent from this website. If an email app does
                not open, copy or download your enquiry and send it to the
                address above.
              </p>
            </div>
          )}
        </div>
      </section>
      <div className="contact-back">
        <Link href="/plans">← Compare the plans</Link>
        <span>YOUR KNOWLEDGE. YOUR VOICE. YOUR XEVEN.</span>
      </div>
    </PageShell>
  );
}
