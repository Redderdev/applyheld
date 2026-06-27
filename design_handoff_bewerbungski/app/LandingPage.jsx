/* ============================================================
   BewerbungsKI — Landing Page
   ============================================================ */
function LandingNav() {
  const { navigate } = useStore();
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(248,250,252,.82)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", height: 64 }} className="row center spread">
        <div style={{ cursor: "pointer" }} onClick={() => navigate("landing")}><Logo size={30} /></div>
        <nav className="row center gap-4 desktop-only">
          {["Funktionen","So funktioniert's","Preise"].map((t,i) => (
            <a key={i} href={`#${["features","workflow","pricing"][i]}`} className="btn btn-ghost btn-sm" style={{ fontWeight: 500 }}>{t}</a>
          ))}
        </nav>
        <div className="row center gap-8">
          <button className="btn btn-ghost btn-sm desktop-only" onClick={() => navigate("login")}>Anmelden</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate("register")}>Kostenlos starten</button>
        </div>
      </div>
    </header>
  );
}

function HeroPreview() {
  // Miniature product UI preview
  return (
    <div className="hero-preview card" style={{ borderRadius: 14, overflow: "hidden", boxShadow: "var(--sh-lg)" }}>
      <div className="row center gap-8" style={{ padding: "11px 14px", borderBottom: "1px solid var(--border)", background: "var(--bg-soft)" }}>
        <span style={{ width: 10, height: 10, borderRadius: 99, background: "#f87171" }}></span>
        <span style={{ width: 10, height: 10, borderRadius: 99, background: "#fbbf24" }}></span>
        <span style={{ width: 10, height: 10, borderRadius: 99, background: "#34d399" }}></span>
        <span style={{ marginLeft: 8, fontSize: 12, color: "var(--ink-400)", fontFamily: "var(--mono)" }}>bewerbungski.de/bewerbung/neu</span>
      </div>
      <div className="hp-body" style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", minHeight: 320 }}>
        <div className="hp-left" style={{ padding: 18, borderRight: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--ink-400)", marginBottom: 12 }}>Stelle</div>
          <div className="company-cell" style={{ marginBottom: 14 }}>
            <CompanyLogo company="SAP SE" idx={0} size={34} />
            <div className="col"><b style={{ fontSize: 14 }}>SAP SE</b><span style={{ fontSize: 12.5, color: "var(--ink-500)" }}>Senior Frontend Developer</span></div>
          </div>
          <div style={{ height: 8, background: "var(--bg-soft)", borderRadius: 4, marginBottom: 7 }}></div>
          <div style={{ height: 8, width: "85%", background: "var(--bg-soft)", borderRadius: 4, marginBottom: 7 }}></div>
          <div style={{ height: 8, width: "70%", background: "var(--bg-soft)", borderRadius: 4, marginBottom: 18 }}></div>
          <div className="btn btn-primary btn-sm btn-block" style={{ pointerEvents: "none" }}><Icon name="sparkles" size={15} />KI-Anschreiben generieren</div>
        </div>
        <div style={{ padding: 18, background: "linear-gradient(180deg,#fff,var(--bg))" }}>
          <div className="row center gap-6" style={{ marginBottom: 12 }}>
            <span className="pulse-dot"></span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-600)" }}>KI schreibt …</span>
          </div>
          {[100,94,88,97,72,90,40].map((w,i) => (
            <div key={i} className="skel" style={{ height: 9, width: w+"%", marginBottom: 9, animationDelay: (i*.1)+"s" }}></div>
          ))}
          <div style={{ marginTop: 16, fontSize: 13, lineHeight: 1.6, color: "var(--ink-700)" }}>
            „… sehe ich in Ihrem Team die <span style={{ background: "var(--accent-50)", color: "var(--accent-600)", padding: "1px 4px", borderRadius: 4 }}>ideale Gelegenheit</span>, meine Expertise einzubringen.“
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const { navigate } = useStore();
  return (
    <section style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 70% at 70% 0%, rgba(6,182,212,.10), transparent 60%), radial-gradient(50% 60% at 15% 10%, rgba(30,58,95,.06), transparent 55%)" }}></div>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "72px 24px 80px", position: "relative" }}>
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.05fr", gap: 56, alignItems: "center" }}>
          <div className="fade-in">
            <div className="chip" style={{ marginBottom: 22, borderColor: "var(--accent-500)", background: "var(--accent-50)", color: "var(--accent-600)" }}>
              <Icon name="sparkles" size={14} /> KI für den deutschen Arbeitsmarkt
            </div>
            <h1 className="h-display" style={{ marginBottom: 20 }}>
              Bewerbungen schreiben in<br /><span style={{ color: "var(--navy-700)" }}>Minuten</span>, nicht <span style={{ position: "relative" }}>Stunden<svg style={{ position: "absolute", left: 0, bottom: -6, width: "100%" }} height="10" viewBox="0 0 200 10" preserveAspectRatio="none"><path d="M2 7 Q 100 1 198 6" stroke="var(--accent-500)" strokeWidth="3" fill="none" strokeLinecap="round"/></svg></span>
            </h1>
            <p style={{ fontSize: 18.5, lineHeight: 1.55, color: "var(--ink-500)", maxWidth: 480, marginBottom: 30 }}>
              Erstelle überzeugende, individuelle Anschreiben mit KI – und behalte mit dem integrierten Bewerbungs-Tracker jede Bewerbung im Blick.
            </p>
            <div className="row center gap-12 wrap" style={{ marginBottom: 26 }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate("register")}>Kostenlos starten<Icon name="arrowRight" size={18} /></button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigate("dashboard")}><Icon name="eye" size={17} />Demo ansehen</button>
            </div>
            <div className="row center gap-20 wrap" style={{ fontSize: 13.5, color: "var(--ink-500)" }}>
              <span className="row center gap-6"><Icon name="check" size={16} style={{ color: "var(--st-accepted-dot)" }} />Keine Kreditkarte nötig</span>
              <span className="row center gap-6"><Icon name="check" size={16} style={{ color: "var(--st-accepted-dot)" }} />5 Bewerbungen / Monat gratis</span>
            </div>
          </div>
          <div className="fade-in" style={{ animationDelay: ".1s" }}><HeroPreview /></div>
        </div>
        <div className="trust-strip" style={{ marginTop: 64, paddingTop: 30, borderTop: "1px solid var(--border)" }}>
          <div style={{ textAlign: "center", fontSize: 13, color: "var(--ink-400)", marginBottom: 18, fontWeight: 500 }}>Erfolgreiche Bewerbungen bei Unternehmen wie</div>
          <div className="row center wrap" style={{ justifyContent: "center", gap: 40, opacity: .7 }}>
            {["SAP","Siemens","Zalando","N26","BMW","Personio"].map(n => (
              <span key={n} style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-.02em", color: "var(--ink-400)" }}>{n}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const feats = [
    { icon: "sparkles", color: "var(--navy-700)", bg: "var(--navy-50)", title: "KI-Anschreiben", desc: "Lade deinen Lebenslauf hoch, füge die Stellenanzeige ein – und erhalte in Sekunden ein individuelles, professionelles Anschreiben, perfekt auf die Stelle zugeschnitten." },
    { icon: "chat", color: "var(--accent-600)", bg: "var(--accent-50)", title: "AI-Chat Verfeinerung", desc: "Du bestimmst den Ton. Sag der KI im Chat einfach, was du ändern möchtest – „kürzer“, „formeller“, „den ersten Absatz überarbeiten“ – und sieh die Änderung sofort." },
    { icon: "chart", color: "#6d28d9", bg: "#f5f3ff", title: "Bewerbungs-Tracker", desc: "Behalte den Überblick: vom Entwurf über das Telefoninterview bis zur Zusage. Farbige Status, Stats und Erinnerungen halten deinen Bewerbungsprozess organisiert." },
  ];
  return (
    <section id="features" style={{ maxWidth: 1160, margin: "0 auto", padding: "88px 24px" }}>
      <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 52px" }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>Funktionen</div>
        <h2 className="h1" style={{ marginBottom: 16, fontSize: 38 }}>Alles für deine Bewerbung an einem Ort</h2>
        <p style={{ fontSize: 17, color: "var(--ink-500)" }}>Drei Werkzeuge, die zusammenarbeiten – vom ersten Entwurf bis zur Zusage.</p>
      </div>
      <div className="feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
        {feats.map((f,i) => (
          <div key={i} className="card card-pad" style={{ padding: 28 }}>
            <div className="stat-icn" style={{ background: f.bg, width: 48, height: 48, borderRadius: 12, marginBottom: 20 }}>
              <Icon name={f.icon} size={24} style={{ color: f.color }} />
            </div>
            <h3 className="h3" style={{ fontSize: 19, marginBottom: 10 }}>{f.title}</h3>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-500)" }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Workflow() {
  const steps = [
    { n: "1", title: "Lebenslauf hochladen", desc: "Lade deinen Lebenslauf als PDF oder DOCX hoch. Die KI liest deine Erfahrung und Fähigkeiten automatisch aus.", icon: "upload" },
    { n: "2", title: "Stelle einfügen", desc: "Kopiere die Stellenanzeige oder füge die URL ein. Wir erkennen Firma, Position und Anforderungen.", icon: "link" },
    { n: "3", title: "Anschreiben fertig", desc: "In Sekunden steht dein maßgeschneidertes Anschreiben – verfeinere es per Chat und lade es als PDF herunter.", icon: "checkCircle" },
  ];
  return (
    <section id="workflow" style={{ background: "var(--navy-900)", color: "#fff", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(50% 60% at 80% 20%, rgba(6,182,212,.16), transparent 60%)" }}></div>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "88px 24px", position: "relative" }}>
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 56px" }}>
          <div className="eyebrow" style={{ marginBottom: 14, color: "var(--accent-400)" }}>So funktioniert's</div>
          <h2 className="h1" style={{ fontSize: 38, color: "#fff", marginBottom: 16 }}>In drei Schritten zum Anschreiben</h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,.6)" }}>Kein Schreibstress, keine leere Seite. Du gibst den Input, die KI erledigt den Rest.</p>
        </div>
        <div className="wf-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, position: "relative" }}>
          {steps.map((s,i) => (
            <div key={i} style={{ position: "relative" }}>
              <div style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 16, padding: 28, height: "100%" }}>
                <div className="row center spread" style={{ marginBottom: 22 }}>
                  <span style={{ fontSize: 46, fontWeight: 700, letterSpacing: "-.03em", color: "var(--accent-400)", lineHeight: 1 }}>{s.n}</span>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: "rgba(6,182,212,.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name={s.icon} size={22} style={{ color: "var(--accent-400)" }} />
                  </div>
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 600, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "rgba(255,255,255,.6)" }}>{s.desc}</p>
              </div>
              {i < 2 && <div className="wf-arrow desktop-only" style={{ position: "absolute", right: -16, top: "50%", transform: "translateY(-50%)", zIndex: 2, color: "var(--accent-400)" }}><Icon name="arrowRight" size={22} /></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing({ standalone }) {
  const { navigate } = useStore();
  const Plan = ({ name, price, per, desc, feats, cta, featured, badge }) => (
    <div className="card card-pad" style={{ padding: 30, position: "relative", border: featured ? "2px solid var(--navy-700)" : "1px solid var(--border)", boxShadow: featured ? "var(--sh-lg)" : "var(--sh-sm)" }}>
      {badge && <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "var(--navy-700)", color: "#fff", fontSize: 12, fontWeight: 600, padding: "5px 14px", borderRadius: 99 }}>{badge}</div>}
      <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{name}</h3>
      <p style={{ fontSize: 14, color: "var(--ink-500)", marginBottom: 20, minHeight: 40 }}>{desc}</p>
      <div className="row" style={{ alignItems: "baseline", gap: 4, marginBottom: 24 }}>
        <span style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-.03em" }}>{price}</span>
        <span style={{ fontSize: 15, color: "var(--ink-500)" }}>{per}</span>
      </div>
      <button className={`btn btn-block ${featured ? "btn-primary" : "btn-secondary"}`} style={{ marginBottom: 24 }} onClick={() => navigate("register")}>{cta}</button>
      <div className="col gap-12">
        {feats.map((f,i) => (
          <div key={i} className="row gap-10" style={{ alignItems: "flex-start" }}>
            <Icon name="check" size={17} style={{ color: featured ? "var(--accent-600)" : "var(--st-accepted-dot)", marginTop: 1, flex: "none" }} />
            <span style={{ fontSize: 14.5, color: "var(--ink-700)" }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <section id="pricing" style={{ maxWidth: 940, margin: "0 auto", padding: standalone ? "40px 24px" : "88px 24px" }}>
      <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 48px" }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>Preise</div>
        <h2 className="h1" style={{ fontSize: 38, marginBottom: 16 }}>Starte gratis. Upgrade, wenn du mehr brauchst.</h2>
        <p style={{ fontSize: 17, color: "var(--ink-500)" }}>Keine versteckten Kosten. Jederzeit kündbar.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }} className="price-grid">
        <Plan name="Free" price="0 €" per="/ Monat" desc="Perfekt, um BewerbungsKI auszuprobieren."
          feats={["5 KI-Anschreiben pro Monat","Bewerbungs-Tracker","1 Lebenslauf","PDF-Export"]}
          cta="Kostenlos starten" />
        <Plan name="Pro" price="12 €" per="/ Monat" desc="Für die aktive Jobsuche ohne Limits." featured badge="Beliebt"
          feats={["Unbegrenzte KI-Anschreiben","AI-Chat Verfeinerung","Mehrere Lebensläufe & Vorlagen","Prioritäts-Support","Erweiterte Tracker-Statistiken"]}
          cta="Pro testen" />
      </div>
    </section>
  );
}

function Footer() {
  const { navigate } = useStore();
  const cols = [
    { h: "Produkt", links: ["Funktionen","Preise","Demo","Changelog"] },
    { h: "Ressourcen", links: ["Bewerbungs-Ratgeber","Vorlagen","Hilfe-Center","Blog"] },
    { h: "Unternehmen", links: ["Über uns","Datenschutz","Impressum","Kontakt"] },
  ];
  return (
    <footer style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "56px 24px 32px" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 32, marginBottom: 44 }}>
          <div>
            <Logo size={30} />
            <p style={{ fontSize: 14, color: "var(--ink-500)", marginTop: 14, maxWidth: 260, lineHeight: 1.6 }}>
              KI-gestütztes Bewerbungsmanagement für den deutschen Arbeitsmarkt.
            </p>
            <div className="row center gap-8" style={{ marginTop: 18, fontSize: 13, color: "var(--ink-500)" }}>
              <Icon name="shield" size={16} style={{ color: "var(--st-accepted-dot)" }} /> DSGVO-konform · Server in der EU
            </div>
          </div>
          {cols.map((c,i) => (
            <div key={i}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>{c.h}</div>
              <div className="col gap-10">
                {c.links.map((l,j) => <a key={j} style={{ fontSize: 14, color: "var(--ink-500)", cursor: "pointer" }} onClick={() => l==="Preise" ? navigate("pricing") : null}>{l}</a>)}
              </div>
            </div>
          ))}
        </div>
        <div className="divider" style={{ marginBottom: 24 }}></div>
        <div className="row center spread wrap gap-12" style={{ fontSize: 13.5, color: "var(--ink-400)" }}>
          <span>© 2026 BewerbungsKI. Alle Rechte vorbehalten.</span>
          <span className="row center gap-16">
            <a style={{ cursor: "pointer" }}>Datenschutz</a><a style={{ cursor: "pointer" }}>AGB</a><a style={{ cursor: "pointer" }}>Impressum</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

function LandingPage() {
  return (
    <div className="landing">
      <LandingNav />
      <Hero />
      <Features />
      <Workflow />
      <Pricing />
      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px 88px" }}>
        <div style={{ background: "linear-gradient(135deg, var(--navy-700), var(--navy-900))", borderRadius: 22, padding: "56px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(50% 80% at 50% 0%, rgba(6,182,212,.22), transparent 60%)" }}></div>
          <div style={{ position: "relative" }}>
            <h2 className="h1" style={{ fontSize: 36, color: "#fff", marginBottom: 14 }}>Deine nächste Bewerbung wartet nicht.</h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,.7)", marginBottom: 28, maxWidth: 480, margin: "0 auto 28px" }}>Starte jetzt kostenlos und schreibe dein erstes KI-Anschreiben in unter zwei Minuten.</p>
            <LandingCTA />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
function LandingCTA() {
  const { navigate } = useStore();
  return <button className="btn btn-accent btn-lg" onClick={() => navigate("register")}>Kostenlos starten<Icon name="arrowRight" size={18} /></button>;
}

Object.assign(window, { LandingPage, Pricing });
