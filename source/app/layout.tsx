import type { Metadata } from "next";
import { ExperienceProvider } from "@/components/experience-shell";
import "./globals.css";

const origin = "https://xeven-spatial-studio.guddaaa.chatgpt.site";
export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: {
    default: "XEVEN",
    template: "XEVEN",
  },
  description:
    "An AI agent that connects your business knowledge, customer context, and next steps. Explore XEVEN’s spatial interface, guided demo, and commercial plans.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "XEVEN",
    title: "XEVEN — Conversations beyond the screen",
    description:
      "Your knowledge. A new connection. Explore the XEVEN AI platform.",
    images: [
      {
        url: "/xeven/social-preview.png",
        width: 1200,
        height: 630,
        alt: "XEVEN spider identity — Conversations beyond the screen",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "XEVEN — Conversations beyond the screen",
    description: "Your knowledge. A new connection.",
    images: ["/xeven/social-preview.png"],
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/space-regular.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <noscript>
          <div className="no-script-note">
            The visual story is available. JavaScript is needed for the guided
            demo and enquiry form. For access, email{" "}
            <a href="mailto:hello@xeven.world">hello@xeven.world</a>.
          </div>
        </noscript>
        <ExperienceProvider>{children}</ExperienceProvider>
      </body>
    </html>
  );
}
