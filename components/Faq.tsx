'use client';

/**
 * FAQ als Button/Panel statt <details> — nur so ist die Höhenanimation
 * kontrollierbar und bei reduzierter Bewegung sauber abschaltbar.
 */

import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useMotionPref } from './useMotionPref';

type Eintrag = { frage: string; antwort: string };

export default function Faq({ eintraege }: { eintraege: Eintrag[] }) {
  const [offen, setOffen] = useState<number | null>(0);
  const reduziert = useMotionPref();

  return (
    <div className="faq">
      {eintraege.map((e, i) => {
        const istOffen = offen === i;
        const id = `faq-panel-${i}`;
        const btnId = `faq-btn-${i}`;
        return (
          <div key={e.frage} className="faq__item">
            <h3 className="faq__h">
              <button
                id={btnId}
                className="faq__trigger"
                aria-expanded={istOffen}
                aria-controls={id}
                onClick={() => setOffen(istOffen ? null : i)}
              >
                <span className="faq__idx meta" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="faq__frage">{e.frage}</span>
                <span className={`faq__plus ${istOffen ? 'is-open' : ''}`} aria-hidden="true">
                  <i />
                  <i />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {istOffen && (
                <motion.div
                  id={id}
                  role="region"
                  aria-labelledby={btnId}
                  initial={reduziert ? { opacity: 1 } : { height: 0, opacity: 0 }}
                  animate={reduziert ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                  exit={reduziert ? { opacity: 1 } : { height: 0, opacity: 0 }}
                  transition={reduziert ? { duration: 0 } : { duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <p className="faq__antwort body">{e.antwort}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
