import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://theblinkx.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Instagram Reels Production in India | Blink X",
    template: "%s | Blink X",
  },
  description:
    "Plan, shoot and edit Instagram Reels for your business with Blink X. Choose 8, 12 or 18-video packages, with delivery within 24 hours after your shoot.",
  applicationName: "Blink X",
  keywords: [
    "Reels production company India",
    "Instagram Reels production services",
    "short-form video production for brands",
    "video content creation for businesses",
    "Reels editing services India",
    "social media video production",
    "brand video production",
    "Blink X",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Blink X",
    title: "Instagram Reels Production in India | Blink X",
    description:
      "Plan, shoot and edit short-form videos for your business or brand. Explore Blink X content-day packages and book a shoot.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Reels Production in India | Blink X",
    description:
      "Short-form video production for businesses and brands. Choose an 8, 12 or 18-Reel package with Blink X.",
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
  logo: `${siteUrl}/blinkx-logo.png`,
  description:
    "Short-form video and Instagram Reels production for businesses and brands.",
  areaServed: {
    "@type": "Country",
    name: "India",
  },
  knowsAbout: [
    "Instagram Reels production",
    "Short-form video production",
    "Social media content creation",
    "Video editing for brands",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Blink X",
  url: siteUrl,
  inLanguage: "en-IN",
  publisher: {
    "@type": "Organization",
    name: "Blink X",
    url: siteUrl,
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Short-form Video and Reels Production",
  serviceType: "Short-form video production",
  provider: {
    "@type": "Organization",
    name: "Blink X",
    url: siteUrl,
  },
  areaServed: {
    "@type": "Country",
    name: "India",
  },
  description:
    "Content planning, scripting, video shoots and editing for businesses and brands, with social-ready Reels delivered within 24 hours after the shoot.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationSchema, websiteSchema, serviceSchema]),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; if (location.hash) return; const nav = performance.getEntriesByType("navigation")[0]; if (!nav || nav.type !== "reload") return; const reset = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" }); let tries = 0; const timer = setInterval(() => { reset(); if (++tries >= 20) clearInterval(timer); }, 50); reset(); })();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
