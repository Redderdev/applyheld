/* ============================================================
   BewerbungsKI — Sample data (German job market)
   ============================================================ */
window.STATUS = {
  entwurf:     { key: "entwurf",     label: "Entwurf",                cls: "entwurf" },
  beworben:    { key: "beworben",    label: "Beworben",               cls: "beworben" },
  telefon:     { key: "telefon",     label: "Telefoninterview",       cls: "telefon" },
  persoenlich: { key: "persoenlich", label: "Persönliches Gespräch",  cls: "persoenlich" },
  angebot:     { key: "angebot",     label: "Angebot",                cls: "angebot" },
  angenommen:  { key: "angenommen",  label: "Angenommen",             cls: "angenommen" },
  abgelehnt:   { key: "abgelehnt",   label: "Abgelehnt",              cls: "abgelehnt" },
};
window.STATUS_ORDER = ["entwurf","beworben","telefon","persoenlich","angebot","angenommen","abgelehnt"];

// logo background colors per company
window.LOGO_COLORS = ["#2a4d77","#0891b2","#7c3aed","#db2777","#ea580c","#0d9488","#4f46e5","#b45309","#0369a1","#be123c"];

const LETTER_SAP = `Sehr geehrte Damen und Herren,

mit großem Interesse habe ich Ihre Ausschreibung für die Position als Senior Frontend Developer bei der SAP SE gelesen. Als Entwickler mit über sechs Jahren Erfahrung in der Konzeption skalierbarer Web-Anwendungen sehe ich in Ihrem Team die ideale Gelegenheit, meine Expertise in moderne Enterprise-Software einzubringen.

In meiner aktuellen Position verantworte ich die Frontend-Architektur einer SaaS-Plattform mit über 40.000 aktiven Nutzern. Dabei konnte ich die Ladezeiten um 45 % reduzieren und ein komponentenbasiertes Design-System etablieren, das die Entwicklungsgeschwindigkeit des gesamten Teams spürbar erhöht hat. Ihre Anforderungen an TypeScript, React und Performance-Optimierung decken sich exakt mit meinem Tätigkeitsschwerpunkt.

Besonders reizt mich an SAP der Anspruch, Software für Millionen von Geschäftsanwendern weltweit zu gestalten. Die Verbindung aus technischer Tiefe und unternehmerischer Wirkung entspricht genau dem Umfeld, in dem ich meine Stärken am besten entfalten kann.

Über die Gelegenheit zu einem persönlichen Gespräch würde ich mich sehr freuen.

Mit freundlichen Grüßen
Max Mustermann`;

window.SAMPLE_LETTER = LETTER_SAP;

window.APPLICATIONS = [
  { id:"a1", company:"SAP SE", role:"Senior Frontend Developer", location:"Walldorf", date:"2026-06-02", status:"beworben", letter:LETTER_SAP, words:198,
    notes:"Über LinkedIn-Kontakt von Julia eingereicht. Tech-Stack: React, TypeScript, Fiori." },
  { id:"a2", company:"Zalando SE", role:"Product Designer", location:"Berlin", date:"2026-05-28", status:"telefon",
    notes:"Recruiter-Call am 11.06 um 14:00. Portfolio-Review vorbereiten." },
  { id:"a3", company:"Siemens AG", role:"DevOps Engineer", location:"München", date:"2026-05-24", status:"persoenlich",
    notes:"Onsite-Termin 16.06. Kubernetes & Azure-Themen wiederholen." },
  { id:"a4", company:"N26", role:"Mobile Developer (iOS)", location:"Berlin", date:"2026-05-19", status:"angebot",
    notes:"Angebot erhalten: 78k + Equity. Frist bis 13.06." },
  { id:"a5", company:"Delivery Hero", role:"Senior Data Analyst", location:"Berlin", date:"2026-04-30", status:"angenommen",
    notes:"Vertrag unterschrieben! Start 01.08." },
  { id:"a6", company:"BMW Group", role:"UX Researcher", location:"München", date:"2026-05-10", status:"abgelehnt",
    notes:"Absage nach 2. Runde. Feedback: zu wenig Automotive-Erfahrung." },
  { id:"a7", company:"Trade Republic", role:"Backend Engineer (Go)", location:"Berlin", date:"2026-06-05", status:"entwurf",
    notes:"" },
  { id:"a8", company:"Celonis", role:"Solutions Engineer", location:"München", date:"2026-06-01", status:"beworben",
    notes:"Über Jobportal beworben. Process-Mining-Demo ansehen." },
  { id:"a9", company:"ABOUT YOU", role:"Frontend Developer", location:"Hamburg", date:"2026-05-26", status:"telefon",
    notes:"Screening-Call mit Recruiterin Lena war positiv." },
  { id:"a10", company:"Personio", role:"Customer Success Manager", location:"München", date:"2026-06-04", status:"entwurf",
    notes:"" },
];

