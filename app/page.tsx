"use client";
import {useMemo,useState} from "react";
import {ArrowRight,Check,Clock3,Instagram,MapPin,Play,Phone,Video,Zap} from "lucide-react";
import {motion} from "framer-motion";

const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const times=["10:00 AM","12:00 PM","2:00 PM","4:00 PM","6:00 PM"];

export default function Home(){
 const [date,setDate]=useState<number|null>(null);
 const [time,setTime]=useState<string|null>(null);
 const [showBooking,setShowBooking]=useState(false);
 const [submitted,setSubmitted]=useState(false);
 const [form,setForm]=useState({name:"",business:"",phone:"",email:"",type:"Business / Brand",location:""});
 const calendar=useMemo(()=>Array.from({length:30},(_,i)=>i+1),[]);
 const canBook=date!==null&&time!==null;
 return <main>
  <nav className="nav"><div className="brand"><span className="mark">X</span><span>Blink X</span></div><div className="navlinks"><a href="#work">Work</a><a href="#process">How it works</a><a href="#book">Book</a></div><a className="navcta" href="#book">Book a shoot <ArrowRight size={17}/></a></nav>

  <section className="hero">
   <div className="heroGlow one"/><div className="heroGlow two"/>
   <div className="heroCopy">
    <p className="eyebrow"><Zap size={15}/> CONTENT AT THE SPEED OF LIGHT</p>
    <h1><span>12 REELS.</span><span>24 HOURS.</span><span className="accent">ONE SHOOT.</span></h1>
    <p className="heroText">We come to you, shoot your content, edit 12 reels and hand over the finished content in 24 hours.</p>
    <div className="heroActions"><a className="button primary" href="#book">Book your shoot <ArrowRight size={19}/></a><a className="button ghost" href="#work"><Play size={17} fill="currentColor"/> See the work</a></div>
    <div className="heroMeta"><span>₹15,000 / shoot</span><span>50% to book</span><span>50% on delivery</span></div>
   </div>
   <div className="heroVisual"><div className="reelFrame"><div className="scan"/><div className="reelTop"><span>BLINK X</span><span>01 / 12</span></div><div className="reelScene"><div className="sceneCircle"/><div className="sceneCard">YOUR<br/><b>BRAND.</b></div></div><div className="reelBottom">SHOOT → EDIT → DELIVER</div></div></div>
  </section>

  <section className="ticker"><div>12 REELS <i>✦</i> 24 HOURS <i>✦</i> SHOOT TODAY <i>✦</i> POST TOMORROW <i>✦</i> 12 REELS <i>✦</i> 24 HOURS</div></section>

  <section id="work" className="work">
   <div className="sectionHead"><div><p className="eyebrow">THE OUTPUT</p><h2>Built for the <span>scroll.</span></h2></div><p>Product launches, restaurants, personal brands, events and everything in between. One shoot gives you a full bank of content.</p></div>
   <div className="reelGrid">
    {[1,2,3,4,5,6].map((n)=><motion.div key={n} className="reelTile" whileHover={{scale:1.025}}><div className="tileNo">0{n}</div><div className={"tileShape s"+n}/><div className="tileLabel">{["Brand launch","Restaurant","Founder","Product","Event","Creator"][n-1]}</div><div className="tilePlay"><Play size={19} fill="currentColor"/></div></motion.div>)}
   </div>
  </section>

  <section id="process" className="process"><div className="sectionHead"><div><p className="eyebrow">THE BLINK X METHOD</p><h2>Fast in. <span>Fast out.</span></h2></div></div>
   <div className="steps">{[
    ["01","BOOK","Pick a date and time that works. Your slot is reserved instantly.","Calendar"],
    ["02","SHOOT","Our team comes to your location and captures everything we need for 12 reels.","On location"],
    ["03","EDIT","We turn the footage into 12 polished, social-ready edits.","In-house"],
    ["04","DELIVER","Get your 12 reels via a Google Drive link within 24 hours of the shoot.","24 hours"]
   ].map(([num,title,text,badge])=><div className="step" key={num}><div className="num">{num}</div><div><div className="stepBadge">{badge}</div><h3>{title}</h3><p>{text}</p></div></div>)}</div>
  </section>

  <section className="offer"><div className="offerMark">X</div><div><p className="eyebrow">ONE SIMPLE OFFER</p><h2>₹15,000</h2><p>Everything needed for your 12-reel content day. <b>50% to reserve.</b> The balance is due on delivery.</p></div><div className="offerList">{["12 edited vertical reels","Shoot + production","Editing + finishing","Social-ready exports","Google Drive delivery"].map(x=><span key={x}><Check size={17}/>{x}</span>)}</div></section>

  <section id="book" className="booking">
   <div className="bookingIntro"><p className="eyebrow">RESERVE YOUR SLOT</p><h2>Pick a date.<br/><span>We’ll call you.</span></h2><p>Choose your preferred day and time. Once the booking request is submitted, the Blink X team will call you to discuss the shoot, location and remaining details.</p><div className="bookingInfo"><span><Phone size={17}/> Team callback after booking</span><span><MapPin size={17}/> Location confirmed on call</span><span><Clock3 size={17}/> 24-hour delivery</span></div></div>
   <div className="calendarCard">
    {!submitted ? <>
    <div className="calendarHeader"><div><span className="month">September 2026</span><small>Choose your preferred date</small></div><div className="miniMark">X</div></div>
    <div className="week">{days.map(d=><span key={d}>{d}</span>)}</div>
    <div className="days">{calendar.map(d=><button key={d} className={date===d?"selected":""} onClick={()=>setDate(d)}>{d}</button>)}</div>
    <div className="timeRow"><span>Preferred time</span><div>{times.map(t=><button key={t} className={time===t?"selected":""} onClick={()=>setTime(t)}>{t}</button>)}</div></div>
    <button disabled={!canBook} className="bookButton" onClick={()=>setShowBooking(true)}>Continue <ArrowRight size={19}/></button>
    </>:<div className="success"><div className="successIcon"><Check/></div><p className="eyebrow">BOOKING REQUEST RECEIVED</p><h3>We’ll call you.</h3><p>Your preferred slot is <b>September {date}, 2026 · {time}</b>. Blink X will contact you to discuss the shoot details and the 50% advance.</p><a href="#" onClick={(e)=>{e.preventDefault();setSubmitted(false);setShowBooking(false)}}>Make another booking</a></div>}
   </div>
  </section>

  <footer><div className="footerBrand"><span className="mark">X</span><span>Blink X</span></div><p>Content, at the speed of light.</p><div className="footerRight"><a href="#book">Book a shoot</a><a href="#work">Instagram <Instagram size={15}/></a></div></footer>

  {showBooking&&<div className="modalBack" onMouseDown={()=>setShowBooking(false)}><motion.div className="modal" initial={{y:30,opacity:0}} animate={{y:0,opacity:1}} onMouseDown={e=>e.stopPropagation()}><div className="modalHead"><div><p className="eyebrow">FINAL STEP</p><h3>Tell us who’s booking.</h3></div><button onClick={()=>setShowBooking(false)}>×</button></div><div className="selectedSummary">Sep {date}, 2026 <span>•</span> {time}<span>•</span> ₹7,500 advance</div><div className="formGrid">{[
   ["name","Your name"],["business","Business / brand"],["phone","Phone number"],["email","Email address"],["location","Shoot location / area"]
  ].map(([k,label])=><input key={k} placeholder={label} value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})} className={k==="location"?"full":""}/>)}</div><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option>Business / Brand</option><option>Creator / Personal brand</option><option>Event</option><option>Personal</option><option>Other</option></select><p className="modalNote">Available times, location, production details and all shoot requirements will be discussed with the Blink X team on the callback.</p><button className="bookButton" onClick={()=>{setShowBooking(false);setSubmitted(true)}}>Submit booking request <ArrowRight size={18}/></button></motion.div></div>}
 </main>
}