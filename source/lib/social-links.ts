/** Populate only with owner-confirmed profile URLs. Null keeps a truthful coming-soon state. */
export const SOCIAL_PROFILES: {
  name: string;
  url: string | null;
  icon: "instagram" | "x" | "linkedin";
}[] = [
  { name: "Instagram", url: null, icon: "instagram" },
  { name: "X", url: null, icon: "x" },
  { name: "LinkedIn", url: null, icon: "linkedin" },
];
