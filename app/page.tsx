"use client";

import React from "react";
import dynamic from "next/dynamic";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Check, ChevronDown, Clock3, Instagram, MapPin, Play, Phone, Star, Video, X, ListChecks, PenLine, CircleDot, Film, Layers3, TrendingUp, Moon, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";


const bookingMonths = Array.from({ length: 12 }, (_, i) => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + i);
  return { year: d.getFullYear(), month: d.getMonth() };
});
const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const timeOptions = ["Morning (9 AM to 12 PM)", "Afternoon (12 PM to 4 PM)", "Evening (4 PM to 7 PM)", "Discuss on call"];

const benefits: [string, string, string, LucideIcon][] = [
  ["01", "Save Time", "No more planning, scripting, shooting or editing on your own.", Clock3],
  ["02", "Grow Faster", "More content means more reach, more conversations, more customers.", ArrowRight],
  ["03", "Pro Quality", "Shoot and edited by a dedicated creative team.", Film],
  ["04", "All in One", "Planning, scripts, shooting, editing, captions and music.", Star],
];


const IPhone3D = dynamic(() => import("./components/IPhone3D"), { ssr: false });

const heroContentThumbs = [
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=700&q=85",
];

const process: [string, string, string, LucideIcon, string, string][] = [
  ["01", "We Plan", "We bring ideas to life.", Clock3, "IDEA", "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=88"],
  ["02", "We Shoot", "On-location with professional production.", Video, "PRODUCTION", "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=88"],
  ["03", "We Edit", "High-quality, ready-to-post reels.", Star, "POST-PRODUCTION", "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=88"],
  ["04", "You Grow", "More content. More opportunities.", ArrowRight, "GROWTH", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=88"],
];

const faqs = [
  ["What is included in a content day?", "Every package includes professional shooting, editing, captions and subtitles, music and sound design, color grading and 24-hour delivery. The number of ready-to-post Reels depends on the package you choose."],
  ["How does the 50% payment work?", "You pay 50% to reserve the content day. The remaining 50% is due on delivery."],
  ["How quickly will I receive the Reels?", "The package is designed for delivery within 24 hours after the shoot."],
  ["Where do you shoot?", "Shoot location is discussed and confirmed with the Blink X team during the booking callback."],
  ["Can creators and personal brands book?", "Yes. Blink X is set up for businesses, brands, creators and personal brands."],
];

export default function Home() {
  const [date, setDate] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [time, setTime] = useState("Discuss on call");
  const [showTimeOptions, setShowTimeOptions] = useState(false);
  const [modalOpenDropdown, setModalOpenDropdown] = useState<"time" | "plan" | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [availability, setAvailability] = useState<Record<string, string[]>>({});

  const packages = [
    { id: "starter", name: "Starter", reels: 8, price: 10000, advance: 5000 },
    { id: "growth", name: "Growth", reels: 12, price: 15000, advance: 7500, popular: true },
    { id: "scale", name: "Scale", reels: 18, price: 25000, advance: 12500 },
  ];
  const [selectedPackage, setSelectedPackage] = useState("growth");
  const activePackage = packages.find(pkg => pkg.id === selectedPackage) || packages[1];

  function toggleDarkMode() {
    setDarkMode(prev => {
      const next = !prev;
      document.body.classList.toggle("darkMode", next);
      return next;
    });
  }
  const [form, setForm] = useState({ name: "", business: "", phone: "", email: "", type: "Business / Brand", location: "" });
  const [formError, setFormError] = useState("");

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.22], [0, -110]);
  const phoneY = useTransform(scrollYProgress, [0, 0.28], [0, 120]);
  const blobY = useTransform(scrollYProgress, [0, 0.3], [0, -70]);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const smoothX = useSpring(cursorX, { stiffness: 80, damping: 22 });
  const smoothY = useSpring(cursorY, { stiffness: 80, damping: 22 });
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const smoothGlowX = useSpring(glowX, { stiffness: 55, damping: 24 });
  const smoothGlowY = useSpring(glowY, { stiffness: 55, damping: 24 });

  const calendar = useMemo(() => {
    const first = new Date(selectedMonth.year, selectedMonth.month, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const count = new Date(selectedMonth.year, selectedMonth.month + 1, 0).getDate();
    return [...Array(startOffset).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  }, [selectedMonth]);
  const monthLabel = monthFormatter.format(new Date(selectedMonth.year, selectedMonth.month, 1));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPastDate = (day: number) => {
    const candidate = new Date(selectedMonth.year, selectedMonth.month, day);
    candidate.setHours(0, 0, 0, 0);
    return candidate < today;
  };
  const getDateKey = (year: number, month: number, day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const getBookedTimes = (day: number | null) =>
    day === null ? [] : availability[getDateKey(selectedMonth.year, selectedMonth.month, day)] || [];

  const isFullyBooked = (day: number) =>
    new Set(getBookedTimes(day)).size >= timeOptions.length;

  const isTimeBooked = (option: string) =>
    date !== null && getBookedTimes(date).includes(option);

  const canContinue = date !== null && !isPastDate(date) && !isFullyBooked(date);
  const formComplete = form.name.trim().length > 0 && form.phone.trim().length > 0;

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      const monthStart = getDateKey(selectedMonth.year, selectedMonth.month, 1);
      const monthEnd = getDateKey(
        selectedMonth.year,
        selectedMonth.month,
        new Date(selectedMonth.year, selectedMonth.month + 1, 0).getDate()
      );

      setAvailability({});

      try {
        const response = await fetch(
          `/api/booking?start=${monthStart}&end=${monthEnd}`,
          { cache: "no-store" }
        );
        const result = await response.json();

        if (!cancelled && result?.success && result.booked && typeof result.booked === "object") {
          setAvailability(result.booked);
        }
      } catch {
        // Availability is non-blocking. Keep the calendar usable if it cannot be loaded.
      }
    }

    loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [selectedMonth.year, selectedMonth.month]);

  async function submitBooking() {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (!formComplete) {
      setFormError("Please enter your name and phone number.");
      return;
    }
    if (phoneDigits.length < 7) {
      setFormError("Please enter a valid phone number.");
      return;
    }
    if (form.email.trim() && !emailValid) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!date) {
      setFormError("Please choose a date.");
      return;
    }

    const selectedDate = new Date(selectedMonth.year, selectedMonth.month, date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setDate(null);
      setFormError("That date has already passed. Please choose a future date.");
      return;
    }

    if (isFullyBooked(date)) {
      setFormError("That date is fully booked. Please choose another date.");
      return;
    }

    if (isTimeBooked(time)) {
      setFormError("That time slot is already booked. Please choose another time.");
      return;
    }

    const dateKey = [
      selectedMonth.year,
      String(selectedMonth.month + 1).padStart(2, "0"),
      String(date).padStart(2, "0"),
    ].join("-");

    setFormError("");
    setBookingSubmitting(true);

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          date: dateKey,
          time,
          name: form.name.trim(),
          business: form.business.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          type: form.type,
          location: form.location.trim(),
          package: `${activePackage.name} - ${activePackage.reels} Reels - ₹${activePackage.price.toLocaleString("en-IN")}`,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        if (result.booked) {
          setFormError("Time slot is already booked. Please choose another date or time.");
        } else {
          setFormError(result.message || "We couldn't submit your booking. Please try again.");
        }
        return;
      }

      setShowBooking(false);
      setSubmitted(true);
    } catch {
      setFormError("We couldn't connect to the booking system. Please try again.");
    } finally {
      setBookingSubmitting(false);
    }
  }

  function moveHero(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    cursorX.set((e.clientX - rect.left - rect.width / 2) / 22);
    cursorY.set((e.clientY - rect.top - rect.height / 2) / 22);
    glowX.set(e.clientX - rect.left - rect.width / 2);
    glowY.set(e.clientY - rect.top - rect.height / 2);
  }

  return (
    <>
      <div className="blinkLoadingScreen" aria-label="Loading Blink X" role="status">
        <div className="blinkLoaderCenter">
          <img src="/loading%20page%20logo%20neww.png" alt="Blink X" className="blinkLoaderLogo" />
          <div className="blinkLoaderBar" aria-hidden="true">
            <div className="blinkLoaderBarFill" />
          </div>
        </div>
      </div>

    <main onMouseLeave={() => { cursorX.set(0); cursorY.set(0); }}>
      <div className="progress"><motion.div style={{ scaleX: scrollYProgress }} /></div>

      <nav className="nav glass">
        <a className="brand" href="#">
          <img src={darkMode ? "/blinkx-logo-dark.png" : "/blinkx-logo.png"} alt="Blink X" />
        </a>
        <div className="navlinks">
          <a href="#problem">Why Blink X?</a>
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
          <a href="#book">Book</a>
        </div>
        <div className="navActions">
          <div className="themeLanyardAnchor">
            <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} className="themeToggle" onClick={toggleDarkMode} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} title={darkMode ? "Light mode" : "Dark mode"}>
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </motion.button>
          </div>
          <motion.a whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="pillButton dark" href="#book">
            Book a Shoot <ArrowRight size={16} />
          </motion.a>
        </div>
      </nav>

      <section className="hero" onMouseMove={moveHero}>
        <motion.div className="heroOrb orbOne" style={{ x: smoothX, y: smoothY }} />
        <motion.div className="heroOrb orbTwo" style={{ x: useTransform(smoothX, v => -v * 0.45), y: useTransform(smoothY, v => -v * 0.45) }} />
        <motion.div className="cursorGlow" style={{ x: smoothGlowX, y: smoothGlowY }} aria-hidden="true" />
        <div className="heroNoise" />
        <div className="heroInner">
          <motion.div className="heroCopy" style={{ y: heroY }}>
            <motion.div className="eyebrow glassPill"> CONTENT THAT MOVES BUSINESS</motion.div>
            <h1><span>18 Reels</span><span className="orange">24 Hours</span></h1>
            <div className="heroSub">Blink X helps businesses, creators and brands get high-quality short-form content, shot and delivered within 24 hours.</div>
            <div className="heroActions">
              <motion.a whileHover={{ y: -3 }} whileTap={{ scale: .97 }} className="ctaButton orangeButton" href="#pricing">Book Your Shoot <span><ArrowRight size={17}/></span></motion.a>
              <motion.a whileHover={{ y: -3, x: 3 }} whileTap={{ scale: .97 }} className="watchButton glass" href="#how">See how we work <ArrowRight size={15} /></motion.a>
            </div>
            <div className="trustRow"><div className="avatarStack"><img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=160&q=80" alt="" /><img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80" alt="" /><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80" alt="" /><img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=160&q=80" alt="" /><img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=160&q=80" alt="" /></div><div><b>500+</b><span>Businesses trust Blink X</span></div></div>
          </motion.div>

          <div className="heroVisual">
            <motion.div className="heroBackText" style={{ y: blobY }}>BLINK X</motion.div>
            <motion.div className="orangeShape" style={{ y: blobY }} />
            <motion.div className="phoneWrap" style={{ y: phoneY, rotateX: useTransform(smoothY, v => -v * 0.45), rotateY: useTransform(smoothX, v => v * 0.6) }}>
              <div className="iphone3d">
                <IPhone3D />
              </div>
              <motion.div className="floatCard topCard glass" animate={{ y: [0, -10, 0], rotate: [-2, 1, -2] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                <b>⚡</b><span>18 Reels<br/><strong>24 Hours</strong></span>
              </motion.div>
              <motion.div className="floatCard bottomCard glass" animate={{ y: [0, 9, 0], rotate: [2, -1, 2] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
                <img className="tinyLogo" src="/blinkx-logo-dark.png" alt="Blink X" /><span><strong>Blink X</strong><small>More Content. Less Stress.</small></span>
              </motion.div>
            </motion.div>
          </div>
        </div>
        <div className="sideProgress"><span>SHOOT</span><i/><span>EDIT</span><i/><span>DELIVER</span></div>
        <div className="scrollHint">SCROLL <span>↓</span></div>
      </section>

      <div className="marqueeWrap">
        <div className="marquee">
          {[0,1,2,3].map(group => <React.Fragment key={group}>
            <span>18 REELS</span><b className="marqueeLogo"><img src={darkMode ? "/blinkx-logo-dark.png" : "/blinkx-logo.png"} alt="Blink X" /></b><span>24 HOURS</span><b className="marqueeLogo"><img src={darkMode ? "/blinkx-logo-dark.png" : "/blinkx-logo.png"} alt="Blink X" /></b><span>MORE CONTENT</span><b className="marqueeLogo"><img src={darkMode ? "/blinkx-logo-dark.png" : "/blinkx-logo.png"} alt="Blink X" /></b><span>MORE GROWTH</span><b className="marqueeLogo"><img src={darkMode ? "/blinkx-logo-dark.png" : "/blinkx-logo.png"} alt="Blink X" /></b><span>BLINK X</span><b className="marqueeLogo"><img src={darkMode ? "/blinkx-logo-dark.png" : "/blinkx-logo.png"} alt="Blink X" /></b>
          </React.Fragment>)}
        </div>
      </div>

      <section id="problem" className="problem section">
        <motion.div className="problemVisual problemImageCard" initial={{ opacity: 0, scale: .96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <img src="/blinkx-problem.jpg" alt="Blink X content production workspace" />
        </motion.div>
        <div className="problemCopy">
          <div className="miniEyebrow">THE PROBLEM <span /></div>
          <h2>Running a business is already a <em>full-time job.</em></h2>
          <p>Let Blink X handle the content.</p>
          <div className="taskList">
            {[["Planning content", ListChecks],["Writing scripts", PenLine],["Shooting videos", CircleDot],["Editing Reels", Film]].map(([x,Icon])=><div key={x as string}><span><Icon size={22} strokeWidth={2}/></span>{x as string}</div>)}
          </div>
          <div className="handline">It takes time.</div>
        </div>
      </section>

      <section id="how" className="section how">
        <div className="howHeader"><div><div className="miniEyebrow">HOW IT WORKS <span /></div><h2>That’s where <em>Blink X</em> comes in.</h2><p>We take care of your short-form content from idea to final Reel.</p></div></div>
        <div className="processGrid">
          {process.map(([num,title,text,Icon,category,image],i)=>(
            <div className="processItem" key={num}>
              <div className="processVisual">
                <img src={image} alt="" loading={i === 0 ? "eager" : "lazy"} />
                <span className="processNo">{num}</span>
                <span className="processCategory">{category}</span>
              </div>
              <div className="processContent">
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
              {i<3&&<span className="processConnector"><i /></span>}
            </div>
          ))}
        </div>
      </section>

      <section className="ctaSection">
        <div className="ctaEditorialGlow" />
        <div className="ctaArtworkCleanup" aria-hidden="true">
          <span className="ctaArtworkDashCleanup" />
          <span className="ctaArtworkTextCleanup" />
          <span className="ctaMobileContentCleanup" />
        </div>
        <div className="ctaEditorialCopy">
          <div className="miniEyebrow">READY WHEN YOU ARE <span /></div>
          <h2>Your next<br/><em>content day</em><br/>starts here.</h2>
          <motion.a whileHover={{ y: -3 }} whileTap={{ scale: .97 }} className="ctaButton orangeButton" href="#pricing">Book Your Shoot <span><ArrowRight size={17}/></span></motion.a>
          <div className="ctaMeta">18 REELS <i/> 24 HOURS <i/> ONE SHOOT</div>
        </div>
        <div className="ctaEditorialVisual">
          <motion.div className="ctaImageFrame" whileHover={{ y: -10, rotate: 0, scale: 1.025 }} transition={{ type: "spring", stiffness: 180, damping: 18 }}>
            <img src="/cta-production.webp" alt="Blink X production setup" />
            <div className="ctaImageLabel"><span>BLINK X</span><small>PRODUCTION DAY / 01</small></div>
          </motion.div>
          <div className="ctaVerticalText">SHOOT&nbsp;&nbsp;&nbsp; EDIT&nbsp;&nbsp;&nbsp; DELIVER</div>
        </div>
      </section>

      <section id="pricing" className="offerSection section">
        <div className="pricingHeader">
          <div className="miniEyebrow">SIMPLE PRICING <span /></div>
          <h2>Choose your <em>content day.</em></h2>
          <p>High-quality short-form content, shot and delivered within 24 hours.</p>
        </div>

        <div className="pricingOptions" id="book">
          {packages.map(pkg => {
            const features: [string, string, LucideIcon][] = [
              ["Script", "Concept, hooks & shot direction", PenLine],
              ["Shooting", "On-location, professional setup", Video],
              ["Editing", "Crisp, engaging, ready-to-post", Film],
              ["24-Hour Delivery", "Your reels, delivered within 24 hours", Clock3],
            ];

            return (
              <motion.button
                key={pkg.id}
                whileTap={{ scale: .985 }}
                className={`packageCard glassCard ${selectedPackage === pkg.id ? "selected" : ""} ${pkg.id === "scale" ? "scaleCard" : ""}`}
                onClick={() => {
                  setSelectedPackage(pkg.id);
                  window.setTimeout(() => {
                    document.getElementById("bookForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 50);
                }}
              >
                {pkg.popular && <span className="packagePopular">MOST POPULAR</span>}
                <span className="packageName">{pkg.name}</span>
                <div className="packagePriceRow">
                  <span className="packagePrice">₹{pkg.price.toLocaleString("en-IN")}</span>
                  <span className="packageUnit">/content day</span>
                </div>
                <span className="packageReels">{pkg.reels} Reels</span>
                <div className="packageFeatureList">
                  {features.map(([feature, detail, Icon], index) => (
                    <span className="packageFeature" key={feature}>
                      <span className="packageFeatureIcon"><Icon size={18} /></span>
                      <span className="packageFeatureText"><b>{feature}</b><small>{detail}</small></span>
                    </span>
                  ))}
                </div>

                <span className={`packageSelect ${selectedPackage === pkg.id ? "active" : ""}`}>
                  Choose {pkg.name}
                  <ArrowRight size={17} />
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="pricingHighlights">
          <div><span><Clock3 size={20} /></span><div><b>One content day</b><small>We come to you</small></div></div>
          <i />
          <div><span><Layers3 size={20} /></span><div><b>Everything included</b><small>Script. Shoot. Edit. Deliver.</small></div></div>
          <i />
          <div><span><TrendingUp size={20} /></span><div><b>More content. More growth.</b><small>Built for businesses & creators</small></div></div>
        </div>
      </section>


      <section id="bookForm" className="bookingSection section">
        <div className="bookingCopy">
          <div className="miniEyebrow">BOOK YOUR CONTENT DAY <span /></div>
          <h2>Pick a date.<br/><em>We’ll call you.</em></h2>
          <p>Choose your preferred date. The Blink X team will call you to confirm the available time, location and all shoot details before the session.</p>
          <div className="bookFacts"><span><Phone size={17}/> Team callback</span><span><Clock3 size={17}/> 24-hour delivery</span><span><MapPin size={17}/> Location discussed on call</span></div>
        </div>
        <div className="calendar glassCard">
          {!submitted ? <>
            <div className="calendarTop">
              <div><small>SELECT DATE</small><h3>{monthLabel}</h3></div>
              <div className="monthControls">
                <button aria-label="Previous month" disabled={bookingMonths.findIndex(m => m.year === selectedMonth.year && m.month === selectedMonth.month) <= 0} onClick={() => {
                  const index = bookingMonths.findIndex(m => m.year === selectedMonth.year && m.month === selectedMonth.month);
                  if (index > 0) { setSelectedMonth(bookingMonths[index - 1]); setDate(null); }
                }}>‹</button>
                <button aria-label="Next month" disabled={bookingMonths.findIndex(m => m.year === selectedMonth.year && m.month === selectedMonth.month) === bookingMonths.length - 1} onClick={() => {
                  const index = bookingMonths.findIndex(m => m.year === selectedMonth.year && m.month === selectedMonth.month);
                  if (index < bookingMonths.length - 1) { setSelectedMonth(bookingMonths[index + 1]); setDate(null); }
                }}>›</button>
                <CalendarDays/>
              </div>
            </div>
            <div className="calendarWeek">{["M","T","W","T","F","S","S"].map((x,i)=><span key={i}>{x}</span>)}</div>
            <div className="calendarDays">{calendar.map((d, i)=>{ const past = d !== null && isPastDate(d); const full = d !== null && isFullyBooked(d); const disabled = past || full; return <span key={`${selectedMonth.year}-${selectedMonth.month}-${i}`}>{d !== null && <button type="button" disabled={disabled} className={`${date===d?"active ":""}${past?"past ":""}${full?"bookedFull":""}`} onClick={()=>{ if (!disabled) { setDate(d); const bookedForDay = getBookedTimes(d); if (bookedForDay.includes(time)) { const nextTime = timeOptions.find(option => !bookedForDay.includes(option)); if (nextTime) setTime(nextTime); } setFormError(""); } }}>{d}</button>}</span> })}</div>
            <div className="preference" onClick={()=>setShowTimeOptions(v=>!v)} role="button" tabIndex={0}>
              <div><small>PREFERRED CALL TIME</small><b>{time}</b></div><ChevronDown size={17}/>
            </div>
            {showTimeOptions && <div className="timeOptions">{timeOptions.map(option=>{ const booked = isTimeBooked(option); return <button key={option} disabled={booked} className={`${time===option?"selected ":""}${booked?"booked":""}`} onClick={()=>{ if (!booked) { setTime(option); setShowTimeOptions(false); } }}>{option}{booked && <small>BOOKED</small>}{!booked && <Check size={15}/>}</button>})}</div>}
            <button className="preferenceHint" onClick={()=>setShowTimeOptions(v=>!v)}>Tap to choose a preferred call time</button>
            <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: .985 }} disabled={!canContinue} className="fullButton" onClick={()=>setShowBooking(true)}>Continue <ArrowRight size={18}/></motion.button>
          </> : <div className="success"><div className="successIcon"><Check/></div><div className="miniEyebrow">REQUEST RECEIVED <span /></div><h3>We’ll call you.</h3><p>Your preferred date is <b>{monthFormatter.format(new Date(selectedMonth.year, selectedMonth.month, date || 1)).split(" ")[0]} {date}, {selectedMonth.year}</b>. The Blink X team will call to confirm the time, location and shoot details.</p><motion.button whileHover={{ y: -2 }} whileTap={{ scale: .97 }} className="successBookingButton" onClick={()=>setSubmitted(false)}>Make another booking <span><ArrowRight size={16}/></span></motion.button></div>}
        </div>
      </section>

      <section className="faqSection section" id="faqs">
        <div className="faqHeader">
          <div>
            <div className="miniEyebrow">FAQ <span /></div>
            <h2>Everything you need to <em>know.</em></h2>
            <p>Simple answers before you book your content day.</p>
          </div>
        </div>
        <div className="faqGrid">
          {faqs.map(([question, answer], i) => (
            <details className="faqItem glassCard" key={question}>
              <summary><span>{question}</span><span className="faqPlus">+</span></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="footerSimpleTop">
          <div className="footerBrand">
            <img src={darkMode ? "/blinkx-logo-dark.png" : "/blinkx-logo.png"} alt="Blink X"/>
            <span>More Content. Bigger Growth.</span>
            <p>We shoot, edit and deliver high-quality short-form content. fast.</p>
            <div className="footerSocial">
              <a href="#" aria-label="Instagram"><Instagram size={16}/></a>
              <a href="#" aria-label="Video"><Video size={16}/></a>
              <a href="#" aria-label="Call"><Phone size={16}/></a>
            </div>
          </div>
          <div className="footerColumn">
            <b>Explore</b>
            <a href="#why">Why Blink X?</a><a href="#how">How It Works</a><a href="#pricing">Pricing</a>
          </div>
          <div className="footerColumn">
            <b>Services</b>
            <a href="#pricing">Content Shoots</a><a href="#pricing">Editing</a><a href="#pricing">24-Hour Delivery</a>
          </div>
          <div className="footerColumn">
            <b>Company</b>
            <a href="#pricing">Book a Shoot</a><a href="#faqs">FAQs</a><a href="#bookForm">Contact</a>
          </div>
          <a className="footerBookButton" href="#pricing">Book a Shoot <ArrowRight size={16}/></a>
        </div>
        <div className="footerBottom">
          <span>© 2026 Blink X. All rights reserved.</span>
          <span>Shot · Edit · Deliver.</span>
        </div>
      </footer>

      {showBooking && <div className="modalBack" onMouseDown={()=>setShowBooking(false)}>
        <motion.div className="bookingModal glassCard" initial={{opacity:0,y:30,scale:.97}} animate={{opacity:1,y:0,scale:1}} onMouseDown={e=>{e.stopPropagation();setModalOpenDropdown(null)}}>
          <button className="modalClose" onClick={()=>setShowBooking(false)}><X size={18}/></button>
          <div className="miniEyebrow">FINAL STEP <span /></div><h3>Tell us about your shoot.</h3>
          <div className="selectedSlot"><CalendarDays size={16}/> {monthFormatter.format(new Date(selectedMonth.year, selectedMonth.month, date || 1)).split(" ")[0]} {date}, {selectedMonth.year} <span>•</span> {time} <span>•</span> {activePackage.reels} Reels · ₹{activePackage.price.toLocaleString("en-IN")} <span>•</span> ₹{activePackage.advance.toLocaleString("en-IN")} advance</div>
          <div className="modalDropdownField">
            <div className="modalTimePickerLabel">PREFERRED CALL TIME</div>
            <button type="button" className="modalDropdownTrigger" onMouseDown={e=>e.stopPropagation()} onClick={()=>setModalOpenDropdown(v=>v==="time"?null:"time")}>
              <span className="modalDropdownValue"><Clock3 size={15}/><span><b>{time === "Discuss on call" ? "Flexible" : time.split(" (")[0]}</b><small>{time === "Discuss on call" ? "Discuss on call" : time.split(" (")[1]?.replace(")","").replace(" to "," – ")}</small></span></span>
              <ChevronDown size={16} className={modalOpenDropdown==="time" ? "open" : ""}/>
            </button>
            {modalOpenDropdown==="time" && <div className="modalDropdownMenu">
              {timeOptions.map(option=>{
                const booked = isTimeBooked(option);
                const label=option==="Discuss on call"?"Flexible":option.split(" (")[0];
                const range=option==="Discuss on call"?"Discuss on call":option.split(" (")[1]?.replace(")","").replace(" to "," – ");
                return <button type="button" key={option} disabled={booked} className={`${time===option?"selected ":""}${booked?"booked":""}`} onMouseDown={e=>e.stopPropagation()} onClick={()=>{if (!booked) {setTime(option);setModalOpenDropdown(null)}}}><span><b>{label}</b><small>{range}{booked ? " · BOOKED" : ""}</small></span>{time===option&&!booked&&<Check size={15}/>}</button>;
              })}
            </div>}
          </div>
          <div className="modalDropdownField modalPlanPicker">
            <div className="modalPlanPickerLabel">SELECT PLAN</div>
            <button type="button" className="modalDropdownTrigger" onMouseDown={e=>e.stopPropagation()} onClick={()=>setModalOpenDropdown(v=>v==="plan"?null:"plan")}>
              <span className="modalDropdownValue"><Layers3 size={15}/><span><b>{activePackage.name}</b><small>{activePackage.reels} Reels · ₹{activePackage.price.toLocaleString("en-IN")}</small></span></span>
              <ChevronDown size={16} className={modalOpenDropdown==="plan" ? "open" : ""}/>
            </button>
            {modalOpenDropdown==="plan" && <div className="modalDropdownMenu">
              {packages.map(pkg=><button type="button" key={pkg.id} className={selectedPackage===pkg.id?"selected":""} onMouseDown={e=>e.stopPropagation()} onClick={()=>{setSelectedPackage(pkg.id);setModalOpenDropdown(null)}}><span><b>{pkg.name}</b><small>{pkg.reels} Reels · ₹{pkg.price.toLocaleString("en-IN")}</small></span>{selectedPackage===pkg.id&&<Check size={15}/>}</button>)}
            </div>}
          </div>
          <div className="formGrid">{[["name","Your name *"],["business","Business / brand (optional)"],["phone","Phone number *"],["email","Email address (optional)"],["location","Shoot location / area (optional)"]].map(([k,label])=><input key={k} required={k==="name" || k==="phone"} type={k==="email"?"email":k==="phone"?"tel":"text"} className={k==="location"?"full":""} placeholder={label} value={(form as any)[k]} onChange={e=>{setForm({...form,[k]:e.target.value});setFormError("")}} />)}</div>
          <select value={form.type} onChange={e=>{setForm({...form,type:e.target.value});setFormError("")}}><option>Business / Brand</option><option>Creator / Personal brand</option><option>Event</option><option>Personal</option><option>Other</option></select>
          <p className="modalNote">Time availability, location, production requirements and the 50% advance process will be discussed with the Blink X team on the callback.</p>
          {formError && <p className="formError" role="alert">{formError}</p>}
          <motion.button whileHover={{scale:1.015}} whileTap={{scale:.985}} className="fullButton" onClick={submitBooking} disabled={bookingSubmitting}>{bookingSubmitting ? "Checking slot..." : <>Submit Booking Request <ArrowRight size={18}/></>}</motion.button>
        </motion.div>
      </div>}
    </main>
    </>
  );
}
