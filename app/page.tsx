import Link from 'next/link';
import GridRails from '@/components/GridRails';
import SceneMount from '@/components/scene/SceneMount';
import SmoothScroll from '@/components/SmoothScroll';
import CustomCursor from '@/components/CustomCursor';
import Grain from '@/components/Grain';
import SectionHud from '@/components/hud/SectionHud';
import PageNav from '@/components/hud/PageNav';
import PageRail from '@/components/hud/PageRail';
import Pipeline from '@/components/hud/Pipeline';
import TiefenCard from '@/components/hud/TiefenCard';
import MiniDia from '@/components/hud/MiniDia';
import Blueprint from '@/components/blueprint/Blueprint';
import Constellation from '@/components/constellation/Constellation';
import FinaleCore from '@/components/hud/FinaleCore';
import Reveal from '@/components/Reveal';
import Faq from '@/components/Faq';
import MotionToggle from '@/components/MotionToggle';
import MaskHeadline from '@/components/MaskHeadline';
import Magnetic from '@/components/Magnetic';
import TiltCard from '@/components/TiltCard';
import CountUp from '@/components/CountUp';
import DrawRule from '@/components/DrawRule';
import PinnedThesis from '@/components/PinnedThesis';
import CaseScrolly from '@/components/CaseScrolly';
import Gallery from '@/components/gallery/Gallery';
import Founder from '@/components/Founder';
import {
  hero, navigation, medien, these, leistungen, fallstudie,
  vorgehen, offer, founder, faq, kontakt, produkte, claim, EMAIL, STANDORT_LANG,
} from '@/content/site';

const pad = (n: number) => String(n).padStart(2, '0');

