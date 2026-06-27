/* ============================================================
   BewerbungsKI — Login + Register (split layout)
   ============================================================ */
function AuthAside() {
  return (
    <div className="auth-aside desktop-only" style={{ background: "var(--navy-900)", color: "#fff", position: "relative", overflow: "hidden", padding: "48px 52px", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 50% at 80% 10%, rgba(6,182,212,.18), transparent 60%), radial-gradient(50% 50% at 0% 90%, rgba(6,182,212,.10), transparent 55%)" }}></div>
      <div style={{ position: "relative", zIndex: 1 }}><Logo size={32} light /></div>
      <div style={{ position: "relative", zIndex: 1, marginTop: "auto", marginBottom: "auto", paddingTop: 40 }}>
        <h2 style={{ fontSize: 32, fontWeight: 680, letterSpacing: "-.02em", lineHeight: 1.18, marginBottom: 18 }}>
          Schluss mit dem<br />leeren Blatt.
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,.65)", lineHeight: 1.6, maxWidth: 360, marginBottom: 36 }}>
          BewerbungsKI schreibt individuelle Anschreiben, die zur Stelle passen – und hält deinen gesamten Bewerbungsprozess organisiert.
        </p>
        <div className="col gap-16">
          {[
            { icon: "sparkles", t: "Anschreiben in Sekunden", d: "KI-generiert, auf jede Stelle zugeschnitten" },
            { icon: "chat", t: "Verfeinern per Chat", d: "Kürzer, formeller, neuer Absatz – ein Klick" },
            { icon: "chart", t: "Alles im Blick", d: "Tracker von Entwurf bis Zusage" },
          ].map((f,i) => (
            <div key={i} className="row gap-14" style={{ alignItems: "flex-start" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(6,182,212,.14)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <Icon name={f.icon} size={20} style={{ color: "var(--accent-400)" }} />
              </div>
              <div className="col"><b style={{ fontSize: 15 }}>{f.t}</b><span style={{ fontSize: 13.5, color: "rgba(255,255,255,.55)" }}>{f.d}</span></div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 10, alignItems: "center", fontSize: 13, color: "rgba(255,255,255,.5)" }}>
        <Icon name="shield" size={16} /> DSGVO-konform · Deine Daten bleiben in der EU
      </div>
    </div>
  );
}

function SocialButtons() {
  const toast = useToast();
  return (
    <div className="col gap-10">
      <button className="btn btn-secondary btn-block" onClick={() => toast("Google-Login (Demo)", "info")}>
        <Icon name="google" size={18} />Mit Google fortfahren
      </button>
      <div className="row center gap-12" style={{ margin: "4px 0" }}>
        <div className="divider grow"></div>
        <span style={{ fontSize: 12.5, color: "var(--ink-400)" }}>oder</span>
        <div className="divider grow"></div>
      </div>
    </div>
  );
}

function AuthField({ label, type, placeholder, icon, value, onChange, autoComplete, rightLink, onRightLink }) {
  return (
    <div className="field">
      <div className="row center spread">
        <label className="label">{label}</label>
        {rightLink && <a style={{ fontSize: 12.5, color: "var(--accent-600)", fontWeight: 550, cursor: "pointer", whiteSpace: "nowrap" }} onClick={onRightLink}>{rightLink}</a>}
      </div>
      <div className="input-icon">
        <Icon name={icon} size={17} />
        <input className="input" type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} autoComplete={autoComplete} />
      </div>
    </div>
  );
}

function RegisterPage() {
  const { navigate, setAuth } = useStore();
  const toast = useToast();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setAuth(true); toast("Konto erstellt – willkommen!", "success"); navigate("dashboard"); }, 1100);
  };
  return (
    <div className="auth-split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }}>
      <AuthAside />
      <div className="row" style={{ justifyContent: "center", alignItems: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 392 }}>
          <div className="mobile-only" style={{ marginBottom: 28, justifyContent: "center" }}><Logo size={32} /></div>
          <h1 className="h1" style={{ marginBottom: 8 }}>Konto erstellen</h1>
          <p className="muted" style={{ marginBottom: 28, fontSize: 15 }}>Kostenlos starten – keine Kreditkarte nötig.</p>
          <SocialButtons />
          <form className="col gap-16" onSubmit={submit}>
            <AuthField label="Name" type="text" placeholder="Max Mustermann" icon="user" value={name} onChange={setName} autoComplete="name" />
            <AuthField label="E-Mail" type="email" placeholder="max@email.de" icon="mail" value={email} onChange={setEmail} autoComplete="email" />
            <AuthField label="Passwort" type="password" placeholder="Mind. 8 Zeichen" icon="lock" value={pw} onChange={setPw} autoComplete="new-password" />
            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
              {loading ? <><span className="typing"><span></span><span></span><span></span></span></> : <>Konto erstellen<Icon name="arrowRight" size={18} /></>}
            </button>
          </form>
          <p style={{ fontSize: 12.5, color: "var(--ink-400)", textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
            Mit der Registrierung stimmst du den <a style={{ color: "var(--ink-500)", textDecoration: "underline" }}>AGB</a> und der <a style={{ color: "var(--ink-500)", textDecoration: "underline" }}>Datenschutzerklärung</a> zu.
          </p>
          <p style={{ textAlign: "center", marginTop: 24, fontSize: 14.5, color: "var(--ink-500)" }}>
            Schon ein Konto? <a style={{ color: "var(--navy-700)", fontWeight: 600, cursor: "pointer" }} onClick={() => navigate("login")}>Anmelden</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginPage() {
  const { navigate, setAuth } = useStore();
  const toast = useToast();
  const [email, setEmail] = React.useState("max.mustermann@email.de");
  const [pw, setPw] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setAuth(true); toast("Willkommen zurück, Max!", "success"); navigate("dashboard"); }, 1000);
  };
  return (
    <div className="auth-split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }}>
      <AuthAside />
      <div className="row" style={{ justifyContent: "center", alignItems: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 392 }}>
          <div className="mobile-only" style={{ marginBottom: 28, justifyContent: "center" }}><Logo size={32} /></div>
          <h1 className="h1" style={{ marginBottom: 8 }}>Willkommen zurück</h1>
          <p className="muted" style={{ marginBottom: 28, fontSize: 15 }}>Melde dich an, um fortzufahren.</p>
          <SocialButtons />
          <form className="col gap-16" onSubmit={submit}>
            <AuthField label="E-Mail" type="email" placeholder="max@email.de" icon="mail" value={email} onChange={setEmail} autoComplete="email" />
            <AuthField label="Passwort" type="password" placeholder="Dein Passwort" icon="lock" value={pw} onChange={setPw} autoComplete="current-password"
              rightLink="Passwort vergessen?" onRightLink={() => toast("Reset-Link gesendet (Demo)", "info")} />
            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
              {loading ? <span className="typing"><span></span><span></span><span></span></span> : "Anmelden"}
            </button>
          </form>
          <p style={{ textAlign: "center", marginTop: 24, fontSize: 14.5, color: "var(--ink-500)" }}>
            Noch kein Konto? <a style={{ color: "var(--navy-700)", fontWeight: 600, cursor: "pointer" }} onClick={() => navigate("register")}>Kostenlos registrieren</a>
          </p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginPage, RegisterPage });
