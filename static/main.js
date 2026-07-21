// Gemeinsame Hilfsfunktionen – werden in allen Templates genutzt

// ── CSRF ─────────────────────────────────────────────────────────────────────
// Haengt das Token automatisch an alle veraendernden fetch()-Aufrufe an, damit
// nicht jede einzelne Aufrufstelle daran denken muss.
(function () {
  const meta = document.querySelector('meta[name="csrf-token"]');
  if (!meta || !window.fetch) return;
  const TOKEN = meta.getAttribute('content');
  const SAFE = /^(GET|HEAD|OPTIONS|TRACE)$/i;
  const origFetch = window.fetch.bind(window);

  window.fetch = function (input, init) {
    init = init || {};
    const method = (init.method || (input instanceof Request ? input.method : 'GET') || 'GET');
    if (SAFE.test(method)) return origFetch(input, init);

    // Nur an eigene Requests anhaengen — Token niemals an Fremdhosts senden
    let url = (input instanceof Request) ? input.url : String(input);
    try {
      if (new URL(url, location.href).origin !== location.origin) {
        return origFetch(input, init);
      }
    } catch (e) { /* relative URL -> gleiche Origin */ }

    const headers = new Headers(init.headers ||
      (input instanceof Request ? input.headers : undefined));
    if (!headers.has('X-CSRFToken')) headers.set('X-CSRFToken', TOKEN);
    return origFetch(input, Object.assign({}, init, { headers: headers }));
  };
})();

// Haupt-Navigation ein-/ausklappen (mehr Platz für Inhalt, z.B. CV-Editor)
function toggleNav() {
  const collapsed = document.body.classList.toggle('nav-collapsed');
  try { localStorage.setItem('nav_collapsed', collapsed ? '1' : ''); } catch (e) {}
}

// Konto-Menü unten in der Sidebar (Einstellungen / Abmelden)
function toggleUserMenu(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('user-menu');
  const btn  = document.getElementById('user-chip-btn');
  if (!menu || !btn) return;
  const open = menu.hidden;
  menu.hidden = !open;
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
}

// Klick außerhalb / Escape schließt das Konto-Menü
document.addEventListener('click', function (e) {
  const account = document.getElementById('account');
  const menu    = document.getElementById('user-menu');
  const btn     = document.getElementById('user-chip-btn');
  if (!account || !menu || menu.hidden) return;
  if (!account.contains(e.target)) {
    menu.hidden = true;
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
});

document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  const menu = document.getElementById('user-menu');
  const btn  = document.getElementById('user-chip-btn');
  if (menu && !menu.hidden) {
    menu.hidden = true;
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
});
