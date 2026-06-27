/* ============================================================
   BewerbungsKI — Icons + shared components
   ============================================================ */
const { useState, useEffect, useRef, useCallback, createContext, useContext } = React;

/* ---------- Icon set (lucide-style, 1.75 stroke) ---------- */
const PATHS = {
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  doc: '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M5 21V5a2 2 0 0 1 2-2h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M5.5 21a7.5 7.5 0 0 1 13 0"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  sparkles: '<path d="M12 3l1.6 4.6L18 9l-4.4 1.4L12 15l-1.6-4.6L6 9l4.4-1.4z"/><path d="M19 14l.7 2 2 .7-2 .7L19 20l-.7-1.9-2-.7 2-.7z"/><path d="M5 14l.6 1.7 1.7.6-1.7.6L5 18.6l-.6-1.7L2.7 16l1.7-.6z"/>',
  chat: '<path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15l3-4 3 2 4-6"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  briefcase: '<rect x="2.5" y="7" width="19" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M2.5 12.5h19"/>',
  arrowRight: '<path d="M5 12h14M13 5l7 7-7 7"/>',
  arrowUpRight: '<path d="M7 17L17 7M8 7h9v9"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>',
  upload: '<path d="M12 17V5M7 10l5-5 5 5"/><path d="M5 21h14"/>',
  link: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>',
  trash: '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6"/><path d="M10 11v6M14 11v6"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="M3 6.5l9 6 9-6"/>',
  lock: '<rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mapPin: '<path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  home: '<path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/>',
  send: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  chevDown: '<path d="M6 9l6 6 6-6"/>',
  chevRight: '<path d="M9 6l6 6-6 6"/>',
  bold: '<path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z"/>',
  italic: '<path d="M19 4h-9M14 20H5M15 4L9 20"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  file: '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M5 21V5a2 2 0 0 1 2-2h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  google: '<path d="M21.35 11.1H12v3.8h5.35c-.24 1.3-.96 2.4-2.04 3.13v2.6h3.3c1.93-1.78 3.04-4.4 3.04-7.53 0-.7-.06-1.37-.18-2z" fill="#4285F4" stroke="none"/><path d="M12 22c2.7 0 4.96-.9 6.6-2.42l-3.3-2.6c-.9.6-2.06.97-3.3.97-2.54 0-4.7-1.72-5.47-4.03H3.1v2.6A9.99 9.99 0 0 0 12 22z" fill="#34A853" stroke="none"/><path d="M6.53 13.92a6 6 0 0 1 0-3.84v-2.6H3.1a10 10 0 0 0 0 9.04l3.43-2.6z" fill="#FBBC05" stroke="none"/><path d="M12 6.58c1.47 0 2.78.5 3.82 1.5l2.85-2.85C16.96 3.6 14.7 2.7 12 2.7A9.99 9.99 0 0 0 3.1 7.48l3.43 2.6C7.3 8.3 9.46 6.58 12 6.58z" fill="#EA4335" stroke="none"/>',
  trendUp: '<path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/>',
  handshake: '<path d="M11 17l2 2a1 1 0 0 0 1.4 0l3-3"/><path d="M14 14l2.5 2.5a1 1 0 0 0 1.4 0L21 13l-3-7-4 1-2-1-7 2"/><path d="M3 6l3 7 3-3"/>',
  shield: '<path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/>',
  zap: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  star: '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8 6.8 19l1-5.8L3.5 9.1l5.9-.9z"/>',
  filter: '<path d="M3 5h18M6 12h12M10 19h4"/>',
  moreH: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
  paperclip: '<path d="M21 11.5l-8.5 8.5a5 5 0 0 1-7-7l8.5-8.5a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3l7.8-7.8"/>',
};
function Icon({ name, size, style, className, strokeWidth }) {
  const s = size || 20;
  const colored = name === "google";
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke={colored ? "none" : "currentColor"} strokeWidth={strokeWidth || 1.75}
      strokeLinecap="round" strokeLinejoin="round" style={style} className={className}
      dangerouslySetInnerHTML={{ __html: PATHS[name] || "" }} />
  );
}

/* ---------- Logo ---------- */
function LogoMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="var(--navy-700)"/>
      <text x="15" y="22.5" textAnchor="middle" fill="#fff" style={{ fontFamily: "Geist, Inter, sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: "-.04em" }}>B</text>
      <circle cx="24" cy="9" r="4.2" fill="var(--accent-500)"/>
      <path d="M24 6.1l.6 1.9 1.9.6-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.6z" fill="#fff"/>
    </svg>
  );
}
function Logo({ size = 30, hideText = false, light = false }) {
  return (
    <div className="row center gap-10">
      <LogoMark size={size} />
      {!hideText && (
        <span style={{ fontSize: size*.62, fontWeight: 680, letterSpacing: "-.02em", color: light ? "#fff" : "var(--navy-900)" }}>
          Bewerbungs<span style={{ color: "var(--accent-600)" }}>KI</span>
        </span>
      )}
    </div>
  );
}

/* ---------- Badge ---------- */
function StatusBadge({ status }) {
  const s = window.STATUS[status];
  if (!s) return null;
  return <span className={`badge ${s.cls}`}><span className="dot"></span>{s.label}</span>;
}

/* ---------- Toast system ---------- */
const ToastCtx = createContext(null);
function useToast() { return useContext(ToastCtx); }
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span className="ticn"><Icon name={t.type === "error" ? "x" : t.type === "info" ? "info" : "check"} size={13} /></span>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------- Company logo block ---------- */
function CompanyLogo({ company, idx = 0, size = 36 }) {
  const color = window.LOGO_COLORS[idx % window.LOGO_COLORS.length];
  return (
    <div className="company-logo" style={{ background: color, width: size, height: size, borderRadius: size*.25, fontSize: size*.4 }}>
      {window.companyInitial(company)}
    </div>
  );
}

Object.assign(window, { Icon, Logo, LogoMark, StatusBadge, ToastProvider, useToast, CompanyLogo,
  React_useState: useState, React_useEffect: useEffect, React_useRef: useRef });
