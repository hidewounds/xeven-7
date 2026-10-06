import { SALES_EMAIL, type Billing } from "./xeven-content";
export type Enquiry = {
  plan: string;
  name: string;
  email: string;
  business: string;
  needs: string;
  website?: string;
  monthlyChats?: string;
  billing?: Billing;
};
export function enquiryBody({
  plan,
  name,
  email,
  business,
  needs,
  website = "",
  monthlyChats = "",
  billing = "monthly",
}: Enquiry) {
  return `Hello XEVEN,\n\nI’m interested in purchasing the ${plan} plan (${billing === "yearly" ? "annual billing guide" : "monthly billing guide"}).\n\nName: ${name.trim()}\nWork email: ${email.trim()}\nBusiness: ${business.trim()}\nWebsite: ${website.trim() || "Not provided"}\nEstimated monthly chats: ${monthlyChats.trim() || "Not yet known"}\n\nWhat we need:\n${needs.trim() || "Please help us choose the right configuration."}\n\nPlease confirm final pricing, terms, and the next steps for access.\n\nThank you,\n${name.trim()}`;
}
export function enquiryMailto(enquiry: Enquiry) {
  return `mailto:${SALES_EMAIL}?subject=${encodeURIComponent(`XEVEN ${enquiry.plan} — purchase enquiry`)}&body=${encodeURIComponent(enquiryBody(enquiry))}`;
}
