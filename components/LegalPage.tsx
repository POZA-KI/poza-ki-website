import Link from 'next/link';
import type { Abschnitt } from '@/content/legal';

export default function LegalPage({
  titel,
  intro,
  abschnitte,
  stand,
}: {
  titel: string;
  intro?: string;
  abschnitte: Abschnitt[];
  stand: string;
}) {
  return (
    <main id="inhalt" className="section">
      <div className="wrap legal">
        <Link href="/" className="tlink mono legal__back">← Zurück zur Startseite</Link>
        <h1 className="h1 legal__h">{titel}</h1>
        {intro && <p className="small legal__intro">{intro}</p>}

        {abschnitte.map((a, i) => (
          <section key={i} className="legal__abschnitt">
            {a.titel && <h2 className="h3">{a.titel}</h2>}
            {a.absaetze.map((p, j) => (
              <p key={j} className="body">{p}</p>
            ))}
            {a.liste && (
              <ul className="legal__liste">
                {a.liste.map((l) => (
                  <li key={l} className="body">{l}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <p className="meta legal__stand">Stand: {stand}</p>
      </div>
    </main>
  );
}
