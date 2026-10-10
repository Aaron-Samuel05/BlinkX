import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

const siteUrl = "https://www.theblinkx.com";

export const metadata: Metadata = {
  title: "Blink X Reels Production Company in India",
  description:
    "Need a Reels production company in India? Blink X (TheBlinkX) plans, scripts, shoots and edits short-form videos for businesses and brands. Compare 8, 12 and 18-Reel packages with 24-hour post-shoot delivery.",
  alternates: { canonical: "/reels-production" },
  openGraph: {
    type: "website",
    url: `${siteUrl}/reels-production`,
    siteName: "Blink X",
    title: "Blink X Reels Production Company in India | TheBlinkX",
    description:
      "TheBlinkX is Blink X, a Reels production service for businesses and brands in India. Explore 8, 12 and 18-Reel packages.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reels Production Services for Brands in India | Blink X",
    description:
      "TheBlinkX (Blink X) plans, shoots and edits Instagram Reels for businesses and brands in India.",
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Blink X Instagram Reels Production for Businesses and Brands",
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
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
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
    question: "Who is this service for?",
    answer:
      "The service is designed for businesses, product brands, service providers, creators and personal brands that want a consistent supply of short-form social video content.",
  },
  {
    question: "Do I need to provide scripts or ideas?",
    answer:
      "The service includes content planning, scripting and shot direction. Share your goals, product or service details and preferred style so the team can plan the content with you.",
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

      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/">Home</Link><span aria-hidden="true">/</span><span>Reels Production</span>
      </nav>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>SHORT-FORM VIDEO FOR BUSINESS</p>
        <h1>Reels production for <em>businesses &amp; brands.</em></h1>
        <p className={styles.lead}>
          TheBlinkX is Blink X, a Reels production company for businesses and brands in India. Turn one content day into a library of social-ready videos. We help businesses plan,
          script, shoot and edit Instagram Reels and short-form video content, with delivery within
          24 hours after your shoot.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/#pricing">Explore Reels packages <span aria-hidden="true">↗</span></Link>
          <Link className={styles.secondary} href="/#how">See how it works</Link>
        </div>
        <div className={styles.proof}>
          <span>PLAN</span><i /> <span>SHOOT</span><i /> <span>EDIT</span><i /> <span>DELIVER</span>
        </div>
      </section>

      <section className={styles.section}>
        <p className={styles.eyebrow}>REELS PRODUCTION SERVICES</p>
        <h2>Consistent content, without managing every step yourself.</h2>
        <p className={styles.copy}>
          Keeping your business visible on social media takes more than recording a quick clip.
          Ideas need to become scripts, shoots need direction, and raw footage needs to become
          clear, engaging videos. Blink X brings those steps together in one content-day service so
          your team can spend less time coordinating production and more time running the business.
          If you are comparing options for <strong>Instagram Reels production</strong> or
          <strong> short-form video production for your brand</strong>, start with the package that
          matches the amount of content you need.
        </p>
        <div className={styles.grid}>
          <article className={styles.card}><span>01</span><h3>Plan the content</h3><p>Develop concepts, hooks and shot direction around the content your brand needs.</p></article>
          <article className={styles.card}><span>02</span><h3>Shoot professionally</h3><p>Capture your content in a planned session, with location and shoot details confirmed with the team.</p></article>
          <article className={styles.card}><span>03</span><h3>Edit for social</h3><p>Turn footage into ready-to-post Reels with editing, captions, subtitles, music and colour grading.</p></article>
          <article className={styles.card}><span>04</span><h3>Receive it fast</h3><p>Receive edited content within 24 hours after the shoot, according to the service promise.</p></article>
        </div>
      </section>

      <section className={styles.section + " " + styles.audience}>
        <p className={styles.eyebrow}>WHO IT'S FOR</p>
        <h2>Short-form video for the way your business shows up.</h2>
        <p className={styles.copy}>
          Reels can help you introduce products, explain a service, answer common customer questions,
          show the people behind your business and build a more consistent social media presence.
          Blink X works with businesses and brands that want a planned batch of video content rather
          than arranging every shoot and edit separately.
        </p>
        <div className={styles.audienceLinks}>
          <Link href="/#pricing">Compare Reels production packages <span aria-hidden="true">↗</span></Link>
          <Link href="/#faqs">Read booking and delivery FAQs <span aria-hidden="true">↗</span></Link>
          <Link href="/#book">Request a content-day booking <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className={styles.pricing} id="packages">
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
        <p className={styles.packageNote}>All packages are shown in Indian rupees. The team will confirm your preferred shoot time, location and requirements after you request a booking.</p>
      </section>

      <section className={styles.section}>
        <p className={styles.eyebrow}>HOW TO GET STARTED</p>
        <h2>From content ideas to ready-to-post Reels.</h2>
        <p className={styles.copy}>
          Start by choosing an 8, 12 or 18-Reel package. Submit your preferred date and contact
          details through the booking form, then the Blink X team will call to discuss your shoot,
          location and content requirements. A 50% advance reserves the content day, with the
          remaining payment due on delivery.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/#book">Request a booking <span aria-hidden="true">↗</span></Link>
          <Link className={styles.secondary} href="/">Explore Blink X</Link>
        </div>
      </section>

      <section className={styles.faq} id="service-faqs">
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
        <Link href="/">Blink X homepage</Link>
        <span>Short-form video production for businesses and brands.</span>
        <Link href="/#pricing">View Reels production packages ↗</Link>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([serviceSchema, breadcrumbSchema]) }}
      />
    </main>
  );
}
