import assert from "node:assert/strict";
import { readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

// Behavioral checks for state and data that the presentation must not misrepresent.
// TypeScript and the production build are separate required gates.
const directory = await mkdtemp(join(tmpdir(), "xeven-experience-"));
let passed = 0;
try {
  await writeFile(join(directory, "package.json"), '{"type":"commonjs"}');
  for (const name of [
    "xeven-content",
    "demo-machine",
    "enquiry",
    "console-journey",
  ]) {
    const source = await readFile(resolve("lib", `${name}.ts`), "utf8");
    await writeFile(
      join(directory, `${name}.js`),
      ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2020,
        },
      }).outputText,
    );
  }
  const require = createRequire(join(directory, "test.cjs"));
  const { initialDemo, demoReducer } = require("./demo-machine.js");
  const { enquiryBody, enquiryMailto } = require("./enquiry.js");
  const { consoleFrame, DISPLAY } = require("./console-journey.js");
  const { PLANS, TRIAL } = require("./xeven-content.js");
  const check = (name, run) => {
    run();
    passed++;
    console.log(`PASS ${name}`);
  };
  let id = 0;
  const ask = (state, text, intent) => {
    const request = ++id;
    return demoReducer(
      demoReducer(state, { type: "send", id: request, text, intent }),
      { type: "reply", id: request },
    );
  };

  check(
    "Shopping uses sample memory; forgetting changes the following conversation",
    () => {
      let state = ask(initialDemo(), "Please recommend everyday sneakers");
      assert.match(state.messages.at(-1).text, /saved size 9/);
      state = ask(state, "Forget my preferences");
      assert.equal(state.memory, false);
      state = ask(state, "Recommend sneakers");
      assert.equal(state.stage, "awaiting_size");
      assert.match(state.messages.at(-1).text, /What shoe size/);
      assert.doesNotMatch(state.messages.at(-1).text, /Welcome back, Alex/);
      state = ask(state, "I wear size 9");
      assert.match(state.messages.at(-1).tag, /CONVERSATION DETAIL/);
    },
  );
  check(
    "A supplied size outside the sample catalog never becomes invented stock",
    () => {
      const state = ask(initialDemo(), "I wear size 11");
      assert.match(
        state.messages.at(-1).text,
        /can’t confirm availability in your size/,
      );
    },
  );
  check(
    "Support keeps its own scope and asks for missing order information",
    () => {
      let state = ask(initialDemo("support"), "Could I book a consultation?");
      assert.equal(state.messages.at(-1).tag, "PREVIEW BOUNDARY");
      state = ask(state, "Can I exchange my shoes?");
      assert.equal(state.stage, "awaiting_order");
      state = ask(state, "Unworn, arrived 14 days ago");
      assert.match(state.messages.at(-1).text, /Nothing has been processed/);
    },
  );
  check(
    "Booking selects a sample time and never reports a real appointment",
    () => {
      let state = ask(initialDemo("booking"), "Book a Friday consultation");
      assert.equal(state.stage, "awaiting_time");
      assert.equal(state.messages.at(-1).slots, true);
      state = ask(state, "Choose 15:30 UTC");
      assert.equal(state.slot, "15:30");
      assert.equal(state.stage, "time_selected");
      assert.match(
        state.messages.at(-1).text,
        /No appointment has been booked/,
      );
    },
  );
  check(
    "Duplicate sends and stale replies cannot leak between scenarios",
    () => {
      let state = demoReducer(initialDemo(), {
        type: "send",
        id: 50,
        text: "Recommend sneakers",
      });
      state = demoReducer(state, { type: "send", id: 51, text: "Duplicate" });
      assert.equal(state.messages.length, 1);
      state = demoReducer(state, { type: "scenario", scenario: "booking" });
      state = demoReducer(state, { type: "reply", id: 50 });
      assert.equal(state.messages.length, 0);
      assert.equal(state.pending, null);
    },
  );
  check("Memory switch and reset have defined, distinct effects", () => {
    let state = demoReducer(initialDemo(), { type: "memory", enabled: false });
    state = demoReducer(state, { type: "scenario", scenario: "support" });
    assert.equal(state.memory, false);
    state = demoReducer(state, { type: "reset" });
    assert.equal(state.memory, true);
    assert.equal(state.scenario, "support");
    assert.equal(state.messages.length, 0);
  });
  check(
    "Lead qualification asks for missing context before a clearly unsent sample handoff",
    () => {
      let state = ask(
        initialDemo("lead-qual"),
        "Can you qualify 200 website chats each week?",
      );
      assert.equal(state.stage, "awaiting_handoff");
      assert.match(state.messages.at(-1).text, /business hours/i);
      assert.match(state.messages.at(-1).text, /who should receive/i);
      assert.match(state.messages.at(-1).text, /does not create a lead/i);
      state = ask(state, "Our team works 09:00–17:00. Handoff to sales.");
      assert.equal(state.stage, "responded");
      assert.match(state.messages.at(-1).text, /confirm the timezone/);
      assert.match(
        state.messages.at(-1).text,
        /Nothing has been forwarded or booked/,
      );
      state = ask(state, "Book a Friday consultation");
      assert.equal(state.messages.at(-1).tag, "PREVIEW BOUNDARY");
    },
  );
  check(
    "Annual offers calculate 20 percent off with zero net setup and unchanged monthly capacity",
    () => {
      for (const plan of PLANS.filter((item) => item.price !== null)) {
        assert.equal(
          plan.yearly.total,
          Math.round(plan.price * 12 * 0.8 * 100) / 100,
        );
        assert.equal(
          plan.yearly.monthlyEquivalent,
          Math.round(plan.price * 0.8 * 100) / 100,
        );
        assert.equal(plan.yearly.setup, 0);
        assert.equal(
          Number(plan.conversations.replaceAll(",", "")),
          plan.conversationLimit,
        );
      }
      assert.equal(TRIAL.days, 14);
      assert.equal(TRIAL.price, 0);
      assert.equal(PLANS.find((item) => item.name === "Custom").yearly, null);
    },
  );
  check(
    "Enquiry retains the chosen plan and safely encodes punctuation and newlines",
    () => {
      const values = {
        plan: "Scale",
        name: "A & B",
        email: "a+sample@example.test",
        business: "Studio / 7",
        needs: "Knowledge & memory?\nA second line.",
        website: "https://example.test/store?ref=A&B",
        monthlyChats: "800",
        billing: "yearly",
      };
      const url = new URL(enquiryMailto(values));
      assert.equal(url.protocol, "mailto:");
      assert.equal(url.searchParams.get("body"), enquiryBody(values));
      assert.match(url.searchParams.get("subject"), /Scale/);
      assert.equal(url.searchParams.get("bcc"), null);
      assert.match(enquiryBody(values), /final pricing, terms/);
      assert.match(enquiryBody(values), /annual billing guide/);
      assert.ok(enquiryBody(values).includes(values.website));
      assert.match(enquiryBody(values), /Estimated monthly chats: 800/);
    },
  );
  check(
    "The display covers every viewport, reverses cleanly, and expands from a landed console",
    () => {
      for (const [w, h] of [
        [1440, 900],
        [1920, 1080],
        [1024, 768],
        [390, 844],
        [360, 640],
        [844, 390],
      ]) {
        const metrics = {
          heroEnd: h * 1.25,
          returnStart: h * 5,
          footerStart: h * 6.7,
        };
        const start = consoleFrame(0, w, h, metrics);
        assert.equal(start.entry, 0);
        assert.equal(start.heroOpacity, 1);
        const inside = consoleFrame(h * 2, w, h, metrics);
        assert.equal(inside.phase, "inside");
        assert.equal(inside.contentOpacity, 1);
        assert.ok(inside.screen.x <= 0 && inside.screen.y <= 0);
        assert.ok(
          inside.screen.x + inside.screen.width >= w &&
            inside.screen.y + inside.screen.height >= h,
        );
        assert.equal(inside.pose.rx, 0);
        assert.equal(inside.pose.ry, 0);
        assert.equal(inside.pose.rz, 0);
        const docked = consoleFrame(metrics.footerStart, w, h, metrics);
        assert.equal(docked.docking, 1);
        assert.equal(docked.expansion, 0);
        assert.deepEqual(docked.projection, docked.screen);
        const footer = consoleFrame(metrics.footerStart + h, w, h, metrics);
        assert.equal(footer.footerOpacity, 1);
        assert.equal(footer.expansion, 1);
        assert.deepEqual(footer.pose, docked.pose);
        assert.ok(footer.projection.width > docked.screen.width);
        assert.deepEqual(consoleFrame(h * 2, w, h, metrics), inside);
        for (let y = 0; y < metrics.footerStart + h; y += h / 30) {
          const frame = consoleFrame(y, w, h, metrics);
          Object.values(frame.pose).forEach((v) =>
            assert.ok(Number.isFinite(v)),
          );
          assert.ok(frame.pose.width > 0);
        }
        assert.equal(DISPLAY.width, 0.716);
      }
    },
  );
  console.log(`${passed} behavior checks passed.`);
} finally {
  await rm(directory, { recursive: true, force: true });
}
