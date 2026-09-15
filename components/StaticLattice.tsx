/**
 * Standbild des Netzes für `prefers-reduced-motion`. Deterministisch erzeugt,
 * damit serverseitig und im Client identisches Markup entsteht. Zeigt die
 * Netz-Formation (F1), also den geordneten Zustand.
 */
function rnd(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function StaticLattice() {
  const r = rnd(20260914);
  const N = 34;
  const punkte: [number, number][] = [];
  const spalten = 7;
  for (let i = 0; i < N; i++) {
    const c = i % spalten;
    const row = Math.floor(i / spalten);
    const versatz = row % 2 === 1 ? 0.5 / spalten : 0;
    punkte.push([
      0.06 + ((c + 0.5) / spalten) * 0.88 + versatz + (r() - 0.5) * 0.05,
      0.1 + ((row + 0.5) / 5) * 0.8 + (r() - 0.5) * 0.05,
    ]);
  }
  const kanten: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const d = Math.hypot(punkte[i][0] - punkte[j][0], punkte[i][1] - punkte[j][1]);
      if (d < 0.19) kanten.push([i, j]);
    }
  }

  return (
    <svg className="lattice lattice--static" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <g stroke="var(--net-edge)" strokeWidth="0.08" vectorEffect="non-scaling-stroke">
        {kanten.map(([i, j], k) => (
          <line
            key={k}
            x1={punkte[i][0] * 100}
            y1={punkte[i][1] * 100}
            x2={punkte[j][0] * 100}
            y2={punkte[j][1] * 100}
          />
        ))}
      </g>
      <g fill="var(--net-node)">
        {punkte.map(([x, y], i) => (
          <circle key={i} cx={x * 100} cy={y * 100} r="0.28" />
        ))}
      </g>
    </svg>
  );
}
