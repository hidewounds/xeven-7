// Product facts from hidewounds/xeven-ai; commercial positioning requested by the owner.
// Examples are scripted product demonstrations, not live backend responses.
export const SALES_EMAIL = "hello@xeven.world";
export const HARDWARE_NOTE =
  "XEVEN is software for your website. Handheld + spider are concept visuals, not hardware for sale.";
export const PREVIEW_NOTE =
  "Scripted preview with sample data — no real appointment, no customer data.";
export const TRIAL = {
  days: 14,
  price: 0,
  label: "14-day sample sandbox, $0",
} as const;
export const ANNUAL_DISCOUNT = 0.2;
export type Billing = "monthly" | "yearly";
export function formatUsd(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export const PATTERNS = [
  "Customer support",
  "Sales",
  "Shopping assistance",
  "Product advice",
  "Lead qualification",
  "General assistance",
];
export const SCENARIOS = [
  {
    id: "shopping",
    label: "Shopping",
    title: "A familiar customer. A relevant answer.",
    question:
      "I’m back for a pair of everyday sneakers. What would you suggest?",
    facts: [
      {
        type: "Memory",
        title: "A preference worth remembering",
        detail: "Alex · size 9 · prefers black sneakers",
        icon: "memory",
      },
      {
        type: "Behavior",
        title: "A signal, not a fact",
        detail: "Recently viewed the everyday footwear collection",
        icon: "context",
      },
      {
        type: "Knowledge",
        title: "From the sample catalog",
        detail: "Everyday 01 · black · size 9 available",
        icon: "knowledge",
      },
    ],
    answer:
      "Welcome back, Alex. The Everyday 01 comes in black and your saved size 9. It could be a good fit for everyday wear. Would you like to compare it with another option?",
    outcome:
      "Product guidance informed by saved preferences and catalog knowledge.",
  },
  {
    id: "support",
    label: "Support",
    title: "Your policy. In the right moment.",
    question: "The shoes I ordered don’t fit. Can I exchange them?",
    facts: [
      {
        type: "Intent",
        title: "Understand the request",
        detail: "Customer support · size exchange",
        icon: "context",
      },
      {
        type: "Knowledge",
        title: "From the sample store policy",
        detail: "Unworn items can be exchanged within 30 days",
        icon: "knowledge",
      },
      {
        type: "Boundary",
        title: "Ask for what is missing",
        detail: "Order date and item condition are not yet known",
        icon: "memory",
      },
    ],
    answer:
      "I can help you check. Our sample store accepts exchanges for unworn shoes within 30 days. When did your order arrive, and have the shoes been worn outside?",
    outcome:
      "A grounded answer with a follow-up question, without assuming eligibility.",
  },
  {
    id: "booking",
    label: "Booking",
    title: "A conversation with a next step.",
    question: "Could I book a product consultation on Friday afternoon?",
    facts: [
      {
        type: "Intent",
        title: "Make room for a conversation",
        detail: "Product consultation · Friday afternoon",
        icon: "context",
      },
      {
        type: "Chrono",
        title: "Check the sample schedule",
        detail: "30-minute consultation · 14:00 or 15:30 UTC",
        icon: "knowledge",
      },
      {
        type: "Confirmation",
        title: "Let the customer choose",
        detail: "A time and contact details are needed to book",
        icon: "memory",
      },
    ],
    answer:
      "The sample schedule has Friday at 14:00 or 15:30 UTC for a 30-minute consultation. Which time works for you? I’ll also need your contact details before confirming.",
    outcome:
      "Chrono brings availability into the conversation. No booking is made in this preview.",
  },
  {
    id: "lead-qual",
    label: "Lead qualification",
    title: "A better brief for the next conversation.",
    question: "Can XEVEN help qualify around 200 website chats each week?",
    facts: [
      {
        type: "Intent",
        title: "Understand the enquiry",
        detail: "Lead qualification · around 200 website chats per week",
        icon: "context",
      },
      {
        type: "Knowledge",
        title: "Six connected areas of expertise",
        detail:
          "Support, sales, shopping, product advice, lead qualification, and general assistance",
        icon: "knowledge",
      },
      {
        type: "Boundary",
        title: "Set the handoff conditions",
        detail:
          "Business hours and the person or team receiving qualified enquiries are still needed",
        icon: "memory",
      },
    ],
    answer:
      "Lead qualification is one of XEVEN’s six areas of expertise. For this sample of 200 chats a week, I’d first clarify two things: what are your team’s business hours, and who should receive an enquiry when a customer is ready to talk? This preview does not create a lead or make a booking.",
    outcome:
      "Two useful follow-ups shape a handoff brief. No lead, message, or appointment is created.",
  },
] as const;
export type ScenarioId = (typeof SCENARIOS)[number]["id"];

export const PLANS = [
  {
    name: "Launch",
    price: 29,
    setup: 99,
    yearly: {
      discount: ANNUAL_DISCOUNT,
      total: 278.4,
      monthlyEquivalent: 23.2,
      setup: 0,
    },
    trial: TRIAL,
    conversationLimit: 1000,
    perConversation: "~$0.03",
    caption: "Your first connection.",
    conversations: "1,000",
    knowledge: "50",
    features: [
      "Unified AI brain",
      "Knowledge + memory",
      "Website chat widget",
      "Behavioral context",
    ],
    excluded: "Chrono and Echo not included.",
  },
  {
    name: "Growth",
    price: 79,
    setup: 199,
    yearly: {
      discount: ANNUAL_DISCOUNT,
      total: 758.4,
      monthlyEquivalent: 63.2,
      setup: 0,
    },
    trial: TRIAL,
    conversationLimit: 10000,
    perConversation: "~$0.008",
    caption: "More conversations. More possibility.",
    conversations: "10,000",
    knowledge: "200",
    features: [
      "Everything in Launch",
      "Chrono scheduling",
      "Echo English voice",
      "More business knowledge",
    ],
    excluded: "Voice channel and custom rules are separate.",
  },
  {
    name: "Scale",
    price: 199,
    setup: 499,
    yearly: {
      discount: ANNUAL_DISCOUNT,
      total: 1910.4,
      monthlyEquivalent: 159.2,
      setup: 0,
    },
    trial: TRIAL,
    conversationLimit: 50000,
    perConversation: "~$0.004",
    caption: "Built for a growing business.",
    conversations: "50,000",
    knowledge: "500",
    features: [
      "Chrono + Echo + voice",
      "Multilanguage support",
      "10 custom behavior rules",
      "Expanded conversation capacity",
    ],
    excluded: "",
  },
  {
    name: "Custom",
    price: null,
    setup: null,
    yearly: null,
    trial: TRIAL,
    conversationLimit: null,
    perConversation: null,
    caption: "From Scale + scope.",
    conversations: "Agreed scope",
    knowledge: "Agreed scope",
    features: [
      "All add-ons",
      "Additional behavior rules",
      "Bespoke configuration",
      "Tailored business setup",
    ],
    excluded:
      "Extra rules, languages, and voice channels — scope agreed with sales.",
  },
] as const;
export const FAQ = [
  {
    question: "Is the handheld for sale?",
    answer:
      "No — the handheld and spider are concept visuals. XEVEN is software for your website.",
  },
  {
    question: "What counts as one conversation or one knowledge item?",
    answer:
      "For this guide, a conversation is one customer chat session and a knowledge item is one supplied entry, such as an FAQ or policy; exact session boundaries and entry-size limits are confirmed with sales.",
  },
  {
    question: "How do I purchase Xeven?",
    answer:
      "Choose a plan and prepare a purchase enquiry for the Xeven sales team. They can confirm pricing, business requirements, and access. Xeven is offered as a commercial product.",
  },
  {
    question: "What makes Xeven different from a basic chat widget?",
    answer:
      "Xeven combines business knowledge, explicit customer memories, behavioral signals, and conversation history. Its unified brain draws on six areas of expertise, from support to shopping and lead qualification.",
  },
  {
    question: "What does Xeven remember?",
    answer:
      "Memory can retain allowed customer facts and preferences. Explicit memories stay separate from inferred behavior. Businesses control allowed fields and event retention, while remember and forget commands support customer control.",
  },
  {
    question: "Are Chrono and Echo available on every plan?",
    answer:
      "Chrono scheduling and Echo English are included in the Growth profile. Scale includes additional voice and multilanguage features. Voice services need appropriate configuration; confirm your requirements with sales.",
  },
  {
    question: "Is the test drive connected to a live AI agent?",
    answer:
      "The test drive is an interactive preview with sample business information and scripted responses. It demonstrates shopping, support, booking, and lead qualification with sample data. No lead, appointment, or customer record is created.",
  },
];
