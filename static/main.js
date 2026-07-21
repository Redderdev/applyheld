// Gemeinsame Hilfsfunktionen – werden in allen Templates genutzt

// Haupt-Navigation ein-/ausklappen (mehr Platz für Inhalt, z.B. CV-Editor)
function toggleNav() {
  const collapsed = document.body.classList.toggle('nav-collapsed');
  try { localStorage.setItem('nav_collapsed', collapsed ? '1' : ''); } catch (e) {}
}
