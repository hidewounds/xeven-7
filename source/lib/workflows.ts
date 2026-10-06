export const WORKFLOWS = [
  {
    name: "Research",
    copy: "Find answers in your business knowledge.",
    question: "What is our exchange policy?",
    answer:
      "Unworn items, within 30 days. When did your order arrive? Let’s check before the next step.",
    tag: "SAMPLE EXCHANGE POLICY",
    scenario: "support",
  },
  {
    name: "Create",
    copy: "Shape a response in your business’s voice.",
    question: "Help me welcome a new customer.",
    answer:
      "Hello, and welcome. Tell me what you’re looking for — I’ll help you find the right fit.",
    tag: "ILLUSTRATIVE CUSTOMER RESPONSE",
    scenario: "shopping",
  },
  {
    name: "Plan",
    copy: "Bring availability into the conversation.",
    question: "Can we find a time on Friday?",
    answer:
      "The sample schedule has 14:00 or 15:30 UTC. Which works best for you?",
    tag: "CHRONO · SAMPLE AVAILABILITY",
    scenario: "booking",
  },
  {
    name: "Do",
    copy: "Choose a useful next step, with clear limits.",
    question: "Let’s choose 15:30.",
    answer:
      "15:30 selected in this preview. Share your details with the team to confirm. No booking has been made.",
    tag: "PREVIEW SELECTION · NOT A BOOKING",
    scenario: "booking",
  },
] as const;
export type ScreenContent = { question: string; answer: string; tag: string };
export function screenContent(
  chapter: number,
  workflow: number,
): ScreenContent {
  if (chapter === 0)
    return {
      question: "Can I exchange my order?",
      answer: "Let’s check your store’s policy. When did your order arrive?",
      tag: "YOUR KNOWLEDGE. IN THE CONVERSATION.",
    };
  if (chapter === 3)
    return {
      question: "Still black sneakers. Size 9.",
      answer:
        "With your permission, I can remember that. Let’s pick up where we left off.",
      tag: "SAMPLE MEMORY · ON YOUR TERMS",
    };
  return WORKFLOWS[workflow];
}
