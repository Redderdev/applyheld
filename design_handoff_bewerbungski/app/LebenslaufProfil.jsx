/* ============================================================
   BewerbungsKI — Lebenslauf + Profil
   ============================================================ */
function Lebenslauf() {
  const { resume, setResume } = useStore();
  const toast = useToast();
  const [hasResume, setHasResume] = React.useState(true);
  const [dragging, setDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [accordion, setAccordion] = React.useState(false);
  const fileRef = React.useRef(null);

  const doUpload = () => {
    setUploading(true); setDragging(false);
    setTimeout(() => { setUploading(false); setHasResume(true); toast("Lebenslauf erfolgreich hochgeladen", "success"); }, 1500);
  };

  return (
    <AppShell active="lebenslauf" title="Lebenslauf">
      <div className="page" style={{ maxWidth: 820 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 className="h1" style={{ marginBottom: 6 }}>Dein Lebenslauf</h2>
          <p className="muted" style={{ fontSize: 15 }}>Die KI nutzt deinen Lebenslauf, um Anschreiben mit deiner echten Erfahrung zu personalisieren.</p>
        </div>

        {/* Upload zone */}
        {!hasResume || uploading ? (
          <div className="card" style={{ padding: 8 }}>
            <label
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); doUpload(); }}
              onClick={() => !uploading && doUpload()}
              style={{ display: "block", border: `2px dashed ${dragging ? "var(--accent-500)" : "var(--border-strong)"}`, borderRadius: 12, padding: "56px 24px", textAlign: "center", cursor: "pointer", background: dragging ? "var(--accent-50)" : "transparent", transition: "all .16s" }}>
              {uploading ? (
                <div className="col center gap-12">
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--accent-50)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="typing"><span></span><span></span><span></span></span>
                  </div>
                  <b style={{ fontSize: 16 }}>Wird hochgeladen & analysiert…</b>
                  <span className="muted" style={{ fontSize: 13.5 }}>Text wird extrahiert</span>
                </div>
              ) : (
                <div className="col center gap-12">
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--navy-50)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="upload" size={26} style={{ color: "var(--navy-600)" }} />
                  </div>
                  <b style={{ fontSize: 16.5 }}>Ziehe deinen Lebenslauf hierher</b>
                  <span className="muted" style={{ fontSize: 14 }}>oder <span style={{ color: "var(--navy-700)", fontWeight: 600 }}>klicke zum Hochladen</span></span>
                  <span style={{ fontSize: 12.5, color: "var(--ink-400)", marginTop: 4 }}>PDF oder DOCX · max. 5 MB</span>
                </div>
              )}
            </label>
          </div>
        ) : (
          <div className="fade-only col gap-16">
            <div className="card card-pad" style={{ padding: 20 }}>
              <div className="row spread wrap gap-16" style={{ alignItems: "flex-start" }}>
                <div className="row gap-14" style={{ alignItems: "center" }}>
                  <div style={{ width: 48, height: 56, borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: "none", position: "relative" }}>
                    <Icon name="file" size={22} style={{ color: "#dc2626" }} />
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#dc2626", marginTop: 1 }}>PDF</span>
                  </div>
                  <div className="col gap-4">
                    <b style={{ fontSize: 15.5 }}>{resume.filename}</b>
                    <div className="row center gap-12" style={{ fontSize: 13, color: "var(--ink-500)" }} className="tabular">
                      <span className="row center gap-6"><Icon name="calendar" size={14} style={{ color: "var(--ink-400)" }} />{window.fmtDate(resume.uploaded)}</span>
                      <span>·</span><span>{resume.size}</span><span>·</span>
                      <span className="row center gap-6"><Icon name="doc" size={14} style={{ color: "var(--ink-400)" }} />{resume.chars.toLocaleString("de-DE")} Zeichen</span>
                    </div>
                  </div>
                </div>
                <div className="row center gap-8">
                  <button className="btn btn-secondary btn-sm" onClick={() => { setHasResume(false); }}><Icon name="refresh" size={15} />Ersetzen</button>
                  <button className="icon-btn" onClick={() => toast("Lebenslauf entfernt", "success")}><Icon name="trash" size={16} /></button>
                </div>
              </div>
              <div className="row center gap-8" style={{ marginTop: 14, padding: "10px 12px", background: "var(--st-accepted-bg)", borderRadius: 8, fontSize: 13, color: "var(--st-accepted-fg)" }}>
                <Icon name="checkCircle" size={16} style={{ flex: "none" }} />Text erfolgreich extrahiert – bereit für KI-Anschreiben.
              </div>
            </div>

            {/* Accordion preview */}
            <div className="card" style={{ overflow: "hidden" }}>
              <button className="row center spread" style={{ width: "100%", padding: "16px 20px", border: "none", background: "transparent", cursor: "pointer" }} onClick={() => setAccordion(a => !a)}>
                <span className="row center gap-10"><Icon name="eye" size={18} style={{ color: "var(--ink-500)" }} /><b style={{ fontSize: 15 }}>Extrahierter Text</b></span>
                <Icon name="chevDown" size={18} style={{ color: "var(--ink-400)", transform: accordion ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
              </button>
              {accordion && (
                <div className="fade-only" style={{ padding: "0 20px 20px" }}>
                  <div style={{ background: "var(--bg-soft)", borderRadius: 8, padding: "18px 20px", whiteSpace: "pre-wrap", fontFamily: "var(--mono)", fontSize: 12.5, lineHeight: 1.7, color: "var(--ink-700)", maxHeight: 320, overflow: "auto" }}>
                    {resume.text}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="row center gap-10" style={{ marginTop: 20, padding: "14px 16px", background: "var(--navy-50)", borderRadius: 10, fontSize: 13.5, color: "var(--navy-800)" }}>
          <Icon name="shield" size={18} style={{ flex: "none", color: "var(--navy-600)" }} />
          <span>Dein Lebenslauf wird verschlüsselt gespeichert und niemals an Dritte weitergegeben. Server in der EU, DSGVO-konform.</span>
        </div>
      </div>
    </AppShell>
  );
}

function Profil() {
  const { profile, setProfile } = useStore();
  const toast = useToast();
  const [form, setForm] = React.useState({ ...profile });
  const [saving, setSaving] = React.useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const dirty = JSON.stringify(form) !== JSON.stringify(profile);
  const save = () => {
    setSaving(true);
    setTimeout(() => { setProfile(form); setSaving(false); toast("Profil gespeichert", "success"); }, 800);
  };
  const Field = ({ label, k, placeholder, type = "text", icon, half }) => (
    <div className="field" style={half ? { flex: 1 } : {}}>
      <label className="label">{label}</label>
      {icon ? (
        <div className="input-icon"><Icon name={icon} size={16} /><input className="input" type={type} placeholder={placeholder} value={form[k]} onChange={e => set(k, e.target.value)} /></div>
      ) : (
        <input className="input" type={type} placeholder={placeholder} value={form[k]} onChange={e => set(k, e.target.value)} />
      )}
    </div>
  );
  return (
    <AppShell active="profil" title="Profil">
      <div className="page" style={{ maxWidth: 720 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 className="h1" style={{ marginBottom: 6 }}>Profil</h2>
          <p className="muted" style={{ fontSize: 15 }}>Diese Angaben verwenden wir als Absenderadresse in deinen PDF-Anschreiben.</p>
        </div>

        <div className="card card-pad" style={{ padding: 26 }}>
          <div className="row center gap-14" style={{ marginBottom: 24 }}>
            <div className="avatar lg" style={{ width: 56, height: 56, fontSize: 19 }}>{window.initials(form.name || "M M")}</div>
            <div className="col">
              <b style={{ fontSize: 16 }}>{form.name || "Dein Name"}</b>
              <span className="muted" style={{ fontSize: 13.5 }}>{form.email}</span>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ marginLeft: "auto" }}><Icon name="edit" size={15} />Foto ändern</button>
          </div>

          <div className="divider" style={{ marginBottom: 22 }}></div>

          <div className="col gap-16">
            <Field label="Name" k="name" placeholder="Max Mustermann" icon="user" />
            <div className="row gap-12 form-row">
              <Field label="E-Mail" k="email" placeholder="max@email.de" type="email" icon="mail" half />
              <Field label="Telefon" k="phone" placeholder="+49 …" type="tel" icon="phone" half />
            </div>
            <Field label="Straße & Hausnummer" k="street" placeholder="Musterstraße 12" icon="home" />
            <div className="row gap-12 form-row">
              <div className="field" style={{ flex: "0 0 140px" }}><label className="label">PLZ</label><input className="input" placeholder="10115" value={form.zip} onChange={e => set("zip", e.target.value)} /></div>
              <Field label="Ort" k="city" placeholder="Berlin" half />
            </div>
          </div>

          <div className="row center gap-10" style={{ marginTop: 22, padding: "12px 14px", background: "var(--navy-50)", borderRadius: 10, fontSize: 13.5, color: "var(--navy-800)" }}>
            <Icon name="info" size={17} style={{ flex: "none", color: "var(--navy-600)" }} />
            <span>Diese Daten werden im PDF-Anschreiben als Absenderadresse in der Kopfzeile verwendet.</span>
          </div>

          <div className="divider" style={{ margin: "22px 0 18px" }}></div>
          <div className="row center spread">
            <span className="muted" style={{ fontSize: 13 }}>{dirty ? "Ungespeicherte Änderungen" : "Alle Änderungen gespeichert"}</span>
            <button className="btn btn-primary" disabled={!dirty || saving} onClick={save}>
              {saving ? <span className="typing"><span></span><span></span><span></span></span> : <><Icon name="check" size={17} />Speichern</>}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

Object.assign(window, { Lebenslauf, Profil });
