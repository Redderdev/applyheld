/* ============================================================
   BewerbungsKI — Global store + router context
   ============================================================ */
const StoreCtx = React.createContext(null);
const useStore = () => React.useContext(StoreCtx);

function StoreProvider({ children }) {
  const parseHash = () => {
    const h = (window.location.hash || "").replace(/^#\/?/, "");
    if (!h) return { name: "landing", params: {} };
    const [name, id] = h.split("/");
    return { name: name || "landing", params: id ? { id } : {} };
  };
  const [route, setRoute] = React.useState(parseHash);
  const [apps, setApps] = React.useState(() => window.APPLICATIONS.map(a => ({ ...a })));
  const [profile, setProfile] = React.useState({ ...window.SAMPLE_PROFILE });
  const [resume, setResume] = React.useState({ ...window.SAMPLE_RESUME });
  const [auth, setAuth] = React.useState(false);

  const navigate = React.useCallback((name, params = {}) => {
    setRoute({ name, params });
    const hash = "#" + name + (params.id ? "/" + params.id : "");
    if (window.location.hash !== hash) { try { history.replaceState(null, "", hash); } catch (e) {} }
    window.scrollTo(0, 0);
    const main = document.querySelector(".main");
    if (main) main.scrollTop = 0;
  }, []);

  const updateApp = React.useCallback((id, patch) => {
    setApps(list => list.map(a => a.id === id ? { ...a, ...patch } : a));
  }, []);
  const addApp = React.useCallback((app) => {
    const id = "a" + (Date.now());
    setApps(list => [{ id, ...app }, ...list]);
    return id;
  }, []);
  const removeApp = React.useCallback((id) => {
    setApps(list => list.filter(a => a.id !== id));
  }, []);
  const getApp = React.useCallback((id) => apps.find(a => a.id === id), [apps]);

  const value = { route, navigate, apps, setApps, updateApp, addApp, removeApp, getApp,
                  profile, setProfile, resume, setResume, auth, setAuth };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

/* ---------- App Shell (sidebar + topbar) for authenticated pages ---------- */
function AppShell({ active, title, topRight, children, wide }) {
  const { navigate, apps, profile } = useStore();
  const activeCount = apps.filter(a => !["angenommen","abgelehnt"].includes(a.status)).length;
  const navMain = [
    { key: "dashboard", label: "Dashboard", icon: "dashboard", route: "dashboard" },
    { key: "neu", label: "Neue Bewerbung", icon: "plus", route: "neu" },
    { key: "lebenslauf", label: "Lebenslauf", icon: "doc", route: "lebenslauf" },
  ];
  const navAccount = [
    { key: "profil", label: "Profil", icon: "user", route: "profil" },
    { key: "einstellungen", label: "Einstellungen", icon: "settings", route: "profil" },
  ];
  const NavItem = ({ item }) => (
    <a className={`nav-item ${active === item.key ? "active" : ""}`} onClick={() => navigate(item.route)}>
      <Icon name={item.icon} />
      {item.label}
      {item.key === "neu" ? null : (item.badge != null && <span className="nav-count">{item.badge}</span>)}
    </a>
  );
  navMain[0].badge = apps.length;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand" style={{ cursor: "pointer" }} onClick={() => navigate("dashboard")}>
          <Logo size={28} />
        </div>
        <nav className="nav-group">
          {navMain.map(i => <NavItem key={i.key} item={i} />)}
        </nav>
        <div className="nav-label">Konto</div>
        <nav className="nav-group">
          {navAccount.map(i => <NavItem key={i.key} item={i} />)}
        </nav>
        <div className="sidebar-foot">
          <div className="card-pad" style={{ background: "var(--navy-50)", borderRadius: "var(--r-md)", padding: 14, marginBottom: 12 }}>
            <div className="row center gap-8" style={{ marginBottom: 6 }}>
              <Icon name="zap" size={15} style={{ color: "var(--accent-600)" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--navy-800)" }}>Free-Plan</span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-500)", marginBottom: 10 }}>3 von 5 Bewerbungen genutzt</div>
            <div style={{ height: 6, background: "#fff", borderRadius: 99, overflow: "hidden", marginBottom: 11 }}>
              <div style={{ width: "60%", height: "100%", background: "linear-gradient(90deg,var(--accent-500),var(--accent-600))", borderRadius: 99 }}></div>
            </div>
            <button className="btn btn-primary btn-sm btn-block" onClick={() => navigate("pricing")}>Auf Pro upgraden</button>
          </div>
          <div className="user-chip" style={{ cursor: "pointer" }} onClick={() => navigate("profil")}>
            <div className="avatar">{window.initials(profile.name)}</div>
            <div className="col" style={{ minWidth: 0 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.name}</span>
              <span style={{ fontSize: 12, color: "var(--ink-500)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.email}</span>
            </div>
            <Icon name="settings" size={16} style={{ color: "var(--ink-400)", marginLeft: "auto" }} />
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="mobile-only"><Logo size={26} /></div>
          <div className="desktop-only row center gap-12" style={{ flex: 1 }}>
            <h1 style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-.01em" }}>{title}</h1>
          </div>
          <div className="row center gap-10" style={{ marginLeft: "auto" }}>
            {topRight}
            <button className="icon-btn desktop-only"><Icon name="bell" size={18} /></button>
          </div>
        </header>
        {children}
      </div>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        {[
          { key: "dashboard", label: "Dashboard", icon: "dashboard", route: "dashboard" },
          { key: "neu", label: "Neu", icon: "plus", route: "neu" },
          { key: "lebenslauf", label: "Lebenslauf", icon: "doc", route: "lebenslauf" },
          { key: "profil", label: "Profil", icon: "user", route: "profil" },
        ].map(i => (
          <a key={i.key} className={`bn-item ${active === i.key ? "active" : ""}`} onClick={() => navigate(i.route)}>
            <Icon name={i.icon} />{i.label}
          </a>
        ))}
      </nav>
    </div>
  );
}

Object.assign(window, { StoreProvider, useStore, AppShell, StoreCtx });
