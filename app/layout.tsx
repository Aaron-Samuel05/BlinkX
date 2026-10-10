import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://www.theblinkx.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Blink X | Reels Production for Brands & Businesses in India",
    template: "%s | Blink X",
  },
  description:
    "Create scroll-stopping Instagram Reels with Blink X. We plan, shoot and edit short-form videos for businesses and brands across India, with delivery within 24 hours after your shoot.",
  applicationName: "Blink X",
  icons: {
    icon: [{ url: "/blinkx-logo.png", type: "image/png", sizes: "any" }],
    shortcut: "/blinkx-logo.png",
    apple: "/blinkx-logo.png",
  },
  keywords: [
    "Reels production company India",
    "Instagram Reels production services",
    "short-form video production for brands",
    "video content creation for businesses",
    "Reels editing services India",
    "social media video production",
    "brand video production",
    "Blink X",
    "TheBlinkX",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Blink X",
    title: "Blink X | Reels Production for Brands & Businesses in India",
    description:
      "Blink X plans, shoots and edits high-quality Instagram Reels for businesses and brands across India. Book a content shoot and get ready-to-post videos within 24 hours.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blink X | Instagram Reels & Short-Form Video Production",
    description:
      "Professional Instagram Reels production for businesses and brands across India. Planning, shooting, editing and 24-hour delivery by Blink X.",
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
  alternateName: ["TheBlinkX", "theblinkx"],
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
  alternateName: ["TheBlinkX", "theblinkx"],
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
