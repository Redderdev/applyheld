// Gemeinsame Hilfsfunktionen – werden in allen Templates genutzt

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
