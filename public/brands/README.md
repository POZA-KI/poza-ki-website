# Wortmarken der eigenen Produkte

TODO: Hier gehören die echten SVG-Logos von FREI, CABION und BelegFrei hinein.

Bis dahin rendert die Seite die Wortmarken **typografisch** (Inter Tight, Versalien
mit weitem Tracking bei FREI und CABION, gemischt bei BelegFrei). Das ist Absicht:
Ein typografischer Platzhalter sieht bewusst wie eine Wortmarke aus, während ein
generisches Logo-Icon wie ein fehlendes Asset wirkt.

Zum Austauschen: SVGs hier ablegen und in `components/hud/Produkte.tsx`
die `<span className="prod__wortmarke">` durch ein `<Image>` ersetzen.
Dateinamen erwartet: frei.svg · cabion.svg · belegfrei.svg
