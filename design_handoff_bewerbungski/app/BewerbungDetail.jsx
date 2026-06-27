/* ============================================================
   BewerbungsKI — Bewerbung Detail + AI Chat (3-column)
   ============================================================ */
function StatusDropdown({ value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="btn btn-secondary btn-sm btn-block" style={{ justifyContent: "space-between" }} onClick={() => setOpen(o => !o)}>
        <StatusBadge status={value} />
        <Icon name="chevDown" size={15} style={{ color: "var(--ink-400)" }} />
      </button>
      {open && (
        <div className="card fade-only" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 20, padding: 5, boxShadow: "var(--sh-lg)" }}>
          {window.STATUS_ORDER.map(k => (
            <button key={k} className="row center spread" style={{ width: "100%", padding: "8px 8px", borderRadius: 7, background: value === k ? "var(--bg-soft)" : "transparent", border: "none" }}
              onClick={() => { onChange(k); setOpen(false); }}>
              <StatusBadge status={k} />
              {value === k && <Icon name="check" size={15} style={{ color: "var(--navy-700)" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChatBubble({ msg }) {
  if (msg.role === "user") {
    return (
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <div style={{ background: "var(--navy-700)", color: "#fff", padding: "9px 13px", borderRadius: "14px 14px 4px 14px", fontSize: 14, lineHeight: 1.5, maxWidth: "85%" }}>{msg.text}</div>
      </div>
    );
  }
  return (
    <div className="row gap-8" style={{ alignItems: "flex-start" }}>
      <div style={{ width: 26, height: 26, borderRadius: 8, background: "var(--navy-50)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none", marginTop: 2 }}>
        <Icon name="sparkles" size={15} style={{ color: "var(--navy-600)" }} />
      </div>
      <div style={{ background: "var(--bg-soft)", color: "var(--ink-900)", padding: "9px 13px", borderRadius: "4px 14px 14px 14px", fontSize: 14, lineHeight: 1.55, maxWidth: "85%" }}>
        {msg.typing ? <span className="typing"><span></span><span></span><span></span></span> : msg.text}
      </div>
    </div>
  );
}

function BewerbungDetail() {
  const { route, navigate, getApp, updateApp } = useStore();
  const toast = useToast();
  const app = getApp(route.params.id);
  const [letter, setLetter] = React.useState(app ? (app.letter || window.SAMPLE_LETTER) : "");
  const [notes, setNotes] = React.useState(app ? app.notes : "");
  const [status, setStatus] = React.useState(app ? app.status : "entwurf");
  const [messages, setMessages] = React.useState([
    { role: "ai", text: "Dein Anschreiben ist fertig. Sag mir einfach, was ich anpassen soll – z. B. kürzer, formeller oder einen bestimmten Absatz überarbeiten." },
  ]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const chatRef = React.useRef(null);
  const idx = app ? window.APPLICATIONS.findIndex(a => a.id === app.id) : 0;

  React.useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages]);

  if (!app) {
    return <AppShell active="dashboard" title="Bewerbung"><div className="page"><div className="card card-pad">Bewerbung nicht gefunden. <a style={{ color: "var(--navy-700)", cursor: "pointer" }} onClick={() => navigate("dashboard")}>Zurück zum Dashboard</a></div></div></AppShell>;
  }

  const wordCount = letter.trim() ? letter.trim().split(/\s+/).length : 0;
  const setStatusAndSave = (s) => { setStatus(s); updateApp(app.id, { status: s }); toast(`Status: ${window.STATUS[s].label}`, "success"); };

  const chips = [
    { label: "Kürzer", instr: "Mach es kürzer" },
    { label: "Formeller", instr: "Formuliere es formeller" },
    { label: "Ersten Absatz überarbeiten", instr: "Überarbeite den ersten Absatz" },
    { label: "Stärker auf die Stelle eingehen", instr: "Geh stärker auf die Stelle ein" },
  ];

  const replyFor = (text) => {
    const t = text.toLowerCase();
    if (t.includes("kürzer") || t.includes("kurz")) return "Ich habe das Anschreiben gestrafft und auf die wichtigsten Punkte fokussiert. Schau es dir im Editor an.";
    if (t.includes("formell")) return "Erledigt – ich habe den Ton formeller gestaltet und die Anrede angepasst.";
    if (t.includes("absatz")) return "Den ersten Absatz habe ich überarbeitet und prägnanter formuliert.";
    if (t.includes("stelle")) return "Ich habe einen konkreten Bezug zu den Anforderungen der Stelle ergänzt.";
    return "Verstanden – ich habe das Anschreiben entsprechend angepasst.";
  };

  const send = (text) => {
    if (!text.trim() || busy) return;
    setInput(""); setBusy(true);
    setMessages(m => [...m, { role: "user", text }]);
    setMessages(m => [...m, { role: "ai", typing: true }]);
    setTimeout(() => {
      setMessages(m => { const c = [...m]; c[c.length - 1] = { role: "ai", text: replyFor(text) }; return c; });
      // tweak the letter a touch to show change
      if (text.toLowerCase().includes("kürzer")) {
        setLetter(l => l.split("\n\n").slice(0, 3).join("\n\n") + "\n\nÜber die Gelegenheit zu einem persönlichen Gespräch würde ich mich sehr freuen.\n\nMit freundlichen Grüßen\nMax Mustermann");
      }
      setBusy(false);
    }, 1400);
  };

  return (
    <AppShell active="dashboard" title="Bewerbung" wide
      topRight={
        <div className="row center gap-8">
          <span className="desktop-only"><StatusBadge status={status} /></span>
          <button className="btn btn-secondary btn-sm" onClick={() => toast("PDF wird heruntergeladen…", "info")}><Icon name="download" size={16} />PDF</button>
        </div>
      }>
      <div className="page page-wide" style={{ padding: 20, maxWidth: 1500 }}>
        {/* breadcrumb */}
        <div className="row center spread wrap gap-12" style={{ marginBottom: 16 }}>
          <div className="row center gap-8" style={{ fontSize: 13.5, color: "var(--ink-400)" }}>
            <a style={{ cursor: "pointer", color: "var(--ink-500)" }} onClick={() => navigate("dashboard")}>Dashboard</a>
            <Icon name="chevRight" size={14} /><span style={{ color: "var(--ink-700)", fontWeight: 500, whiteSpace: "nowrap" }}>{app.company}</span>
          </div>
        </div>

        <div className="detail-grid" style={{ display: "grid", gridTemplateColumns: "270px minmax(0,1fr) 320px", gap: 18, alignItems: "start" }}>
          {/* LEFT — info */}
          <div className="col gap-16 detail-left">
            <div className="card card-pad" style={{ padding: 18 }}>
              <div className="row center gap-12" style={{ marginBottom: 16 }}>
                <CompanyLogo company={app.company} idx={idx} size={44} />
                <div className="col" style={{ minWidth: 0 }}>
                  <b style={{ fontSize: 16, letterSpacing: "-.01em" }}>{app.company}</b>
                  <span style={{ fontSize: 13.5, color: "var(--ink-500)" }}>{app.role}</span>
                </div>
              </div>
              <div className="col gap-10" style={{ fontSize: 13.5, color: "var(--ink-700)" }}>
                <div className="row center gap-8"><Icon name="mapPin" size={15} style={{ color: "var(--ink-400)" }} />{app.location}</div>
                <div className="row center gap-8"><Icon name="calendar" size={15} style={{ color: "var(--ink-400)" }} />Beworben am {window.fmtDate(app.date)}</div>
              </div>
              <div className="divider" style={{ margin: "16px 0" }}></div>
              <label className="label" style={{ marginBottom: 8, display: "block" }}>Status</label>
              <StatusDropdown value={status} onChange={setStatusAndSave} />
            </div>

            <div className="card card-pad" style={{ padding: 18 }}>
              <label className="label" style={{ marginBottom: 8, display: "block" }}>Notizen</label>
              <textarea className="textarea" style={{ minHeight: 120, fontSize: 13.5 }} placeholder="Eigene Notizen zu dieser Bewerbung…" value={notes}
                onChange={e => setNotes(e.target.value)} onBlur={() => updateApp(app.id, { notes })} />
            </div>
          </div>

          {/* MIDDLE — editor */}
          <div className="card detail-editor" style={{ display: "flex", flexDirection: "column", minHeight: 600 }}>
            <div className="row center spread" style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", flexWrap: "wrap", gap: 8 }}>
              <div className="row center gap-2">
                {["bold","italic","list"].map(t => <button key={t} className="icon-btn"><Icon name={t} size={16} /></button>)}
                <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 6px" }}></div>
                <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard && toast("In Zwischenablage kopiert", "success")}><Icon name="copy" size={15} />Kopieren</button>
              </div>
              <span style={{ fontSize: 12.5, color: "var(--ink-400)" }} className="tabular">{wordCount} Wörter</span>
            </div>
            <textarea className="letter-editor grow" value={letter} onChange={e => setLetter(e.target.value)}
              style={{ border: "none", outline: "none", resize: "none", padding: "28px 36px", fontSize: 15, lineHeight: 1.75, color: "var(--ink-900)", fontFamily: "var(--font)", background: "transparent" }} />
            <div className="row center spread" style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", background: "var(--bg-soft)" }}>
              <span style={{ fontSize: 12.5, color: "var(--ink-500)" }} className="row center gap-6"><Icon name="check" size={15} style={{ color: "var(--st-accepted-dot)" }} />Automatisch gespeichert</span>
              <div className="row center gap-8">
                <button className="btn btn-secondary btn-sm" onClick={() => toast("PDF wird heruntergeladen…", "info")}><Icon name="download" size={16} />PDF herunterladen</button>
              </div>
            </div>
          </div>

          {/* RIGHT — AI chat */}
          <div className="card detail-chat" style={{ display: "flex", flexDirection: "column", height: 600, position: "sticky", top: 76 }}>
            <div className="row center gap-10" style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,var(--navy-600),var(--navy-800))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="sparkles" size={17} style={{ color: "#fff" }} />
              </div>
              <div className="col"><b style={{ fontSize: 14.5 }}>KI-Assistent</b><span style={{ fontSize: 12, color: "var(--st-accepted-fg)" }} className="row center gap-4"><span className="dot" style={{ width: 6, height: 6, borderRadius: 99, background: "var(--st-accepted-dot)", display: "inline-block" }}></span>Online</span></div>
            </div>
            <div ref={chatRef} className="grow" style={{ overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
              {messages.map((m, i) => <ChatBubble key={i} msg={m} />)}
            </div>
            <div style={{ padding: 12, borderTop: "1px solid var(--border)" }}>
              <div className="row gap-6 wrap" style={{ marginBottom: 10 }}>
                {chips.map((c, i) => <button key={i} className="chip" style={{ height: 28, fontSize: 12.5 }} onClick={() => send(c.instr)} disabled={busy}>{c.label}</button>)}
              </div>
              <div className="row gap-8" style={{ alignItems: "flex-end" }}>
                <textarea className="textarea grow" rows={1} placeholder="Sag der KI, was geändert werden soll…" value={input}
                  onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                  style={{ minHeight: 42, maxHeight: 90, fontSize: 13.5, padding: "10px 12px" }} />
                <button className="btn btn-primary btn-icon" style={{ height: 42, width: 42 }} onClick={() => send(input)} disabled={busy || !input.trim()}><Icon name="send" size={17} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

Object.assign(window, { BewerbungDetail });
