# Handoff: BewerbungsKI — KI-gestütztes Bewerbungsmanagement

## Overview
**BewerbungsKI** ("applyheld") ist eine deutschsprachige Web-App, mit der Jobsuchende
KI-Anschreiben erstellen, per Chat verfeinern und ihren gesamten Bewerbungsprozess
in einem Tracker verwalten. Dieses Paket enthält das vollständige UI-Design als
**interaktiven HTML-Prototyp** über 7 Seiten hinweg.

## About the Design Files
Die Dateien in diesem Bundle sind **Design-Referenzen, die in HTML + React (über Babel im Browser)
erstellt wurden** — also ein Prototyp, der Aussehen und Verhalten zeigt, **kein Produktionscode
zum direkten Kopieren**.

Die Aufgabe ist, **diese Designs im Zielcodebase neu zu implementieren** und dabei dessen
etablierte Patterns/Bibliotheken zu nutzen. Empfehlung, falls noch kein Codebase existiert:
**Next.js (App Router) + React + TypeScript + Tailwind CSS** (oder CSS Modules) — das Design ist
komponenten- und token-basiert und lässt sich 1:1 darauf abbilden. Der bestehende Prototyp nutzt
bewusst Vanilla-CSS mit CSS-Variablen, damit die Tokens leicht übertragbar sind.

## Fidelity
**High-fidelity (hifi).** Finale Farben, Typografie, Abstände, Radien, Schatten und Interaktionen
sind festgelegt. Bitte die UI pixelgenau mit den Bibliotheken/Patterns des Zielcodebase nachbauen.
Alle exakten Werte stehen unten unter **Design Tokens** und in `app/styles.css`.

---

## Tech-Stack des Prototyps (nur zur Orientierung)
- React 18 (UMD) + Babel Standalone, geladen im Browser
- Ein globaler Store via React Context (`app/store.jsx`) — Routing per `route`-State + URL-Hash
- Reines CSS mit Custom Properties (`app/styles.css`) — **die Quelle der Wahrheit für alle Tokens**
- Schrift: **Geist** (primär) + **Geist Mono**, Fallback **Inter** (Google Fonts)
- Icons: handgezeichnetes lucide-ähnliches Set (stroke 1.75) in `app/components.jsx` (`PATHS`-Objekt)

---

## Screens / Views

Routing (Hash-basiert im Prototyp): `#landing`, `#login`, `#register`, `#dashboard`,
`#neu`, `#detail/<id>`, `#lebenslauf`, `#profil`, `#pricing`.

