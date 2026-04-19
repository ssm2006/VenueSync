"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useFirestoreData } from "../lib/firebase/firestore";
import { auth } from "../lib/firebase/config";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { WeatherWidget } from "../components/features/WeatherWidget";
import { EventTimeline } from "../components/features/EventTimeline";

// ─── ICONS (Lucide-style inline SVGs to avoid import issues) ──────────────
const Icon = ({ d, size = 18, color = "currentColor", strokeWidth = 1.75, fill = "none", ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>{Array.isArray(d) ? d.map((p,i) => <path key={i} d={p}/>) : <path d={d}/>}</svg>
);
const Icons = {
  wifi: "M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  menu: ["M3 12h18","M3 6h18","M3 18h18"],
  x: ["M18 6L6 18","M6 6l12 12"],
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  map: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  utensils: ["M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2","M7 2v20","M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"],
  shoppingBag: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0",
  navigation: "M3 11l19-9-9 19-2-8-8-2z",
  clock: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
  trending: ["M23 6l-9.5 9.5-5-5L1 18","M17 6h6v6"],
  alert: ["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4","M12 17h.01"],
  check: "M20 6L9 17l-5-5",
  checkCircle: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  route: ["M3 11l18-5v12L3 14v-3z","M11.6 16.8a3 3 0 1 1-5.8-1.6"],
  qr: ["M3 3h7v7H3z","M14 3h7v7h-7z","M14 14h7v7h-7z","M3 14h7v7H3z","M6 6h1v1H6z","M17 6h1v1h-1z","M17 17h1v1h-1z","M6 17h1v1H6z"],
  truck: ["M1 3h15v13H1z","M16 8h4l3 3v5h-7V8z","M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z","M18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"],
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
  percent: ["M19 5L5 19","M6.5 3.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z","M17.5 14.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  coffee: ["M18 8h1a4 4 0 0 1 0 8h-1","M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z","M6 1v3","M10 1v3","M14 1v3"],
  beer: ["M17 11l1-8H6l1 8","M5 11a2 2 0 0 0 0 4c0 2 2 4 7 4s7-2 7-4a2 2 0 0 0 0-4"],
  plus: ["M12 5v14","M5 12h14"],
  minus: "M5 12h14",
  arrowRight: ["M5 12h14","M12 5l7 7-7 7"],
  eye: ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  eyeOff: ["M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24","M1 1l22 22"],
  grid: ["M3 3h7v7H3z","M14 3h7v7h-7z","M14 14h7v7h-7z","M3 14h7v7H3z"],
  settings: ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z","M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"],
  logOut: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4","M16 17l5-5-5-5","M21 12H9"],
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  flame: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
  package: ["M16.5 9.4l-9-5.19","M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z","M3.27 6.96L12 12.01l8.73-5.05","M12 22.08V12"],
  ice: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
  ticket: ["M15 5v2","M15 11v2","M15 17v2","M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z"],
  trophy: ["M6 9H4.5a2.5 2.5 0 0 1 0-5H6","M18 9h1.5a2.5 2.5 0 0 0 0-5H18","M4 22h16","M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22","M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22","M18 2H6v7a6 6 0 0 0 12 0V2z"],
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  locate: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z","M4.93 4.93l4.24 4.24","M14.83 14.83l4.24 4.24","M4.93 19.07l4.24-4.24","M14.83 9.17l4.24-4.24"],
  scan: ["M3 7V5a2 2 0 0 1 2-2h2","M17 3h2a2 2 0 0 1 2 2v2","M21 17v2a2 2 0 0 1-2 2h-2","M7 21H5a2 2 0 0 1-2-2v-2"],
  chevronDown: "M6 9l6 6 6-6",
  globe: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M2 12h20","M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"],
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────
const STADIUM_SECTIONS = [
  { id:"gate-north", label:"North Gate", type:"gate", x:47, y:5, w:6, h:5, capacity:0.35, wait:2, crowd:340, max:900 },
  { id:"gate-south", label:"South Gate", type:"gate", x:47, y:90, w:6, h:5, capacity:0.82, wait:11, crowd:738, max:900 },
  { id:"gate-east", label:"East Gate", type:"gate", x:91, y:47, w:5, h:6, capacity:0.55, wait:5, crowd:495, max:900 },
  { id:"gate-west", label:"West Gate", type:"gate", x:4, y:47, w:5, h:6, capacity:0.28, wait:2, crowd:252, max:900 },
  { id:"stand-north", label:"North Stand", type:"stand", x:32, y:8, w:36, h:18, capacity:0.91, wait:0, crowd:8190, max:9000 },
  { id:"stand-south", label:"South Stand", type:"stand", x:32, y:74, w:36, h:18, capacity:0.87, wait:0, crowd:7830, max:9000 },
  { id:"stand-east", label:"East Stand", type:"stand", x:74, y:28, w:18, h:44, capacity:0.78, wait:0, crowd:5460, max:7000 },
  { id:"stand-west", label:"West Stand", type:"stand", x:8, y:28, w:18, h:44, capacity:0.72, wait:0, crowd:5040, max:7000 },
  { id:"food-nw", label:"NW Food Court", type:"food", x:10, y:10, w:14, h:12, capacity:0.68, wait:9, crowd:68, max:100 },
  { id:"food-ne", label:"NE Food Court", type:"food", x:76, y:10, w:14, h:12, capacity:0.45, wait:5, crowd:45, max:100 },
  { id:"food-sw", label:"SW Food Court", type:"food", x:10, y:78, w:14, h:12, capacity:0.88, wait:16, crowd:88, max:100 },
  { id:"food-se", label:"SE Food Court", type:"food", x:76, y:78, w:14, h:12, capacity:0.52, wait:7, crowd:52, max:100 },
  { id:"wc-nw", label:"Washroom NW", type:"washroom", x:27, y:10, w:8, h:7, capacity:0.3, wait:1, crowd:9, max:30 },
  { id:"wc-ne", label:"Washroom NE", type:"washroom", x:65, y:10, w:8, h:7, capacity:0.83, wait:8, crowd:25, max:30 },
  { id:"wc-sw", label:"Washroom SW", type:"washroom", x:27, y:83, w:8, h:7, capacity:0.47, wait:3, crowd:14, max:30 },
  { id:"wc-se", label:"Washroom SE", type:"washroom", x:65, y:83, w:8, h:7, capacity:0.6, wait:5, crowd:18, max:30 },
  { id:"merch-nw", label:"Fan Shop NW", type:"merch", x:10, y:24, w:10, h:8, capacity:0.55, wait:4, crowd:55, max:100 },
  { id:"merch-ne", label:"Fan Shop NE", type:"merch", x:80, y:24, w:10, h:8, capacity:0.7, wait:7, crowd:70, max:100 },
  { id:"merch-sw", label:"Fan Shop SW", type:"merch", x:10, y:68, w:10, h:8, capacity:0.4, wait:3, crowd:40, max:100 },
  { id:"merch-se", label:"Fan Shop SE", type:"merch", x:80, y:68, w:10, h:8, capacity:0.9, wait:14, crowd:90, max:100 },
  { id:"pitch", label:"The Pitch", type:"pitch", x:28, y:28, w:44, h:44, capacity:0, wait:0, crowd:0, max:0 },
  { id:"vip-box", label:"VIP Boxes", type:"vip", x:36, y:26, w:28, h:6, capacity:0.6, wait:0, crowd:120, max:200 },
  { id:"media", label:"Media Centre", type:"media", x:36, y:68, w:28, h:6, capacity:0.5, wait:0, crowd:40, max:80 },
];

const MENU = [
  { id:"m1", name:"Signature Burger", price:14.50, cal:820, icon:"utensils", cat:"mains", prep:8 },
  { id:"m2", name:"Loaded Nachos", price:11.00, cal:650, icon:"utensils", cat:"mains", prep:5 },
  { id:"m3", name:"Gourmet Hot Dog", price:9.50, cal:480, icon:"utensils", cat:"mains", prep:4 },
  { id:"m4", name:"Chicken Strips", price:12.00, cal:560, icon:"utensils", cat:"mains", prep:7 },
  { id:"m5", name:"Craft IPA", price:8.50, cal:210, icon:"beer", cat:"drinks", prep:1 },
  { id:"m6", name:"Sparkling Water", price:3.50, cal:0, icon:"coffee", cat:"drinks", prep:1 },
  { id:"m7", name:"Cold Brew Coffee", price:5.50, cal:15, icon:"coffee", cat:"drinks", prep:2 },
  { id:"m8", name:"Lemonade", price:4.50, cal:120, icon:"coffee", cat:"drinks", prep:1 },
  { id:"m9", name:"Churros", price:6.50, cal:380, icon:"utensils", cat:"snacks", prep:4 },
  { id:"m10", name:"Ice Cream Tub", price:5.00, cal:280, icon:"utensils", cat:"snacks", prep:1 },
];

const ALERTS_DATA = [
  { id:1, type:"deal", title:"Flash Offer", msg:"20% off at NW Food Court — only 4 min walk! Ends in 12 minutes.", icon:"🎯" },
  { id:2, type:"warning", title:"Gate Congestion", msg:"South Gate is at 82% capacity. Use North Gate for faster exit — save 9 min.", icon:"⚠️" },
  { id:3, type:"deal", title:"Merch Deal", msg:"15% off all jerseys at Fan Shop NE right now. Show your e-ticket.", icon:"🛍️" },
  { id:4, type:"info", title:"Washroom Clear", msg:"NW Washrooms just cleared — under 1 min wait. Perfect timing!", icon:"✅" },
  { id:5, type:"deal", title:"Halftime Special", msg:"Buy any main + drink at SE Food Court and get free nachos.", icon:"🔥" },
];

const ROUTE_STEPS = {
  food: ["Head to Section 7 concourse","Turn left at the main corridor","NW Food Court entrance on your right","Order via app for priority pickup"],
  washroom: ["Continue 60m along North Stand","Take elevator to Level 2","Turn right at the top","NW Washrooms — 1 min wait currently"],
  merch: ["Follow green signage toward Fan Zone","Pass Gate West turnstiles","Fan Shop NW is straight ahead","Show digital ticket for 10% member discount"],
  gate: ["Proceed along North concourse","Gate North is signposted ahead","Scan your digital ticket at turnstile","Exit toward North Car Park"],
  vip: ["Use dedicated VIP elevator — Level 3","Show VIP lanyard at checkpoint","Concierge service available at desk","Complimentary champagne reception"],
};

// ─── UTILITIES ─────────────────────────────────────────────────────────────
function getStatusColor(cap, alpha = 1) {
  if (cap < 0.5) return `rgba(16,185,129,${alpha})`;
  if (cap < 0.8) return `rgba(245,158,11,${alpha})`;
  return `rgba(239,68,68,${alpha})`;
}
function getStatusLabel(cap) {
  if (cap < 0.5) return "Open";
  if (cap < 0.8) return "Busy";
  return "Full";
}
function getTypeColor(type) {
  return { gate:"#6366f1", food:"#f59e0b", washroom:"#0ea5e9", merch:"#ec4899", stand:"#374151", pitch:"#16a34a", vip:"#d97706", media:"#64748b" }[type] || "#6b7280";
}
function getTypeLabel(type) {
  return { gate:"Gate", food:"Food & Drink", washroom:"Washroom", merch:"Merchandise", stand:"Seating Stand", pitch:"Pitch", vip:"VIP Suite", media:"Media" }[type] || type;
}

// ─── STYLES ──────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0b0f;
    --bg2: #0f1117;
    --bg3: #161820;
    --surface: rgba(255,255,255,0.04);
    --surface2: rgba(255,255,255,0.07);
    --border: rgba(255,255,255,0.08);
    --border2: rgba(255,255,255,0.14);
    --text: #f1f0ee;
    --text2: #9d9c9a;
    --text3: #6b6a68;
    --accent: #7c6deb;
    --accent2: #9d91f0;
    --gold: #f59e0b;
    --green: #10b981;
    --red: #ef4444;
    --amber: #f59e0b;
    --mono: 'JetBrains Mono', monospace;
    --font: 'Outfit', sans-serif;
  }
  html { scroll-behavior: smooth; }
  body { font-family: var(--font); background: var(--bg); color: var(--text); overflow-x: hidden; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
  ::selection { background: rgba(124,109,235,0.35); }

  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes slideDown { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideRight { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
  @keyframes toastIn { from { opacity:0; transform:translateX(110%); } to { opacity:1; transform:translateX(0); } }
  @keyframes toastOut { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(110%); } }
  @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.55; transform:scale(0.88); } }
  @keyframes shimmer { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes gradientShift { 0%,100%{ background-position:0% 50%; } 50%{ background-position:100% 50%; } }
  @keyframes float { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-8px); } }
  @keyframes scanline { 0%{ transform:translateY(-100%); } 100%{ transform:translateY(100vh); } }

  .btn-primary {
    display:inline-flex; align-items:center; gap:8px;
    padding:12px 28px; border-radius:12px; border:none; cursor:pointer;
    font-family:var(--font); font-size:14px; font-weight:600; letter-spacing:0.01em;
    background:linear-gradient(135deg,#7c6deb,#9b8af5);
    color:white; transition:all 0.2s; position:relative; overflow:hidden;
  }
  .btn-primary::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,#9b8af5,#7c6deb); opacity:0; transition:opacity 0.2s; }
  .btn-primary:hover::after { opacity:1; }
  .btn-primary:hover { transform:translateY(-1px); box-shadow:0 8px 32px rgba(124,109,235,0.4); }
  .btn-primary:active { transform:translateY(0); }
  .btn-primary span { position:relative; z-index:1; }
  .btn-ghost {
    display:inline-flex; align-items:center; gap:8px;
    padding:11px 24px; border-radius:12px; cursor:pointer;
    font-family:var(--font); font-size:14px; font-weight:500;
    background:transparent; color:var(--text2); border:1px solid var(--border2);
    transition:all 0.2s;
  }
  .btn-ghost:hover { background:var(--surface2); color:var(--text); border-color:rgba(255,255,255,0.25); }
  .glass {
    background:rgba(255,255,255,0.04); backdrop-filter:blur(20px);
    -webkit-backdrop-filter:blur(20px); border:1px solid var(--border);
    border-radius:16px;
  }
  .glass-strong {
    background:rgba(255,255,255,0.07); backdrop-filter:blur(32px);
    -webkit-backdrop-filter:blur(32px); border:1px solid var(--border2);
    border-radius:20px;
  }
  .skeleton {
    background:linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size:200% 100%; animation:shimmer 1.6s infinite; border-radius:8px;
  }
  .tab-btn { display:flex; align-items:center; gap:7px; padding:8px 16px; border-radius:10px; border:none; cursor:pointer; font-family:var(--font); font-size:13px; font-weight:500; background:transparent; color:var(--text2); transition:all 0.18s; white-space:nowrap; }
  .tab-btn:hover { background:var(--surface2); color:var(--text); }
  .tab-btn.active { background:rgba(124,109,235,0.18); color:#a89df5; }
  .hover-scale { transition:transform 0.18s, box-shadow 0.18s; }
  .hover-scale:hover { transform:scale(1.025); }
  input, textarea { font-family:var(--font); }
`;

// ─── SKELETON ─────────────────────────────────────────────────────────────
const Skel = ({ w="100%", h=16, r=6 }) => (
  <div className="skeleton" style={{ width:w, height:h, borderRadius:r }} />
);

// ─── TOAST SYSTEM ─────────────────────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }) {
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, display:"flex", flexDirection:"column", gap:10, maxWidth:360 }}>
      {toasts.map(t => (
        <div key={t.uid} style={{
          display:"flex", gap:12, alignItems:"flex-start",
          padding:"14px 16px", borderRadius:14,
          background: t.type==="deal" ? "rgba(245,158,11,0.12)" : t.type==="warning" ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.1)",
          border:`1px solid ${t.type==="deal" ? "rgba(245,158,11,0.3)" : t.type==="warning" ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.25)"}`,
          backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
          boxShadow:"0 8px 32px rgba(0,0,0,0.4)",
          animation: t.exiting ? "toastOut 0.3s ease forwards" : "toastIn 0.35s ease",
        }}>
          <span style={{ fontSize:20, flexShrink:0 }}>{t.icon}</span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:3 }}>{t.title}</div>
            <div style={{ fontSize:12, color:"var(--text2)", lineHeight:1.5 }}>{t.msg}</div>
          </div>
          <button onClick={() => onDismiss(t.uid)} style={{
            flexShrink:0, width:22, height:22, borderRadius:"50%", border:"none", cursor:"pointer",
            background:"rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center",
            marginTop:1,
          }}>
            <Icon d={Icons.x} size={11} color="var(--text2)" strokeWidth={2.5}/>
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────
function Landing({ onEnter }) {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const features = [
    { icon:"🗺️", title:"Live 3D Stadium Map", desc:"Interactive real-time occupancy map showing crowd density, wait times and optimal routing across every zone of your venue." },
    { icon:"⚡", title:"Zero-Queue Ordering", desc:"In-seat food, drink and merchandise ordering with QR express pickup or direct seat delivery. Eliminate lines entirely." },
    { icon:"🧭", title:"Smart Pathfinding", desc:"AI-powered routing that calculates the fastest route to any amenity, updated every 30 seconds with live congestion data." },
    { icon:"📣", title:"Crowd Dispersal Alerts", desc:"Intelligent push notifications with real-time incentives to naturally balance crowd flow and reduce bottlenecks." },
    { icon:"🔒", title:"Enterprise Security", desc:"SOC2 compliant infrastructure with end-to-end encryption, role-based access control and full audit trails." },
    { icon:"📊", title:"Operations Analytics", desc:"Comprehensive dashboards for venue operators with historical trends, predictive modelling and exportable reports." },
  ];

  const stats = [
    { value:"240+", label:"Venues Worldwide" },
    { value:"98.7%", label:"Uptime SLA" },
    { value:"4.2M", label:"Events Managed" },
    { value:"34s", label:"Avg Alert Response" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", overflow:"hidden" }}>
      {/* Nav */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        padding:"0 48px", height:68,
        display:"flex", alignItems:"center", gap:32,
        background: scrollY > 40 ? "rgba(10,11,15,0.92)" : "transparent",
        backdropFilter: scrollY > 40 ? "blur(24px)" : "none",
        borderBottom: scrollY > 40 ? "1px solid var(--border)" : "none",
        transition:"all 0.3s",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#7c6deb,#9b8af5)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon d={Icons.wifi} size={16} color="white" strokeWidth={2}/>
          </div>
          <span style={{ fontSize:17, fontWeight:800, letterSpacing:"-0.02em", color:"var(--text)" }}>VenueSync</span>
        </div>
        <div style={{ flex:1 }}/>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          {["Product","Pricing","Docs","Blog"].map(l => (
            <button key={l} style={{ padding:"8px 14px", background:"none", border:"none", color:"var(--text2)", cursor:"pointer", fontFamily:"var(--font)", fontSize:13, fontWeight:500, transition:"color 0.15s" }}
              onMouseEnter={e=>e.target.style.color="var(--text)"} onMouseLeave={e=>e.target.style.color="var(--text2)"}>{l}</button>
          ))}
          <button onClick={onEnter} className="btn-ghost" style={{ marginLeft:8 }}><span>Sign in</span></button>
          <button onClick={onEnter} className="btn-primary"><span>Get Started</span></button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"120px 48px 80px", position:"relative", textAlign:"center" }}>
        {/* Ambient glow */}
        <div style={{ position:"absolute", top:"20%", left:"50%", transform:"translateX(-50%)", width:800, height:500, background:"radial-gradient(ellipse,rgba(124,109,235,0.18) 0%,transparent 70%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", top:"60%", left:"20%", width:300, height:300, background:"radial-gradient(ellipse,rgba(16,185,129,0.08) 0%,transparent 70%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", top:"40%", right:"15%", width:350, height:350, background:"radial-gradient(ellipse,rgba(245,158,11,0.07) 0%,transparent 70%)", pointerEvents:"none" }}/>

        {/* Badge */}
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 16px", borderRadius:99, border:"1px solid rgba(124,109,235,0.35)", background:"rgba(124,109,235,0.1)", marginBottom:28, animation:"fadeUp 0.6s ease" }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", animation:"pulse 2s infinite" }}/>
          <span style={{ fontSize:12, fontWeight:600, color:"#a89df5", letterSpacing:"0.04em", textTransform:"uppercase" }}>Now live at 240+ stadiums worldwide</span>
        </div>

        <h1 style={{ fontSize:"clamp(44px,7vw,88px)", fontWeight:900, letterSpacing:"-0.04em", lineHeight:1.0, marginBottom:24, animation:"fadeUp 0.6s ease 0.1s both", maxWidth:900 }}>
          The Venue Intelligence<br/>
          <span style={{ background:"linear-gradient(135deg,#7c6deb,#a89df5,#f59e0b)", backgroundClip:"text", WebkitBackgroundClip:"text", color:"transparent", backgroundSize:"200% 200%", animation:"gradientShift 4s ease infinite" }}>
            Platform
          </span>
        </h1>

        <p style={{ fontSize:"clamp(16px,2vw,20px)", color:"var(--text2)", maxWidth:560, lineHeight:1.7, marginBottom:44, animation:"fadeUp 0.6s ease 0.2s both", fontWeight:400 }}>
          Real-time crowd management, AI-powered routing, and frictionless fan experiences — built for the world's largest sporting venues.
        </p>

        <div style={{ display:"flex", gap:14, animation:"fadeUp 0.6s ease 0.3s both" }}>
          <button onClick={onEnter} className="btn-primary" style={{ padding:"15px 36px", fontSize:15, borderRadius:14 }}>
            <span>Enter Dashboard</span>
            <Icon d={Icons.arrowRight} size={16} color="white"/>
          </button>
          <button className="btn-ghost" style={{ padding:"15px 36px", fontSize:15, borderRadius:14 }}>
            <Icon d={Icons.eye} size={15} color="currentColor"/>
            Watch demo
          </button>
        </div>

        {/* Hero visual — stadium SVG */}
        <div style={{ marginTop:72, width:"100%", maxWidth:860, animation:"fadeUp 0.8s ease 0.4s both", position:"relative" }}>
          <div style={{ borderRadius:24, border:"1px solid var(--border2)", overflow:"hidden", background:"var(--bg2)", boxShadow:"0 40px 120px rgba(0,0,0,0.6)", position:"relative" }}>
            {/* Mock dashboard screenshot */}
            <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ display:"flex", gap:7 }}>
                {["#ef4444","#f59e0b","#10b981"].map(c => <div key={c} style={{ width:11, height:11, borderRadius:"50%", background:c }}/>)}
              </div>
              <div style={{ flex:1, display:"flex", justifyContent:"center" }}>
                <div style={{ padding:"4px 20px", borderRadius:7, background:"var(--surface)", border:"1px solid var(--border)", fontSize:11, color:"var(--text3)", fontFamily:"var(--mono)" }}>app.venuesync.io/dashboard</div>
              </div>
            </div>
            <StadiumMapPreview />
          </div>
          <div style={{ position:"absolute", bottom:-1, left:0, right:0, height:120, background:"linear-gradient(transparent, var(--bg))", borderRadius:"0 0 24px 24px", pointerEvents:"none" }}/>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ padding:"0 48px 100px" }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, borderRadius:20, overflow:"hidden", border:"1px solid var(--border)", background:"var(--border)" }}>
          {stats.map((s,i) => (
            <div key={i} style={{ padding:"36px 24px", background:"var(--bg2)", textAlign:"center" }}>
              <div style={{ fontSize:36, fontWeight:800, letterSpacing:"-0.03em", color:"var(--text)", marginBottom:8 }}>{s.value}</div>
              <div style={{ fontSize:13, color:"var(--text2)", fontWeight:400 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ padding:"0 48px 120px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:64 }}>
            <div style={{ fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em", color:"#a89df5", marginBottom:16 }}>Platform Capabilities</div>
            <h2 style={{ fontSize:"clamp(30px,4vw,48px)", fontWeight:800, letterSpacing:"-0.03em" }}>Everything you need,<br/>nothing you don't.</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            {features.map((f,i) => (
              <div key={i} className="glass hover-scale" style={{ padding:"28px 26px", animation:`fadeUp 0.5s ease ${i*0.08}s both`, cursor:"default" }}>
                <div style={{ fontSize:32, marginBottom:16 }}>{f.icon}</div>
                <div style={{ fontSize:16, fontWeight:700, marginBottom:10, letterSpacing:"-0.01em" }}>{f.title}</div>
                <div style={{ fontSize:13, color:"var(--text2)", lineHeight:1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding:"0 48px 100px" }}>
        <div style={{ maxWidth:700, margin:"0 auto", textAlign:"center", padding:"72px 48px", borderRadius:28, border:"1px solid var(--border2)", background:"linear-gradient(135deg,rgba(124,109,235,0.08),rgba(245,158,11,0.05))", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-100, left:"50%", transform:"translateX(-50%)", width:500, height:300, background:"radial-gradient(ellipse,rgba(124,109,235,0.15) 0%,transparent 70%)", pointerEvents:"none" }}/>
          <h2 style={{ fontSize:"clamp(26px,4vw,40px)", fontWeight:800, letterSpacing:"-0.03em", marginBottom:16 }}>Ready to transform<br/>your venue?</h2>
          <p style={{ fontSize:15, color:"var(--text2)", marginBottom:36, lineHeight:1.7 }}>Join 240 stadiums and arenas using VenueSync to deliver extraordinary fan experiences.</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            <button onClick={onEnter} className="btn-primary" style={{ padding:"14px 32px", fontSize:15, borderRadius:14 }}>
              <span>Start Free Trial</span>
            </button>
            <button className="btn-ghost" style={{ padding:"14px 28px", fontSize:15, borderRadius:14 }}>Talk to Sales</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop:"1px solid var(--border)", padding:"32px 48px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:26, height:26, borderRadius:8, background:"linear-gradient(135deg,#7c6deb,#9b8af5)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon d={Icons.wifi} size={13} color="white" strokeWidth={2}/>
          </div>
          <span style={{ fontSize:14, fontWeight:700, color:"var(--text)" }}>VenueSync</span>
        </div>
        <span style={{ fontSize:12, color:"var(--text3)" }}>© 2025 VenueSync Inc. All rights reserved.</span>
        <div style={{ display:"flex", gap:20 }}>
          {["Privacy","Terms","Security"].map(l => (
            <span key={l} style={{ fontSize:12, color:"var(--text3)", cursor:"pointer" }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── STADIUM MAP PREVIEW (hero) ───────────────────────────────────────────
function StadiumMapPreview() {
  return (
    <div style={{ padding:24, background:"var(--bg2)", minHeight:380, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:"100%", maxWidth:680, position:"relative" }}>
        <svg viewBox="0 0 100 100" style={{ width:"100%", filter:"drop-shadow(0 0 20px rgba(124,109,235,0.2))" }}>
          {STADIUM_SECTIONS.map(s => {
            const c = s.type==="pitch" ? "#16a34a" : getStatusColor(s.capacity, 0.7);
            return (
              <rect key={s.id} x={s.x} y={s.y} width={s.w} height={s.h}
                fill={s.type==="pitch" ? "rgba(22,163,74,0.3)" : `${c.replace("rgba","rgba").replace(/,[\d.]+\)$/, ",0.18)")}`}
                stroke={c} strokeWidth={0.4} rx={0.8}
              />
            );
          })}
        </svg>
        <div style={{ position:"absolute", top:12, right:12, padding:"8px 12px", borderRadius:10, background:"rgba(0,0,0,0.7)", border:"1px solid var(--border)", backdropFilter:"blur(12px)" }}>
          <div style={{ fontSize:10, color:"var(--text2)", marginBottom:6, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Live Density</div>
          {[["🟢","Available"],["🟡","Busy"],["🔴","Full"]].map(([e,l]) => (
            <div key={l} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
              <span style={{ fontSize:8 }}>{e}</span>
              <span style={{ fontSize:10, color:"var(--text2)" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────────────────
function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleGoogleLogin = async () => {
    if (!auth) { setErr("Firebase Auth is not initialized."); return; }
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      onLogin({ name: cred.user.displayName || cred.user.email?.split("@")[0] || "User", email: cred.user.email });
    } catch (error: any) {
      setErr(error.message.replace("Firebase: ", ""));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!auth) { setErr("Firebase Auth is not initialized."); return; }
    if (!email || !password) { setErr("Please fill in all fields."); return; }
    if (mode === "signup" && !name) { setErr("Please enter your name."); return; }
    setErr("");
    setLoading(true);
    try {
      if (mode === "login") {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        onLogin({ name: cred.user.displayName || email.split("@")[0], email: cred.user.email });
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        onLogin({ name, email });
      }
    } catch (err: any) {
      setErr(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width:"100%", padding:"13px 16px", borderRadius:12, border:"1px solid var(--border2)",
    background:"rgba(255,255,255,0.04)", color:"var(--text)", fontSize:14,
    fontFamily:"var(--font)", outline:"none", transition:"border-color 0.2s",
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24, background:"var(--bg)", position:"relative" }}>
      <div style={{ position:"absolute", top:"30%", left:"50%", transform:"translateX(-50%)", width:600, height:400, background:"radial-gradient(ellipse,rgba(124,109,235,0.12) 0%,transparent 70%)", pointerEvents:"none" }}/>

      <div style={{ width:"100%", maxWidth:420, animation:"fadeUp 0.5s ease" }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:24 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:"linear-gradient(135deg,#7c6deb,#9b8af5)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Icon d={Icons.wifi} size={20} color="white" strokeWidth={2}/>
            </div>
            <span style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.02em" }}>VenueSync</span>
          </div>
          <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.03em", marginBottom:8 }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p style={{ fontSize:14, color:"var(--text2)" }}>
            {mode === "login" ? "Sign in to your dashboard" : "Start your 30-day free trial"}
          </p>
        </div>

        <div className="glass-strong" style={{ padding:32 }}>
          {/* Social */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:24 }}>
            {["Microsoft", "Google"].map((l) => (
              <button key={l} type="button" onClick={() => l === "Google" ? handleGoogleLogin() : setErr("Microsoft login not configured yet.")} style={{ ...inputStyle, display:"flex", alignItems:"center", justifyContent:"center", gap:8, cursor:"pointer", border:"1px solid var(--border2)", transition:"all 0.2s" }}
                onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.2)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor="var(--border2)"; }}
              >
                <span style={{ fontSize:15 }}><Icon d={l === "Google" ? Icons.user : Icons.user} size={15} color="var(--text2)"/></span>
                <span style={{ fontSize:13, fontWeight:500, color:"var(--text2)" }}>{l}</span>
              </button>
            ))}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24 }}>
            <div style={{ flex:1, height:1, background:"var(--border)" }}/>
            <span style={{ fontSize:12, color:"var(--text3)", fontWeight:500 }}>or continue with email</span>
            <div style={{ flex:1, height:1, background:"var(--border)" }}/>
          </div>

          <form onSubmit={submit}>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {mode === "signup" && (
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:"0.06em" }}>Full Name</label>
                  <input value={name} onChange={e=>setName(e.target.value)} placeholder="Alex Morgan" style={inputStyle}
                    onFocus={e=>e.target.style.borderColor="rgba(124,109,235,0.6)"} onBlur={e=>e.target.style.borderColor="var(--border2)"}/>
                </div>
              )}
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:"0.06em" }}>Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@venue.com" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor="rgba(124,109,235,0.6)"} onBlur={e=>e.target.style.borderColor="var(--border2)"}/>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:"0.06em" }}>Password</label>
                <div style={{ position:"relative" }}>
                  <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, paddingRight:44 }}
                    onFocus={e=>e.target.style.borderColor="rgba(124,109,235,0.6)"} onBlur={e=>e.target.style.borderColor="var(--border2)"}/>
                  <button type="button" onClick={()=>setShowPw(p=>!p)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", padding:2 }}>
                    <Icon d={showPw ? Icons.eyeOff : Icons.eye} size={15} color="var(--text3)"/>
                  </button>
                </div>
              </div>
            </div>

            {err && <div style={{ marginTop:12, padding:"10px 14px", borderRadius:10, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", fontSize:13, color:"#fca5a5" }}>{err}</div>}

            {mode === "login" && (
              <div style={{ textAlign:"right", marginTop:10 }}>
                <span style={{ fontSize:12, color:"#a89df5", cursor:"pointer" }}>Forgot password?</span>
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width:"100%", marginTop:20, justifyContent:"center", padding:"14px", fontSize:15, borderRadius:12 }}>
              {loading ? (
                <div style={{ width:18, height:18, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"white", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
              ) : (
                <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
              )}
            </button>
          </form>

          <div style={{ textAlign:"center", marginTop:20, fontSize:13, color:"var(--text2)" }}>
            {mode === "login" ? "No account? " : "Already have one? "}
            <span onClick={()=>setMode(m=>m==="login"?"signup":"login")} style={{ color:"#a89df5", cursor:"pointer", fontWeight:600 }}>
              {mode === "login" ? "Sign up free" : "Sign in"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── INTERACTIVE STADIUM MAP ──────────────────────────────────────────────
function StadiumMap({ sections }) {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [filter, setFilter] = useState("all");
  const [popupPos, setPopupPos] = useState({ x:0, y:0 });
  const svgRef = useRef(null);

  const types = ["all","gate","food","washroom","merch","stand","vip"];

  const handleClick = (s, e) => {
    if (s.type === "pitch") return;
    const rect = svgRef.current.getBoundingClientRect();
    setPopupPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setSelected(s.id === selected?.id ? null : s);
  };

  const visible = filter === "all" ? sections : sections.filter(s => s.type === filter || s.type === "pitch");

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      {/* Filter bar */}
      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
        {types.map(t => (
          <button key={t} onClick={()=>setFilter(t)} style={{
            padding:"6px 14px", borderRadius:99, border:`1px solid ${filter===t ? "rgba(124,109,235,0.6)" : "var(--border)"}`,
            background: filter===t ? "rgba(124,109,235,0.15)" : "transparent",
            color: filter===t ? "#a89df5" : "var(--text2)",
            fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"var(--font)",
            transition:"all 0.15s", textTransform:"capitalize",
          }}>{t === "all" ? "All Zones" : getTypeLabel(t)}</button>
        ))}
      </div>

      {/* Map */}
      <div style={{ flex:1, position:"relative", minHeight:0 }}>
        <div style={{ width:"100%", paddingBottom:"100%", position:"relative" }}>
          <div style={{ position:"absolute", inset:0, borderRadius:16, background:"rgba(255,255,255,0.02)", border:"1px solid var(--border)", overflow:"hidden", padding:12 }}>
            {/* 3D-ish perspective wrapper */}
            <div style={{ width:"100%", height:"100%", perspective:"1000px" }}>
              <div style={{ width:"100%", height:"100%", transformStyle:"preserve-3d" }}>
                <svg ref={svgRef} viewBox="0 0 100 100" style={{ width:"100%", height:"100%", cursor:"crosshair" }}>
                  {/* Outer stadium ring */}
                  <ellipse cx={50} cy={50} rx={48} ry={48} fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.06)" strokeWidth={0.3}/>
                  {/* Track/ring */}
                  <ellipse cx={50} cy={50} rx={40} ry={40} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={0.2}/>

                  {/* Grid overlay */}
                  {[...Array(10)].map((_,i) => (
                    <g key={i}>
                      <line x1={i*10} y1={0} x2={i*10} y2={100} stroke="rgba(255,255,255,0.025)" strokeWidth={0.2}/>
                      <line x1={0} y1={i*10} x2={100} y2={i*10} stroke="rgba(255,255,255,0.025)" strokeWidth={0.2}/>
                    </g>
                  ))}

                  {/* Sections */}
                  {visible.map(s => {
                    const isSelected = selected?.id === s.id;
                    const isHovered = hovered === s.id;
                    const c = s.type === "pitch" ? "#16a34a" : getStatusColor(s.capacity, 1);
                    const fillOp = s.type === "pitch" ? 0.15 : isSelected ? 0.45 : isHovered ? 0.32 : 0.18;
                    const strokeOp = s.type === "pitch" ? 0.5 : isSelected ? 1 : isHovered ? 0.85 : 0.55;
                    return (
                      <g key={s.id}>
                        <rect
                          x={s.x} y={s.y} width={s.w} height={s.h} rx={0.8}
                          fill={c.replace(/,[\d.]+\)$/, `,${fillOp})`)}
                          stroke={c.replace(/,[\d.]+\)$/, `,${strokeOp})`)}
                          strokeWidth={isSelected ? 0.5 : 0.3}
                          style={{ cursor: s.type==="pitch" ? "default" : "pointer", transition:"all 0.15s" }}
                          onClick={e => handleClick(s, e)}
                          onMouseEnter={() => s.type!=="pitch" && setHovered(s.id)}
                          onMouseLeave={() => setHovered(null)}
                        />
                        {(s.w > 10 || s.h > 10) && (
                          <text x={s.x + s.w/2} y={s.y + s.h/2} textAnchor="middle" dominantBaseline="central"
                            fontSize={s.w > 20 ? 3 : 2} fill="rgba(255,255,255,0.6)" fontFamily="Outfit,sans-serif" fontWeight={600}
                            style={{ pointerEvents:"none" }}>
                            {s.label}
                          </text>
                        )}
                        {isSelected && (
                          <rect x={s.x-0.3} y={s.y-0.3} width={s.w+0.6} height={s.h+0.6} rx={1.1}
                            fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={0.3} strokeDasharray="1 0.5"/>
                        )}
                      </g>
                    );
                  })}

                  {/* Compass */}
                  <text x={50} y={2.5} textAnchor="middle" fontSize={2.5} fill="rgba(255,255,255,0.3)" fontFamily="Outfit,sans-serif">N</text>
                  <text x={50} y={99} textAnchor="middle" fontSize={2.5} fill="rgba(255,255,255,0.3)" fontFamily="Outfit,sans-serif">S</text>
                  <text x={98} y={51} textAnchor="middle" fontSize={2.5} fill="rgba(255,255,255,0.3)" fontFamily="Outfit,sans-serif">E</text>
                  <text x={2} y={51} textAnchor="middle" fontSize={2.5} fill="rgba(255,255,255,0.3)" fontFamily="Outfit,sans-serif">W</text>
                </svg>
              </div>
            </div>

            {/* Zone detail popup */}
            {selected && (
              <div style={{
                position:"absolute",
                left: Math.min(popupPos.x + 12, 65) + "%",
                top: Math.min(popupPos.y, 60) + "%",
                zIndex:20, width:210,
                animation:"slideDown 0.2s ease",
              }}>
                <div className="glass-strong" style={{ padding:"16px", borderRadius:14, boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:"var(--text)", marginBottom:2 }}>{selected.label}</div>
                      <div style={{ fontSize:10, color:"var(--text2)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{getTypeLabel(selected.type)}</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 9px", borderRadius:99, background:`${getStatusColor(selected.capacity, 0.15)}`, border:`1px solid ${getStatusColor(selected.capacity, 0.4)}` }}>
                      <div style={{ width:5, height:5, borderRadius:"50%", background:getStatusColor(selected.capacity, 1) }}/>
                      <span style={{ fontSize:10, fontWeight:600, color:getStatusColor(selected.capacity, 1) }}>{getStatusLabel(selected.capacity)}</span>
                    </div>
                  </div>
                  {selected.type !== "pitch" && (
                    <>
                      <div style={{ marginBottom:10 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                          <span style={{ fontSize:11, color:"var(--text2)" }}>Occupancy</span>
                          <span style={{ fontSize:11, fontWeight:600, fontFamily:"var(--mono)", color:"var(--text)" }}>{Math.round(selected.capacity*100)}%</span>
                        </div>
                        <div style={{ height:4, borderRadius:4, background:"rgba(255,255,255,0.08)" }}>
                          <div style={{ width:`${selected.capacity*100}%`, height:"100%", borderRadius:4, background:getStatusColor(selected.capacity,1), transition:"width 0.6s" }}/>
                        </div>
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                        {[
                          ["Crowd",`${selected.crowd.toLocaleString()} / ${selected.max.toLocaleString()}`],
                          ["Wait Time", selected.wait > 0 ? `${selected.wait} min` : "None"],
                        ].map(([l,v]) => (
                          <div key={l} style={{ padding:"8px 10px", borderRadius:9, background:"rgba(255,255,255,0.04)", border:"1px solid var(--border)" }}>
                            <div style={{ fontSize:10, color:"var(--text3)", marginBottom:3 }}>{l}</div>
                            <div style={{ fontSize:12, fontWeight:600, fontFamily:"var(--mono)", color:"var(--text)" }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <button onClick={() => setSelected(null)} style={{
                    marginTop:12, width:"100%", padding:"8px", borderRadius:9, border:"1px solid var(--border)",
                    background:"transparent", color:"var(--text2)", cursor:"pointer", fontFamily:"var(--font)", fontSize:12,
                  }}>Close</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div style={{ marginTop:12, display:"flex", gap:16, flexWrap:"wrap" }}>
          {[["#10b981","< 50% — Open"],["#f59e0b","50–80% — Busy"],["#ef4444","> 80% — Full"]].map(([c,l]) => (
            <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:10, height:10, borderRadius:3, background:c }}/>
              <span style={{ fontSize:11, color:"var(--text2)" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PATHFINDER TAB ───────────────────────────────────────────────────────
function PathfinderTab({ sections }) {
  const [selected, setSelected] = useState(null);
  const [finding, setFinding] = useState(false);
  const [result, setResult] = useState(null);

  const amenities = [
    { type:"food", label:"Food & Drink", emoji:"🍔", color:"#f59e0b" },
    { type:"washroom", label:"Washrooms", emoji:"🚻", color:"#0ea5e9" },
    { type:"merch", label:"Merchandise", emoji:"👕", color:"#ec4899" },
    { type:"gate", label:"Exit Gates", emoji:"🚪", color:"#10b981" },
    { type:"vip", label:"VIP Suites", emoji:"👑", color:"#d97706" },
    { type:"media", label:"Media Centre", emoji:"📡", color:"#64748b" },
  ];

  const find = (type) => {
    setSelected(type);
    setFinding(true);
    setResult(null);
    setTimeout(() => {
      const matches = sections.filter(s => s.type === type).sort((a,b) => a.wait - b.wait);
      setResult({ zone: matches[0], steps: ROUTE_STEPS[type] || ROUTE_STEPS.gate });
      setFinding(false);
    }, 1000);
  };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, height:"100%" }}>
      <div>
        <h3 style={{ fontSize:14, fontWeight:600, color:"var(--text2)", marginBottom:16, textTransform:"uppercase", letterSpacing:"0.06em" }}>Select Amenity</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {amenities.map(a => {
            const active = selected === a.type;
            return (
              <button key={a.type} onClick={() => find(a.type)} style={{
                padding:"16px 14px", borderRadius:14, border:`1.5px solid ${active ? a.color+"80" : "var(--border)"}`,
                background: active ? `${a.color}14` : "rgba(255,255,255,0.03)",
                cursor:"pointer", textAlign:"left", transition:"all 0.2s", fontFamily:"var(--font)",
              }}
              onMouseEnter={e=>{ if(!active){ e.currentTarget.style.borderColor=a.color+"50"; e.currentTarget.style.background=a.color+"0a"; }}}
              onMouseLeave={e=>{ if(!active){ e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.background="rgba(255,255,255,0.03)"; }}}
              >
                <div style={{ fontSize:22, marginBottom:8 }}>{a.emoji}</div>
                <div style={{ fontSize:13, fontWeight:600, color:active ? "var(--text)" : "var(--text2)" }}>{a.label}</div>
                <div style={{ fontSize:10, color:"var(--text3)", marginTop:3 }}>
                  {sections.filter(s=>s.type===a.type).length} locations
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize:14, fontWeight:600, color:"var(--text2)", marginBottom:16, textTransform:"uppercase", letterSpacing:"0.06em" }}>Recommended Route</h3>
        {!selected && !finding && (
          <div style={{ height:200, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, opacity:0.4 }}>
            <div style={{ fontSize:36 }}>🧭</div>
            <div style={{ fontSize:13, color:"var(--text2)" }}>Select an amenity to get directions</div>
          </div>
        )}
        {finding && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[100,75,88,60].map((w,i) => <Skel key={i} h={18} w={`${w}%`}/>)}
            <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:8, color:"var(--text2)", fontSize:12 }}>
              <div style={{ width:14, height:14, border:"2px solid var(--accent)", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/>
              Calculating fastest route…
            </div>
          </div>
        )}
        {result && !finding && (
          <div style={{ animation:"fadeUp 0.35s ease" }}>
            <div className="glass" style={{ padding:"16px", marginBottom:14, borderRadius:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:700, color:"var(--text)" }}>{result.zone.label}</div>
                  <div style={{ fontSize:11, color:"var(--text2)", marginTop:3 }}>Lowest wait in category</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:24, fontWeight:800, color:getStatusColor(result.zone.capacity,1), letterSpacing:"-0.02em" }}>{result.zone.wait}m</div>
                  <div style={{ fontSize:10, color:"var(--text3)" }}>ETA</div>
                </div>
              </div>
              <div style={{ marginTop:12, height:3, borderRadius:3, background:"rgba(255,255,255,0.06)" }}>
                <div style={{ width:`${result.zone.capacity*100}%`, height:"100%", borderRadius:3, background:getStatusColor(result.zone.capacity,1) }}/>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
                <span style={{ fontSize:10, color:"var(--text3)" }}>Occupancy: {Math.round(result.zone.capacity*100)}%</span>
                <span style={{ fontSize:10, color:"var(--text3)" }}>{result.zone.crowd}/{result.zone.max}</span>
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {result.steps.map((step, i) => (
                <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", animation:`slideRight 0.3s ease ${i*0.07}s both` }}>
                  <div style={{ width:24, height:24, borderRadius:"50%", background:"rgba(124,109,235,0.2)", border:"1px solid rgba(124,109,235,0.4)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontSize:10, fontWeight:700, color:"#a89df5", fontFamily:"var(--mono)" }}>{i+1}</span>
                  </div>
                  <div style={{ paddingTop:3, fontSize:13, color:"var(--text2)", lineHeight:1.5 }}>{step}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop:16, padding:"10px 14px", borderRadius:10, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:14 }}>✅</span>
              <span style={{ fontSize:12, color:"#6ee7b7", fontWeight:500 }}>Fastest route · ~{result.zone.wait + 3} min total</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ORDER TAB ────────────────────────────────────────────────────────────
function OrderTab({ onAddToast, onPlaceOrder }) {
  const [cart, setCart] = useState({});
  const [catFilter, setCatFilter] = useState("all");
  const [deliveryPref, setDeliveryPref] = useState("seat");
  const [seat, setSeat] = useState({ block:"B", row:"12", seat:"7" });
  const [step, setStep] = useState("menu");
  const [qrCode] = useState("VS-" + Math.random().toString(36).substring(2,7).toUpperCase());
  const [orderStatus, setOrderStatus] = useState(null);

  const add = id => setCart(c => ({ ...c, [id]: (c[id]||0)+1 }));
  const remove = id => setCart(c => { const n={...c}; n[id]>1?n[id]--:delete n[id]; return n; });
  const cartCount = Object.values(cart).reduce((a,b)=>a+b,0);
  const cartTotal = Object.entries(cart).reduce((s,[id,q])=>{ const m=MENU.find(x=>x.id===id); return s+(m?m.price*q:0); },0);

  const cats = ["all","mains","drinks","snacks"];
  const visible = catFilter === "all" ? MENU : MENU.filter(m => m.cat === catFilter);

  const placeOrder = async () => {
    setOrderStatus("confirming");
    if (onPlaceOrder) {
      const items = Object.entries(cart).map(([id, qty]) => {
         const m = MENU.find(x=>x.id===id);
         return { name: m ? m.name : "Unknown", quantity: qty, price: m ? m.price : 0 };
      });
      try {
        await onPlaceOrder({ items, total: cartTotal, deliveryPreference: deliveryPref, seatDetails: deliveryPref === "seat" ? seat : undefined });
      } catch (e) {
        console.error("Order failed", e);
      }
    } else {
      await new Promise(r => setTimeout(r, 1500));
    }
    setTimeout(() => {
      setOrderStatus("confirmed");
      onAddToast({ type:"info", title:"Order Confirmed!", msg:`Your order is being prepared — ${deliveryPref==="seat"?"delivery in 12-15 min":"ready for QR pickup in 5 min"}.`, icon:"✅" });
    }, 1500);
  };

  if (orderStatus === "confirmed") return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:60, gap:20, animation:"fadeUp 0.4s ease" }}>
      <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(16,185,129,0.15)", border:"2px solid rgba(16,185,129,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30 }}>
        <Icon d={Icons.check} size={30} color="#10b981"/>
      </div>
      <div>
        <div style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.02em", marginBottom:8 }}>Order Placed!</div>
        <div style={{ fontSize:14, color:"var(--text2)" }}>
          {deliveryPref === "seat" ? `Delivering to Block ${seat.block}, Row ${seat.row}, Seat ${seat.seat}` : "Ready for QR Express Pickup"}
        </div>
      </div>
      {deliveryPref === "qr_pickup" && (
        <div style={{ padding:20, background:"white", borderRadius:16 }}>
          <svg width={120} height={120} viewBox="0 0 100 100">
            {[...Array(8)].map((_,r)=>[...Array(8)].map((_,c)=>{
              const filled = Math.random()>0.4 || (r<3&&c<3) || (r<3&&c>5) || (r>5&&c<3);
              return <rect key={`${r}${c}`} x={c*12+1} y={r*12+1} width={10} height={10} rx={1} fill={filled?"#1e1b4b":"white"}/>;
            }))}
            <rect x={1} y={1} w={35} h={35} rx={3} fill="none" stroke="#1e1b4b" strokeWidth={2}/>
            <rect x={5} y={5} width={27} height={27} rx={2} fill="#1e1b4b"/>
            <rect x={64} y={1} width={35} height={35} rx={3} fill="none" stroke="#1e1b4b" strokeWidth={2}/>
            <rect x={68} y={5} width={27} height={27} rx={2} fill="#1e1b4b"/>
            <rect x={1} y={64} width={35} height={35} rx={3} fill="none" stroke="#1e1b4b" strokeWidth={2}/>
            <rect x={5} y={68} width={27} height={27} rx={2} fill="#1e1b4b"/>
          </svg>
          <div style={{ fontSize:11, color:"#374151", marginTop:8, fontFamily:"'JetBrains Mono',monospace" }}>{qrCode}</div>
        </div>
      )}
      <div style={{ padding:"12px 24px", borderRadius:12, background:"rgba(124,109,235,0.12)", border:"1px solid rgba(124,109,235,0.3)", fontSize:13, color:"#a89df5" }}>
        Order #{qrCode} · Est. {deliveryPref==="seat"?"12–15 min":"4–6 min"}
      </div>
      <button onClick={()=>{ setCart({}); setOrderStatus(null); setStep("menu"); }} className="btn-ghost">Place New Order</button>
    </div>
  );

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:24, height:"100%", minHeight:0 }}>
      {/* Menu */}
      <div style={{ overflow:"auto" }}>
        <div style={{ display:"flex", gap:8, marginBottom:18, flexWrap:"wrap" }}>
          {cats.map(c => (
            <button key={c} onClick={()=>setCatFilter(c)} style={{
              padding:"6px 16px", borderRadius:99, border:`1px solid ${catFilter===c?"rgba(124,109,235,0.6)":"var(--border)"}`,
              background: catFilter===c?"rgba(124,109,235,0.15)":"transparent",
              color: catFilter===c?"#a89df5":"var(--text2)",
              fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"var(--font)", transition:"all 0.15s", textTransform:"capitalize",
            }}>{c === "all" ? "All Items" : c}</button>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
          {visible.map(item => {
            const qty = cart[item.id] || 0;
            return (
              <div key={item.id} className="glass" style={{
                padding:"16px", borderRadius:14, border:`1px solid ${qty>0?"rgba(124,109,235,0.4)":"var(--border)"}`,
                background: qty>0 ? "rgba(124,109,235,0.06)" : "rgba(255,255,255,0.03)",
                transition:"all 0.15s",
              }}>
                <div style={{ fontSize:32, marginBottom:10, color:"var(--text2)" }}>
                  <Icon d={Icons[item.icon] || Icons.utensils} size={32}/>
                </div>
                <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:3 }}>{item.name}</div>
                <div style={{ fontSize:11, color:"var(--text3)", marginBottom:10 }}>{item.cal} kcal · {item.prep}min prep</div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontSize:15, fontWeight:700, color:"var(--text)", fontFamily:"var(--mono)" }}>£{item.price.toFixed(2)}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    {qty > 0 && (
                      <>
                        <button onClick={()=>remove(item.id)} style={{ width:24, height:24, borderRadius:"50%", border:"1px solid var(--border2)", background:"rgba(255,255,255,0.06)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <Icon d={Icons.minus} size={11} color="var(--text)" strokeWidth={2.5}/>
                        </button>
                        <span style={{ fontSize:13, fontWeight:600, color:"#a89df5", fontFamily:"var(--mono)", minWidth:16, textAlign:"center" }}>{qty}</span>
                      </>
                    )}
                    <button onClick={()=>add(item.id)} style={{ width:24, height:24, borderRadius:"50%", border:"none", background:"rgba(124,109,235,0.7)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Icon d={Icons.plus} size={11} color="white" strokeWidth={2.5}/>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart */}
      <div className="glass" style={{ borderRadius:16, padding:20, display:"flex", flexDirection:"column", gap:16, height:"fit-content", position:"sticky", top:0 }}>
        <div style={{ fontSize:14, fontWeight:700, color:"var(--text)" }}>Your Order <span style={{ color:"var(--text3)", fontWeight:400 }}>({cartCount})</span></div>

        {cartCount === 0 ? (
          <div style={{ padding:"32px 0", textAlign:"center", opacity:0.4 }}>
            <div style={{ fontSize:28, marginBottom:8, display:"flex", justifyContent:"center" }}>
              <Icon d={Icons.shoppingBag} size={32} color="var(--text2)"/>
            </div>
            <div style={{ fontSize:12, color:"var(--text2)" }}>Add items from the menu</div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {Object.entries(cart).map(([id, qty]) => {
              const item = MENU.find(m => m.id === id);
              if (!item) return null;
              return (
                <div key={id} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:18, display:"flex", color:"var(--text2)" }}>
                    <Icon d={Icons[item.icon] || Icons.utensils} size={18}/>
                  </span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"var(--text)" }}>{item.name}</div>
                    <div style={{ fontSize:11, color:"var(--text3)" }}>×{qty}</div>
                  </div>
                  <span style={{ fontSize:12, fontWeight:600, fontFamily:"var(--mono)", color:"var(--text)" }}>£{(item.price*qty).toFixed(2)}</span>
                </div>
              );
            })}
            <div style={{ height:1, background:"var(--border)", margin:"4px 0" }}/>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:13, fontWeight:600, color:"var(--text2)" }}>Total</span>
              <span style={{ fontSize:15, fontWeight:800, fontFamily:"var(--mono)", color:"var(--text)" }}>£{cartTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        {cartCount > 0 && (
          <>
            {/* Delivery toggle */}
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Delivery Method</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {[["seat","users","Seat Delivery","12–15 min"],["qr_pickup","qr","QR Pickup","4–6 min"]].map(([v,e,l,t]) => (
                  <button key={v} onClick={()=>setDeliveryPref(v)} style={{
                    padding:"10px 8px", borderRadius:12, border:`1.5px solid ${deliveryPref===v?"rgba(124,109,235,0.6)":"var(--border)"}`,
                    background: deliveryPref===v?"rgba(124,109,235,0.12)":"transparent",
                    cursor:"pointer", fontFamily:"var(--font)", transition:"all 0.15s",
                  }}>
                    <div style={{ fontSize:16, marginBottom:4, display:"flex", justifyContent:"center" }}>
                      <Icon d={Icons[e]} size={18} color={deliveryPref===v?"#a89df5":"var(--text2)"}/>
                    </div>
                    <div style={{ fontSize:11, fontWeight:600, color:deliveryPref===v?"#a89df5":"var(--text2)" }}>{l}</div>
                    <div style={{ fontSize:9, color:"var(--text3)" }}>{t}</div>
                  </button>
                ))}
              </div>
            </div>

            {deliveryPref === "seat" && (
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Seat Details</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7 }}>
                  {["block","row","seat"].map(f => (
                    <div key={f}>
                      <div style={{ fontSize:10, color:"var(--text3)", marginBottom:4, textTransform:"capitalize" }}>{f}</div>
                      <input value={seat[f]} onChange={e=>setSeat(s=>({...s,[f]:e.target.value}))}
                        placeholder={f==="block"?"B":f==="row"?"12":"7"}
                        style={{ width:"100%", padding:"8px 10px", borderRadius:9, border:"1px solid var(--border2)", background:"rgba(255,255,255,0.04)", color:"var(--text)", fontSize:13, fontFamily:"var(--mono)", outline:"none" }}
                        onFocus={e=>e.target.style.borderColor="rgba(124,109,235,0.5)"} onBlur={e=>e.target.style.borderColor="var(--border2)"}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={placeOrder} className="btn-primary" style={{ width:"100%", justifyContent:"center", padding:"13px", fontSize:14, borderRadius:12 }}>
              {orderStatus==="confirming" ? (
                <div style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"white", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
              ) : (
                <><span>Place Order · £{cartTotal.toFixed(2)}</span><Icon d={Icons.zap} size={14} color="white"/></>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── ALERTS TAB ───────────────────────────────────────────────────────────
function AlertsTab({ onAddToast }) {
  const [dismissed, setDismissed] = useState([]);
  const [sent, setSent] = useState([]);
  const visible = ALERTS_DATA.filter(a => !dismissed.includes(a.id));

  return (
    <div style={{ maxWidth:720 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h3 style={{ fontSize:16, fontWeight:700, color:"var(--text)", marginBottom:4 }}>Crowd Dispersal Alerts</h3>
          <div style={{ fontSize:13, color:"var(--text2)" }}>Real-time incentive notifications to manage crowd flow</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:99, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)" }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", animation:"pulse 2s infinite" }}/>
          <span style={{ fontSize:11, fontWeight:600, color:"#6ee7b7" }}>System Active</span>
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {visible.map(a => {
          const isSent = sent.includes(a.id);
          const typeConfig = {
            deal: { bg:"rgba(245,158,11,0.08)", border:"rgba(245,158,11,0.25)", badge:"rgba(245,158,11,0.15)", badgeText:"#fbbf24" },
            warning: { bg:"rgba(239,68,68,0.08)", border:"rgba(239,68,68,0.25)", badge:"rgba(239,68,68,0.15)", badgeText:"#f87171" },
            info: { bg:"rgba(16,185,129,0.08)", border:"rgba(16,185,129,0.25)", badge:"rgba(16,185,129,0.15)", badgeText:"#6ee7b7" },
          }[a.type];
          return (
            <div key={a.id} style={{ padding:"18px 20px", borderRadius:14, background:typeConfig.bg, border:`1px solid ${typeConfig.border}`, display:"flex", gap:16, alignItems:"flex-start", animation:"fadeUp 0.3s ease" }}>
              <span style={{ fontSize:22, flexShrink:0 }}>{a.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>{a.title}</span>
                  <span style={{ padding:"2px 9px", borderRadius:99, background:typeConfig.badge, color:typeConfig.badgeText, fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>{a.type}</span>
                  {isSent && <span style={{ padding:"2px 9px", borderRadius:99, background:"rgba(16,185,129,0.15)", color:"#6ee7b7", fontSize:10, fontWeight:600 }}>✓ Sent</span>}
                </div>
                <div style={{ fontSize:13, color:"var(--text2)", lineHeight:1.6 }}>{a.msg}</div>
              </div>
              <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                <button onClick={() => { setSent(s=>[...s,a.id]); onAddToast(a); }} disabled={isSent} style={{
                  padding:"7px 14px", borderRadius:9, border:"1px solid rgba(124,109,235,0.4)", background: isSent?"rgba(124,109,235,0.06)":"rgba(124,109,235,0.15)",
                  color: isSent?"var(--text3)":"#a89df5", fontSize:12, fontWeight:600, cursor:isSent?"default":"pointer", fontFamily:"var(--font)", transition:"all 0.15s",
                }}>{isSent?"Sent":"Send Alert"}</button>
                <button onClick={()=>setDismissed(d=>[...d,a.id])} style={{ width:32, height:32, borderRadius:8, border:"1px solid var(--border)", background:"rgba(255,255,255,0.04)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Icon d={Icons.x} size={13} color="var(--text3)" strokeWidth={2.5}/>
                </button>
              </div>
            </div>
          );
        })}
        {visible.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 0", opacity:0.4 }}>
            <div style={{ fontSize:36, marginBottom:12 }}>🎉</div>
            <div style={{ fontSize:14, color:"var(--text2)" }}>All alerts dismissed</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ANALYTICS TAB ────────────────────────────────────────────────────────
function AnalyticsTab() {
  const metrics = [
    { label:"Total Footfall", value:"42,810", delta:"+8.3%", good:true },
    { label:"Orders Processed", value:"3,247", delta:"+22.1%", good:true },
    { label:"Avg Dwell Time", value:"94 min", delta:"-4.2%", good:false },
    { label:"Alert Conversions", value:"68.4%", delta:"+11.5%", good:true },
    { label:"Revenue / Head", value:"£31.20", delta:"+15.8%", good:true },
    { label:"Net Promoter Score", value:"72", delta:"+6pts", good:true },
  ];

  const zones_perf = STADIUM_SECTIONS.filter(s=>s.type==="food").map(s=>({
    name:s.label, rev: Math.floor(Math.random()*8000+4000), orders:Math.floor(Math.random()*200+80), rating:(4+Math.random()).toFixed(1)
  }));

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:20, marginBottom:28 }}>
        <WeatherWidget />
        <EventTimeline />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:28 }}>
        {metrics.map((m,i) => (
          <div key={i} className="glass" style={{ padding:"20px", borderRadius:14, animation:`fadeUp 0.3s ease ${i*0.06}s both` }}>
            <div style={{ fontSize:11, fontWeight:600, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>{m.label}</div>
            <div style={{ fontSize:26, fontWeight:800, color:"var(--text)", letterSpacing:"-0.03em", marginBottom:6 }}>{m.value}</div>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ fontSize:11, fontWeight:600, color:m.good?"#6ee7b7":"#f87171" }}>{m.delta}</span>
              <span style={{ fontSize:11, color:"var(--text3)" }}>vs last event</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        {/* Crowd heatmap bar chart */}
        <div className="glass" style={{ padding:20, borderRadius:14 }}>
          <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:16 }}>Hourly Crowd Density</div>
          <div style={{ display:"flex", gap:4, alignItems:"flex-end", height:120 }}>
            {[0.3,0.45,0.6,0.75,0.9,0.85,0.95,0.88,0.7,0.5,0.35,0.2].map((v,i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <div style={{ width:"100%", height:v*110, borderRadius:"4px 4px 0 0", background:`linear-gradient(to top, ${getStatusColor(v,0.8)}, ${getStatusColor(v,0.4)})`, transition:"height 0.6s" }}/>
                <span style={{ fontSize:8, color:"var(--text3)", fontFamily:"var(--mono)" }}>{12+i}h</span>
              </div>
            ))}
          </div>
        </div>

        {/* Food court performance */}
        <div className="glass" style={{ padding:20, borderRadius:14 }}>
          <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:16 }}>Food Court Performance</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {zones_perf.map((z,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:11, color:"var(--text2)", minWidth:120 }}>{z.name}</span>
                <div style={{ flex:1, height:5, borderRadius:5, background:"rgba(255,255,255,0.06)" }}>
                  <div style={{ width:`${(z.rev/12000)*100}%`, height:"100%", borderRadius:5, background:"linear-gradient(90deg,#7c6deb,#a89df5)" }}/>
                </div>
                <span style={{ fontSize:11, fontFamily:"var(--mono)", color:"var(--text)", minWidth:60, textAlign:"right" }}>£{z.rev.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────
function SettingsTab({ user }) {
  const [notifs, setNotifs] = useState({ crowdAlerts:true, orderUpdates:true, dealNotifs:true, emailDigest:false });
  const [saved, setSaved] = useState(false);
  const toggle = k => setNotifs(n => ({ ...n, [k]:!n[k] }));
  const save = () => { setSaved(true); setTimeout(()=>setSaved(false), 2000); };

  const Toggle = ({ k, label, desc }) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", borderBottom:"1px solid var(--border)" }}>
      <div>
        <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:3 }}>{label}</div>
        <div style={{ fontSize:11, color:"var(--text3)" }}>{desc}</div>
      </div>
      <button onClick={()=>toggle(k)} style={{
        width:44, height:24, borderRadius:12, border:"none", cursor:"pointer",
        background: notifs[k] ? "rgba(124,109,235,0.8)" : "rgba(255,255,255,0.1)",
        position:"relative", transition:"all 0.2s", flexShrink:0,
      }}>
        <div style={{ position:"absolute", top:3, left: notifs[k]?22:3, width:18, height:18, borderRadius:"50%", background:"white", transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }}/>
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth:620 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:28 }}>
        <div className="glass" style={{ padding:20, borderRadius:14 }}>
          <div style={{ fontSize:11, fontWeight:600, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14 }}>Account</div>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
            <div style={{ width:48, height:48, borderRadius:"50%", background:"linear-gradient(135deg,#7c6deb,#f59e0b)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700, color:"white" }}>
              {(user?.name||"A").charAt(0)}
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"var(--text)" }}>{user?.name || "Alex Morgan"}</div>
              <div style={{ fontSize:12, color:"var(--text2)" }}>{user?.email || "alex@wembley.com"}</div>
            </div>
          </div>
          <div style={{ padding:"6px 12px", borderRadius:8, background:"rgba(124,109,235,0.12)", border:"1px solid rgba(124,109,235,0.3)", display:"inline-flex", alignItems:"center", gap:6 }}>
            <Icon d={Icons.shield} size={12} color="#a89df5"/>
            <span style={{ fontSize:11, fontWeight:600, color:"#a89df5" }}>Pro Plan · Verified</span>
          </div>
        </div>
        <div className="glass" style={{ padding:20, borderRadius:14 }}>
          <div style={{ fontSize:11, fontWeight:600, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14 }}>Venue</div>
          <div style={{ fontSize:14, fontWeight:700, color:"var(--text)", marginBottom:4 }}>Wembley Stadium</div>
          <div style={{ fontSize:12, color:"var(--text2)", marginBottom:10 }}>London, United Kingdom</div>
          <div style={{ display:"flex", gap:8 }}>
            {["90,000 cap.","Premier League"].map(t => (
              <div key={t} style={{ padding:"4px 10px", borderRadius:7, background:"rgba(255,255,255,0.06)", border:"1px solid var(--border)", fontSize:11, color:"var(--text2)" }}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass" style={{ padding:20, borderRadius:14, marginBottom:16 }}>
        <div style={{ fontSize:11, fontWeight:600, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Notification Preferences</div>
        <Toggle k="crowdAlerts" label="Crowd Alerts" desc="Real-time congestion and capacity warnings"/>
        <Toggle k="orderUpdates" label="Order Updates" desc="Status updates for food and merchandise orders"/>
        <Toggle k="dealNotifs" label="Incentive Notifications" desc="Flash deals and crowd dispersal offers"/>
        <Toggle k="emailDigest" label="Email Digest" desc="Daily analytics summary to your inbox"/>
      </div>

      <button onClick={save} className="btn-primary" style={{ padding:"12px 28px" }}>
        {saved ? <><Icon d={Icons.check} size={15} color="white"/><span>Saved!</span></> : <><span>Save Changes</span></>}
      </button>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────
function Dashboard({ user, onLogout, onAddToast }) {
  const [tab, setTab] = useState("map");
  const { zones, orders, addOrder, loading, seedAndSimulate } = useFirestoreData();
  const [sections, setSections] = useState(STADIUM_SECTIONS);
  const [time, setTime] = useState(new Date());

  // Merge Firebase zones with STADIUM_SECTIONS or fallback to simulation
  useEffect(() => {
    if (zones && zones.length > 0) {
      setSections(prev => prev.map(s => {
        // Try to match zone by rough name heuristic since mock data differs
        const match = zones.find(z => {
          if (s.type === 'gate' && z.type === 'gate') return z.name.includes(s.label.split(' ')[0]);
          if (s.type === 'food' && z.type === 'food') return true; // just pick any for demo
          return false;
        });
        if (match) {
          return { ...s, capacity: match.currentCapacity / match.maxCapacity, wait: match.waitTime, crowd: match.currentCapacity, max: match.maxCapacity };
        }
        return s;
      }));
    }
  }, [zones]);

  // Simulate real-time updates for zones not from Firebase
  useEffect(() => {
    const t = setInterval(() => {
      if (!zones || zones.length === 0) {
        setSections(prev => prev.map(s => ({
          ...s,
          capacity: s.type === "pitch" ? 0 : Math.max(0.1, Math.min(0.98, s.capacity + (Math.random()-0.5)*0.06)),
          wait: s.wait > 0 ? Math.max(0, s.wait + Math.floor(Math.random()*3)-1) : s.wait,
          crowd: s.type === "pitch" ? 0 : Math.max(0, Math.min(s.max, s.crowd + Math.floor((Math.random()-0.5)*30))),
        })));
      }
    }, 5000);
    return () => clearInterval(t);
  }, [zones]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const tabs = [
    { id:"map", label:"Live Map", icon:Icons.map },
    { id:"pathfinder", label:"Pathfinder", icon:Icons.navigation },
    { id:"order", label:"Order", icon:Icons.utensils },
    { id:"alerts", label:"Alerts", icon:Icons.bell },
    { id:"analytics", label:"Analytics", icon:Icons.activity },
    { id:"settings", label:"Settings", icon:Icons.settings },
  ];

  const overallOccupancy = Math.round(sections.filter(s=>s.type==="stand").reduce((a,s)=>a+s.capacity,0)/sections.filter(s=>s.type==="stand").length*100);

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
      {/* Top Nav */}
      <nav style={{
        height:60, padding:"0 28px", display:"flex", alignItems:"center", gap:16,
        background:"rgba(10,11,15,0.92)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
        borderBottom:"1px solid var(--border)", position:"sticky", top:0, zIndex:50, flexShrink:0,
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:9, marginRight:8, flexShrink:0 }}>
          <div style={{ width:30, height:30, borderRadius:9, background:"linear-gradient(135deg,#7c6deb,#9b8af5)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon d={Icons.wifi} size={14} color="white" strokeWidth={2}/>
          </div>
          <span style={{ fontSize:15, fontWeight:800, letterSpacing:"-0.02em" }}>VenueSync</span>
        </div>

        {/* Tab bar */}
        <div style={{ display:"flex", gap:2, flex:1, overflowX:"auto" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} className={`tab-btn${tab===t.id?" active":""}`}>
              <Icon d={t.icon} size={14} color="currentColor"/>
              {t.label}
            </button>
          ))}
        </div>

        {/* Right: status + user */}
        <div style={{ display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", animation:"pulse 2s infinite" }}/>
            <span style={{ fontSize:11, fontWeight:600, color:"#6ee7b7" }}>Match Live</span>
          </div>
          <div style={{ width:1, height:20, background:"var(--border)" }}/>
          <span style={{ fontSize:12, color:"var(--text2)", fontFamily:"var(--mono)" }}>
            {time.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
          </span>
          <div style={{ width:1, height:20, background:"var(--border)" }}/>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#7c6deb,#f59e0b)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"white" }}>
              {(user?.name||"A").charAt(0)}
            </div>
            <span style={{ fontSize:12, fontWeight:500, color:"var(--text2)" }}>{user?.name?.split(" ")[0] || "Alex"}</span>
          </div>
          <button onClick={onLogout} style={{ width:30, height:30, borderRadius:8, border:"1px solid var(--border)", background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon d={Icons.logOut} size={13} color="var(--text3)"/>
          </button>
        </div>
      </nav>

      {/* Venue context bar */}
      <div style={{ padding:"10px 28px", borderBottom:"1px solid var(--border)", background:"rgba(255,255,255,0.01)", display:"flex", alignItems:"center", gap:20, overflowX:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:14, fontWeight:700, color:"var(--text)" }}>Wembley Stadium</span>
          <span style={{ fontSize:11, color:"var(--text3)" }}>FA Cup Final · Arsenal vs Chelsea</span>
        </div>
        {[
          [`${overallOccupancy}%`, "Stadium Occupancy", overallOccupancy>80?"#ef4444":overallOccupancy>60?"#f59e0b":"#10b981"],
          ["Half Time", "Current Period", "#a89df5"],
          [`${sections.filter(s=>s.capacity>0.8&&s.type!=="stand"&&s.type!=="pitch").length}`, "Congested Zones", "#f59e0b"],
        ].map(([v,l,c]) => (
          <div key={l} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 12px", borderRadius:8, background:"rgba(255,255,255,0.03)", border:"1px solid var(--border)", flexShrink:0 }}>
            <span style={{ fontSize:13, fontWeight:700, color:c, fontFamily:"var(--mono)" }}>{v}</span>
            <span style={{ fontSize:11, color:"var(--text3)" }}>{l}</span>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex:1, padding:28, overflow:"auto" }}>
        <div style={{ animation:"fadeUp 0.3s ease" }}>
          {tab === "map" && <StadiumMap sections={sections}/>}
          {tab === "pathfinder" && <PathfinderTab sections={sections}/>}
          {tab === "order" && <OrderTab onAddToast={onAddToast} onPlaceOrder={addOrder}/>}
          {tab === "alerts" && <AlertsTab onAddToast={onAddToast}/>}
          {tab === "analytics" && <AnalyticsTab/>}
          {tab === "settings" && <SettingsTab user={user}/>}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing"); // landing | auth | dashboard
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);
  const toastQueue = useRef([]);
  const alertIdx = useRef(0);

  const addToast = useCallback((alert) => {
    const uid = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-3), { ...alert, uid, exiting:false }]);
  }, []);

  const dismissToast = useCallback((uid) => {
    setToasts(prev => prev.map(t => t.uid === uid ? { ...t, exiting:true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.uid !== uid)), 320);
  }, []);

  // Auto-dismiss toasts
  useEffect(() => {
    toasts.forEach(t => {
      if (!t.exiting) {
        const timer = setTimeout(() => dismissToast(t.uid), 7000);
        return () => clearTimeout(timer);
      }
    });
  }, [toasts, dismissToast]);

  // Periodic auto-alerts on dashboard
  useEffect(() => {
    if (page !== "dashboard") return;
    const t = setInterval(() => {
      const a = ALERTS_DATA[alertIdx.current % ALERTS_DATA.length];
      alertIdx.current++;
      addToast(a);
    }, 18000);
    return () => clearInterval(t);
  }, [page, addToast]);

  return (
    <>
      <style>{css}</style>
      {page === "landing" && <Landing onEnter={() => setPage("auth")}/>}
      {page === "auth" && <Auth onLogin={(u) => { setUser(u); setPage("dashboard"); }}/>}
      {page === "dashboard" && (
        <Dashboard user={user} onLogout={() => { if(auth) signOut(auth); setPage("landing"); }} onAddToast={addToast}/>
      )}
      <ToastContainer toasts={toasts} onDismiss={dismissToast}/>
    </>
  );
}
