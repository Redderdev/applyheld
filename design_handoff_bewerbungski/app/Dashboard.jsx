/* ============================================================
   BewerbungsKI — Dashboard
   ============================================================ */
function StatCard({ icon, color, bg, val, label, trend, trendColor }) {
  return (
    <div className="stat fade-in">
      <div className="stat-icn" style={{ background: bg }}><Icon name={icon} size={19} style={{ color }} /></div>
      <div className="stat-val">{val}</div>
      <div className="row center spread">
        <div className="stat-lbl">{label}</div>
        {trend && <span className="stat-trend" style={{ color: trendColor }}>{trend}</span>}
      </div>
    </div>
  );
}

function Dashboard() {
  const { apps, navigate, removeApp, profile } = useStore();
  const toast = useToast();
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState("alle");
  const [menuOpen, setMenuOpen] = React.useState(null);

  const stats = {
    total: apps.length,
    active: apps.filter(a => !["angenommen","abgelehnt","entwurf"].includes(a.status)).length,
    interviews: apps.filter(a => ["telefon","persoenlich"].includes(a.status)).length,
    accepted: apps.filter(a => a.status === "angenommen").length,
  };

  const filtered = apps.filter(a => {
    const q = query.toLowerCase();
    const matchQ = !q || a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q) || a.location.toLowerCase().includes(q);
    const matchF = filter === "alle"
      || (filter === "aktiv" && !["angenommen","abgelehnt"].includes(a.status))
      || filter === a.status;
    return matchQ && matchF;
  });

  const filterTabs = [
    { key: "alle", label: "Alle", count: apps.length },
    { key: "aktiv", label: "Aktiv", count: apps.filter(a => !["angenommen","abgelehnt"].includes(a.status)).length },
    { key: "entwurf", label: "Entwürfe", count: apps.filter(a => a.status === "entwurf").length },
    { key: "angebot", label: "Angebote", count: apps.filter(a => a.status === "angebot").length },
  ];

  const firstName = profile.name.split(" ")[0];
  const hour = 9;
  const greet = hour < 11 ? "Guten Morgen" : hour < 18 ? "Hallo" : "Guten Abend";

  return (
    <AppShell active="dashboard" title="Dashboard"
      topRight={<button className="btn btn-primary btn-sm desktop-only" onClick={() => navigate("neu")}><Icon name="plus" size={16} />Neue Bewerbung</button>}>
      <div className="page">
        {/* Greeting */}
        <div className="row center spread wrap gap-12" style={{ marginBottom: 24 }}>
          <div>
            <h2 className="h1" style={{ marginBottom: 4 }}>{greet}, {firstName} 👋</h2>
            <p className="muted" style={{ fontSize: 15 }}>Du hast <b style={{ color: "var(--ink-700)" }}>{stats.active} aktive Bewerbungen</b> und {stats.interviews} anstehende Gespräche.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="stat-grid" style={{ marginBottom: 28 }}>
          <StatCard icon="briefcase" color="var(--navy-700)" bg="var(--navy-50)" val={stats.total} label="Bewerbungen gesamt" trend="+3 diese Woche" trendColor="var(--st-accepted-fg)" />
          <StatCard icon="clock" color="var(--accent-600)" bg="var(--accent-50)" val={stats.active} label="Aktiv im Prozess" />
          <StatCard icon="chat" color="#c2410c" bg="var(--st-onsite-bg)" val={stats.interviews} label="Gespräche" trend="2 anstehend" trendColor="var(--st-onsite-fg)" />
          <StatCard icon="handshake" color="var(--st-accepted-fg)" bg="var(--st-accepted-bg)" val={stats.accepted} label="Angenommen" />
        </div>

        {/* Toolbar */}
        <div className="row center spread wrap gap-12" style={{ marginBottom: 16 }}>
          <div className="row center gap-6 wrap">
            {filterTabs.map(t => (
              <button key={t.key} className="chip" onClick={() => setFilter(t.key)}
                style={filter === t.key ? { borderColor: "var(--navy-700)", background: "var(--navy-700)", color: "#fff" } : {}}>
                {t.label}<span style={{ opacity: .65, fontVariantNumeric: "tabular-nums" }}>{t.count}</span>
              </button>
            ))}
          </div>
          <div className="input-icon" style={{ width: 240, maxWidth: "100%" }}>
            <Icon name="search" size={17} />
            <input className="input btn-sm" style={{ height: 38, paddingLeft: 36 }} placeholder="Firma oder Stelle suchen…" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <EmptyState query={query} onReset={() => { setQuery(""); setFilter("alle"); }} />
        ) : (
          <div className="tbl-wrap fade-only desktop-only">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Firma & Stelle</th>
                  <th>Standort</th>
                  <th>Beworben</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, idx) => (
                  <tr key={a.id} onClick={() => navigate("detail", { id: a.id })}>
                    <td>
                      <div className="company-cell">
                        <CompanyLogo company={a.company} idx={apps.indexOf(a)} />
                        <div className="col">
                          <b style={{ fontSize: 14.5 }}>{a.company}</b>
                          <span style={{ fontSize: 13, color: "var(--ink-500)" }}>{a.role}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="row center gap-6" style={{ fontSize: 14, color: "var(--ink-700)" }}><Icon name="mapPin" size={15} style={{ color: "var(--ink-400)" }} />{a.location}</span></td>
                    <td><span style={{ fontSize: 14, color: "var(--ink-700)" }} className="tabular">{window.relDate(a.date)}</span></td>
                    <td><StatusBadge status={a.status} /></td>
                    <td>
                      <div className="row" style={{ justifyContent: "flex-end" }}>
                        <div className="row-actions" onClick={e => e.stopPropagation()}>
                          <button className="icon-btn" title="Öffnen" onClick={() => navigate("detail", { id: a.id })}><Icon name="edit" size={16} /></button>
                          <button className="icon-btn" title="PDF" onClick={() => toast("PDF wird heruntergeladen…", "info")}><Icon name="download" size={16} /></button>
                          <button className="icon-btn" title="Löschen" onClick={() => { removeApp(a.id); toast("Bewerbung gelöscht", "success"); }}><Icon name="trash" size={16} /></button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile cards */}
        {filtered.length > 0 && (
          <div className="mobile-only col gap-12">
            {filtered.map((a) => (
              <div key={a.id} className="card card-pad fade-only" style={{ padding: 16 }} onClick={() => navigate("detail", { id: a.id })}>
                <div className="row spread" style={{ alignItems: "flex-start", marginBottom: 12 }}>
                  <div className="company-cell">
                    <CompanyLogo company={a.company} idx={apps.indexOf(a)} />
                    <div className="col"><b style={{ fontSize: 15 }}>{a.company}</b><span style={{ fontSize: 13, color: "var(--ink-500)" }}>{a.role}</span></div>
                  </div>
                </div>
                <div className="row center spread">
                  <StatusBadge status={a.status} />
                  <span style={{ fontSize: 12.5, color: "var(--ink-400)" }} className="tabular">{window.relDate(a.date)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => navigate("neu")}><Icon name="plus" size={20} />Neue Bewerbung</button>
    </AppShell>
  );
}

function EmptyState({ query, onReset }) {
  return (
    <div className="card" style={{ padding: "56px 24px", textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--bg-soft)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
        <Icon name="search" size={28} style={{ color: "var(--ink-400)" }} />
      </div>
      <h3 className="h3" style={{ marginBottom: 8 }}>Keine Bewerbungen gefunden</h3>
      <p className="muted" style={{ marginBottom: 20, maxWidth: 340, margin: "0 auto 20px" }}>
        {query ? `Für „${query}" gibt es keine Treffer.` : "Für diesen Filter gibt es keine Einträge."}
      </p>
      <button className="btn btn-secondary btn-sm" onClick={onReset}><Icon name="refresh" size={16} />Filter zurücksetzen</button>
    </div>
  );
}

Object.assign(window, { Dashboard });