### 1. Landing Page (`#landing` → `app/LandingPage.jsx`)
- **Zweck:** Marketing-Einstieg, Conversion zu „Kostenlos starten".
- **Layout:** Volle Breite, zentrierter Content-Container `max-width: 1160px`, Padding `0 24px`.
- **Sektionen (von oben):**
  1. **Sticky Nav** (Höhe 64px, `backdrop-filter: blur(10px)`, `background: rgba(248,250,252,.82)`,
     untere Border `1px solid var(--border)`): Logo links; Mitte Links „Funktionen / So funktioniert's / Preise"
     (Anker-Scroll); rechts „Anmelden" (ghost) + „Kostenlos starten" (primary, sm).
  2. **Hero:** 2-Spalten-Grid `1fr 1.05fr`, `gap: 56px`, Padding `72px 24px 80px`. Hintergrund:
     zwei radiale Verläufe (cyan oben-rechts, navy oben-links, sehr subtil). Links: Chip-Badge
     („KI für den deutschen Arbeitsmarkt"), H1 Display (siehe Typo) mit handgezeichnetem cyan
     Unterstrich-SVG unter „Stunden", Subline (18.5px, `--ink-500`, max-width 480), zwei CTAs
     (primary lg „Kostenlos starten" + secondary lg „Demo ansehen"), zwei Trust-Punkte mit grünen
     Häkchen. Rechts: **HeroPreview** — ein Mini-Produkt-Mockup (Browser-Chrome mit 3 Ampelpunkten,
     2-Spalten-Inhalt: links Stelle/SAP, rechts streamendes KI-Anschreiben mit Skeleton-Zeilen +
     `pulse-dot`). Darunter Trust-Strip: „Erfolgreiche Bewerbungen bei …" + 6 Firmen-Wortmarken (opacity .7).
  3. **Features (`#features`):** zentrierter Header (eyebrow + H1 38px + Subline), darunter 3-Spalten-Grid
     `gap: 22px`. Jede Karte: 48px Icon-Tile mit eigener Tint-Farbe, H3 19px, Beschreibung 15px/1.6.
     Inhalte: „KI-Anschreiben" (navy), „AI-Chat Verfeinerung" (cyan), „Bewerbungs-Tracker" (violett #6d28d9).
  4. **Workflow (`#workflow`):** dunkle Sektion `background: var(--navy-900)`, weißer Text, radialer
     cyan Glow. 3-Spalten-Grid mit Karten (`rgba(255,255,255,.05)`, Border `rgba(255,255,255,.1)`,
     radius 16). Große Schrittnummer (46px, `--accent-400`) + Icon-Tile; H3 19px; Text `rgba(255,255,255,.6)`.
     Zwischen Karten ein `arrowRight`-Icon (desktop). Schritte: 1. Lebenslauf hochladen, 2. Stelle einfügen,
     3. Anschreiben fertig.
  5. **Pricing (`#pricing`):** zentrierter Header + 2-Spalten-Grid `max-width: 940px`. Zwei Pläne:
     **Free** (0 €, secondary CTA) und **Pro** (12 €/Monat, `border: 2px solid var(--navy-700)`,
     Badge „Beliebt" oben zentriert, primary CTA). Feature-Liste mit Häkchen.
  6. **Final CTA-Band:** navy Gradient-Box (`linear-gradient(135deg, var(--navy-700), var(--navy-900))`,
     radius 22, Padding 56/40), zentriert, H1 36px weiß + Subline + accent-Button.
  7. **Footer:** 4-Spalten-Grid (`1.4fr 1fr 1fr 1fr`): Logo + Beschreibung + DSGVO-Zeile; 3 Linkspalten
     (Produkt / Ressourcen / Unternehmen). Untere Zeile: Copyright + Datenschutz/AGB/Impressum.

### 2. Login / Register (`#login`, `#register` → `app/AuthPages.jsx`)
- **Zweck:** Anmelden bzw. Konto erstellen.
- **Layout:** Split `grid-template-columns: 1fr 1fr`, `min-height: 100vh`.
  - **Links (AuthAside, nur Desktop):** navy `--navy-900`, weißer Text, radiale cyan-Glows. Oben Logo (light),
    Mitte H2 32px „Schluss mit dem leeren Blatt." + Subline + 3 Feature-Zeilen (Icon-Tile + Titel + Sub),
    unten DSGVO-Zeile. Auf Mobile ausgeblendet → einspaltiges Formular mit Logo oben.
  - **Rechts:** zentriertes Formular `max-width: 392px`. Titel + Subline; **SocialButtons** (Google-Button
    secondary + „oder"-Divider); Felder mit Icon-Prefix; primary lg Submit-Button (zeigt Typing-Dots beim Laden).
- **Register-Felder:** Name (user-icon), E-Mail (mail), Passwort (lock). CTA „Konto erstellen". Darunter
  AGB/Datenschutz-Hinweis + „Schon ein Konto? Anmelden".
- **Login-Felder:** E-Mail, Passwort (mit „Passwort vergessen?"-Link rechts oben am Label). CTA „Anmelden".
  Darunter „Noch kein Konto? Kostenlos registrieren".
- **Verhalten:** Submit simuliert ~1s Laden (Typing-Dots), setzt `auth=true`, Toast, navigiert zu `#dashboard`.

### 3. Dashboard (`#dashboard` → `app/Dashboard.jsx`)
- **Zweck:** Übersicht aller Bewerbungen + Stats.
- **Shell:** `AppShell` (Sidebar + Topbar, siehe unten). Topbar rechts: „Neue Bewerbung"-Button (primary sm) + Bell.
- **Inhalt (`.page`, max-width 1240):**
  - **Begrüßung:** H1 „Guten Morgen, Max 👋" + Subzeile mit aktiven Bewerbungen/Gesprächen.
  - **Stats-Grid:** 4 Karten (`repeat(4,1fr)`, gap 16). Jede Karte: 36px Icon-Tile (eigene Tint),
    Wert 30px/680, Label 13.5px, optionaler Trend-Text farbig. Werte: Gesamt / Aktiv im Prozess /
    Gespräche / Angenommen.
  - **Toolbar:** links Filter-Chips (Alle / Aktiv / Entwürfe / Angebote mit Count; aktiver Chip = navy
    gefüllt weiß); rechts Such-Input mit search-Icon (240px).
  - **Tabelle (Desktop):** `.tbl-wrap` Card. Spalten: **Firma & Stelle** (Firmen-Logo-Tile + Name/Rolle),
    **Standort** (mapPin), **Beworben** (Relativdatum), **Status** (Badge), **Aktionen** (rechts, erscheinen
    bei row-hover: Öffnen/PDF/Löschen Icon-Buttons). Zeilen klickbar → `#detail/<id>`. Hover: `--navy-50`.
  - **Mobile (`<=880px`):** statt Tabelle Karten-Liste (Logo + Name/Rolle + Badge + Relativdatum).
  - **FAB:** unten rechts, navy Pille „+ Neue Bewerbung".
- **Empty State:** wenn Filter/Suche leer → Card mit search-Icon, „Keine Bewerbungen gefunden", Reset-Button.

### 4. Neue Bewerbung (`#neu` → `app/NeueBewerbung.jsx`)
- **Zweck:** Stelle erfassen + KI-Anschreiben generieren.
- **Layout:** 2-Spalten `minmax(0,1fr) minmax(0,1.15fr)`, gap 22, `align-items: start`, max-width 1320.
  Breadcrumb darüber. Topbar rechts: „Abbrechen" (ghost).
  - **LINKS — Stelleninformationen (Card):** Header „Stelleninformationen" + „Beispiel"-Ghost-Button
    (füllt Demodaten). Felder: Firma + Stelle (nebeneinander), Stellen-URL mit „Auslesen"-Button
    (simuliert ~1.4s Extraktion, füllt Felder), großes Textarea „Stellenanzeige" (min-height 240,
    Zeichenzähler), primary lg Button **„KI-Anschreiben generieren"** (disabled bis Firma + ≥20 Zeichen Anzeige).
  - **RECHTS — Anschreiben-Editor (Card, min-height 560):** Header mit doc-Icon + „Anschreiben" + Status-Badge
    „Generiert" (wenn fertig); rechts „KI schreibt…" mit pulse-dot während Laden/Streaming. Body:
    **3 Zustände** (siehe States). Footer: Wörter-/Zeichenzähler + „PDF" (secondary, disabled bis fertig) +
    „Speichern" (primary, disabled bis fertig → legt Bewerbung als Entwurf an, navigiert zu Detail).

### 5. Bewerbung Detail + AI-Chat (`#detail/<id>` → `app/BewerbungDetail.jsx`)
- **Zweck:** Anschreiben bearbeiten + per KI-Chat verfeinern + Status/Notizen pflegen.
- **Layout:** 3-Spalten `270px minmax(0,1fr) 320px`, gap 18, `align-items: start`, max-width 1500.
  Breadcrumb (Dashboard › Firma). Topbar rechts: Status-Badge + „PDF".
  - **LINKS (270px):** Card mit Firmen-Logo + Name/Rolle, Standort, Bewerbungsdatum, Divider,
    **Status-Dropdown** (Custom-Dropdown, listet alle 7 Status mit Badges, Häkchen beim aktiven; Auswahl
    aktualisiert Store + Toast). Zweite Card: **Notizen**-Textarea (onBlur speichert).
  - **MITTE (flexibel):** Editor-Card (min-height 600). Toolbar: bold/italic/list Icon-Buttons + „Kopieren".
    Großes editierbares Textarea (Anschreiben, 15px/1.75, padding 28/36). Footer: „Automatisch gespeichert" +
    „PDF herunterladen".
  - **RECHTS (320px, sticky top 76):** **AI-Chat** (Höhe 600). Header: KI-Avatar (navy Gradient + sparkles)
    + „KI-Assistent" + „Online"-Dot. Verlauf: **Bubbles** — User rechts navy (`14px 14px 4px 14px`),
    KI links grau mit Avatar (`4px 14px 14px 14px`). Beim Senden: User-Bubble + KI-Typing-Bubble, nach
    ~1.4s ersetzt durch Antwort. Footer: **Beispiel-Chips** (Kürzer / Formeller / Ersten Absatz überarbeiten /
    Stärker auf die Stelle eingehen) + Textarea + Send-Icon-Button (Enter sendet, Shift+Enter = Zeilenumbruch).
    „Kürzer" kürzt das Anschreiben im Editor sichtbar.
- **Mobile/Tablet (`<=1180px`):** Spalten stapeln, Chat wird statisch + mitscrollbar.

### 6. Lebenslauf (`#lebenslauf` → `app/LebenslaufProfil.jsx` → `Lebenslauf`)
- **Zweck:** Lebenslauf hochladen/verwalten.
- **Layout:** `.page` max-width 820. H1 + Subline.
  - **Leer-Zustand / Upload:** Card mit Drag-&-Drop-Zone (gestrichelte Border, wird cyan bei Drag),
    upload-Icon-Tile, „Ziehe deinen Lebenslauf hierher / klicke zum Hochladen", „PDF oder DOCX · max. 5 MB".
    Klick/Drop → ~1.5s „Wird hochgeladen & analysiert…" (Typing-Dots) → gefüllter Zustand + Toast.
  - **Gefüllt:** Card mit PDF-Datei-Glyph (rot), Dateiname, Datum/Größe/Zeichenanzahl, „Ersetzen" +
    Lösch-Icon. Grüner Erfolgshinweis „Text erfolgreich extrahiert". Darunter **Accordion** „Extrahierter Text"
    (klappt Monospace-Vorschau auf, max-height 320, scrollbar).
  - Unten: navy Info-Box mit shield-Icon (DSGVO/EU-Server).

### 7. Profil (`#profil` → `app/LebenslaufProfil.jsx` → `Profil`)
- **Zweck:** Absenderdaten für die PDF-Kopfzeile pflegen.
- **Layout:** `.page` max-width 720. H1 + Subline.
  - Eine **Card** (padding 26): Avatar (Initialen) + Name/E-Mail + „Foto ändern". Divider. Felder:
    Name; E-Mail + Telefon (Zeile, stapeln auf Mobile); Straße & Hausnummer; PLZ (140px fix) + Ort (Zeile).
    Jedes Feld mit Icon-Prefix. **Info-Box** (navy): „Diese Daten werden im PDF-Anschreiben als
    Absenderadresse … verwendet". Divider. Footer: Dirty-Status-Text + „Speichern"-Button
    (disabled wenn unverändert; ~0.8s Laden → Toast).

---

## Shared Layout — AppShell (`app/store.jsx`)
- **Sidebar (248px, sticky, volle Höhe, weiß, rechte Border):**
  - Brand/Logo oben (klickbar → Dashboard).
  - Nav-Gruppe „Haupt": Dashboard (mit Count-Badge = Anzahl), Neue Bewerbung, Lebenslauf.
  - Label „Konto" + Nav-Gruppe: Profil, Einstellungen.
  - **Aktiver Nav-Item:** `background: var(--navy-50)`, Text+Icon navy, fett.
  - Unten: **Free-Plan-Karte** (navy-50, Fortschrittsbalken 60%, „Auf Pro upgraden"-Button) +
    **User-Chip** (Avatar + Name/E-Mail + settings-Icon, klickbar → Profil).
- **Topbar (60px, sticky, blur):** links Seitentitel (Desktop) / Logo (Mobile); rechts `topRight`-Slot + Bell.
- **Bottom-Nav (nur `<=880px`):** fixiert unten, 64px, blur. 4 Items: Dashboard / Neu / Lebenslauf / Profil.

---

## Interactions & Behavior
- **Navigation:** zentral über `navigate(name, params)` im Store; schreibt zusätzlich den URL-Hash
  (`#detail/a1`). Scrollt nach oben.
- **KI-Generierung (Neue Bewerbung):** Klick → `phase: "loading"` (1.5s, Skeleton-Zeilen + „analysiert…") →
  `"streaming"` (Tokenweises Einblenden des Anschreibens alle 28ms, blinkender Caret) → `"done"`.
- **KI-Chat (Detail):** Nachricht → User-Bubble + Typing-Bubble → nach 1.4s Antwort (regelbasiert nach
  Schlüsselwörtern: kürzer/formell/absatz/stelle). „Kürzer" verändert den Editortext real.
- **Status-Wechsel:** Dropdown → Store-Update + Toast.
- **Toasts:** unten zentriert, navy, slide/scale-in (`toastIn` .32s), auto-dismiss nach 3.2s.
  Typen: success (grün), error (rot), info (cyan).
- **Such-/Filter-Logik (Dashboard):** Volltext über Firma/Rolle/Standort + Status-Filter; leere Treffer → Empty State.
- **Entrance-Animationen:** **nur transform** (`fadeIn`/`fadeOnly`, kein opacity-Fade), damit Inhalte auch
  bei pausierten Animationen sichtbar bleiben — bitte beibehalten.
- **Hover:** Buttons heben sich 1px + Schatten; Tabellenzeilen tönen navy-50; Row-Actions fade-in; Chips
  bekommen cyan Border.

## State Management
Globaler Context-Store (`app/store.jsx`), Felder:
- `route: { name, params }` + `navigate()`
- `apps: Application[]` + `addApp / updateApp / removeApp / getApp`
- `profile`, `setProfile`
- `resume`, `setResume`
- `auth`, `setAuth`

**Application-Shape** (siehe `app/data.js` → `window.APPLICATIONS`):
`{ id, company, role, location, date(YYYY-MM-DD), status, letter?, words?, notes }`.
Lokale UI-States pro Seite: Such-/Filter-Query, Generierungs-`phase`, Chat-`messages`, Editor-Text,
Upload-`phase`, Form-Dirty etc.

---

## Design Tokens
**Alle Tokens sind in `app/styles.css` unter `:root` definiert — das ist die Quelle der Wahrheit.**
Auszug:

### Farben — Brand
- Navy: `--navy-900 #0f2440`, `--navy-800 #15314f`, **`--navy-700 #1e3a5f` (Primary)**, `--navy-600 #2a4d77`,
  `--navy-500 #3a6092`, `--navy-50 #eef3f9`
- Accent (Cyan): `--accent-600 #0891b2`, **`--accent-500 #06b6d4` (Accent)**, `--accent-400 #22d3ee`,
  `--accent-50 #ecfeff`

### Farben — Neutral (Slate)
`--bg #f8fafc`, `--bg-soft #f1f5f9`, `--surface #ffffff`, `--border #e2e8f0`, `--border-strong #cbd5e1`,
`--ink-900 #0f172a`, `--ink-700 #334155`, `--ink-500 #64748b`, `--ink-400 #94a3b8`, `--ink-300 #cbd5e1`

### Status-Farben (bg / fg / dot)
- Entwurf (grau): `#f1f5f9 / #475569 / #94a3b8`
- Beworben (blau): `#eff6ff / #1d4ed8 / #3b82f6`
- Telefoninterview (gelb): `#fefce8 / #a16207 / #eab308`
- Persönliches Gespräch (orange): `#fff7ed / #c2410c / #f97316`
- Angebot (lila): `#f5f3ff / #6d28d9 / #8b5cf6`
- Angenommen (grün): `#ecfdf5 / #047857 / #10b981`
- Abgelehnt (rot): `#fef2f2 / #b91c1c / #ef4444`

### Radius
`--r-sm 6px`, `--r 8px`, `--r-md 10px`, `--r-lg 14px`, `--r-xl 20px`, `--r-full 999px`

### Schatten
- `--sh-xs 0 1px 2px rgba(15,23,42,.05)`
- `--sh-sm 0 1px 3px rgba(15,23,42,.07), 0 1px 2px rgba(15,23,42,.04)`
- `--sh-md 0 4px 12px rgba(15,23,42,.08), 0 2px 4px rgba(15,23,42,.04)`
- `--sh-lg 0 12px 32px rgba(15,23,42,.12), 0 4px 8px rgba(15,23,42,.05)`
- `--sh-glow 0 0 0 4px rgba(6,182,212,.14)` (Input-Focus)
- `--sh-navy 0 8px 24px rgba(30,58,95,.22)`

### Typografie
- Familie: `--font: "Geist","Inter",-apple-system,…`; Mono: `--mono: "Geist Mono",…`
- Skala (siehe `.h-display/.h1/.h2/.h3`): Display `clamp(38px,5.2vw,60px)`/700/`-.03em`;
  H1 30px/650/`-.02em`; H2 22px/600; H3 17px/600. Body 15px/1.5. Eyebrow 12.5px/600/uppercase/`.08em`, cyan.
- Auf Mobile feste Größen statt vw (Display 34px), siehe Media-Block.

### Spacing / Sonstiges
- Sidebar-Breite `--sidebar-w: 248px` (0 auf Mobile).
- Buttons: Höhe 42px (sm 34 / lg 50), radius `--r`. Inputs: Höhe 42px, Border `--border-strong`,
  Focus = `--accent-500` Border + `--sh-glow`.
- Container-Breiten: Landing 1160, Dashboard 1240, Neue Bewerbung 1320, Detail 1500, Lebenslauf 820, Profil 720.

### Responsive Breakpoints
- **≤1180px:** Detail-3-Spalten stapeln, Chat statisch.
- **≤1024px:** Neue Bewerbung einspaltig, Features 2-spaltig.
- **≤880px:** Sidebar aus → Bottom-Nav; alle Landing-Grids + Auth-Split einspaltig; Dashboard Karten statt
  Tabelle; Formularzeilen stapeln; FAB über Bottom-Nav; feste Mobile-Typo.
- **≤560px:** engere Stats/Abstände.

---

## Assets
- **Icons:** Inline-SVG, lucide-ähnlich (stroke 1.75), definiert im `PATHS`-Objekt in `app/components.jsx`.
  Im Zielcodebase am besten durch **lucide-react** (oder bestehendes Icon-Set) ersetzen — Namen sind
  weitgehend deckungsgleich (dashboard→layout-dashboard, sparkles, chat→message-circle, chart→line-chart, …).
  Google-Icon ist mehrfarbig.
- **Logo:** Platzhalter-Wortmarke „Bewerbungs**KI**" + Lettermark-„B" mit cyan AI-Sparkle (`Logo`/`LogoMark`
  in `app/components.jsx`). **Vom Nutzer durch echtes Logo zu ersetzen.**
- **Firmen-Logos:** farbige Initial-Tiles (keine echten Marken-Logos), Farbpalette `window.LOGO_COLORS`.
- **Fonts:** Geist + Geist Mono + Inter via Google Fonts (`<link>` in `BewerbungsKI.html`).
- **Bilder:** keine; alles CSS/SVG.

## Files
- `BewerbungsKI.html` — Einstieg, lädt Fonts + alle Skripte, Reihenfolge beachten.
- `app/styles.css` — **alle Tokens + Komponentenstile + Responsive** (Quelle der Wahrheit).
- `app/data.js` — Beispieldaten (Bewerbungen, Profil, Lebenslauf, Stellenanzeige), Status-Definitionen,
  Datums-/Initial-Helfer.
- `app/components.jsx` — Icons (`PATHS`), `Icon`, `Logo`/`LogoMark`, `StatusBadge`, Toast-System,
  `CompanyLogo`.
- `app/store.jsx` — Store/Context, `navigate`, `AppShell` (Sidebar/Topbar/Bottom-Nav).
- `app/LandingPage.jsx` — Landing + `Pricing`.
- `app/AuthPages.jsx` — Login + Register.
- `app/Dashboard.jsx` — Dashboard (Stats, Tabelle, Filter, Empty State, FAB).
- `app/NeueBewerbung.jsx` — Neue Bewerbung + KI-Generierungs-States.
- `app/BewerbungDetail.jsx` — Detail + Editor + AI-Chat + Status-Dropdown.
- `app/LebenslaufProfil.jsx` — Lebenslauf-Upload + Profil-Formular.
- `app/app.jsx` — Router + Tweaks-Panel (Akzent-/Primärfarbe, Schrift, Radius — optional, nicht produktionsrelevant).
- `app/tweaks-panel.jsx` — Helfer für das In-Design-Tweak-Panel (kann beim Nachbau entfallen).

### Implementierungs-Reihenfolge (Empfehlung)
1. Tokens aus `styles.css` als CSS-Variablen / Tailwind-Theme übernehmen.
2. Primitive bauen: Button, Input/Field, Card, Badge, Icon, Toast, Avatar.
3. AppShell (Sidebar + Topbar + Bottom-Nav) + Routing.
4. Seiten in dieser Reihenfolge: Dashboard → Neue Bewerbung → Detail → Lebenslauf → Profil → Auth → Landing.
5. KI-Flows zunächst simulieren (wie im Prototyp), später an echtes Modell anbinden.
