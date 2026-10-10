import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

const siteUrl = "https://theblinkx.com";

export const metadata: Metadata = {
  title: "Reels Production for Businesses & Brands in India",
  description:
    "Get professional Instagram Reels and short-form video content for your business or brand. Blink X handles planning, scripting, shooting and editing, with 24-hour delivery after your shoot.",
  alternates: { canonical: "/reels-production" },
  openGraph: {
    type: "website",
    url: `${siteUrl}/reels-production`,
    siteName: "Blink X",
    title: "Reels Production for Businesses & Brands | Blink X",
    description:
      "Plan, shoot and edit social-ready Reels with Blink X. Choose an 8, 12 or 18-Reel content day.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reels Production for Businesses & Brands | Blink X",
    description:
      "Plan, shoot and edit social-ready Reels with Blink X. Choose an 8, 12 or 18-Reel content day, with delivery within 24 hours after the shoot.",
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Instagram Reels Production for Businesses and Brands",
  serviceType: "Short-form video and Reels production",
  provider: {
    "@type": "Organization",
    name: "Blink X",
    url: siteUrl,
  },
  areaServed: { "@type": "Country", name: "India" },
  description:
    "A content-day service for businesses and brands, covering planning, scripting, professional shooting and editing of social-ready Reels.",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: siteUrl,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Reels Production",
      item: `${siteUrl}/reels-production`,
    },
  ],
};

const faqs = [
  {
    question: "What does Blink X's Reels production service include?",
    answer:
      "The content day includes planning, scripting and shot direction, professional shooting, editing, captions and subtitles, music and sound design, and colour grading. The package you choose determines the number of Reels.",
  },
  {
    question: "How many Reels can I get in one content day?",
    answer:
      "Choose a package for 8, 12 or 18 Reels. The right option depends on the amount of content your business needs.",
  },
  {
    question: "How soon will I receive my videos?",
    answer:
      "Blink X's service is designed for delivery within 24 hours after the shoot.",
  },
  {
    question: "How does booking and payment work?",
    answer:
      "Choose your preferred content-day package and request a booking. The team will call to confirm the preferred time, location and shoot details. A 50% advance reserves the content day.",
  },
  {
    question: "Is this service suitable for my business?",
    answer:
      "The service is designed for businesses and brands that want a consistent supply of short-form social video content for their marketing.",
  },
];

export default function ReelsProductionPage() {
  return (
    <main className={styles.page}>
      <header className={styles.nav}>
        <Link href="/" className={styles.logo} aria-label="Blink X homepage">
          <span className={styles.mark}>X</span> Blink X
        </Link>
        <Link className={styles.navCta} href="/#pricing">View packages <span aria-hidden="true">↗</span></Link>
      </header>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>SHORT-FORM VIDEO FOR BUSINESS</p>
        <h1>Reels production for <em>businesses &amp; brands.</em></h1>
        <p className={styles.lead}>
          Turn one content day into a library of social-ready videos. Blink X helps businesses plan,
          script, shoot and edit Instagram Reels and short-form video content, with delivery within
          24 hours after your shoot.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/#pricing">Explore packages <span aria-hidden="true">↗</span></Link>
          <Link className={styles.secondary} href="/#how">How it works</Link>
        </div>
        <div className={styles.proof}>
          <span>PLAN</span><i /> <span>SHOOT</span><i /> <span>EDIT</span><i /> <span>DELIVER</span>
        </div>
      </section>

      <section className={styles.section}>
        <p className={styles.eyebrow}>WHY REELS PRODUCTION?</p>
        <h2>Consistent content, without managing every step yourself.</h2>
        <p className={styles.copy}>
          Keeping your business visible on social media takes more than recording a quick clip.
          Ideas need to become scripts, shoots need direction, and raw footage needs to become
          clear, engaging videos. Blink X brings those steps together in one content-day service so
          your team can spend less time coordinating production and more time running the business.
        </p>
        <div className={styles.grid}>
          <article className={styles.card}><span>01</span><h3>Plan the content</h3><p>Develop concepts, hooks and shot direction around the content your brand needs.</p></article>
          <article className={styles.card}><span>02</span><h3>Shoot professionally</h3><p>Capture your content in a planned session, with location and shoot details confirmed with the team.</p></article>
          <article className={styles.card}><span>03</span><h3>Edit for social</h3><p>Turn footage into ready-to-post Reels with editing, captions, subtitles, music and colour grading.</p></article>
          <article className={styles.card}><span>04</span><h3>Receive it fast</h3><p>Get your edited content within 24 hours after the shoot, according to the service promise.</p></article>
        </div>
      </section>

      <section className={styles.pricing}>
        <div>
          <p className={styles.eyebrow}>CONTENT-DAY PACKAGES</p>
          <h2>Choose the volume your brand needs.</h2>
          <p className={styles.copy}>Every option brings planning, shooting and editing together in one booking.</p>
        </div>
        <div className={styles.priceGrid}>
          <article><p>STARTER</p><strong>8 Reels</strong><b>₹10,000</b><small>₹5,000 advance</small><Link href="/#pricing">Choose Starter ↗</Link></article>
          <article className={styles.featured}><p>GROWTH · POPULAR</p><strong>12 Reels</strong><b>₹15,000</b><small>₹7,500 advance</small><Link href="/#pricing">Choose Growth ↗</Link></article>
          <article><p>SCALE</p><strong>18 Reels</strong><b>₹25,000</b><small>₹12,500 advance</small><Link href="/#pricing">Choose Scale ↗</Link></article>
        </div>
      </section>

      <section className={styles.section}>
        <p className={styles.eyebrow}>BUILT FOR BUSINESS</p>
        <h2>Short-form video for your brand's next stage.</h2>
        <p className={styles.copy}>
          Whether you're introducing a product, showing how your service works, sharing behind-the-scenes
          moments or building a more consistent social presence, a planned batch of Reels gives your
          business more material to publish. Start with a content day that fits your needs and build
          your workflow from there.
        </p>
      </section>

      <section className={styles.faq}>
        <p className={styles.eyebrow}>FAQ</p>
        <h2>Before you book.</h2>
        <div className={styles.faqList}>
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}<span aria-hidden="true">+</span></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.bottomCta}>
        <p className={styles.eyebrow}>READY TO MAKE YOUR NEXT CONTENT BATCH?</p>
        <h2>Let's plan your content day.</h2>
        <p>Pick a package and tell Blink X when you'd like to shoot.</p>
        <Link className={styles.primary} href="/#pricing">Book a shoot <span aria-hidden="true">↗</span></Link>
      </section>

      <footer className={styles.footer}>
        <Link href="/">Blink X</Link>
        <span>Short-form video production for businesses and brands.</span>
        <Link href="/#pricing">Book a shoot ↗</Link>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([serviceSchema, breadcrumbSchema]) }}
      />
    </main>
  );
}
