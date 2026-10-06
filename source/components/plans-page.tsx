"use client";
import Link from "@/components/transition-link";
import { useState } from "react";
import { ArrowUpRight, Check, CircleHelp } from "lucide-react";
import { PageShell, Reveal } from "./experience-shell";
import { PLANS, TRIAL, formatUsd, type Billing } from "@/lib/xeven-content";

export default function PlansPage() {
  const [billing, setBilling] = useState<Billing>("monthly");
  return (
    <PageShell active="/plans">
      <section className="page-title page-section">
        <p className="eyebrow">04 / PLANS & ACCESS</p>
        <h1>
          Intelligence.
          <br />
          <span>On your terms.</span>
        </h1>
        <div className="plans-intro-foot">
          <p>
            Choose a starting point for your business.
            <br />
            Confirm the configuration and purchase with XEVEN sales.
          </p>
          <span>COMMERCIAL ACCESS / USD GUIDE</span>
        </div>
      </section>
      <section className="pricing-section page-section">
        <div className="pricing-toolbar">
          <fieldset className="billing-control">
            <legend className="sr-only">Billing guide</legend>
            <label>
              <input
                type="radio"
                name="billing"
                value="monthly"
                checked={billing === "monthly"}
                onChange={() => setBilling("monthly")}
              />
              <span>Monthly</span>
            </label>
            <label>
              <input
                type="radio"
                name="billing"
                value="yearly"
                checked={billing === "yearly"}
                onChange={() => setBilling("yearly")}
              />
              <span>
                Yearly <small>−20%</small>
              </span>
            </label>
          </fieldset>
          <p>
            Annual guide: 20% off the subscription.
            <br />
            <span>Full setup credit. $0 net setup.</span>
          </p>
        </div>
        <div className="pricing-grid">
          {PLANS.map((plan, index) => (
            <Reveal
              className={`price-card ${index === 1 ? "recommended" : ""}`}
              key={plan.name}
            >
              <div className="plan-top">
                <span>
                  0{index + 1} / {plan.name.toUpperCase()}
                </span>
                {index === 1 && <b>WITH CHRONO</b>}
              </div>
              <h2>{plan.name}</h2>
              <p className="plan-caption">{plan.caption}</p>
              <div className="price">
                {plan.price !== null ? (
                  <>
                    <span>$</span>
                    {formatUsd(
                      billing === "yearly"
                        ? plan.yearly.monthlyEquivalent
                        : plan.price,
                    )}
                    <small>/ month</small>
                  </>
                ) : (
                  <strong>Let’s talk.</strong>
                )}
              </div>
              {plan.yearly ? (
                <>
                  <p className="annual-total">
                    ${formatUsd(plan.yearly.total)} / year{" "}
                    <span>
                      {billing === "yearly"
                        ? "Billed annually"
                        : "with annual billing"}
                    </span>
                  </p>
                  <p className="setup-price">
                    ${plan.setup} setup, credited on annual
                  </p>
                  <p className="conversation-rate">
                    {plan.perConversation} / conversation{" "}
                    <span>at full included volume on the monthly guide</span>
                  </p>
                </>
              ) : (
                <p className="custom-scope">
                  From Scale + scope. Extra rules, languages, voice channels —
                  agreed with sales.
                </p>
              )}
              <p className="plan-sales-note">
                USD guide. Taxes/terms confirmed with sales. No payment taken
                here.
              </p>
              <Link
                className={index === 1 ? "primary-button" : "secondary-button"}
                href={`/contact?plan=${plan.name}&billing=${billing}`}
              >
                {plan.price !== null
                  ? `Enquire about ${plan.name}`
                  : "Discuss Custom"}
                <ArrowUpRight size={15} />
              </Link>
              <dl>
                <div>
                  <dt>Monthly conversations</dt>
                  <dd>{plan.conversations}</dd>
                </div>
                <div>
                  <dt>Knowledge items</dt>
                  <dd>{plan.knowledge}</dd>
                </div>
              </dl>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={15} />
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.excluded && (
                <p className="plan-exclusion">{plan.excluded}</p>
              )}
            </Reveal>
          ))}
        </div>
        <div className="trial-band">
          <div>
            <span className="eyebrow">A PLACE TO BEGIN</span>
            <h2>{TRIAL.label}</h2>
            <p>
              Explore sample scenarios before discussing your configuration. Ask
              sales to arrange sandbox access; the on-page demo is available
              now.
            </p>
          </div>
          <Link href="/demo?scenario=shopping" className="outline-pill">
            Explore the sample <ArrowUpRight size={17} />
          </Link>
        </div>
        <p className="pricing-note">
          The annual setup credit equals the listed setup fee, so net setup is
          $0. Included conversation limits remain monthly; approximate unit
          costs use the monthly subscription divided by the full included
          volume. Final counting rules, taxes, scope, and terms are confirmed
          with sales.
        </p>
      </section>
      <section className="purchase-steps page-section">
        <div>
          <p className="eyebrow">FROM INTEREST TO ACCESS</p>
          <h2>
            Your next
            <br />
            <span>three moves.</span>
          </h2>
        </div>
        <ol>
          <li>
            <span>01</span>
            <div>
              <h3>Find your fit.</h3>
              <p>
                Choose the capabilities and capacity that suit your business.
              </p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Talk to XEVEN.</h3>
              <p>
                Prepare your enquiry and confirm requirements, pricing, and
                terms with sales.
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Make it yours.</h3>
              <p>
                Arrange commercial access and configure your agent’s knowledge,
                tone, and connected services.
              </p>
            </div>
          </li>
        </ol>
      </section>
      <section className="plan-help">
        <CircleHelp size={27} />
        <div>
          <h3>Start with a conversation.</h3>
          <p>
            Explore the sample experience before choosing your configuration.
          </p>
        </div>
        <Link href="/demo" className="secondary-button">
          Try the guided demo <ArrowUpRight size={17} />
        </Link>
      </section>
    </PageShell>
  );
}
