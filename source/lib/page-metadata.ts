import type { Metadata } from "next";

export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  void title;
  return {
    title: "XEVEN",
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `XEVEN`,
      description,
      url: path,
      siteName: "XEVEN",
      type: "website",
      images: [
        {
          url: "/xeven/social-preview.png",
          width: 1200,
          height: 630,
          alt: "XEVEN — Connected by design",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `XEVEN`,
      description,
      images: ["/xeven/social-preview.png"],
    },
  };
}
