import { useState, useEffect, useRef, useMemo } from "react";

const DF = "'Playfair Display', Georgia, serif";
const BF = "'Syne', sans-serif";
const MF = "'Space Grotesk', monospace";
const AF = "'Instrument Serif', Georgia, serif";
const C = {
  bg: "#050507", dark: "#0a0a0f", smoke: "#0d1117",
  line: "rgba(255,255,255,0.06)", line2: "rgba(255,255,255,0.12)",
  dim: "rgba(255,255,255,0.25)", mid: "rgba(255,255,255,0.5)",
  light: "rgba(255,255,255,0.7)", white: "rgba(255,255,255,0.93)",
  cyan: "#00d2ff", cyanB: "#0ef6cc", cyanD: "#00a8cc",
  cyanG: "rgba(0,210,255,0.12)", cyanF: "rgba(0,210,255,0.05)",
};

function useReveal(th = 0.15) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: th });
    o.observe(el); return () => o.disconnect();
  }, [th]);
  return [ref, v];
}

function Reveal({ children, delay = 0 }) {
  const [ref, v] = useReveal();
  return <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(50px)", transition: `all 1s cubic-bezier(0.16,1,0.3,1) ${delay}s` }}>{children}</div>;
}

function TiltCard({ children, style = {} }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [h, setH] = useState(false);
  return (
    <div ref={ref}
      onMouseMove={e => { if (!ref.current) return; const r = ref.current.getBoundingClientRect(); setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 10, y: ((e.clientY - r.top) / r.height - 0.5) * -10 }); }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => { setH(false); setTilt({ x: 0, y: 0 }); }}
      style={{ transform: `perspective(800px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) scale(${h ? 1.02 : 1})`, transition: h ? "transform 0.1s" : "transform 0.6s cubic-bezier(0.16,1,0.3,1)", position: "relative", ...style }}>
      {children}
      {h && <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none", background: `radial-gradient(circle at ${(tilt.x / 10 + 0.5) * 100}% ${(-tilt.y / 10 + 0.5) * 100}%, rgba(0,210,255,0.05), transparent 60%)` }} />}
    </div>
  );
}

