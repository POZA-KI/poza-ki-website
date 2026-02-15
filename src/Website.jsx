import { useState, useEffect, useRef, useMemo } from "react";

const PHONE = "+43 XXX XXXXXXX";
const DF = "'Playfair Display', Georgia, serif";
const BF = "'Syne', sans-serif";
const MF = "'Space Grotesk', monospace";
const AF = "'Instrument Serif', Georgia, serif";
const C = {
  bg: "#050507", dark: "#0a0a0f", smoke: "#111118",
  line: "rgba(255,255,255,0.06)", line2: "rgba(255,255,255,0.12)",
  dim: "rgba(255,255,255,0.25)", mid: "rgba(255,255,255,0.5)",
  light: "rgba(255,255,255,0.7)", white: "rgba(255,255,255,0.93)",
  gold: "#c8a44e", goldB: "#e8c85a",
  goldG: "rgba(200,164,78,0.15)", goldF: "rgba(200,164,78,0.06)",
};

function useReveal(th = 0.15) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: th });
    o.observe(el);
    return () => o.disconnect();
  }, [th]);
  return [ref, v];
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, v] = useReveal();
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      transform: v ? "translateY(0) rotateX(0)" : "translateY(60px) rotateX(4deg)",
      transition: `all 1s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      ...style
    }}>{children}</div>
  );
}

function Typewriter({ texts }) {
  const [idx, setIdx] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const txt = texts[idx];
    if (!del && ci < txt.length) { const t = setTimeout(() => setCi(c => c + 1), 80); return () => clearTimeout(t); }
    if (!del && ci === txt.length) { const t = setTimeout(() => setDel(true), 2500); return () => clearTimeout(t); }
    if (del && ci > 0) { const t = setTimeout(() => setCi(c => c - 1), 40); return () => clearTimeout(t); }
    if (del && ci === 0) { setDel(false); setIdx(i => (i + 1) % texts.length); }
  }, [ci, del, idx, texts]);
  return (
    <span>
      {texts[idx].substring(0, ci)}
      <span style={{ display: "inline-block", width: 3, height: "0.9em", backgroundColor: C.gold, marginLeft: 4, verticalAlign: "text-bottom", animation: "poza_blink 1s step-end infinite" }} />
    </span>
  );
}

function TiltCard({ children, style = {} }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [h, setH] = useState(false);
  return (
    <div ref={ref}
      onMouseMove={e => { if (!ref.current) return; const r = ref.current.getBoundingClientRect(); setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 10, y: ((e.clientY - r.top) / r.height - 0.5) * -10 }); }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => { setH(false); setTilt({ x: 0, y: 0 }); }}
      style={{
        transform: `perspective(800px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) scale(${h ? 1.02 : 1})`,
        transition: h ? "transform 0.1s ease-out" : "transform 0.6s cubic-bezier(0.16,1,0.3,1)",
        position: "relative", ...style
      }}>{children}</div>
  );
}

function Counter({ end, suffix = "" }) {
  const [ref, v] = useReveal(0.3);
  const [c, setC] = useState(0);
  useEffect(() => {
    if (!v) return;
    const s = performance.now();
    const tick = (n) => { const t = Math.min((n - s) / 2000, 1); setC(Math.round((1 - Math.pow(1 - t, 4)) * end)); if (t < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, [v, end]);
  return <span ref={ref}>{c.toLocaleString("de-DE")}{suffix}</span>;
}

function Waveform({ active }) {
  const bars = 35;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height: 48, justifyContent: "center" }}>
      {Array.from({ length: bars }, (_, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 2,
          backgroundColor: C.gold,
          height: active ? `${20 + Math.sin(i * 0.5) * 30 + 15}%` : "8%",
          opacity: 0.6 + (i / bars) * 0.4,
          animation: active ? `poza_wave 1.${2 + (i % 5)}s ease-in-out infinite ${i * 0.05}s` : "none",
        }} />
      ))}
    </div>
  );
}

export default function PozaKI() {
  const [scrollY, setScrollY] = useState(0);
  const [progress, setProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [activeInd, setActiveInd] = useState(0);
  const [callActive, setCallActive] = useState(false);
  const [openFaq, setOpenFaq] = useState(-1);

  useEffect(() => {
    const h = () => { setScrollY(window.scrollY); const max = document.documentElement.scrollHeight - window.innerHeight; setProgress(max > 0 ? window.scrollY / max : 0); };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const h = (e) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveInd(i => (i + 1) % 5), 3000);
    return () => clearInterval(t);
  }, []);

  // Inject global styles via useEffect
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Syne:wght@400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      html, body, #root { background: #050507 !important; margin: 0; padding: 0; }
      * { box-sizing: border-box; }
      ::selection { background: rgba(200,164,78,0.3); color: #fff; }
      html { scroll-behavior: smooth; }
      ::-webkit-scrollbar { width: 3px; }
      ::-webkit-scrollbar-track { background: #050507; }
      ::-webkit-scrollbar-thumb { background: #c8a44e; border-radius: 3px; }
      @keyframes poza_blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
      @keyframes poza_wave { 0%,100% { height:20%; } 50% { height:80%; } }
      @keyframes poza_marquee { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }
      @keyframes poza_float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
      @keyframes poza_gradient { 0% { background-position:0% 50%; } 50% { background-position:100% 50%; } 100% { background-position:0% 50%; } }
      @keyframes poza_blob { 0%,100% { border-radius:60% 40% 30% 70%/60% 30% 70% 40%; } 50% { border-radius:30% 60% 70% 40%/50% 60% 30% 60%; } }
      @keyframes poza_pulse { 0% { transform:translate(-50%,-50%) scale(1); opacity:0.3; } 100% { transform:translate(-50%,-50%) scale(1.5); opacity:0; } }
      @keyframes poza_particle { 0%,100% { transform:translate(0,0); } 25% { transform:translate(10px,-20px); } 50% { transform:translate(-5px,-40px); } 75% { transform:translate(15px,-20px); } }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(link); document.head.removeChild(style); };
  }, []);

  const industries = [
    { name: "Handwerker", icon: "🔧", stat: "73%", desc: "verpasste Anrufe während der Arbeit", color: "#f39c12" },
    { name: "Ärzte & Praxen", icon: "🏥", stat: "180+", desc: "Anrufe pro Woche in einer Praxis", color: "#2ecc71" },
    { name: "Restaurants", icon: "🍽️", stat: "45%", desc: "der Reservierungen per Telefon", color: "#e74c3c" },
    { name: "Anwälte", icon: "⚖️", stat: "€340", desc: "Wert eines verpassten Mandanten", color: "#9b59b6" },
    { name: "Immobilien", icon: "🏠", stat: "62%", desc: "der Leads rufen zuerst an", color: "#3498db" },
  ];

  const features = [
    { title: "24/7 Erreichbar", desc: "Kein Anruf geht verloren. Nicht um 3 Uhr nachts, nicht am Sonntag, nicht im Urlaub.", icon: "◉", n: "01" },
    { title: "Natürliche Stimme", desc: "Kein Roboter. Deine Kunden merken keinen Unterschied zu einem echten Menschen.", icon: "◎", n: "02" },
    { title: "Termine buchen", desc: "Der Agent checkt deinen Kalender und bucht Termine direkt ein. Automatisch.", icon: "◈", n: "03" },
    { title: "Anrufe zusammenfassen", desc: "Nach jedem Anruf bekommst du eine E-Mail mit Zusammenfassung, Name und Anliegen.", icon: "◇", n: "04" },
    { title: "Intelligente Weiterleitung", desc: "Bei dringenden Fällen leitet der Agent sofort an dein Handy weiter.", icon: "◆", n: "05" },
    { title: "Mehrsprachig", desc: "Deutsch, Englisch, und mehr. Dein Agent spricht die Sprache deiner Kunden.", icon: "◑", n: "06" },
  ];

  const packages = [
    { name: "Signature", price: "999", tag: "Managed Voice Intelligence", list: ["KI-Telefonassistent 24/7", "Bis 300 Anrufe / Monat", "Automatische Terminbuchung", "Anrufzusammenfassung per E-Mail", "Anrufweiterleitung", "Monatliches Reporting", "Persönliches Onboarding"], note: "Ideal für Einzelunternehmer & kleine Teams" },
    { name: "Exclusive", price: "1.999", tag: "Full-Service AI Operations", pop: true, list: ["Alles aus Signature", "Bis 700 Anrufe / Monat", "CRM-Integration", "Follow-up SMS & E-Mail Sequenzen", "Eigene Stimme (Voice Cloning)", "Wöchentliches Reporting + Strategy Call", "Prioritäts-Support (< 2h)"], note: "Unser meistgebuchtes Paket" },
    { name: "Elite", price: "3.999", tag: "Enterprise AI Concierge", list: ["Alles aus Exclusive", "Unbegrenzte Anrufe", "Multi-Standort / Multi-Nummer", "Custom Integrationen & Workflows", "Mehrsprachig (DE/EN + weitere)", "Dedicated Account Manager", "Wöchentliche Strategie-Sessions", "Eigenes Dashboard"], note: "Für Unternehmen die keine Kompromisse machen" },
  ];

  const faqs = [
    { q: "Klingt das wirklich wie ein Mensch?", a: "Ja. Wir nutzen die fortschrittlichste Sprach-KI am Markt. 9 von 10 Anrufern merken keinen Unterschied. Ruf unsere Demo-Nummer an und überzeug dich selbst." },
    { q: "Was passiert bei komplexen Fragen?", a: "Der Agent erkennt automatisch, wenn er nicht weiterhelfen kann und leitet den Anruf sofort an dein Handy weiter." },
    { q: "Wie schnell bin ich online?", a: "48 Stunden nach dem Onboarding-Gespräch. Wir konfigurieren alles — du musst nur deine Infos bereitstellen." },
    { q: "Was kostet mich ein verpasster Anruf?", a: "Studien zeigen: Durchschnittlich €180 an entgangenem Umsatz. Unser günstigstes Paket rentiert sich ab dem 6. geretteten Anruf." },
    { q: "Gibt es eine Mindestlaufzeit?", a: "Wir empfehlen mindestens 3 Monate. Danach monatlich kündbar." },
    { q: "Kann ich vorher testen?", a: "Ja. Ruf unsere Demo-Nummer an. Im Gründer-Angebot bekommst du das Setup geschenkt." },
  ];

  const steps = [
    { s: "01", t: "Gespräch buchen", d: "15 Minuten reichen. Wir analysieren dein Business und was dein Agent können soll." },
    { s: "02", t: "Wir konfigurieren", d: "Innerhalb von 48h bauen wir deinen KI-Agenten — trainiert auf dein Unternehmen." },
    { s: "03", t: "Go Live", d: "Dein Agent übernimmt. Ab jetzt geht kein Anruf mehr verloren." },
    { s: "04", t: "Optimierung", d: "Wir analysieren und optimieren laufend. Dein Agent wird jede Woche besser." },
  ];

  const pad = "clamp(24px,5vw,80px)";

  const particles = useMemo(() => Array.from({ length: 18 }, () => ({
    x: Math.random() * 100, y: Math.random() * 100, s: Math.random() * 3 + 1,
    dur: Math.random() * 20 + 15, del: Math.random() * 10, op: Math.random() * 0.2 + 0.05,
  })), []);

  return (
    <div style={{ backgroundColor: "#050507", color: C.white, fontFamily: BF, minHeight: "100vh", overflowX: "hidden", position: "relative" }}>

      {/* Progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, height: 2, zIndex: 200, width: `${progress * 100}%`, background: `linear-gradient(90deg, ${C.gold}, ${C.goldB}, #e84393)` }} />

      {/* Ambient background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {particles.map((p, i) => (
          <div key={i} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, borderRadius: "50%", backgroundColor: C.gold, opacity: p.op, animation: `poza_particle ${p.dur}s ease-in-out infinite ${p.del}s` }} />
        ))}
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "60vw", height: "60vw", background: `radial-gradient(circle, ${C.goldF}, transparent 60%)`, animation: "poza_blob 20s ease-in-out infinite", filter: "blur(60px)", opacity: 0.5 }} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at ${50 + (mousePos.x - 0.5) * 15}% ${50 + (mousePos.y - 0.5) * 15}%, ${C.goldF}, transparent 40%)`, transition: "background 0.3s" }} />
      </div>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 80, padding: `0 ${pad}`, display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: scrollY > 80 ? "rgba(5,5,7,0.92)" : "transparent", backdropFilter: scrollY > 80 ? "blur(30px)" : "none", borderBottom: `1px solid ${scrollY > 80 ? C.line : "transparent"}`, transition: "all 0.5s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="130" height="32" viewBox="0 0 280 68" style={{ display: "block" }}>
            <text x="0" y="50" fontFamily="Georgia, 'Playfair Display', serif" fontSize="52" fontWeight="900" letterSpacing="-1" fill="rgba(255,255,255,0.93)">P</text>
            <circle cx="52" cy="28" r="15" fill="none" stroke="rgba(255,255,255,0.93)" strokeWidth="3.2" />
            <rect x="44" y="19" width="3.2" height="18" rx="1.6" fill="#c8a44e" opacity="0.65"><animate attributeName="height" values="18;10;18" dur="1.4s" repeatCount="indefinite" /><animate attributeName="y" values="19;23;19" dur="1.4s" repeatCount="indefinite" /></rect>
            <rect x="50.5" y="14" width="3.2" height="28" rx="1.6" fill="#c8a44e" opacity="0.85"><animate attributeName="height" values="28;15;28" dur="1.1s" repeatCount="indefinite" /><animate attributeName="y" values="14;20.5;14" dur="1.1s" repeatCount="indefinite" /></rect>
            <rect x="57" y="19" width="3.2" height="18" rx="1.6" fill="#c8a44e" opacity="0.65"><animate attributeName="height" values="18;10;18" dur="1.3s" repeatCount="indefinite" /><animate attributeName="y" values="19;23;19" dur="1.3s" repeatCount="indefinite" /></rect>
            <text x="74" y="50" fontFamily="Georgia, 'Playfair Display', serif" fontSize="52" fontWeight="900" letterSpacing="-1" fill="rgba(255,255,255,0.93)">ZA</text>
            <rect x="174" y="28" width="12" height="1.8" rx="0.9" fill="#c8a44e" opacity="0.5" />
            <text x="192" y="50" fontFamily="Georgia, 'Playfair Display', serif" fontSize="52" fontWeight="400" fontStyle="italic" fill="#c8a44e">KI</text>
          </svg>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Vorteile", "Demo", "Pakete", "FAQ"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ fontFamily: BF, fontSize: 13, fontWeight: 500, letterSpacing: 1.5, color: C.mid, textDecoration: "none", textTransform: "uppercase" }}>{l}</a>
          ))}
          <a href="https://cal.eu/poza-ki/30min" target="_blank" style={{ fontFamily: BF, fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#050507", backgroundColor: C.gold, padding: "12px 28px", borderRadius: 60, textDecoration: "none", textTransform: "uppercase" }}>Gespräch buchen</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", position: "relative", zIndex: 1, padding: `140px ${pad} 80px`, textAlign: "center" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: `translate(-50%,-50%) rotate(${scrollY * 0.02}deg)`, width: "min(80vw,700px)", height: "min(80vw,700px)", border: `1px solid ${C.line}`, borderRadius: "50%", opacity: 0.3 }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: `translate(-50%,-50%) rotate(${-scrollY * 0.015}deg)`, width: "min(60vw,520px)", height: "min(60vw,520px)", border: `1px dashed ${C.line}`, borderRadius: "50%", opacity: 0.15 }} />

        <Reveal>
          <div style={{ fontFamily: MF, fontSize: 11, letterSpacing: 8, color: C.gold, textTransform: "uppercase", marginBottom: 40, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 40, height: 1, backgroundColor: C.gold }} />
            Managed AI Voice Operations
            <div style={{ width: 40, height: 1, backgroundColor: C.gold }} />
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <h1 style={{ fontFamily: DF, fontSize: "clamp(48px, 8vw, 110px)", fontWeight: 900, lineHeight: 0.95, letterSpacing: -4, maxWidth: 900 }}>
            <span style={{ display: "block", color: C.light }}>Kein Anruf</span>
            <span style={{ display: "block", fontStyle: "italic", fontWeight: 400, backgroundImage: `linear-gradient(135deg, ${C.gold}, ${C.goldB}, #e84393, ${C.gold})`, backgroundSize: "300% 300%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "poza_gradient 5s ease infinite" }}>geht verloren.</span>
          </h1>
        </Reveal>

        <Reveal delay={0.4}>
          <p style={{ fontFamily: AF, fontStyle: "italic", fontSize: "clamp(18px, 2vw, 26px)", color: C.mid, maxWidth: 560, lineHeight: 1.6, marginTop: 40 }}>
            Dein KI-Assistent nimmt jeden Anruf an — <br />
            <span style={{ color: C.gold }}>
              <Typewriter texts={["24 Stunden am Tag.", "7 Tage die Woche.", "365 Tage im Jahr.", "auch um 3 Uhr nachts.", "auch am Feiertag.", "in deiner Stimme."]} />
            </span>
          </p>
        </Reveal>

        <Reveal delay={0.6}>
          <div style={{ display: "flex", gap: 20, marginTop: 56, flexWrap: "wrap", justifyContent: "center" }}>
            <a href="https://cal.eu/poza-ki/30min" target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "18px 40px", borderRadius: 60, textDecoration: "none", fontFamily: BF, fontSize: 15, fontWeight: 700, letterSpacing: 1, backgroundColor: C.gold, color: "#050507", boxShadow: `0 4px 30px ${C.goldG}` }}>Demo anhören →</a>
            <a href="#vorteile" style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "18px 40px", borderRadius: 60, textDecoration: "none", fontFamily: BF, fontSize: 15, letterSpacing: 1, backgroundColor: "transparent", color: C.light, border: `1px solid ${C.line2}` }}>Mehr erfahren</a>
          </div>
        </Reveal>

        <Reveal delay={0.8}>
          <div style={{ marginTop: 80, display: "flex", gap: 48, flexWrap: "wrap", justifyContent: "center" }}>
            {[{ num: "2.4s", label: "Reaktionszeit" }, { num: "24/7", label: "Erreichbar" }, { num: "98%", label: "Zufriedenheit" }].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <p style={{ fontFamily: DF, fontSize: 36, fontWeight: 900, color: C.gold }}>{s.num}</p>
                <p style={{ fontFamily: MF, fontSize: 10, letterSpacing: 4, color: C.dim, textTransform: "uppercase", marginTop: 4 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", animation: "poza_float 3s ease-in-out infinite" }}>
          <div style={{ width: 24, height: 40, borderRadius: 12, border: `1px solid ${C.line2}`, display: "flex", justifyContent: "center", paddingTop: 8 }}>
            <div style={{ width: 3, height: 8, borderRadius: 2, backgroundColor: C.gold }} />
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ overflow: "hidden", padding: "40px 0", borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ display: "flex", animation: "poza_marquee 25s linear infinite", whiteSpace: "nowrap" }}>
          {[0,1,2,3].map(i => (
            <span key={i} style={{ fontFamily: DF, fontSize: "8vw", fontWeight: 900, color: "transparent", WebkitTextStroke: `1px ${C.line2}`, letterSpacing: -2, marginRight: 80 }}>
              NEVER MISS A CALL ✦ NIE WIEDER UNERREICHBAR ✦&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* INDUSTRIES */}
      <section style={{ padding: "120px 0", position: "relative", zIndex: 1 }}>
        <div style={{ padding: `0 ${pad}`, marginBottom: 60 }}>
          <Reveal>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 40, height: 1, backgroundColor: C.gold }} />
              <span style={{ fontFamily: MF, fontSize: 11, letterSpacing: 8, color: C.gold, textTransform: "uppercase" }}>Branchen</span>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 style={{ fontFamily: DF, fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, letterSpacing: -2, lineHeight: 1.05 }}>
              Für jede Branche,<br /><span style={{ fontStyle: "italic", fontWeight: 400, color: C.gold }}>die Anrufe bekommt.</span>
            </h2>
          </Reveal>
        </div>
        <div style={{ display: "flex", gap: 24, overflowX: "auto", padding: `20px ${pad}`, scrollbarWidth: "none" }}>
          {industries.map((ind, i) => (
            <TiltCard key={i} style={{ minWidth: 320, backgroundColor: activeInd === i ? C.smoke : C.dark, border: `1px solid ${activeInd === i ? "rgba(200,164,78,0.25)" : C.line}`, borderRadius: 24, padding: "44px 32px", flexShrink: 0, transition: "all 0.5s", overflow: "hidden" }}>
              {activeInd === i && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />}
              <span style={{ fontSize: 48, display: "block", marginBottom: 20 }}>{ind.icon}</span>
              <h3 style={{ fontFamily: DF, fontSize: 26, fontWeight: 700, marginBottom: 8, color: C.white }}>{ind.name}</h3>
              <span style={{ fontFamily: DF, fontSize: 44, fontWeight: 900, color: ind.color }}>{ind.stat}</span>
              <p style={{ fontFamily: BF, fontSize: 15, color: C.mid, lineHeight: 1.6, marginTop: 12 }}>{ind.desc}</p>
            </TiltCard>
          ))}
        </div>
        <p style={{ textAlign: "center", marginTop: 16, fontFamily: MF, fontSize: 10, letterSpacing: 6, color: C.dim, textTransform: "uppercase" }}>← Scroll →</p>
      </section>

      {/* FEATURES */}
      <section id="vorteile" style={{ padding: `120px ${pad}`, maxWidth: 1300, margin: "0 auto" }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ width: 40, height: 1, backgroundColor: C.gold }} />
            <span style={{ fontFamily: MF, fontSize: 11, letterSpacing: 8, color: C.gold, textTransform: "uppercase" }}>Features</span>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 style={{ fontFamily: DF, fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, letterSpacing: -2, lineHeight: 1.05, marginBottom: 48 }}>
            Alles was dein<br /><span style={{ fontStyle: "italic", fontWeight: 400, color: C.gold }}>Telefon braucht.</span>
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: 24 }}>
          {features.map((f, i) => (
            <Reveal key={i} delay={0.08 * i}>
              <TiltCard style={{ backgroundColor: C.dark, border: `1px solid ${C.line}`, borderRadius: 24, padding: "44px 32px", overflow: "hidden" }}>
                <span style={{ fontFamily: DF, fontSize: 72, fontWeight: 900, color: C.gold, opacity: 0.04, position: "absolute", top: -10, right: 16 }}>{f.n}</span>
                <div style={{ fontFamily: MF, fontSize: 28, color: C.gold, marginBottom: 20 }}>{f.icon}</div>
                <h3 style={{ fontFamily: DF, fontSize: 22, fontWeight: 700, marginBottom: 12, color: C.white }}>{f.title}</h3>
                <p style={{ fontFamily: BF, fontSize: 15, color: C.mid, lineHeight: 1.7 }}>{f.desc}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: `100px ${pad}`, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 48 }}>
          {[{ end: 180, suf: "€", l: "Durchschn. Verlust pro verpasstem Anruf" }, { end: 47, suf: "%", l: "der Anrufer legen nach 5x Klingeln auf" }, { end: 73, suf: "%", l: "der Handwerker verpassen Anrufe" }].map((s, i) => (
            <Reveal key={i} delay={0.15 * i}>
              <div style={{ textAlign: "center", maxWidth: 260 }}>
                <p style={{ fontFamily: DF, fontSize: "clamp(48px,6vw,72px)", fontWeight: 900, color: C.gold, lineHeight: 1 }}><Counter end={s.end} suffix={s.suf} /></p>
                <p style={{ fontFamily: BF, fontSize: 14, color: C.mid, marginTop: 12, lineHeight: 1.5 }}>{s.l}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* BIG QUOTE */}
      <section style={{ padding: `140px ${pad}` }}>
        <Reveal>
          <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
            <p style={{ fontFamily: DF, fontStyle: "italic", fontSize: "clamp(28px,4vw,56px)", fontWeight: 400, lineHeight: 1.4, color: C.light }}>
              &ldquo;Dein Wettbewerber nimmt den Anruf an.<br /><span style={{ color: C.gold }}>Immer.</span>&rdquo;
            </p>
          </div>
        </Reveal>
      </section>

      {/* DEMO */}
      <section id="demo" style={{ padding: `120px ${pad}`, background: `linear-gradient(180deg, transparent, ${C.goldF}, transparent)` }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center", marginBottom: 20 }}>
              <div style={{ width: 40, height: 1, backgroundColor: C.gold }} />
              <span style={{ fontFamily: MF, fontSize: 11, letterSpacing: 8, color: C.gold, textTransform: "uppercase" }}>Live Demo</span>
              <div style={{ width: 40, height: 1, backgroundColor: C.gold }} />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 style={{ fontFamily: DF, fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, letterSpacing: -2, marginBottom: 20 }}>Hör selbst.</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ fontFamily: AF, fontStyle: "italic", fontSize: 20, color: C.mid, lineHeight: 1.6, marginBottom: 48 }}>Kein Video. Kein Pitch-Deck. Ruf einfach an und sprich mit unserer KI.</p>
          </Reveal>
          <Reveal delay={0.3}>
            <div onClick={() => setCallActive(!callActive)} style={{ backgroundColor: C.dark, border: `2px solid ${callActive ? C.gold : C.line2}`, borderRadius: 32, padding: "40px 48px", cursor: "pointer", transition: "all 0.5s", boxShadow: callActive ? `0 0 60px ${C.goldG}` : "none", position: "relative", overflow: "hidden" }}>
              {callActive && <div style={{ position: "absolute", top: "50%", left: "50%", width: 300, height: 300, borderRadius: "50%", border: `1px solid rgba(200,164,78,0.12)`, animation: "poza_pulse 2s ease-out infinite" }} />}
              <Waveform active={callActive} />
              <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: callActive ? "#e84393" : `linear-gradient(135deg, ${C.gold}, ${C.goldB})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, transition: "all 0.5s", transform: callActive ? "rotate(135deg)" : "rotate(0)" }}>📞</div>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontFamily: MF, fontSize: 11, letterSpacing: 3, color: C.dim, textTransform: "uppercase" }}>{callActive ? "Anruf beenden" : "Jetzt anrufen"}</p>
                  <p style={{ fontFamily: DF, fontSize: 28, fontWeight: 700, color: C.gold }}>{PHONE}</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: `120px ${pad}`, maxWidth: 1000, margin: "0 auto" }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ width: 40, height: 1, backgroundColor: C.gold }} />
            <span style={{ fontFamily: MF, fontSize: 11, letterSpacing: 8, color: C.gold, textTransform: "uppercase" }}>Ablauf</span>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 style={{ fontFamily: DF, fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, letterSpacing: -2, lineHeight: 1.05, marginBottom: 48 }}>
            In 48 Stunden<br /><span style={{ fontStyle: "italic", fontWeight: 400, color: C.gold }}>einsatzbereit.</span>
          </h2>
        </Reveal>
        <div style={{ position: "relative", paddingLeft: 60 }}>
          <div style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 1, background: `linear-gradient(to bottom, ${C.gold}, rgba(200,164,78,0.1))` }} />
          {steps.map((s, i) => (
            <Reveal key={i} delay={0.12 * i}>
              <div style={{ position: "relative", marginBottom: 52 }}>
                <div style={{ position: "absolute", left: -52, top: 4, width: 24, height: 24, borderRadius: "50%", backgroundColor: C.dark, border: `2px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: C.gold }} />
                </div>
                <span style={{ fontFamily: MF, fontSize: 11, letterSpacing: 6, color: C.gold, textTransform: "uppercase" }}>Schritt {s.s}</span>
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
            <div style={{ width: 40, height: 1, backgroundColor: C.gold }} />
            <span style={{ fontFamily: MF, fontSize: 11, letterSpacing: 8, color: C.gold, textTransform: "uppercase" }}>Pakete</span>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 style={{ fontFamily: DF, fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, letterSpacing: -2, lineHeight: 1.05, marginBottom: 20 }}>
            Investiere in<br /><span style={{ fontStyle: "italic", fontWeight: 400, color: C.gold }}>Erreichbarkeit.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p style={{ fontFamily: BF, fontSize: 17, color: C.mid, lineHeight: 1.7, maxWidth: 520, marginBottom: 60 }}>Jeder verpasste Anruf kostet dich Geld. Wähl das Paket das zu deinem Business passt — individuelle Einrichtung besprechen wir persönlich.</p>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 24 }}>
          {packages.map((pkg, i) => (
            <Reveal key={i} delay={0.12 * i}>
              <TiltCard style={{ backgroundColor: pkg.pop ? C.smoke : C.dark, border: `1px solid ${pkg.pop ? "rgba(200,164,78,0.25)" : C.line}`, borderRadius: 24, padding: "48px 32px", overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
                {pkg.pop && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.gold}, ${C.goldB})` }} />}
                {pkg.pop && <span style={{ position: "absolute", top: 20, right: 20, fontFamily: MF, fontSize: 9, letterSpacing: 3, color: "#050507", backgroundColor: C.gold, padding: "4px 14px", borderRadius: 60, fontWeight: 700, textTransform: "uppercase" }}>Meistgebucht</span>}
                <span style={{ fontFamily: MF, fontSize: 10, letterSpacing: 4, color: C.dim, textTransform: "uppercase", marginBottom: 4 }}>{pkg.tag}</span>
                <h3 style={{ fontFamily: DF, fontSize: 32, fontWeight: 900, marginBottom: 4, letterSpacing: -1, color: C.white }}>{pkg.name}</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span style={{ fontFamily: MF, fontSize: 14, color: C.dim }}>ab</span>
                  <span style={{ fontFamily: DF, fontSize: 48, fontWeight: 900, color: C.gold }}>€{pkg.price}</span>
                  <span style={{ fontFamily: MF, fontSize: 14, color: C.dim }}>/Mo</span>
                </div>
                <p style={{ fontFamily: BF, fontSize: 13, color: C.dim, marginBottom: 28, fontStyle: "italic" }}>{pkg.note}</p>
                <div style={{ flex: 1 }}>
                  {pkg.list.map((f, fi) => (
                    <div key={fi} style={{ display: "flex", gap: 12, padding: "10px 0", fontSize: 14, color: C.mid, borderBottom: fi < pkg.list.length - 1 ? `1px solid ${C.line}` : "none" }}>
                      <span style={{ color: C.gold, fontSize: 12, flexShrink: 0, marginTop: 2 }}>✦</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="https://cal.eu/poza-ki/30min" target="_blank" style={{ display: "block", textAlign: "center", marginTop: 32, padding: "16px 0", borderRadius: 60, fontFamily: BF, fontSize: 14, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none", background: pkg.pop ? `linear-gradient(135deg, ${C.gold}, ${C.goldB})` : "transparent", color: pkg.pop ? "#050507" : C.light, border: pkg.pop ? "none" : `1px solid ${C.line2}` }}>Gespräch buchen</a>
              </TiltCard>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.4}>
          <p style={{ textAlign: "center", marginTop: 48, fontFamily: MF, fontSize: 11, letterSpacing: 3, color: C.dim, textTransform: "uppercase" }}>✦ Individuelle Einrichtung & Setup im persönlichen Gespräch ✦</p>
        </Reveal>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: `120px ${pad}`, maxWidth: 800, margin: "0 auto" }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ width: 40, height: 1, backgroundColor: C.gold }} />
            <span style={{ fontFamily: MF, fontSize: 11, letterSpacing: 8, color: C.gold, textTransform: "uppercase" }}>FAQ</span>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 style={{ fontFamily: DF, fontSize: "clamp(36px,5vw,56px)", fontWeight: 900, letterSpacing: -2, lineHeight: 1.05, marginBottom: 48 }}>
            Fragen<span style={{ fontStyle: "italic", fontWeight: 400, color: C.gold }}> & Antworten</span>
          </h2>
        </Reveal>
        {faqs.map((faq, i) => (
          <Reveal key={i} delay={0.04 * i}>
            <div onClick={() => setOpenFaq(openFaq === i ? -1 : i)} style={{ borderBottom: `1px solid ${C.line}`, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "28px 0" }}>
                <p style={{ fontFamily: DF, fontSize: 20, fontWeight: 600, color: openFaq === i ? C.gold : C.light, transition: "color 0.3s" }}>{faq.q}</p>
                <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, marginLeft: 20, border: `1px solid ${openFaq === i ? C.gold : C.line2}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.4s", transform: openFaq === i ? "rotate(45deg)" : "rotate(0)" }}>
                  <span style={{ fontFamily: MF, fontSize: 18, color: openFaq === i ? C.gold : C.dim }}>+</span>
                </div>
              </div>
              <div style={{ maxHeight: openFaq === i ? 200 : 0, overflow: "hidden", transition: "max-height 0.5s cubic-bezier(0.16,1,0.3,1), padding 0.5s", paddingBottom: openFaq === i ? 28 : 0 }}>
                <p style={{ fontFamily: BF, fontSize: 16, color: C.mid, lineHeight: 1.7, maxWidth: 640 }}>{faq.a}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* PARTNER CTA */}
      <section style={{ margin: `40px ${pad}`, borderRadius: 32, position: "relative", overflow: "hidden", background: `linear-gradient(135deg, ${C.smoke}, ${C.dark})`, border: `1px solid rgba(200,164,78,0.18)`, padding: "80px 60px" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 300, height: 300, background: `radial-gradient(circle, ${C.goldF}, transparent 70%)`, filter: "blur(40px)", pointerEvents: "none" }} />
        <Reveal>
          <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 40 }}>
            <div>
              <p style={{ fontFamily: MF, fontSize: 11, letterSpacing: 6, color: C.gold, textTransform: "uppercase", marginBottom: 16 }}>Für Agenturen & Berater</p>
              <h3 style={{ fontFamily: DF, fontSize: "clamp(28px,3vw,44px)", fontWeight: 900, letterSpacing: -1, lineHeight: 1.1, color: C.white }}>
                Du verkaufst.<br /><span style={{ fontStyle: "italic", fontWeight: 400, color: C.gold }}>Wir betreiben. Du kassierst.</span>
              </h3>
              <p style={{ fontFamily: BF, fontSize: 16, color: C.mid, marginTop: 16, maxWidth: 440, lineHeight: 1.6 }}>Biete deinen Kunden einen KI-Telefonassistenten unter deinem Namen an. White-Label ab €499/Mo pro Kunde.</p>
            </div>
            <a href="/partner" style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "18px 40px", borderRadius: 60, textDecoration: "none", fontFamily: BF, fontSize: 15, fontWeight: 700, letterSpacing: 1, backgroundColor: C.gold, color: "#050507" }}>Partnerprogramm →</a>
          </div>
        </Reveal>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: `160px ${pad}`, textAlign: "center", position: "relative" }}>
        <Reveal>
          <h2 style={{ fontFamily: DF, fontSize: "clamp(40px,6vw,80px)", fontWeight: 900, letterSpacing: -3, lineHeight: 1, marginBottom: 32, color: C.white }}>Bereit?</h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p style={{ fontFamily: AF, fontStyle: "italic", fontSize: "clamp(18px,2vw,24px)", color: C.mid, maxWidth: 460, margin: "0 auto 48px", lineHeight: 1.6 }}>Dein nächster verpasster Anruf könnte dein bester Kunde sein.</p>
        </Reveal>
        <Reveal delay={0.3}>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://cal.eu/poza-ki/30min" target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "22px 56px", borderRadius: 60, textDecoration: "none", fontFamily: BF, fontSize: 16, fontWeight: 700, letterSpacing: 1, backgroundColor: C.gold, color: "#050507", boxShadow: `0 4px 30px ${C.goldG}` }}>Gespräch buchen →</a>
            <a href={`tel:${PHONE.replace(/\s/g, "")}`} style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "22px 40px", borderRadius: 60, textDecoration: "none", fontFamily: BF, fontSize: 14, letterSpacing: 1, backgroundColor: "transparent", color: C.light, border: `1px solid ${C.line2}` }}>Demo anrufen</a>
          </div>
        </Reveal>
        <Reveal delay={0.4}>
          <p style={{ fontFamily: MF, fontSize: 11, letterSpacing: 4, color: C.dim, marginTop: 32, textTransform: "uppercase" }}>✦ Gründer-Angebot: Setup geschenkt bei Buchung bis Ende März ✦</p>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: `60px ${pad}`, borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
        <div>
          <div style={{ marginBottom: 12 }}>
            <svg width="100" height="26" viewBox="0 0 260 64" style={{ display: "block" }}>
              <text x="0" y="46" fontFamily="Georgia, 'Playfair Display', serif" fontSize="46" fontWeight="900" fill="rgba(255,255,255,0.93)">P</text>
              <circle cx="46" cy="25" r="13" fill="none" stroke="rgba(255,255,255,0.93)" strokeWidth="2.8" />
              <rect x="39" y="17" width="2.8" height="16" rx="1.4" fill="#c8a44e" opacity="0.65" />
              <rect x="44.5" y="13" width="2.8" height="24" rx="1.4" fill="#c8a44e" opacity="0.85" />
              <rect x="50" y="17" width="2.8" height="16" rx="1.4" fill="#c8a44e" opacity="0.65" />
              <text x="64" y="46" fontFamily="Georgia, 'Playfair Display', serif" fontSize="46" fontWeight="900" fill="rgba(255,255,255,0.93)">ZA</text>
              <rect x="154" y="25" width="10" height="1.5" rx="0.75" fill="#c8a44e" opacity="0.5" />
              <text x="170" y="46" fontFamily="Georgia, 'Playfair Display', serif" fontSize="46" fontWeight="400" fontStyle="italic" fill="#c8a44e">KI</text>
            </svg>
          </div>
          <p style={{ fontFamily: BF, fontSize: 13, color: C.dim }}>Eichenweg 3, 9871 Seeboden am Millstättersee</p>
          <p style={{ fontFamily: BF, fontSize: 13, color: C.dim, marginTop: 2 }}>kontakt@poza-ki.com</p>
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          {["Impressum", "Datenschutz", "AGB"].map(l => (
            <a key={l} href="#" style={{ fontFamily: MF, fontSize: 11, letterSpacing: 2, color: C.dim, textDecoration: "none", textTransform: "uppercase" }}>{l}</a>
          ))}
        </div>
        <p style={{ fontFamily: MF, fontSize: 11, color: C.dim, letterSpacing: 2 }}>© 2026 POZA-KI</p>
      </footer>
    </div>
  );
}