export default function Home() {
  // Jahr ist ein belegter Wert, kein erfundener — deshalb echt statt Platzhalter.
  const jahr = new Date().getFullYear();

  return (
    <>
      <SmoothScroll />
      <SceneMount />
      <GridRails />
      <Grain />
      <CustomCursor />
      <PageNav />

      <header className="site-header">
        <div className="wrap site-header__inner">
          <Link href="/" className="brand mono">POZA-KI</Link>
          <nav aria-label="Hauptnavigation" className="site-nav">
            {navigation.map((n) => (
              <a key={n.href} href={n.href} className="site-nav__link mono">{n.label}</a>
            ))}
          </nav>
        </div>
      </header>

      <main id="inhalt">
        <PageRail />

        {/* ============================== 01 HERO ============================== */}
        <section className="hero" aria-labelledby="hero-h">
          <div className="wrap hero__inner">
            <div className="hero__copy schutz">
              <MaskHeadline id="hero-h" zeilen={hero.zeilen} />
              <Reveal sofort delay={0.08}>
                <p className="lead hero__sub">{hero.sub}</p>
              </Reveal>
              <Reveal sofort delay={0.16}>
                <div className="hero__ctas">
                  <Magnetic>
                    <a className="btn btn--primary" href="#kontakt">{hero.ctaPrimaer}</a>
                  </Magnetic>
                  <a className="tlink" href="#vorgehen">{hero.ctaSekundaer}</a>
                </div>
              </Reveal>
            </div>

            <Reveal sofort delay={0.28}>
              <dl className="hero__meta meta" aria-label="Eckdaten">
                {hero.meta.map(([k, v]) => (
                  <div key={k} className="hero__meta-row">
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <div className="hero__scroll meta" aria-hidden="true">
              <span className="hero__scroll-line" />SCROLL
            </div>
          </div>
        </section>

        {/* ========================= 02 MEDIENLEISTE ========================== */}
        <section className="medien" aria-labelledby="medien-h">
          <div className="wrap">
            <h2 id="medien-h" className="label medien__label">{medien.label}</h2>
            <ul className="medien__liste">
              {medien.marken.map((m) => (
                <li key={m} className="medien__marke">{m}</li>
              ))}
            </ul>
            <p className="small medien__fn">{medien.fussnote}</p>
          </div>
        </section>

        {/* ============================= 03 THESE ============================= */}
        <section className="section these" id="position" aria-labelledby="these-h">
          <div className="wrap">
            <SectionHud nr="01" label="Positionierung" />
            <PinnedThesis
              zeile1={these.zeile1}
              zeile2={these.zeile2}
              absaetze={these.absaetze}
            />
          </div>
        </section>

        {/* ========================== 04 LEISTUNGEN =========================== */}
        <section className="section section--anschluss" id="leistungen" aria-labelledby="leistungen-h">
          <div className="wrap schutz">
            <SectionHud nr="02" label="Leistungen" titel={leistungen.h2} id="leistungen-h" />
            <Reveal delay={0.06}><p className="lead sec__intro">{leistungen.intro}</p></Reveal>

            <ul className="cards">
              {leistungen.cards.map((c, i) => (
                <li key={c.titel}>
                  <TiefenCard versatz={i * 0.16}>
                    <TiltCard className="card">
                      <span className="meta card__idx" aria-hidden="true">{pad(i + 1)}</span>
                      <h3 className="h3 card__titel">{c.titel}</h3>
                      <DrawRule className="card__hr" />
                      <p className="body card__text">{c.text}</p>
                      <MiniDia form={(['kette', 'treppe', 'kurve'] as const)[i]} />
                      <ul className="card__punkte">
                        {c.punkte.map((p) => (
                          <li key={p} className="label card__punkt">{p}</li>
                        ))}
                      </ul>
                    </TiltCard>
                  </TiefenCard>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ======================= SYSTEMS GALLERY ========================== */}
        <section className="galerie" id="systeme" aria-labelledby="galerie-h">
          <div className="wrap">
            <SectionHud nr="03" label="Systeme" titel="Gebaute Systeme." id="galerie-h" />
            <div className="schutz galerie__kopf">
              <Reveal delay={0.06}>
                <p className="lead sec__intro">
                  Fünf Module aus laufenden Projekten — abstrahiert dargestellt, ohne Kundendaten.
                </p>
              </Reveal>
            </div>
          </div>
          <Gallery />
        </section>

        {/* ============================= 05 CASE ============================== */}
        <section className="section case" id="case" aria-labelledby="case-h">
          <div className="wrap">
            <SectionHud nr="04" label="Referenz" />
            <div className="case__kopf">
              <Reveal><h2 id="case-h" className="h2 case__h">{fallstudie.h2}</h2></Reveal>
              <Reveal delay={0.08}>
                <dl className="case__daten">
                  {fallstudie.daten.map(([k, v]) => (
                    <div key={k} className="case__zeile">
                      <dt className="label">{k}</dt>
                      <dd className="small">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>

            <Reveal><p className="lead case__ausgang">{fallstudie.ausgangslage}</p></Reveal>

            <CaseScrolly stufen={fallstudie.stufen} />

            <ul className="metriken">
              {fallstudie.metriken.map(([wert, label], i) => (
                <Reveal as="li" key={label} delay={i * 0.06} className="metrik">
                  <CountUp wert={wert} className="metrik__wert mono" />
                  <span className="label metrik__label">{label}</span>
                </Reveal>
              ))}
            </ul>

            <p className="label case__zusatz">{fallstudie.zusatz}</p>
            <p className="small case__anon">— {fallstudie.anonymitaet}</p>
          </div>
        </section>

        {/* ============ STATEMENT: BLUEPRINT ASSEMBLY (WebGL, gepinnt) ======= */}
        <Blueprint satz={claim.satz} unter={claim.unter} />

        {/* ========================= 05 EIGENE PRODUKTE ====================== */}
        <section className="section" id="produkte" aria-labelledby="produkte-h">
          <div className="wrap schutz">
            <SectionHud nr="05" label="Produkte" titel={produkte.h2} id="produkte-h" />
            <Reveal><p className="lead sec__intro">{produkte.intro}</p></Reveal>
          </div>
          <Constellation items={produkte.items} status={produkte.status} />
        </section>

        {/* =========================== 06 VORGEHEN ============================ */}
        <section className="section" id="vorgehen" aria-labelledby="vorgehen-h">
          <div className="wrap schutz">
            <SectionHud nr="06" label="Vorgehen" titel={vorgehen.h2} id="vorgehen-h" />
            <Pipeline schritte={vorgehen.schritte} />
          </div>
        </section>

        {/* ============================ 07 OFFER ============================== */}
        <section className="section offer" id="zusammenarbeit" aria-labelledby="offer-h">
          <div className="wrap">
            <SectionHud nr="08" label="Zusammenarbeit" />
            <div className="offer__grid">
              <div className="offer__links">
                <Reveal><h2 id="offer-h" className="h2">{offer.h2}</h2></Reveal>
                <Reveal delay={0.06}>
                  <p className="offer__kapa">{offer.kapazitaetSatz}</p>
                </Reveal>
                <Reveal delay={0.1}><p className="body">{offer.begruendung}</p></Reveal>

                <Reveal delay={0.18}>
                  <h3 className="h3 offer__qh">{offer.qualifizierungTitel}</h3>
                  <ul className="offer__quali">
                    {offer.qualifizierung.map((q) => (
                      <li key={q} className="offer__quali-item body">{q}</li>
                    ))}
                  </ul>
                  <p className="small offer__aus">{offer.ausschluss}</p>
                </Reveal>
              </div>

              <Reveal delay={0.1}>
                <div className="audit">
                  <span className="label">Einstieg</span>
                  <h3 className="h3 audit__h">{offer.auditTitel}</h3>
                  <p className="body audit__text">{offer.auditText}</p>
                  <dl className="audit__daten">
                    {offer.auditDaten.map(([k, v]) => (
                      <div key={k} className="audit__zeile">
                        <dt className="label">{k}</dt>
                        <dd className="small">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <Magnetic><a className="btn btn--primary audit__cta" href="#kontakt">{hero.ctaPrimaer}</a></Magnetic>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* =========================== 08 FOUNDER ============================= */}
        <section className="section" id="gruender" aria-labelledby="founder-h">
          <div className="wrap schutz">
            <SectionHud nr="07" label="Gründer" />
            <Founder
              name={founder.name}
              rolle={founder.rolle}
              absaetze={founder.absaetze}
              register={founder.register}
            />
          </div>
        </section>

        {/* ========================= 09 FAQ + KONTAKT ========================= */}
        <section className="section" id="faq" aria-labelledby="faq-h">
          <div className="wrap schutz">
            <SectionHud nr="09" label="Häufige Fragen" titel={faq.h2} id="faq-h" />
            <div className="faq__grid">
              <Faq eintraege={faq.eintraege} />
            </div>
          </div>
        </section>

        <section className="section kontakt finale" id="kontakt" aria-labelledby="kontakt-h">
          <div className="wrap">
            <SectionHud nr="08" label="Kontakt" />
            <FinaleCore />
            <div className="kontakt__grid schutz finale__inhalt">
              <div>
                <Reveal><h2 id="kontakt-h" className="h2">{kontakt.h2}</h2></Reveal>
                <Reveal delay={0.06}><p className="body kontakt__text">{kontakt.text}</p></Reveal>
                <Reveal delay={0.1}>
                  <Magnetic>
                    <a className="btn btn--primary kontakt__cta" href={`mailto:${EMAIL}`}>
                      {hero.ctaPrimaer}
                    </a>
                  </Magnetic>
                </Reveal>
                <Reveal delay={0.16}>
                  <span className="system-ready">system.ready</span>
                </Reveal>
              </div>
              <Reveal delay={0.08}>
                <dl className="kontakt__block">
                  {kontakt.block.map(([k, v]) => (
                    <div key={k} className="kontakt__zeile">
                      <dt className="label">{k}</dt>
                      <dd className="small">
                        {k === 'E-Mail' ? (
                          <a className="kontakt__mail mono" href={`mailto:${v}`}>{v}</a>
                        ) : (v)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap">
          <div className="footer__top">
            <span className="brand mono">POZA-KI</span>
            <div className="footer__links">
              <Link href="/impressum" className="footer__link mono">Impressum</Link>
              <Link href="/datenschutz" className="footer__link mono">Datenschutz</Link>
              <MotionToggle />
            </div>
          </div>
          <div className="footer__bottom meta">
            <span>© {jahr} POZA-KI · {STANDORT_LANG}</span>
            <span>REV 2026.1</span>
          </div>
        </div>
      </footer>
    </>
  );
}
