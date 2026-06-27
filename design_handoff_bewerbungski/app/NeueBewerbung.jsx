/* ============================================================
   BewerbungsKI — Neue Bewerbung (AI generate)
   ============================================================ */
function NeueBewerbung() {
  const { navigate, addApp } = useStore();
  const toast = useToast();
  const [company, setCompany] = React.useState("");
  const [role, setRole] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [posting, setPosting] = React.useState("");
  const [phase, setPhase] = React.useState("empty"); // empty | loading | streaming | done
  const [letter, setLetter] = React.useState("");
  const [extracting, setExtracting] = React.useState(false);
  const streamRef = React.useRef(null);

  const canGenerate = company.trim() && posting.trim().length > 20;

  const autoExtract = () => {
    if (!url.trim()) { toast("Bitte zuerst eine URL einfügen", "error"); return; }
    setExtracting(true);
    setTimeout(() => {
      setCompany("SAP SE"); setRole("Senior Frontend Developer"); setPosting(window.JOB_POSTING_SAMPLE);
      setExtracting(false); toast("Stellenanzeige automatisch ausgelesen", "success");
    }, 1400);
  };

  const fillExample = () => {
    setCompany("SAP SE"); setRole("Senior Frontend Developer"); setPosting(window.JOB_POSTING_SAMPLE);
  };

  const generate = () => {
    if (!canGenerate) return;
    setPhase("loading"); setLetter("");
    setTimeout(() => {
      setPhase("streaming");
      const full = window.SAMPLE_LETTER;
      const tokens = full.split(/(\s+)/);
      let i = 0;
      streamRef.current = setInterval(() => {
        i += 2;
        setLetter(tokens.slice(0, i).join(""));
        if (i >= tokens.length) { clearInterval(streamRef.current); setLetter(full); setPhase("done"); }
      }, 28);
    }, 1500);
  };
  React.useEffect(() => () => clearInterval(streamRef.current), []);

  const wordCount = letter.trim() ? letter.trim().split(/\s+/).length : 0;

  const save = () => {
    const id = addApp({ company, role: role || "Position", location: "—", date: "2026-06-08", status: "entwurf", letter, words: wordCount, notes: "" });
    toast("Bewerbung gespeichert", "success");
    navigate("detail", { id });
  };

  return (
    <AppShell active="neu" title="Neue Bewerbung"
      topRight={<button className="btn btn-ghost btn-sm" onClick={() => navigate("dashboard")}><Icon name="x" size={16} />Abbrechen</button>}>
      <div className="page page-wide" style={{ maxWidth: 1320 }}>
        <div className="row center gap-8" style={{ fontSize: 13.5, color: "var(--ink-400)", marginBottom: 18 }}>
          <a style={{ cursor: "pointer", color: "var(--ink-500)" }} onClick={() => navigate("dashboard")}>Dashboard</a>
          <Icon name="chevRight" size={14} /><span style={{ color: "var(--ink-700)", fontWeight: 500 }}>Neue Bewerbung</span>
        </div>

        <div className="neu-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.15fr)", gap: 22, alignItems: "start" }}>
          {/* LEFT — job info */}
          <div className="card card-pad" style={{ padding: 24 }}>
            <div className="row center spread" style={{ marginBottom: 20 }}>
              <h3 className="h3">Stelleninformationen</h3>
              <button className="btn btn-ghost btn-sm" onClick={fillExample} style={{ color: "var(--accent-600)" }}><Icon name="zap" size={15} />Beispiel</button>
            </div>
            <div className="col gap-16">
              <div className="row gap-12">
                <div className="field grow"><label className="label">Firma</label><input className="input" placeholder="z. B. SAP SE" value={company} onChange={e => setCompany(e.target.value)} /></div>
                <div className="field grow"><label className="label">Stelle</label><input className="input" placeholder="z. B. Frontend Developer" value={role} onChange={e => setRole(e.target.value)} /></div>
              </div>
              <div className="field">
                <label className="label">Stellen-URL</label>
                <div className="row gap-8">
                  <div className="input-icon grow"><Icon name="link" size={16} /><input className="input" placeholder="https://karriere.firma.de/stelle/123" value={url} onChange={e => setUrl(e.target.value)} /></div>
                  <button className="btn btn-secondary" style={{ flex: "none" }} onClick={autoExtract} disabled={extracting}>
                    {extracting ? <span className="typing"><span></span><span></span><span></span></span> : <><Icon name="sparkles" size={16} />Auslesen</>}
                  </button>
                </div>
                <span className="hint">Wir erkennen Firma, Position und Anforderungen automatisch.</span>
              </div>
              <div className="field">
                <div className="row center spread"><label className="label">Stellenanzeige</label><span className="hint">{posting.length} Zeichen</span></div>
                <textarea className="textarea" style={{ minHeight: 240 }} placeholder="Füge hier den vollständigen Text der Stellenanzeige ein…" value={posting} onChange={e => setPosting(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-lg btn-block" onClick={generate} disabled={!canGenerate || phase === "loading" || phase === "streaming"}>
                <Icon name="sparkles" size={18} />KI-Anschreiben generieren
              </button>
              {!canGenerate && <span className="hint" style={{ textAlign: "center" }}>Firma und Stellenanzeige ausfüllen, um zu starten.</span>}
            </div>
          </div>

          {/* RIGHT — editor */}
          <div className="card" style={{ overflow: "hidden", minHeight: 560, display: "flex", flexDirection: "column" }}>
            <div className="row center spread" style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
              <div className="row center gap-10">
                <Icon name="doc" size={18} style={{ color: "var(--ink-500)" }} />
                <span style={{ fontWeight: 600, fontSize: 15 }}>Anschreiben</span>
                {phase === "done" && <span className="badge angenommen" style={{ height: 22 }}><span className="dot"></span>Generiert</span>}
              </div>
              {(phase === "streaming" || phase === "loading") && (
                <div className="row center gap-6"><span className="pulse-dot"></span><span style={{ fontSize: 13, fontWeight: 550, color: "var(--accent-600)" }}>KI schreibt…</span></div>
              )}
            </div>

            <div className="grow" style={{ position: "relative", overflow: "auto" }}>
              {phase === "empty" && <EditorEmpty />}
              {phase === "loading" && <EditorLoading />}
              {(phase === "streaming" || phase === "done") && (
                <div style={{ padding: "26px 30px", whiteSpace: "pre-wrap", fontSize: 15, lineHeight: 1.7, color: "var(--ink-900)", fontFamily: "var(--font)" }}>
                  {letter}{phase === "streaming" && <span className="caret">▍</span>}
                </div>
              )}
            </div>

            <div className="row center spread" style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", background: "var(--bg-soft)" }}>
              <span style={{ fontSize: 13, color: "var(--ink-500)" }} className="tabular">{wordCount} Wörter · {letter.length} Zeichen</span>
              <div className="row center gap-8">
                <button className="btn btn-secondary btn-sm" disabled={phase !== "done"} onClick={() => toast("PDF wird heruntergeladen…", "info")}><Icon name="download" size={16} />PDF</button>
                <button className="btn btn-primary btn-sm" disabled={phase !== "done"} onClick={save}><Icon name="check" size={16} />Speichern</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.caret{ color: var(--accent-500); animation: blink 1s steps(2) infinite; font-weight: 400; } @keyframes blink { 50% { opacity: 0; } }` }} />
    </AppShell>
  );
}

function EditorEmpty() {
  return (
    <div className="col center" style={{ justifyContent: "center", height: "100%", minHeight: 460, textAlign: "center", padding: 40 }}>
      <div style={{ width: 96, height: 96, marginBottom: 22, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 22, background: "var(--navy-50)" }}></div>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="sparkles" size={42} style={{ color: "var(--navy-500)" }} strokeWidth={1.5} />
        </div>
        <span className="pulse-dot" style={{ position: "absolute", top: 8, right: 10 }}></span>
      </div>
      <h3 className="h3" style={{ marginBottom: 8 }}>Generiere dein Anschreiben</h3>
      <p className="muted" style={{ maxWidth: 320, fontSize: 14.5 }}>Fülle die Stelleninformationen links aus und klicke auf „KI-Anschreiben generieren". Dein individuelles Anschreiben erscheint hier.</p>
      <div className="col gap-10" style={{ marginTop: 26, width: "100%", maxWidth: 280 }}>
        {["Lebenslauf wird berücksichtigt","Auf die Stelle zugeschnitten","Im richtigen deutschen Bewerbungston"].map((t,i) => (
          <div key={i} className="row center gap-10" style={{ fontSize: 13.5, color: "var(--ink-500)" }}>
            <Icon name="checkCircle" size={17} style={{ color: "var(--st-accepted-dot)", flex: "none" }} />{t}
          </div>
        ))}
      </div>
    </div>
  );
}

function EditorLoading() {
  return (
    <div style={{ padding: "26px 30px" }}>
      <div className="row center gap-10" style={{ marginBottom: 22 }}>
        <span className="pulse-dot"></span>
        <span style={{ fontSize: 14, fontWeight: 550, color: "var(--accent-600)" }}>KI analysiert Stelle & Lebenslauf…</span>
      </div>
      {[100,96,88,0,94,99,82,90,0,86,72].map((w,i) => (
        w === 0 ? <div key={i} style={{ height: 14 }}></div> :
        <div key={i} className="skel" style={{ height: 11, width: w+"%", marginBottom: 12, animationDelay: (i*.08)+"s" }}></div>
      ))}
    </div>
  );
}

Object.assign(window, { NeueBewerbung });
