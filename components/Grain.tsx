/**
 * Filmkorn als SVG-Turbulenz. Serverseitig gerendert, kein JS, kein Bild —
 * nimmt dem Dunkel die digitale Härte.
 */
export default function Grain() {
  return (
    <div className="grain" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <filter id="korn">
          <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#korn)" />
      </svg>
    </div>
  );
}
