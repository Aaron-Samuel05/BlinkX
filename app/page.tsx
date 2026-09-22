"use client";

import React from "react";
import dynamic from "next/dynamic";

import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Check, ChevronDown, Clock3, Instagram, MapPin, Play, Phone, Sparkles, Star, Video, X, ListChecks, PenLine, CircleDot, Film, Layers3, TrendingUp, Moon, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";


const bookingMonths = Array.from({ length: 12 }, (_, i) => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + i);
  return { year: d.getFullYear(), month: d.getMonth() };
});
const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const timeOptions = ["Morning (9 AM – 12 PM)", "Afternoon (12 PM – 4 PM)", "Evening (4 PM – 7 PM)", "Discuss on call"];

const benefits: [string, string, string, LucideIcon][] = [
  ["01", "Save Time", "No more planning, scripting, shooting or editing on your own.", Clock3],
  ["02", "Grow Faster", "More content means more reach, more conversations, more customers.", ArrowRight],
  ["03", "Pro Quality", "Shoot and edited by a dedicated creative team.", Sparkles],
  ["04", "All in One", "Planning, scripts, shooting, editing, captions and music.", Star],
];


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
  ["01", "We Plan", "We bring ideas to life.", Sparkles, "IDEA", "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=88"],
  ["02", "We Shoot", "On-location with professional production.", Video, "PRODUCTION", "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=88"],
  ["03", "We Edit", "High-quality, ready-to-post reels.", Star, "POST-PRODUCTION", "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=88"],
  ["04", "You Grow", "More content. More opportunities.", ArrowRight, "GROWTH", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=88"],
];