function Counter({ end, suffix = "", prefix = "" }) {
  const [ref, v] = useReveal(0.3);
  const [c, setC] = useState(0);
  useEffect(() => {
    if (!v) return; const s = performance.now();
    const tick = (n) => { const t = Math.min((n - s) / 2000, 1); setC(Math.round((1 - Math.pow(1 - t, 4)) * end)); if (t < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, [v, end]);
  return <span ref={ref}>{prefix}{c.toLocaleString("de-DE")}{suffix}</span>;
}

/* MARGIN CALCULATOR */
function MarginCalc() {
  const [clients, setClients] = useState(5);
  const [pkg, setPkg] = useState(1);
  const pkgs = [
    { name: "Starter", wholesale: 499, retail: 1099 },
    { name: "Professional", wholesale: 799, retail: 1799 },
    { name: "Enterprise", wholesale: 1500, retail: 3299 },
  ];
  const p = pkgs[pkg];
  const margin = p.retail - p.wholesale;
  const total = margin * clients;
  const annual = total * 12;

  return (
    <div style={{ backgroundColor: C.dark, border: `1px solid ${C.line2}`, borderRadius: 24, padding: "48px 40px", maxWidth: 700, margin: "0 auto" }}>
      <h3 style={{ fontFamily: DF, fontSize: 28, fontWeight: 700, marginBottom: 32, color: C.white }}>Deine Marge berechnen</h3>

      <div style={{ marginBottom: 32 }}>
        <label style={{ fontFamily: MF, fontSize: 11, letterSpacing: 4, color: C.cyan, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Paket wählen</label>
        <div style={{ display: "flex", gap: 8 }}>
          {pkgs.map((pk, i) => (
            <button key={i} onClick={() => setPkg(i)} style={{
              flex: 1, padding: "14px 12px", borderRadius: 12, border: `1px solid ${pkg === i ? C.cyan : C.line2}`,
              backgroundColor: pkg === i ? C.cyanF : "transparent", color: pkg === i ? C.cyan : C.mid,
              fontFamily: BF, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.3s",
            }}>{pk.name}<br /><span style={{ fontSize: 11, opacity: 0.6 }}>€{pk.wholesale}/Mo</span></button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <label style={{ fontFamily: MF, fontSize: 11, letterSpacing: 4, color: C.cyan, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Anzahl Kunden: <span style={{ fontFamily: DF, fontSize: 28, fontWeight: 900, color: C.white }}>{clients}</span></label>
        <input type="range" min="1" max="25" value={clients} onChange={e => setClients(+e.target.value)}
          style={{ width: "100%", accentColor: C.cyan, height: 6, cursor: "pointer" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MF, fontSize: 10, color: C.dim, marginTop: 4 }}>
          <span>1</span><span>25</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, padding: "32px 0", borderTop: `1px solid ${C.line}` }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: MF, fontSize: 10, letterSpacing: 3, color: C.dim, textTransform: "uppercase", marginBottom: 8 }}>Marge / Kunde</p>
          <p style={{ fontFamily: DF, fontSize: 32, fontWeight: 900, color: C.cyan }}>€{margin.toLocaleString("de-DE")}</p>
          <p style={{ fontFamily: MF, fontSize: 10, color: C.dim }}>pro Monat</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: MF, fontSize: 10, letterSpacing: 3, color: C.dim, textTransform: "uppercase", marginBottom: 8 }}>Monatlich</p>
          <p style={{ fontFamily: DF, fontSize: 32, fontWeight: 900, color: C.white }}>€{total.toLocaleString("de-DE")}</p>
          <p style={{ fontFamily: MF, fontSize: 10, color: C.dim }}>Gesamtmarge</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: MF, fontSize: 10, letterSpacing: 3, color: C.dim, textTransform: "uppercase", marginBottom: 8 }}>Jährlich</p>
          <p style={{ fontFamily: DF, fontSize: 32, fontWeight: 900, color: C.cyanB }}>€{annual.toLocaleString("de-DE")}</p>
          <p style={{ fontFamily: MF, fontSize: 10, color: C.dim }}>Gesamtmarge</p>
        </div>
      </div>
    </div>
  );
}

export default function PozaKIPartner() {
  const [scrollY, setScrollY] = useState(0);
  const [progress, setProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [openFaq, setOpenFaq] = useState(-1);

  useEffect(() => {
    const h = () => { setScrollY(window.scrollY); const max = document.documentElement.scrollHeight - window.innerHeight; setProgress(max > 0 ? window.scrollY / max : 0); };
    window.addEventListener("scroll", h, { passive: true }); return () => window.removeEventListener("scroll", h);
  }, []);
  useEffect(() => { const h = (e) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }); window.addEventListener("mousemove", h); return () => window.removeEventListener("mousemove", h); }, []);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Syne:wght@400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap";
    link.rel = "stylesheet"; document.head.appendChild(link);
    const style = document.createElement("style");
    style.textContent = `
      html, body, #root { background: #050507 !important; margin: 0; padding: 0; }
      * { box-sizing: border-box; }
      ::selection { background: rgba(0,210,255,0.3); color: #fff; }
      html { scroll-behavior: smooth; }
      ::-webkit-scrollbar { width: 3px; }
      ::-webkit-scrollbar-track { background: #050507; }
      ::-webkit-scrollbar-thumb { background: #00d2ff; border-radius: 3px; }
      @keyframes pp_marquee { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }
      @keyframes pp_float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
      @keyframes pp_gradient { 0% { background-position:0% 50%; } 50% { background-position:100% 50%; } 100% { background-position:0% 50%; } }
      @keyframes pp_blob { 0%,100% { border-radius:60% 40% 30% 70%/60% 30% 70% 40%; } 50% { border-radius:30% 60% 70% 40%/50% 60% 30% 60%; } }
      @keyframes pp_pulse { 0% { opacity:0.6; } 50% { opacity:1; } 100% { opacity:0.6; } }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(link); document.head.removeChild(style); };
  }, []);

  const packages = [
    {
      name: "Starter", price: "499", tag: "Voice Agent Basics",
      retail: "€999 – 1.299", margin: "€500 – 800",
      list: ["KI-Telefonassistent 24/7", "Bis 300 Anrufe / Monat", "Terminbuchung", "Anrufzusammenfassungen", "E-Mail Reporting", "Dein Branding"],
      note: "Für kleine Kunden & Einstieg"
    },
    {
      name: "Professional", price: "799", tag: "Full Voice Operations", pop: true,
      retail: "€1.499 – 1.999", margin: "€700 – 1.200",
      list: ["Alles aus Starter", "Bis 700 Anrufe / Monat", "CRM-Integration", "Follow-up Sequenzen", "Voice Cloning", "Wöchentliches Reporting", "Prioritäts-Support"],
      note: "Sweet Spot — höchste Marge"
    },
    {
      name: "Enterprise", price: "1.500", tag: "Premium White-Label",
      retail: "€2.499 – 3.499", margin: "€999 – 1.999",
      list: ["Alles aus Professional", "Unbegrenzte Anrufe", "Multi-Standort", "Custom Workflows", "Mehrsprachig", "Dedicated Setup", "Eigenes Dashboard", "Co-Branding möglich"],
      note: "Für Enterprise-Kunden deiner Agentur"
    },
  ];

  const benefits = [
    { icon: "💰", title: "€500 – 1.999 Marge", desc: "Pro Kunde, pro Monat. Kein Revenue-Share, kein Kleingedrucktes. Die Marge gehört dir." },
    { icon: "🏷️", title: "Dein Name, dein Brand", desc: "Deine Kunden sehen nur dich. Wir sind unsichtbar. Alles unter deinem Logo und Branding." },
    { icon: "⚡", title: "48h Go-Live", desc: "Neuer Kunde? Wir konfigurieren den Agent in 48 Stunden. Du verkaufst, wir liefern." },
    { icon: "🔧", title: "Null Technik für dich", desc: "Kein Setup, kein Server, kein Coding. Wir machen alles — du konzentrierst dich auf den Vertrieb." },
    { icon: "📈", title: "Skaliert mit dir", desc: "1 Kunde oder 50 — gleicher Prozess, gleiche Qualität. Keine Kapazitätsgrenzen." },
    { icon: "🤝", title: "Dedicated Partner Manager", desc: "Du bekommst einen festen Ansprechpartner. Für alles. Kein Support-Ticket-System." },
  ];

  const howItWorks = [
    { s: "01", t: "Partner werden", d: "15 Minuten Call. Wir klären dein Business-Modell, deine Zielgruppe, und dein Pricing." },
    { s: "02", t: "Du verkaufst", d: "Du pitchst deinen Kunden den KI-Telefonassistenten — unter deinem Namen, zu deinem Preis." },
    { s: "03", t: "Wir liefern", d: "Du schickst uns die Kundeninfos. In 48h ist der Agent live. Wir übernehmen Setup, Technik, Support." },
    { s: "04", t: "Du kassierst", d: "Dein Kunde zahlt dich. Du zahlst uns den Wholesale-Preis. Die Differenz ist dein Gewinn." },
  ];

  const faqs = [
    { q: "Brauche ich technisches Wissen?", a: "Null. Wir machen alles Technische. Du brauchst nur Vertrieb und Kundenbeziehung." },
    { q: "Wie viele Kunden kann ich anbinden?", a: "So viele du willst. Es gibt kein Limit. Jeder Kunde bekommt seinen eigenen, dedizierten Agent." },
    { q: "Sehen meine Kunden POZA-KI?", a: "Nein. Alles läuft unter deinem Brand. Dein Logo, dein Name, deine Rechnungen. Wir sind zu 100% unsichtbar." },
    { q: "Was wenn ein Kunde Probleme hat?", a: "Du bist der Ansprechpartner für deinen Kunden. Wir sind dein Ansprechpartner im Hintergrund. Response-Time unter 2 Stunden." },
    { q: "Gibt es eine Mindestabnahme?", a: "Nein. Starte mit einem einzigen Kunden und skaliere wenn du bereit bist." },
    { q: "Wie funktioniert die Abrechnung?", a: "Du zahlst uns monatlich den Wholesale-Preis pro Kunde. Deinen Kunden rechnest du ab wie du willst — monatlich, jährlich, mit Setup-Fee." },
  ];

  const pad = "clamp(24px,5vw,80px)";

  const particles = useMemo(() => Array.from({ length: 15 }, () => ({
    x: Math.random() * 100, y: Math.random() * 100, s: Math.random() * 2.5 + 1,
    dur: Math.random() * 25 + 15, del: Math.random() * 10, op: Math.random() * 0.15 + 0.05,
  })), []);

  return (
    <div style={{ backgroundColor: "#050507", color: C.white, fontFamily: BF, minHeight: "100vh", overflowX: "hidden", position: "relative" }}>

      {/* Progress */}
      <div style={{ position: "fixed", top: 0, left: 0, height: 2, zIndex: 200, width: `${progress * 100}%`, background: `linear-gradient(90deg, ${C.cyan}, ${C.cyanB})` }} />

      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {particles.map((p, i) => <div key={i} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, borderRadius: "50%", backgroundColor: C.cyan, opacity: p.op }} />)}
        <div style={{ position: "absolute", top: "-15%", right: "-10%", width: "50vw", height: "50vw", background: `radial-gradient(circle, ${C.cyanF}, transparent 60%)`, animation: "pp_blob 20s ease-in-out infinite", filter: "blur(60px)", opacity: 0.6 }} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at ${50 + (mousePos.x - 0.5) * 12}% ${50 + (mousePos.y - 0.5) * 12}%, ${C.cyanF}, transparent 40%)`, transition: "background 0.3s" }} />
      </div>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 80, padding: `0 ${pad}`, display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: scrollY > 80 ? "rgba(5,5,7,0.92)" : "transparent", backdropFilter: scrollY > 80 ? "blur(30px)" : "none", borderBottom: `1px solid ${scrollY > 80 ? C.line : "transparent"}`, transition: "all 0.5s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
            <svg width="130" height="32" viewBox="0 0 280 68" style={{ display: "block" }}>
              <text x="0" y="50" fontFamily="Georgia, 'Playfair Display', serif" fontSize="52" fontWeight="900" letterSpacing="-1" fill="rgba(255,255,255,0.93)">P</text>
              <circle cx="52" cy="28" r="15" fill="none" stroke="rgba(255,255,255,0.93)" strokeWidth="3.2" />
              <rect x="44" y="19" width="3.2" height="18" rx="1.6" fill="#00d2ff" opacity="0.65"><animate attributeName="height" values="18;10;18" dur="1.4s" repeatCount="indefinite" /><animate attributeName="y" values="19;23;19" dur="1.4s" repeatCount="indefinite" /></rect>
              <rect x="50.5" y="14" width="3.2" height="28" rx="1.6" fill="#00d2ff" opacity="0.85"><animate attributeName="height" values="28;15;28" dur="1.1s" repeatCount="indefinite" /><animate attributeName="y" values="14;20.5;14" dur="1.1s" repeatCount="indefinite" /></rect>
              <rect x="57" y="19" width="3.2" height="18" rx="1.6" fill="#00d2ff" opacity="0.65"><animate attributeName="height" values="18;10;18" dur="1.3s" repeatCount="indefinite" /><animate attributeName="y" values="19;23;19" dur="1.3s" repeatCount="indefinite" /></rect>
              <text x="74" y="50" fontFamily="Georgia, 'Playfair Display', serif" fontSize="52" fontWeight="900" letterSpacing="-1" fill="rgba(255,255,255,0.93)">ZA</text>
              <rect x="174" y="28" width="12" height="1.8" rx="0.9" fill="#00d2ff" opacity="0.5" />
              <text x="192" y="50" fontFamily="Georgia, 'Playfair Display', serif" fontSize="52" fontWeight="400" fontStyle="italic" fill="#00d2ff">KI</text>
            </svg>
          </a>
          <span style={{ fontFamily: MF, fontSize: 10, letterSpacing: 3, color: C.cyan, textTransform: "uppercase", backgroundColor: C.cyanF, padding: "4px 12px", borderRadius: 60, marginLeft: 8 }}>Partner</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Vorteile", "Pakete", "Rechner", "FAQ"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ fontFamily: BF, fontSize: 13, fontWeight: 500, letterSpacing: 1.5, color: C.mid, textDecoration: "none", textTransform: "uppercase" }}>{l}</a>
          ))}
          <a href="https://cal.eu/poza-ki/partner-30min" target="_blank" style={{ fontFamily: BF, fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#050507", backgroundColor: C.cyan, padding: "12px 28px", borderRadius: 60, textDecoration: "none", textTransform: "uppercase" }}>Partner werden</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", position: "relative", zIndex: 1, padding: `140px ${pad} 80px`, textAlign: "center" }}>
        <Reveal>
          <div style={{ fontFamily: MF, fontSize: 11, letterSpacing: 8, color: C.cyan, textTransform: "uppercase", marginBottom: 40, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 40, height: 1, backgroundColor: C.cyan }} />
            White-Label Partnerprogramm
            <div style={{ width: 40, height: 1, backgroundColor: C.cyan }} />
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <h1 style={{ fontFamily: DF, fontSize: "clamp(44px, 7vw, 100px)", fontWeight: 900, lineHeight: 0.95, letterSpacing: -3, maxWidth: 900 }}>
            <span style={{ display: "block", color: C.light }}>Du verkaufst.</span>
            <span style={{ display: "block", fontStyle: "italic", fontWeight: 400, backgroundImage: `linear-gradient(135deg, ${C.cyan}, ${C.cyanB}, ${C.cyan})`, backgroundSize: "200% 200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "pp_gradient 4s ease infinite" }}>Wir liefern.</span>
          </h1>
        </Reveal>

        <Reveal delay={0.4}>
          <p style={{ fontFamily: AF, fontStyle: "italic", fontSize: "clamp(18px, 2vw, 24px)", color: C.mid, maxWidth: 560, lineHeight: 1.6, marginTop: 40 }}>
            Biete deinen Kunden einen KI-Telefonassistenten unter <span style={{ color: C.cyan }}>deinem Namen</span> an. Null Technik. Maximale Marge.
          </p>
        </Reveal>

        <Reveal delay={0.6}>
          <div style={{ display: "flex", gap: 20, marginTop: 56, flexWrap: "wrap", justifyContent: "center" }}>
            <a href="https://cal.eu/poza-ki/partner-30min" target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "18px 40px", borderRadius: 60, textDecoration: "none", fontFamily: BF, fontSize: 15, fontWeight: 700, letterSpacing: 1, backgroundColor: C.cyan, color: "#050507" }}>Jetzt Partner werden →</a>
            <a href="#rechner" style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "18px 40px", borderRadius: 60, textDecoration: "none", fontFamily: BF, fontSize: 15, letterSpacing: 1, backgroundColor: "transparent", color: C.light, border: `1px solid ${C.line2}` }}>Marge berechnen</a>
          </div>
        </Reveal>

        <Reveal delay={0.8}>
          <div style={{ marginTop: 80, display: "flex", gap: 56, flexWrap: "wrap", justifyContent: "center" }}>
            {[{ num: "€500+", label: "Marge pro Kunde" }, { num: "0€", label: "Partnergebühr" }, { num: "48h", label: "Go-Live" }].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <p style={{ fontFamily: DF, fontSize: 36, fontWeight: 900, color: C.cyan }}>{s.num}</p>
                <p style={{ fontFamily: MF, fontSize: 10, letterSpacing: 4, color: C.dim, textTransform: "uppercase", marginTop: 4 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", animation: "pp_float 3s ease-in-out infinite" }}>
          <div style={{ width: 24, height: 40, borderRadius: 12, border: `1px solid ${C.line2}`, display: "flex", justifyContent: "center", paddingTop: 8 }}>
            <div style={{ width: 3, height: 8, borderRadius: 2, backgroundColor: C.cyan }} />
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ overflow: "hidden", padding: "36px 0", borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ display: "flex", animation: "pp_marquee 30s linear infinite", whiteSpace: "nowrap" }}>
          {[0,1,2,3].map(i => (
            <span key={i} style={{ fontFamily: DF, fontSize: "7vw", fontWeight: 900, color: "transparent", WebkitTextStroke: `1px ${C.line2}`, letterSpacing: -2, marginRight: 60 }}>
              YOUR BRAND ✦ YOUR CLIENTS ✦ YOUR REVENUE ✦&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* BENEFITS */}
      <section id="vorteile" style={{ padding: `120px ${pad}`, maxWidth: 1300, margin: "0 auto" }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ width: 40, height: 1, backgroundColor: C.cyan }} />
            <span style={{ fontFamily: MF, fontSize: 11, letterSpacing: 8, color: C.cyan, textTransform: "uppercase" }}>Vorteile</span>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 style={{ fontFamily: DF, fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, letterSpacing: -2, lineHeight: 1.05, marginBottom: 48 }}>
            Warum Agenturen<br /><span style={{ fontStyle: "italic", fontWeight: 400, color: C.cyan }}>mit uns skalieren.</span>
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: 24 }}>
          {benefits.map((b, i) => (
            <Reveal key={i} delay={0.08 * i}>
              <TiltCard style={{ backgroundColor: C.dark, border: `1px solid ${C.line}`, borderRadius: 24, padding: "40px 32px", overflow: "hidden" }}>
                <span style={{ fontSize: 40, display: "block", marginBottom: 16 }}>{b.icon}</span>
                <h3 style={{ fontFamily: DF, fontSize: 22, fontWeight: 700, marginBottom: 10, color: C.white }}>{b.title}</h3>
                <p style={{ fontFamily: BF, fontSize: 15, color: C.mid, lineHeight: 1.7 }}>{b.desc}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: `120px ${pad}`, maxWidth: 1000, margin: "0 auto" }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ width: 40, height: 1, backgroundColor: C.cyan }} />
            <span style={{ fontFamily: MF, fontSize: 11, letterSpacing: 8, color: C.cyan, textTransform: "uppercase" }}>So funktioniert's</span>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 style={{ fontFamily: DF, fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, letterSpacing: -2, lineHeight: 1.05, marginBottom: 48 }}>
            4 Schritte zu<br /><span style={{ fontStyle: "italic", fontWeight: 400, color: C.cyan }}>wiederkehrendem Umsatz.</span>
          </h2>
        </Reveal>
        <div style={{ position: "relative", paddingLeft: 60 }}>
          <div style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 1, background: `linear-gradient(to bottom, ${C.cyan}, rgba(0,210,255,0.1))` }} />
          {howItWorks.map((s, i) => (
            <Reveal key={i} delay={0.12 * i}>
              <div style={{ position: "relative", marginBottom: 52 }}>
                <div style={{ position: "absolute", left: -52, top: 4, width: 24, height: 24, borderRadius: "50%", backgroundColor: C.dark, border: `2px solid ${C.cyan}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: C.cyan }} />
                </div>
                <span style={{ fontFamily: MF, fontSize: 11, letterSpacing: 6, color: C.cyan, textTransform: "uppercase" }}>Schritt {s.s}</span>
                <h3 style={{ fontFamily: DF, fontSize: 26, fontWeight: 700, marginTop: 8, marginBottom: 8, color: C.white }}>{s.t}</h3>
                <p style={{ fontFamily: BF, fontSize: 16, color: C.mid, lineHeight: 1.7, maxWidth: 500 }}>{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pakete" style={{ padding: `120px ${pad}`, maxWidth: 1300, margin: "0 auto" }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ width: 40, height: 1, backgroundColor: C.cyan }} />
            <span style={{ fontFamily: MF, fontSize: 11, letterSpacing: 8, color: C.cyan, textTransform: "uppercase" }}>Wholesale Pakete</span>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 style={{ fontFamily: DF, fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, letterSpacing: -2, lineHeight: 1.05, marginBottom: 20 }}>
            Dein Einkaufspreis.<br /><span style={{ fontStyle: "italic", fontWeight: 400, color: C.cyan }}>Dein Verkaufspreis.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p style={{ fontFamily: BF, fontSize: 17, color: C.mid, lineHeight: 1.7, maxWidth: 520, marginBottom: 60 }}>Kein Revenue-Share. Keine versteckten Kosten. Du kaufst zum Wholesale-Preis und verkaufst zu deinem eigenen Preis.</p>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 24 }}>
          {packages.map((pkg, i) => (
            <Reveal key={i} delay={0.12 * i}>
              <TiltCard style={{ backgroundColor: pkg.pop ? C.smoke : C.dark, border: `1px solid ${pkg.pop ? "rgba(0,210,255,0.25)" : C.line}`, borderRadius: 24, padding: "48px 32px", overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
                {pkg.pop && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.cyan}, ${C.cyanB})` }} />}
                {pkg.pop && <span style={{ position: "absolute", top: 20, right: 20, fontFamily: MF, fontSize: 9, letterSpacing: 3, color: "#050507", backgroundColor: C.cyan, padding: "4px 14px", borderRadius: 60, fontWeight: 700, textTransform: "uppercase" }}>Höchste Marge</span>}
                <span style={{ fontFamily: MF, fontSize: 10, letterSpacing: 4, color: C.dim, textTransform: "uppercase", marginBottom: 4 }}>{pkg.tag}</span>
                <h3 style={{ fontFamily: DF, fontSize: 32, fontWeight: 900, marginBottom: 4, letterSpacing: -1, color: C.white }}>{pkg.name}</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                  <span style={{ fontFamily: MF, fontSize: 12, color: C.dim }}>Wholesale</span>
                  <span style={{ fontFamily: DF, fontSize: 48, fontWeight: 900, color: C.cyan }}>€{pkg.price}</span>
                  <span style={{ fontFamily: MF, fontSize: 14, color: C.dim }}>/Mo</span>
                </div>

                <div style={{ display: "flex", gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: `1px solid ${C.line}` }}>
                  <div>
                    <p style={{ fontFamily: MF, fontSize: 9, letterSpacing: 2, color: C.dim, textTransform: "uppercase" }}>Empf. Retail</p>
                    <p style={{ fontFamily: BF, fontSize: 14, fontWeight: 600, color: C.light }}>{pkg.retail}</p>
                  </div>
                  <div>
                    <p style={{ fontFamily: MF, fontSize: 9, letterSpacing: 2, color: C.dim, textTransform: "uppercase" }}>Deine Marge</p>
                    <p style={{ fontFamily: BF, fontSize: 14, fontWeight: 600, color: C.cyanB }}>{pkg.margin}/Mo</p>
                  </div>
                </div>

                <p style={{ fontFamily: BF, fontSize: 13, color: C.dim, marginBottom: 20, fontStyle: "italic" }}>{pkg.note}</p>
                <div style={{ flex: 1 }}>
                  {pkg.list.map((f, fi) => (
                    <div key={fi} style={{ display: "flex", gap: 12, padding: "9px 0", fontSize: 14, color: C.mid, borderBottom: fi < pkg.list.length - 1 ? `1px solid ${C.line}` : "none" }}>
                      <span style={{ color: C.cyan, fontSize: 12, flexShrink: 0, marginTop: 2 }}>✦</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="https://cal.eu/poza-ki/partner-30min" target="_blank" style={{ display: "block", textAlign: "center", marginTop: 32, padding: "16px 0", borderRadius: 60, fontFamily: BF, fontSize: 14, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none", background: pkg.pop ? `linear-gradient(135deg, ${C.cyan}, ${C.cyanB})` : "transparent", color: pkg.pop ? "#050507" : C.light, border: pkg.pop ? "none" : `1px solid ${C.line2}` }}>Partner werden</a>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* MARGIN CALCULATOR */}
      <section id="rechner" style={{ padding: `120px ${pad}` }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center", marginBottom: 20 }}>
            <div style={{ width: 40, height: 1, backgroundColor: C.cyan }} />
            <span style={{ fontFamily: MF, fontSize: 11, letterSpacing: 8, color: C.cyan, textTransform: "uppercase" }}>Rechner</span>
            <div style={{ width: 40, height: 1, backgroundColor: C.cyan }} />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 style={{ fontFamily: DF, fontSize: "clamp(36px,5vw,56px)", fontWeight: 900, letterSpacing: -2, lineHeight: 1.05, marginBottom: 48, textAlign: "center" }}>
            Was kannst du<br /><span style={{ fontStyle: "italic", fontWeight: 400, color: C.cyan }}>verdienen?</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <MarginCalc />
        </Reveal>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: `120px ${pad}`, maxWidth: 800, margin: "0 auto" }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ width: 40, height: 1, backgroundColor: C.cyan }} />
            <span style={{ fontFamily: MF, fontSize: 11, letterSpacing: 8, color: C.cyan, textTransform: "uppercase" }}>FAQ</span>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 style={{ fontFamily: DF, fontSize: "clamp(36px,5vw,56px)", fontWeight: 900, letterSpacing: -2, lineHeight: 1.05, marginBottom: 48 }}>
            Partner<span style={{ fontStyle: "italic", fontWeight: 400, color: C.cyan }}> FAQ</span>
          </h2>
        </Reveal>
        {faqs.map((faq, i) => (
          <Reveal key={i} delay={0.04 * i}>
            <div onClick={() => setOpenFaq(openFaq === i ? -1 : i)} style={{ borderBottom: `1px solid ${C.line}`, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "28px 0" }}>
                <p style={{ fontFamily: DF, fontSize: 20, fontWeight: 600, color: openFaq === i ? C.cyan : C.light, transition: "color 0.3s" }}>{faq.q}</p>
                <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, marginLeft: 20, border: `1px solid ${openFaq === i ? C.cyan : C.line2}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.4s", transform: openFaq === i ? "rotate(45deg)" : "rotate(0)" }}>
                  <span style={{ fontFamily: MF, fontSize: 18, color: openFaq === i ? C.cyan : C.dim }}>+</span>
                </div>
              </div>
              <div style={{ maxHeight: openFaq === i ? 200 : 0, overflow: "hidden", transition: "max-height 0.5s cubic-bezier(0.16,1,0.3,1), padding 0.5s", paddingBottom: openFaq === i ? 28 : 0 }}>
                <p style={{ fontFamily: BF, fontSize: 16, color: C.mid, lineHeight: 1.7, maxWidth: 640 }}>{faq.a}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* FINAL CTA */}
      <section id="kontakt" style={{ padding: `160px ${pad}`, textAlign: "center", position: "relative" }}>
        <Reveal>
          <h2 style={{ fontFamily: DF, fontSize: "clamp(40px,6vw,80px)", fontWeight: 900, letterSpacing: -3, lineHeight: 1, marginBottom: 20, color: C.white }}>Let's build.</h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p style={{ fontFamily: AF, fontStyle: "italic", fontSize: "clamp(18px,2vw,24px)", color: C.mid, maxWidth: 500, margin: "0 auto 48px", lineHeight: 1.6 }}>15 Minuten Call — wir zeigen dir wie viel deine Agentur mit KI-Voice verdienen kann.</p>
        </Reveal>
        <Reveal delay={0.3}>
          <a href="https://cal.eu/poza-ki/partner-30min" target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "22px 56px", borderRadius: 60, textDecoration: "none", fontFamily: BF, fontSize: 16, fontWeight: 700, letterSpacing: 1, backgroundColor: C.cyan, color: "#050507", boxShadow: `0 4px 30px ${C.cyanG}` }}>Gespräch buchen →</a>
        </Reveal>
        <Reveal delay={0.4}>
          <p style={{ fontFamily: MF, fontSize: 11, letterSpacing: 4, color: C.dim, marginTop: 32, textTransform: "uppercase" }}>✦ Keine Partnergebühr ✦ Kein Risiko ✦ Jederzeit kündbar ✦</p>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: `60px ${pad}`, borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <svg width="100" height="26" viewBox="0 0 260 64" style={{ display: "block" }}>
              <text x="0" y="46" fontFamily="Georgia, 'Playfair Display', serif" fontSize="46" fontWeight="900" fill="rgba(255,255,255,0.93)">P</text>
              <circle cx="46" cy="25" r="13" fill="none" stroke="rgba(255,255,255,0.93)" strokeWidth="2.8" />
              <rect x="39" y="17" width="2.8" height="16" rx="1.4" fill="#00d2ff" opacity="0.65" />
              <rect x="44.5" y="13" width="2.8" height="24" rx="1.4" fill="#00d2ff" opacity="0.85" />
              <rect x="50" y="17" width="2.8" height="16" rx="1.4" fill="#00d2ff" opacity="0.65" />
              <text x="64" y="46" fontFamily="Georgia, 'Playfair Display', serif" fontSize="46" fontWeight="900" fill="rgba(255,255,255,0.93)">ZA</text>
              <rect x="154" y="25" width="10" height="1.5" rx="0.75" fill="#00d2ff" opacity="0.5" />
              <text x="170" y="46" fontFamily="Georgia, 'Playfair Display', serif" fontSize="46" fontWeight="400" fontStyle="italic" fill="#00d2ff">KI</text>
            </svg>
            <span style={{ fontFamily: MF, fontSize: 9, letterSpacing: 2, color: C.cyan }}>PARTNER</span>
          </div>
          <p style={{ fontFamily: BF, fontSize: 13, color: C.dim }}>kontakt@poza-ki.com</p>
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          <a href="/" style={{ fontFamily: MF, fontSize: 11, letterSpacing: 2, color: C.dim, textDecoration: "none", textTransform: "uppercase" }}>← Hauptseite</a>
          {["Impressum", "Datenschutz"].map(l => <a key={l} href="#" style={{ fontFamily: MF, fontSize: 11, letterSpacing: 2, color: C.dim, textDecoration: "none", textTransform: "uppercase" }}>{l}</a>)}
        </div>
        <p style={{ fontFamily: MF, fontSize: 11, color: C.dim, letterSpacing: 2 }}>© 2026 POZA-KI</p>
      </footer>
    </div>
  );
}
