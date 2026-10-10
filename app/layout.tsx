import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://theblinkx.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Blink X | Reels Production & Short-Form Video Content",
    template: "%s | Blink X",
  },
  description:
    "Blink X helps businesses, brands and creators plan, shoot and edit social-ready Reels. Choose 8, 12 or 18 Reels, with delivery within 24 hours after your shoot.",
  applicationName: "Blink X",
  keywords: [
    "Reels production",
    "Instagram Reels production",
    "short-form video content",
    "business video production",
    "content creation for brands",
    "Reels editing",
    "video production for businesses",
    "Blink X",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Blink X",
    title: "Blink X | Reels Production & Short-Form Video Content",
    description:
      "Plan, shoot and edit social-ready Reels for your business, brand or personal brand. Pick a package and book your content day with Blink X.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blink X | Reels Production & Short-Form Video Content",
    description:
      "Plan, shoot and edit social-ready Reels for your business, brand or personal brand with Blink X.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Blink X",
  url: siteUrl,
  description:
    "Short-form video and Reels production for businesses, brands, creators and personal brands.",
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; if (location.hash) return; const nav = performance.getEntriesByType("navigation")[0]; if (!nav || nav.type !== "reload") return; const reset = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" }); let tries = 0; const timer = setInterval(() => { reset(); if (++tries >= 20) clearInterval(timer); }, 50); reset(); })();`,
          }}
        />
        {children}
      </body></html>;
}
