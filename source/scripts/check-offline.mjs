import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { JSDOM, ResourceLoader, VirtualConsole } from "jsdom";

const folder = resolve(process.argv[2] || "outputs/xeven-offline");
let passed = 0;
const pause = (ms) => new Promise((done) => setTimeout(done, ms));
const check = (label) => {
  passed++;
  console.log(`PASS ${label}`);
};
class LocalOnly extends ResourceLoader {
  fetch(url, options) {
    assert.ok(
      url.startsWith("file:") || url.startsWith("data:"),
      `External dependency: ${url}`,
    );
    return super.fetch(url, options);
  }
}
async function open(file, query = "", reduced = true, motionOverride = null) {
  const errors = [];
  const downloads = [];
  const blobs = [];
  const vc = new VirtualConsole();
  vc.on("error", (...args) =>
    errors.push(new Error(args.map(String).join(" "))),
  );
  vc.on("jsdomError", (error) => {
    // jsdom has no layout engine and does not parse modern Tailwind @layer CSS.
    if (
      error.type !== "css parsing" &&
      error.type !== "css-parsing" &&
      !/Could not parse CSS/.test(error.message)
    )
      errors.push(error);
  });
  const url = pathToFileURL(join(folder, file));
  url.search = query;
  const dom = new JSDOM(await readFile(join(folder, file), "utf8"), {
    url: url.href,
    runScripts: "dangerously",
    resources: new LocalOnly(),
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      if (motionOverride)
        Object.defineProperty(window, "localStorage", {
          value: {
            getItem: (key) => (key === "xeven-motion" ? motionOverride : null),
            setItem() {},
          },
        });
      window.matchMedia = () => ({
        matches: reduced,
        addEventListener() {},
        removeEventListener() {},
      });
      window.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
      window.IntersectionObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
      Object.defineProperty(window.document, "fonts", {
        value: { ready: Promise.resolve() },
      });
      window.performance.getEntriesByType = () => [];
      window.scrollTo = () => {};
      window.HTMLElement.prototype.scrollTo = () => {};
      window.HTMLElement.prototype.scrollIntoView = () => {};
      Object.defineProperty(window.HTMLElement.prototype, "clientWidth", {
        get: () => 1280,
      });
      Object.defineProperty(window.HTMLElement.prototype, "clientHeight", {
        get: () => 900,
      });
      window.fetch = () => {
        throw new Error("Offline edition attempted fetch");
      };
      window.XMLHttpRequest = class {
        constructor() {
          throw new Error("Offline edition attempted XHR");
        }
      };
      window.URL.createObjectURL = (blob) => {
        blobs.push(blob);
        return "blob:offline-test";
      };
      window.URL.revokeObjectURL = () => {};
      const anchorClick = window.HTMLAnchorElement.prototype.click;
      window.HTMLAnchorElement.prototype.click = function () {
        if (this.download) {
          downloads.push({
            name: this.download,
            href: this.href,
            connected: this.isConnected,
          });
          return;
        }
        return anchorClick.call(this);
      };
    },
  });
  for (let i = 0; i < 100 && !dom.window.document.querySelector("main h1"); i++)
    await pause(20);
  await pause(60);
  assert.ok(
    dom.window.document.querySelector("main h1"),
    `${file} did not mount: ${errors.map((e) => e.message + " " + e.detail?.stack).join("\n")}`,
  );
  return {
    dom,
    document: dom.window.document,
    window: dom.window,
    errors,
    downloads,
    blobs,
  };
}
const click = (document, text) => {
  const target = [...document.querySelectorAll("button")].find((node) =>
    node.textContent.includes(text),
  );
  assert.ok(target, `Missing button: ${text}`);
  target.click();
};
const pages = ["index", "platform", "about", "plans", "demo", "contact"];
for (const name of pages) {
  const page = await open(`${name}.html`);
  try {
    for (const element of page.document.querySelectorAll(
      "a[href], img[src], script[src], link[href]",
    )) {
      const raw = element.getAttribute(
        element.tagName === "IMG" || element.tagName === "SCRIPT"
          ? "src"
          : "href",
      );
      if (
        !raw ||
        raw.startsWith("#") ||
        raw.startsWith("mailto:") ||
        raw.startsWith("data:")
      )
        continue;
      const url = new URL(raw, page.window.location.href);
      assert.equal(url.protocol, "file:", `Non-local page dependency: ${raw}`);
      await access(fileURLToPath(url));
      if (element.tagName === "IMG" && element.srcset)
        for (const variant of element.srcset.split(","))
          await access(
            fileURLToPath(
              new URL(variant.trim().split(/\s/)[0], page.window.location.href),
            ),
          );
    }
    for (const source of page.document.querySelectorAll("source[srcset]")) {
      assert.equal(source.getAttribute("media"), "(max-width: 700px)");
      const url = new URL(
        source.getAttribute("srcset"),
        page.window.location.href,
      );
      assert.equal(url.protocol, "file:");
      await access(fileURLToPath(url));
    }
    for (const preload of page.document.querySelectorAll(
      'link[rel="preload"][as="image"]',
    ))
      assert.match(preload.href, /console(?:-small)?\.webp$/);
    assert.match(
      page.document.querySelector("footer").textContent,
      /No payment/,
    );
    assert.equal(
      page.errors.length,
      0,
      page.errors.map((e) => e.message).join("\n"),
    );
    check(
      `${name}.html mounts from file:// with valid local links/assets and no runtime errors`,
    );
  } finally {
    page.dom.window.close();
  }
}
{
  const page = await open("index.html", "", false);
  try {
    const intro = page.document.querySelector(".spider-intro");
    assert.ok(intro, "Entrance is shown on fresh home visit");
    assert.equal(
      page.document.querySelectorAll(".spider-intro").length,
      1,
      "Only the dialog owns viewport intro styles",
    );
    assert.equal(intro.querySelector(".intro-name-reveal").textContent, "EVEN");
    assert.ok(intro.querySelector(".spider-view"));
    assert.match(
      intro.querySelector(".spider-poster").src,
      /spider-front\.svg$/,
    );
    click(page.document, "Skip introduction");
    await pause(60);
    assert.equal(page.document.querySelector(".spider-intro"), null);
    click(page.document, "Replay");
    await pause(60);
    assert.ok(page.document.querySelector(".spider-intro"));
    page.document.dispatchEvent(
      new page.window.KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
      }),
    );
    await pause(60);
    assert.equal(page.document.querySelector(".spider-intro"), null);
    check(
      "Dimensional intro uses the model poster plus EVEN, and skip/replay/Escape work",
    );
    const next = page.document.querySelector(
      '[aria-label="Next console workflow"]',
    );
    assert.ok(next);
    next.click();
    await pause(60);
    page.document
      .querySelector('[aria-label="Read the console conversation"]')
      .click();
    await pause(60);
    assert.ok(page.document.querySelector(".screen-reader-dialog"));
    assert.equal(
      page.errors.length,
      0,
      page.errors.map((e) => e.message).join("\n"),
    );
    check(
      "Restored console controls change the workflow and open the conversation reader",
    );
  } finally {
    page.dom.window.close();
  }
}
{
  const page = await open("index.html", "", true, "reduced");
  try {
    assert.ok(page.document.querySelector(".spider-intro"));
    assert.equal(page.document.documentElement.dataset.motion, "full");
    assert.equal(
      page.document.querySelector('[aria-label="Scene rendering quality"]'),
      null,
    );
    assert.equal(page.document.querySelector("audio"), null);
    const buttons = [...page.document.querySelectorAll("button")]
      .map((el) => el.textContent)
      .join(" ");
    assert.doesNotMatch(buttons, /Motion (on|off)|Sound (on|off)/);
    click(page.document, "Skip introduction");
    await pause(60);
    assert.equal(page.document.querySelector(".spider-intro"), null);
    check(
      "Full motion is fixed and the intro plays despite legacy saved preferences",
    );
  } finally {
    page.dom.window.close();
  }
  const reloaded = await open("index.html", "", true, "reduced");
  assert.ok(reloaded.document.querySelector(".spider-intro"));
  reloaded.dom.window.close();
}

