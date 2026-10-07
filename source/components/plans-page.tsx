"use client";
import Link from "@/components/transition-link";
import { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
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
          <p>Choose your plan. Arrange access with XEVEN sales.</p>
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
            Annual billing: save 20%.
            <br />
            <span>Setup included.</span>
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
                </>
              ) : (
                <p className="custom-scope">
                  Scale, tailored to your business.
                </p>
              )}
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
            <p>Try the demo now. Ask sales for sandbox access.</p>
          </div>
          <Link href="/demo?scenario=shopping" className="outline-pill">
            Explore the sample <ArrowUpRight size={17} />
          </Link>
        </div>
        <p className="pricing-note">
          USD guide. Annual billing credits the full setup fee; capacity stays
          monthly. Final scope, taxes, counting rules, and terms confirmed with
          sales. No payment taken here.
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
              <p>Choose your capabilities and capacity.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Talk to XEVEN.</h3>
              <p>Confirm the setup and commercial terms.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Make it yours.</h3>
              <p>Configure your knowledge, tone, and services.</p>
            </div>
          </li>
        </ol>
      </section>
    </PageShell>
  );
}
