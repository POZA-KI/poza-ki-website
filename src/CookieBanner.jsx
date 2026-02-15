import { useState, useEffect } from "react";

const BF = "'Syne', sans-serif";
const MF = "'Space Grotesk', monospace";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = getCookie("poza_cookie_consent");
    if (!consent) setShow(true);
  }, []);

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Lax`;
  }

  function accept() {
    setCookie("poza_cookie_consent", "all", 365);
    setShow(false);
    // Meta Pixel would be initialized here
  }

  function decline() {
    setCookie("poza_cookie_consent", "essential", 365);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 99999,
      background: "rgba(5,5,7,0.97)", backdropFilter: "blur(20px)",
      borderTop: "1px solid rgba(200,164,78,0.2)",
      padding: "20px 24px", display: "flex", flexWrap: "wrap",
      alignItems: "center", justifyContent: "space-between", gap: 16,
    }}>
      <div style={{ flex: "1 1 400px", minWidth: 280 }}>
        <p style={{ fontFamily: MF, fontSize: 13, color: "rgba(255,255,255,0.8)", margin: 0, lineHeight: 1.6 }}>
          Wir verwenden Cookies, um unsere Website zu verbessern und Werbung zu optimieren. 
          Technisch notwendige Cookies sind für den Betrieb erforderlich. 
          Marketing-Cookies werden nur mit Ihrer Zustimmung gesetzt.{" "}
          <a href="/datenschutz" style={{ color: "#c8a44e", textDecoration: "underline" }}>Mehr erfahren</a>
        </p>
      </div>
      <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
        <button onClick={decline} style={{
          fontFamily: BF, fontSize: 12, fontWeight: 600, letterSpacing: 1,
          padding: "10px 24px", borderRadius: 60, cursor: "pointer",
          background: "transparent", color: "rgba(255,255,255,0.5)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}>
          Nur notwendige
        </button>
        <button onClick={accept} style={{
          fontFamily: BF, fontSize: 12, fontWeight: 700, letterSpacing: 1,
          padding: "10px 24px", borderRadius: 60, cursor: "pointer",
          background: "#c8a44e", color: "#050507", border: "none",
        }}>
          Alle akzeptieren
        </button>
      </div>
    </div>
  );
}