{
  const page = await open("plans.html");
  try {
    assert.match(page.document.querySelector(".price").textContent, /29/);
    const yearly = page.document.querySelector(
      'input[name="billing"][value="yearly"]',
    );
    yearly.click();
    await pause(50);
    assert.equal(yearly.checked, true);
    const expected = [
      ["Launch", "23.20", "278.40"],
      ["Growth", "63.20", "758.40"],
      ["Scale", "159.20", "1,910.40"],
    ];
    for (const [index, [plan, monthly, annual]] of expected.entries()) {
      const card = page.document.querySelectorAll(".price-card")[index];
      assert.ok(card.querySelector(".price").textContent.includes(monthly));
      assert.ok(
        card.querySelector(".annual-total").textContent.includes(annual),
      );
      const link = card.querySelector('a[href*="contact.html"]');
      const url = new URL(link.href);
      assert.equal(url.searchParams.get("plan"), plan);
      assert.equal(url.searchParams.get("billing"), "yearly");
      assert.equal(link.previousElementSibling.className, "plan-sales-note");
    }
    assert.match(
      page.document.querySelector(".trial-band").textContent,
      /14-day sample sandbox, \$0/,
    );
    check(
      "Annual pricing displays correct totals and carries plan plus billing to enquiries",
    );
  } finally {
    page.dom.window.close();
  }
}
{
  const page = await open("platform.html");
  try {
    assert.equal(
      page.document.querySelectorAll(".retention-table tbody tr").length,
      3,
    );
    assert.match(
      page.document.querySelector(".retention-table").textContent,
      /DPA on request/,
    );
    assert.match(
      page.document.querySelector(".module-plan-tag").textContent,
      /All plans/,
    );
    click(page.document, "Chrono");
    await pause(50);
    assert.match(
      page.document.querySelector(".module-plan-tag").textContent,
      /Growth/,
    );
    click(page.document, "Is the handheld for sale?");
    await pause(50);
    assert.match(
      page.document.querySelector('.faq-list [data-state="open"]').textContent,
      /concept visuals/,
    );
    check(
      "Platform explains module eligibility, retention controls, and concept hardware",
    );
  } finally {
    page.dom.window.close();
  }
}
{
  const page = await open("demo.html", "?scenario=booking");
  try {
    assert.match(
      page.document.querySelector('[role="tab"][aria-selected="true"]')
        .textContent,
      /Book/i,
    );
    const example = page.document.querySelector(".suggested-prompt");
    assert.ok(example, "Booking sample question exists");
    example.click();
    await pause(550);
    assert.match(
      page.document.querySelector('[role="log"]').textContent,
      /15:30|10:00|sample/i,
    );
    assert.equal(
      page.errors.length,
      0,
      page.errors.map((e) => e.message).join("\n"),
    );
    check(
      "Guided demo preserves file URL scenario query and returns a local scripted response",
    );
  } finally {
    page.dom.window.close();
  }
}
{
  const page = await open("demo.html", "?scenario=lead-qual");
  try {
    assert.equal(page.document.querySelectorAll('[role="tab"]').length, 4);
    assert.match(
      page.document.querySelector('[role="tab"][aria-selected="true"]')
        .textContent,
      /Lead qualification/,
    );
    assert.match(
      page.document.querySelector(".scripted-preview-pill").textContent,
      /Scripted preview with sample data/,
    );
    assert.equal(
      page.document
        .querySelector("#sample-memory")
        .getAttribute("aria-checked"),
      "true",
    );
    page.document.querySelector(".suggested-prompt").click();
    await pause(550);
    const reply = page.document.querySelector(".demo-message.agent");
    assert.match(reply.textContent, /business hours/);
    assert.match(reply.textContent, /who should receive/);
    assert.ok(reply.querySelector(".scenario-outcome"));
    click(page.document, "Use sample hours");
    await pause(550);
    assert.match(
      page.document.querySelector('[role="log"]').textContent,
      /Nothing has been forwarded or booked/,
    );
    const tab = page.document.querySelector(
      '[role="tab"][aria-selected="true"]',
    );
    tab.focus();
    tab.dispatchEvent(
      new page.window.KeyboardEvent("keydown", {
        key: "ArrowLeft",
        bubbles: true,
      }),
    );
    await pause(100);
    assert.match(
      page.document.querySelector('[role="tab"][aria-selected="true"]')
        .textContent,
      /Booking/,
    );
    assert.equal(
      page.errors.length,
      0,
      page.errors.map((e) => e.message).join("\n"),
    );
    check(
      "Fourth scripted demo shows two follow-ups, an unsent handoff, and keyboard tab navigation",
    );
  } finally {
    page.dom.window.close();
  }
}
{
  const page = await open("contact.html", "?plan=Scale&billing=yearly");
  try {
    assert.match(
      page.document.querySelector("#purchase-plan").textContent,
      /Scale/,
    );
    for (const [id, value] of [
      ["contact-name", "Taylor Demo"],
      ["contact-email", "taylor@example.test"],
      ["contact-business", "Offline Studio"],
      ["contact-needs", "Customer support"],
      ["contact-website", "https://example.test/store?ref=A&B"],
      ["contact-monthly-chats", "800"],
    ]) {
      const input = page.document.getElementById(id);
      const prototype =
        input.tagName === "TEXTAREA"
          ? page.window.HTMLTextAreaElement.prototype
          : page.window.HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(prototype, "value").set.call(
        input,
        value,
      );
      input.dispatchEvent(new page.window.Event("input", { bubbles: true }));
    }
    await pause(40);
    page.document
      .querySelector("form")
      .dispatchEvent(
        new page.window.Event("submit", { bubbles: true, cancelable: true }),
      );
    await pause(60);
    const mail = page.document.querySelector(
      'a[href^="mailto:"][class="primary-button"]',
    );
    assert.ok(mail);
    const mailBody = new URL(mail.href).searchParams.get("body");
    assert.match(mailBody, /Scale.*annual billing guide/);
    assert.match(mailBody, /Website: https:\/\/example.test\/store\?ref=A&B/);
    assert.match(mailBody, /Estimated monthly chats: 800/);
    assert.match(
      page.document.querySelector(".enquiry-summary").textContent,
      /1,910.40/,
    );
    click(page.document, "Copy enquiry");
    await pause(60);
    assert.match(
      page.document.querySelector('[role="status"]').textContent,
      /selected below/,
    );
    click(page.document, "Download text");
    await pause(50);
    assert.deepEqual(page.downloads, [
      {
        name: "XEVEN_Scale_Enquiry.txt",
        href: "blob:offline-test",
        connected: true,
      },
    ]);
    const downloadedText = await new Promise((resolve, reject) => {
      const reader = new page.window.FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(page.blobs[0]);
    });
    assert.equal(downloadedText, mailBody);
    assert.equal(
      page.document.querySelector('[role="status"]').textContent,
      "Saved. No message sent — email it to hello@xeven.world when ready.",
    );
    assert.equal(
      page.errors.length,
      0,
      page.errors.map((e) => e.message).join("\n"),
    );
    check(
      "Offline enquiry preserves plan, annual billing and sizing details across email, copy fallback, and download",
    );
  } finally {
    page.dom.window.close();
  }
}
{
  const page = await open("plans.html");
  try {
    page.document
      .querySelector('input[name="billing"][value="yearly"]')
      .click();
    await pause(50);
    page.document
      .querySelector('.global-header nav a[aria-current="page"]')
      .click();
    await pause(40);
    assert.ok(
      page.document.querySelector(".app-page-frame.page-idle"),
      "The current page link does not start a stalled transition",
    );
    const link = [...page.document.querySelectorAll(".price-card a")].find(
      (el) => el.textContent.includes("Growth"),
    );
    link.click();
    await pause(1100);
    assert.ok(page.document.querySelector("#contact-name"));
    assert.match(
      page.document.querySelector("#purchase-plan").textContent,
      /Growth/,
    );
    assert.equal(
      page.document.querySelector("#contact-billing").value,
      "yearly",
    );
    assert.equal(
      new URL(
        page.window.location.hash.slice(1),
        "https://xeven.invalid",
      ).searchParams.get("plan"),
      "Growth",
    );
    const home = page.document.querySelector('a[aria-label="Xeven home"]');
    home.click();
    await pause(1100);
    assert.ok(page.document.querySelector(".spider-intro"));
    click(page.document, "Skip introduction");
    await pause(70);
    page.window.history.back();
    await pause(900);
    assert.ok(page.document.querySelector("#contact-name"));
    assert.match(page.document.title, /XEVEN/);
    assert.equal(
      page.errors.length,
      0,
      page.errors.map((e) => e.message).join("\n"),
    );
    check(
      "App-style offline page switches preserve plan/billing and browser Back without fetch",
    );
  } finally {
    page.dom.window.close();
  }
}
const css = await readFile(join(folder, "assets/style.css"), "utf8");
assert.equal((css.match(/data:font\/woff;base64,/g) || []).length, 2);
const js = await readFile(join(folder, "assets/app.js"), "utf8");
assert.doesNotMatch(js, /\bimport\s*\(|\bimport\.meta\b/);
assert.doesNotMatch(js, /fetch\("\/xeven|console\.glb/);
check(
  "Both fonts are embedded; the script has no dynamic imports or GLB network loading",
);
console.log(
  `${passed} offline checks passed. DOM emulation is not visual/browser compatibility testing.`,
);