window.SAMPLE_PROFILE = {
  name: "Max Mustermann",
  email: "max.mustermann@email.de",
  phone: "+49 151 23456789",
  street: "Musterstraße 12",
  zip: "10115",
  city: "Berlin",
};

window.SAMPLE_RESUME = {
  filename: "Lebenslauf_Max_Mustermann_2026.pdf",
  uploaded: "2026-05-30",
  size: "248 KB",
  chars: 4127,
  text: `MAX MUSTERMANN
Senior Frontend Developer · Berlin

BERUFSERFAHRUNG
Lead Frontend Developer — Fin> GmbH, Berlin (2022–heute)
· Verantwortung für die Frontend-Architektur einer SaaS-Plattform (40.000+ Nutzer)
· Reduktion der Ladezeit um 45 %, Aufbau eines Design-Systems mit 80+ Komponenten
· Führung eines 4-köpfigen Frontend-Teams, Einführung von CI/CD und Testautomatisierung

Frontend Developer — Webwerk AG, Hamburg (2019–2022)
· Entwicklung responsiver Web-Apps mit React, TypeScript und GraphQL
· Migration einer Legacy-Codebasis auf eine moderne Komponentenbibliothek

AUSBILDUNG
M.Sc. Medieninformatik — TU Berlin (2017–2019)
B.Sc. Informatik — Universität Hamburg (2014–2017)

KENNTNISSE
React · TypeScript · Next.js · Node.js · GraphQL · Tailwind · CI/CD · Jest · Figma

SPRACHEN
Deutsch (Muttersprache) · Englisch (verhandlungssicher, C1)`,
};

window.JOB_POSTING_SAMPLE = `Senior Frontend Developer (m/w/d)
SAP SE · Walldorf · Vollzeit · Hybrid

Über die Rolle
Als Teil unseres Produkt-Teams entwickelst du moderne, performante Benutzeroberflächen für unsere Enterprise-Cloud-Lösungen, die täglich von Millionen Geschäftsanwendern genutzt werden.

Deine Aufgaben
· Konzeption und Umsetzung skalierbarer Frontend-Architekturen mit React und TypeScript
· Enge Zusammenarbeit mit UX-Design und Backend-Teams
· Optimierung von Performance, Accessibility und Code-Qualität
· Mentoring von Junior-Entwicklern

Dein Profil
· Mehrjährige Erfahrung in der Frontend-Entwicklung mit React/TypeScript
· Fundiertes Verständnis von Web-Performance und modernen Build-Tools
· Erfahrung mit Design-Systemen von Vorteil
· Sehr gute Deutsch- und Englischkenntnisse`;

// helper
window.fmtDate = (iso) => {
  if (!iso) return "—";
  const [y,m,d] = iso.split("-");
  return `${d}.${m}.${y}`;
};
window.relDate = (iso) => {
  if (!iso) return "—";
  const days = Math.round((new Date("2026-06-08") - new Date(iso)) / 86400000);
  if (days <= 0) return "Heute";
  if (days === 1) return "Gestern";
  if (days < 7) return `vor ${days} Tagen`;
  if (days < 14) return "vor 1 Woche";
  if (days < 30) return `vor ${Math.floor(days/7)} Wochen`;
  return `vor ${Math.floor(days/30)} Monat${Math.floor(days/30)>1?'en':''}`;
};
window.initials = (name) => name.split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase();
window.companyInitial = (c) => {
  const clean = c.replace(/\b(SE|AG|GmbH|Group|Republic)\b/gi,"").trim();
  return clean[0].toUpperCase();
};