const faqs = [
  ["What is included in a content day?", "Every package includes professional shooting, editing, captions and subtitles, music and sound design, color grading, thumbnails and 24-hour delivery. The number of ready-to-post Reels depends on the package you choose."],
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
  const [showBooking, setShowBooking] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
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

  const calendar = useMemo(() => {
    const first = new Date(selectedMonth.year, selectedMonth.month, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const count = new Date(selectedMonth.year, selectedMonth.month + 1, 0).getDate();
    return [...Array(startOffset).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  }, [selectedMonth]);
  const monthLabel = monthFormatter.format(new Date(selectedMonth.year, selectedMonth.month, 1));
  const canContinue = date !== null;
  const formComplete = [form.name, form.business, form.phone, form.email, form.location].every(value => value.trim().length > 0);

  function submitBooking() {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (!formComplete) {
      setFormError("Please fill in all fields before submitting.");
      return;
    }
    if (phoneDigits.length < 7) {
      setFormError("Please enter a valid phone number.");
      return;
    }
    if (!emailValid) {
      setFormError("Please enter a valid email address.");
      return;
    }
    setFormError("");
    setShowBooking(false);
    setSubmitted(true);
  }

  function moveHero(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    cursorX.set((e.clientX - rect.left - rect.width / 2) / 22);
    cursorY.set((e.clientY - rect.top - rect.height / 2) / 22);
  }

  return (
    <>
      <div className="blinkLoadingScreen" aria-label="Loading Blink X" role="status">
        <div className="blinkLoaderGlow glowTop" />
        <div className="blinkLoaderGlow glowBottom" />
        <div className="blinkLoaderArc arcTop" />
        <div className="blinkLoaderArc arcBottom" />

        <div className="blinkLoaderCorner cornerTopRight">
          <span>CONTENT</span><span>THAT</span><span>MOVES</span><span>BUSINESS</span><i />
        </div>
        <div className="blinkLoaderCorner cornerBottomLeft">
          <span>CREATORS</span><span>BRANDS</span><span>BUSINESSES</span><i />
        </div>
        <div className="blinkLoaderStages">
          <span>SHOOT</span><span>EDIT</span><span>DELIVER</span><span>GROW</span><i />
        </div>

        <div className="blinkLoaderCenter">
          <img src="/blinkx-logo-dark.png" alt="Blink X" className="blinkLoaderLogo" />
          <div className="blinkLoaderTagline">MORE CONTENT. LESS STRESS.</div>
          <div className="blinkLoaderProgressRow">
            <div className="blinkLoaderProgressTrack"><span /></div>
            <span className="blinkLoaderPercent">18 REELS</span>
          </div>
          <div className="blinkLoaderLabel">LOADING...</div>
        </div>
      </div>

    <main onMouseLeave={() => { cursorX.set(0); cursorY.set(0); }}>
      <div className="progress"><motion.div style={{ scaleX: scrollYProgress }} /></div>

      <nav className="nav glass">
        <a className="brand" href="#">
          <img src={darkMode ? "/blinkx-logo-dark.png" : "/blinkx-logo.png"} alt="Blink X" />
        </a>
        <div className="navlinks">
          <a href="#why">Why Blink X?</a>
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
        <div className="heroNoise" />
        <div className="heroInner">
          <motion.div className="heroCopy" style={{ y: heroY }}>
            <motion.div className="eyebrow glassPill"><Sparkles size={14}/> CONTENT THAT MOVES BUSINESS</motion.div>
            <h1><span>18 Reels.</span><span className="orange">24 Hours.</span></h1>
            <p>We come. We shoot. We edit. You grow.</p>
            <div className="heroSub">Blink X helps businesses, creators and brands get high-quality short-form content — shot and delivered within 24 hours.</div>
            <div className="heroActions">
              <motion.a whileHover={{ y: -3 }} whileTap={{ scale: .97 }} className="ctaButton orangeButton" href="#book">Book Your Shoot <span><ArrowRight size={17}/></span></motion.a>
              <motion.a whileHover={{ y: -3 }} whileTap={{ scale: .97 }} className="watchButton glass" href="#how"><span className="playCircle"><Play size={13} fill="currentColor"/></span> Watch how it works <small>01:00</small></motion.a>
            </div>
            <div className="trustRow"><div className="avatarStack"><i/><i/><i/><i/><i/></div><div><b>500+</b><span>Businesses trust Blink X</span></div></div>
          </motion.div>

          <div className="heroVisual">
            <motion.div className="heroBackText" style={{ y: blobY }}>BLINK X</motion.div>
            <motion.div className="orangeShape" style={{ y: blobY }} />
            <motion.div className="phoneWrap" style={{ y: phoneY }}>
              <div className="phone">
                <div className="phoneIsland" />
                <div className="phoneScreen">
                  <div className="phoneTop"><span>9:41</span><span>● ◔ ▪</span></div>
                  <div className="phoneGrid">
                    {heroContentThumbs.map((src, i) => (
                    <div key={src} className={"reelThumb reelThumb" + (i + 1)}>
                      <img src={src} alt="" loading={i > 2 ? "lazy" : "eager"} />
                      <span>{i + 1}</span>
                      <i className="reelPlay"><Play size={7} fill="currentColor" /></i>
                    </div>
                  ))}
                  </div>
                  <div className="phoneBottom"><b>REELS</b><span>12 / 12</span></div>
                </div>
              </div>
              <motion.div className="floatCard topCard glass" animate={{ y: [0, -10, 0], rotate: [-2, 1, -2] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                <b>⚡</b><span>18 Reels<br/><strong>24 Hours</strong></span>
              </motion.div>
              <motion.div className="floatCard bottomCard glass" animate={{ y: [0, 9, 0], rotate: [2, -1, 2] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
                <span className="tinyX">X</span><span><strong>Blink X</strong><small>More Content. Less Stress.</small></span>
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

      <section id="why" className="section why">
        <div className="sectionIntro">
          <div><div className="miniEyebrow">WHY <span /></div><h2>Why Blink <em>X?</em></h2><p>Your business deserves better content.</p></div>
          <motion.a whileHover={{ x: 5 }} href="#how" className="textButton">See how it works <ArrowRight size={17}/></motion.a>
        </div>
        <div className="benefitGrid">
          {benefits.map(([num, title, text, Icon], i) => (
            <motion.div key={title} className="benefit glassCard" initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ delay: i * .08 }}>
              <span className="benefitNo">{num}</span><div className="iconBubble"><Icon size={24} strokeWidth={2.2}/></div><h3>{title}</h3><p>{text}</p><ArrowRight size={16} className="cardArrow"/>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="problem section">
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
        <div className="howHeader"><div><div className="miniEyebrow">HOW IT WORKS <span /></div><h2>That’s where <em>Blink X</em> comes in.</h2><p>We take care of your short-form content from idea to final Reel.</p></div><div className="simpleBadge glassPill"><Sparkles size={13}/> Simple. Fast. Effective.</div></div>
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

      <section id="pricing" className="offerSection section">
        <div className="pricingHeader">
          <div className="miniEyebrow">SIMPLE PRICING <span /></div>
          <h2>Choose your <em>content day.</em></h2>
          <p>High-quality short-form content, shot and delivered within 24 hours.</p>
        </div>

        <div className="pricingOptions" id="book">
          {packages.map(pkg => {
            const features =
              pkg.id === "scale"
                ? [
                    "Shooting",
                    "Editing",
                    "Captions & Subtitles",
                    "Music & Sound Design",
                    "Color Grading",
                    "Thumbnails",
                    "24-Hour Delivery",
                    "18 Ready-to-Post Reels",
                    "1 Revision Round",
                    "Shorts + Reels + TikTok Formatting",
                    "Platform-Specific Optimization",
                    "Priority Delivery Support",
                    "Content Strategy & Shot List",
                  ]
                : pkg.id === "growth"
                ? [
                    "Shooting",
                    "Editing",
                    "Captions & Subtitles",
                    "Music & Sound Design",
                    "Color Grading",
                    "Thumbnails",
                    "24-Hour Delivery",
                    `${pkg.reels} Ready-to-Post Reels`,
                    "Hashtag Strategy",
                    "Platform-Specific Optimization",
                    "1 Revision Round",
                  ]
                : [
                    "Shooting",
                    "Editing",
                    "Captions & Subtitles",
                    "Music & Sound Design",
                    "Color Grading",
                    "Thumbnails",
                    "24-Hour Delivery",
                    `${pkg.reels} Ready-to-Post Reels`,
                  ];

            return (
              <motion.button
                key={pkg.id}
                whileTap={{ scale: .985 }}
                className={`packageCard glassCard ${selectedPackage === pkg.id ? "selected" : ""} ${pkg.id === "scale" ? "scaleCard" : ""}`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                {pkg.popular && <span className="packagePopular">MOST POPULAR</span>}
                <span className="packageName">{pkg.name}</span>
                <div className="packagePriceRow">
                  <span className="packagePrice">₹{pkg.price.toLocaleString("en-IN")}</span>
                  <span className="packageUnit">/content day</span>
                </div>
                <span className="packageReels">{pkg.reels} Reels</span>
                <span className="packageAdvance">₹{pkg.advance.toLocaleString("en-IN")} to reserve</span>

                <div className="packageFeatureList">
                  {features.map((feature, index) => (
                    <span className={`packageFeature ${pkg.id === "scale" && index === 8 ? "scaleFeatureStart" : ""}`} key={feature}>
                      <Check size={15} />
                      {feature}
                    </span>
                  ))}
                </div>

                <span className={`packageSelect ${selectedPackage === pkg.id ? "active" : ""}`}>
                  {selectedPackage === pkg.id ? `Selected ${pkg.name}` : `Select ${pkg.name}`}
                  <ArrowRight size={17} />
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="pricingHighlights">
          <div><span><Clock3 size={20} /></span><div><b>One content day</b><small>We come to you</small></div></div>
          <i />
          <div><span><Layers3 size={20} /></span><div><b>Everything included</b><small>Shoot. Edit. Deliver.</small></div></div>
          <i />
          <div><span><TrendingUp size={20} /></span><div><b>More content. More growth.</b><small>Built for businesses & creators</small></div></div>
        </div>
      </section>
      <section className="ctaSection">
        <div className="ctaEditorialGlow" />
        <div className="ctaEditorialCopy">
          <div className="miniEyebrow">READY WHEN YOU ARE <span /></div>
          <h2>Your next<br/><em>content day</em><br/>starts here.</h2>
          <p>Pick a date. We shoot. We edit. We deliver.</p>
          <motion.a whileHover={{ y: -3 }} whileTap={{ scale: .97 }} className="ctaButton orangeButton" href="#bookForm">Book Your Shoot <span><ArrowRight size={17}/></span></motion.a>
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
            <div className="calendarDays">{calendar.map((d, i)=><span key={`${selectedMonth.year}-${selectedMonth.month}-${i}`}>{d !== null && <button className={date===d?"active":""} onClick={()=>setDate(d)}>{d}</button>}</span>)}</div>
            <div className="preference" onClick={()=>setShowTimeOptions(v=>!v)} role="button" tabIndex={0}>
              <div><small>PREFERRED CALL TIME</small><b>{time}</b></div><ChevronDown size={17}/>
            </div>
            {showTimeOptions && <div className="timeOptions">{timeOptions.map(option=><button key={option} className={time===option?"selected":""} onClick={()=>{setTime(option);setShowTimeOptions(false)}}>{option}<Check size={15}/></button>)}</div>}
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
          <div className="faqBadge glassPill"><Sparkles size={14}/> BLINK X DETAILS</div>
        </div>
        <div className="faqGrid">
          {faqs.map(([question, answer], i) => (
            <details className="faqItem glassCard" key={question} open={i === 0}>
              <summary><span>{question}</span><span className="faqPlus">+</span></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="footerBrand"><img src={darkMode ? "/blinkx-logo-dark.png" : "/blinkx-logo.png"} alt="Blink X"/><span>More Content. Bigger Growth.</span></div>
        <div className="footerLinks"><a href="#why">Why Blink X?</a><a href="#how">How It Works</a><a href="#pricing">Pricing</a><a href="#bookForm">Book</a><a href="#faqs">FAQs</a></div>
        <div className="footerSocial"><a href="#"><Instagram size={16}/></a><a href="#"><Video size={16}/></a><a href="#"><Phone size={16}/></a></div>
      </footer>

      {showBooking && <div className="modalBack" onMouseDown={()=>setShowBooking(false)}>
        <motion.div className="bookingModal glassCard" initial={{opacity:0,y:30,scale:.97}} animate={{opacity:1,y:0,scale:1}} onMouseDown={e=>e.stopPropagation()}>
          <button className="modalClose" onClick={()=>setShowBooking(false)}><X size={18}/></button>
          <div className="miniEyebrow">FINAL STEP <span /></div><h3>Tell us about your shoot.</h3>
          <div className="selectedSlot"><CalendarDays size={16}/> {monthFormatter.format(new Date(selectedMonth.year, selectedMonth.month, date || 1)).split(" ")[0]} {date}, {selectedMonth.year} <span>•</span> {time} <span>•</span> {activePackage.reels} Reels · ₹{activePackage.price.toLocaleString("en-IN")} <span>•</span> ₹{activePackage.advance.toLocaleString("en-IN")} advance</div>
          <div className="formGrid">{[["name","Your name"],["business","Business / brand"],["phone","Phone number"],["email","Email address"],["location","Shoot location / area"]].map(([k,label])=><input key={k} required type={k==="email"?"email":k==="phone"?"tel":"text"} className={k==="location"?"full":""} placeholder={label} value={(form as any)[k]} onChange={e=>{setForm({...form,[k]:e.target.value});setFormError("")}} />)}</div>
          <select value={form.type} onChange={e=>{setForm({...form,type:e.target.value});setFormError("")}}><option>Business / Brand</option><option>Creator / Personal brand</option><option>Event</option><option>Personal</option><option>Other</option></select>
          <p className="modalNote">Time availability, location, production requirements and the 50% advance process will be discussed with the Blink X team on the callback.</p>
          {formError && <p className="formError" role="alert">{formError}</p>}
          <motion.button whileHover={{scale:1.015}} whileTap={{scale:.985}} className="fullButton" onClick={submitBooking}>Submit Booking Request <ArrowRight size={18}/></motion.button>
        </motion.div>
      </div>}
    </main>
    </>
  );
}
