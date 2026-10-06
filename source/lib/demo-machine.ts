import { SCENARIOS, type ScenarioId } from "./xeven-content";

export type DemoIntent =
  | { type: "example" }
  | { type: "forget" }
  | { type: "size"; size: string }
  | { type: "time"; time: "14:00" | "15:30" }
  | { type: "exchange_details" }
  | { type: "lead_details" }
  | { type: "outside" };
export type DemoMessage = {
  role: "agent" | "user";
  text: string;
  tag?: string;
  slots?: boolean;
  suggestions?: boolean;
};
export type DemoState = {
  scenario: ScenarioId;
  memory: boolean;
  statedSize: string | null;
  slot: string | null;
  stage:
    | "initial"
    | "awaiting_size"
    | "awaiting_order"
    | "awaiting_time"
    | "time_selected"
    | "awaiting_handoff"
    | "responded";
  messages: DemoMessage[];
  pending: { id: number; intent: DemoIntent } | null;
  lastSource: string;
};
export type DemoAction =
  | { type: "scenario"; scenario: ScenarioId }
  | { type: "reset" }
  | { type: "memory"; enabled: boolean }
  | { type: "send"; id: number; text: string; intent?: DemoIntent }
  | { type: "reply"; id: number };

export function initialDemo(
  scenario: ScenarioId = "shopping",
  memory = true,
): DemoState {
  return {
    scenario,
    memory,
    statedSize: null,
    slot: null,
    stage: "initial",
    messages: [],
    pending: null,
    lastSource: "No response yet",
  };
}
export function classifyInput(scenario: ScenarioId, text: string): DemoIntent {
  const value = text.toLowerCase().trim();
  if (/\bforget\b/.test(value)) return { type: "forget" };
  if (scenario === "shopping") {
    const size = value.match(/\bsize\s*(\d{1,2}(?:\.5)?)\b/);
    if (size) return { type: "size", size: size[1] };
    if (/\b(sneakers?|shoes?|recommend|everyday|pair)\b/.test(value))
      return { type: "example" };
  }
  if (scenario === "support") {
    if (
      /\bunworn\b/.test(value) &&
      /\b(14 days|two weeks|10 days)\b/.test(value)
    )
      return { type: "exchange_details" };
    if (/\b(exchange|return|refund|fit)\b/.test(value))
      return { type: "example" };
  }
  if (scenario === "booking") {
    const times = [...value.matchAll(/\b(14:00|15:30)\b/g)];
    if (times.length === 1)
      return { type: "time", time: times[0][1] as "14:00" | "15:30" };
    if (
      /\b(friday|consultation|book|schedule|availability|appointment)\b/.test(
        value,
      )
    )
      return { type: "example" };
  }
  if (scenario === "lead-qual") {
    if (
      /\b(9|09):?00?\s*(?:to|[-–])\s*(17|5):?00?\b/.test(value) &&
      /\bsales\b/.test(value)
    )
      return { type: "lead_details" };
    if (
      /\b(qualify|qualification|leads?|chats?|200|handoff|enquiries)\b/.test(
        value,
      )
    )
      return { type: "example" };
  }
  return { type: "outside" };
}
export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  if (action.type === "scenario")
    return initialDemo(action.scenario, state.memory);
  if (action.type === "reset") return initialDemo(state.scenario, true);
  if (action.type === "memory")
    return initialDemo(state.scenario, action.enabled);
  if (action.type === "send") {
    if (state.pending || !action.text.trim()) return state;
    const text = action.text.trim().slice(0, 500);
    return {
      ...state,
      messages: [...state.messages, { role: "user", text }],
      pending: {
        id: action.id,
        intent: action.intent || classifyInput(state.scenario, text),
      },
    };
  }
  if (!state.pending || state.pending.id !== action.id) return state;
  const intent = state.pending.intent;
  let next = { ...state, pending: null };
  let reply: DemoMessage = {
    role: "agent",
    text: "This is a guided, scripted preview. Try the example for this scenario, or switch to Shopping, Support, Booking, or Lead qualification to explore another conversation.",
    tag: "PREVIEW BOUNDARY",
    suggestions: true,
  };
  if (intent.type === "forget") {
    next = { ...next, memory: false, statedSize: null, stage: "responded" };
    reply = {
      role: "agent",
      text: "Sample memory cleared for this preview. I’ll ask for your preferences when they are needed. Your data has not been sent anywhere.",
      tag: "MEMORY CONTROL",
    };
  } else if (
    state.scenario === "shopping" &&
    (intent.type === "example" || intent.type === "size")
  ) {
    const size = intent.type === "size" ? intent.size : state.statedSize;
    next.statedSize = size;
    if (size && size !== "9") {
      reply = {
        role: "agent",
        text: `You’ve shared size ${size} in this conversation. This sample catalog only confirms Everyday 01 in black, size 9, so I can’t confirm availability in your size. A real business would check its current catalog.`,
        tag: "CONVERSATION DETAIL + SAMPLE CATALOG",
      };
      next.stage = "responded";
    } else if (state.memory && !size) {
      reply = {
        role: "agent",
        text: SCENARIOS[0].answer,
        tag: "SAMPLE MEMORY + CATALOG",
      };
      next.stage = "responded";
    } else if (size) {
      reply = {
        role: "agent",
        text: "You’ve shared size 9 in this conversation. The sample catalog has Everyday 01 in black, size 9. Would you like to explore the product with the business?",
        tag: "CONVERSATION DETAIL + SAMPLE CATALOG",
      };
      next.stage = "responded";
    } else {
      reply = {
        role: "agent",
        text: "The sample catalog includes Everyday 01 in black. What shoe size do you wear? I don’t have saved preferences for you in this preview.",
        tag: "SAMPLE CATALOG · NO SAVED MEMORY",
      };
      next.stage = "awaiting_size";
    }
  } else if (state.scenario === "support" && intent.type === "example") {
    reply = {
      role: "agent",
      text: SCENARIOS[1].answer,
      tag: "SAMPLE EXCHANGE POLICY",
    };
    next.stage = "awaiting_order";
  } else if (
    state.scenario === "support" &&
    intent.type === "exchange_details"
  ) {
    reply = {
      role: "agent",
      text: "That matches the sample policy’s unworn-item and 30-day conditions. The business would still need to verify your order before arranging an exchange. Nothing has been processed here.",
      tag: "SAMPLE POLICY + DETAILS YOU SHARED",
    };
    next.stage = "responded";
  } else if (state.scenario === "booking" && intent.type === "example") {
    reply = {
      role: "agent",
      text: "The sample schedule has Friday at 14:00 or 15:30 UTC for a 30-minute consultation. Which time works for you? This preview does not check live availability.",
      tag: "CHRONO · SAMPLE AVAILABILITY",
      slots: true,
    };
    next.stage = "awaiting_time";
  } else if (state.scenario === "booking" && intent.type === "time") {
    next.slot = intent.time;
    next.stage = "time_selected";
    reply = {
      role: "agent",
      text: `${intent.time} UTC selected in this preview. Contact details and confirmation from the business are still needed. No appointment has been booked.`,
      tag: "PREVIEW SELECTION · NOT A BOOKING",
    };
  }
  if (state.scenario === "lead-qual" && intent.type === "example") {
    reply = {
      role: "agent",
      text: SCENARIOS.find((item) => item.id === "lead-qual")!.answer,
      tag: "SAMPLE INTENT + EXPERTISE · TWO FOLLOW-UPS",
    };
    next.stage = "awaiting_handoff";
  } else if (state.scenario === "lead-qual" && intent.type === "lead_details") {
    reply = {
      role: "agent",
      text: "Sample handoff brief: around 200 website chats each week, team hours 09:00–17:00, with qualified enquiries intended for the sales team. Sales would still need to confirm the timezone, contact route, and qualification rules. Nothing has been forwarded or booked.",
      tag: "SAMPLE HANDOFF BRIEF · NOT SENT",
    };
    next.stage = "responded";
  }
  return {
    ...next,
    messages: [...next.messages, reply],
    lastSource: reply.tag || "Sample information",
  };
}
