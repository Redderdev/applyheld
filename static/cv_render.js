/* ═══════════════════════════════════════════════════════════════════════════
   ApplyHeld — gemeinsamer Lebenslauf-Renderer (EINE Quelle für Editor + PDF)

   Wichtig: Editor-Vorschau UND Druckseite laden diese Datei und rufen
   renderCV() auf. Dadurch ist die Vorschau exakt das, was im PDF landet
   (WYSIWYG). Vorher gab es zwei getrennte Render-Funktionen, die auseinander-
   liefen — das war die Ursache für "sieht in der Bearbeitung gut aus, im PDF
   verschoben".

   Nur EIN Layout: Minimal (einspaltig). Die früheren Vorlagen Klassisch/Modern
   wurden entfernt.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // A4 in CSS-Pixeln bei 96 dpi (CSS-mm ist fix: 96/25.4 px pro mm).
  var MM_TO_PX = 96 / 25.4;
  window.CV_A4 = {
    widthMM:  210,
    heightMM: 297,
    widthPx:  210 * MM_TO_PX,   // 793.70
    heightPx: 297 * MM_TO_PX    // 1122.52
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // break-inside:avoid = ein Eintrag wird nicht über den Seitenrand zerrissen
  var NOBREAK = 'break-inside:avoid;page-break-inside:avoid;';

  window.renderCV = function renderCV(cv) {
    cv = cv || {};
    var p = cv.personal || {};
    var ACC = cv.accentColor || '#0891b2';
    var html = '';

    // Wrapper = Seiten-Innenrand. 44px oben/unten, 52px seitlich.
    html += '<div class="cv-min" style="font-family:\'Helvetica Neue\',Arial,sans-serif;'
          + 'padding:44px 52px;color:#0f172a;font-size:10pt;line-height:1.55;">';

    // Kopf: Akzentbalken, Name, Kontakt, Profil
    html += '<div style="width:52px;height:4px;background:' + ACC + ';border-radius:2px;margin-bottom:22px;"></div>';
    html += '<h1 style="font-size:26pt;font-weight:300;letter-spacing:-.025em;margin:0 0 5px;">'
          + esc(p.name || '') + '</h1>';

    var contact = [p.email, p.phone, p.city, p.linkedin].filter(Boolean).map(esc).join('  ·  ');
    if (contact) {
      html += '<p style="font-size:8.5pt;color:#64748b;margin:0 0 '
            + (cv.summary ? '10px' : '22px') + ';">' + contact + '</p>';
    }
    if (cv.summary) {
      html += '<p style="font-size:9.5pt;color:#475569;margin:0 0 22px;max-width:480px;'
            + 'line-height:1.65;font-style:italic;">' + esc(cv.summary) + '</p>';
    }
    html += '<div style="border-top:1px solid #e2e8f0;margin-bottom:22px;"></div>';

    function section(title, inner) {
      if (!inner) return '';
      return '<div style="margin-bottom:22px;">'
           + '<p style="font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.12em;'
           + 'color:' + ACC + ';margin:0 0 10px;">' + esc(title) + '</p>' + inner + '</div>';
    }

    // Berufserfahrung
    var expHtml = (cv.experience || []).map(function (e) {
      var period = e.current
        ? esc(e.start || '') + ' – heute'
        : esc(e.start || '') + (e.end ? ' – ' + esc(e.end) : '');
      var loc = e.location ? ', ' + esc(e.location) : '';
      var bullets = (e.bullets || []).filter(Boolean)
        .map(function (b) { return '<li style="color:#374151;margin-bottom:2px;">' + esc(b) + '</li>'; })
        .join('');
      return '<div style="display:grid;grid-template-columns:1fr 86pt;gap:8pt;margin-bottom:12px;' + NOBREAK + '">'
           + '<div><strong style="font-size:10.5pt;">' + esc(e.role || '') + '</strong><br>'
           + '<span style="font-size:9pt;color:#64748b;">' + esc(e.company || '') + loc + '</span>'
           + (bullets ? '<ul style="margin:5pt 0 0 16pt;padding:0;font-size:9pt;">' + bullets + '</ul>' : '')
           + '</div>'
           + '<div style="font-size:8pt;color:#94a3b8;text-align:right;padding-top:2pt;">' + period + '</div></div>';
    }).join('');
    html += section('Berufserfahrung', expHtml);

    // Ausbildung
    var eduHtml = (cv.education || []).map(function (e) {
      var period = esc(e.start || '') + (e.end ? ' – ' + esc(e.end) : '');
      var degree = [e.degree, e.field].filter(Boolean).join(', ');
      return '<div style="display:grid;grid-template-columns:1fr 86pt;gap:8pt;margin-bottom:10px;' + NOBREAK + '">'
           + '<div><strong>' + esc(degree) + '</strong><br>'
           + '<span style="font-size:9pt;color:#64748b;">' + esc(e.institution || '')
           + (e.grade ? ' · Note: ' + esc(e.grade) : '') + '</span></div>'
           + '<div style="font-size:8pt;color:#94a3b8;text-align:right;padding-top:2pt;">' + period + '</div></div>';
    }).join('');
    html += section('Ausbildung', eduHtml);

    // Kenntnisse
    var skills = (cv.skills || []).filter(Boolean);
    if (skills.length) {
      html += section('Kenntnisse', skills.map(function (s) {
        return '<span style="background:#f1f5f9;border-radius:3px;padding:2px 8px;font-size:9pt;'
             + 'margin:0 4px 4px 0;display:inline-block;">' + esc(s) + '</span>';
      }).join(''));
    }

    // Sprachen
    var langs = (cv.languages || []).filter(function (l) { return l.lang; });
    if (langs.length) {
      html += section('Sprachen', '<p style="font-size:9.5pt;">' + langs.map(function (l) {
        return esc(l.lang) + ' <span style="color:#64748b;">(' + esc(l.level || '') + ')</span>';
      }).join('  ·  ') + '</p>');
    }

    // Projekte
    var projects = (cv.projects || []).filter(function (pr) { return (pr.name || '').trim(); });
    if (projects.length) {
      html += section('Projekte', projects.map(function (pr) {
        return '<div style="margin-bottom:10px;' + NOBREAK + '">'
             + '<strong style="font-size:10pt;">' + esc(pr.name.trim()) + '</strong>'
             + (pr.description ? '<br><span style="font-size:9pt;color:#374151;line-height:1.55;">'
                 + esc(pr.description) + '</span>' : '') + '</div>';
      }).join(''));
    }

    // Zertifikate (getrimmt — verhindert leere Einträge aus Leerzeichen-Namen)
    var certs = (cv.certifications || []).filter(function (c) { return (c.name || '').trim(); });
    if (certs.length) {
      html += section('Zertifikate', certs.map(function (c) {
        return '<p style="margin-bottom:3px;font-size:9.5pt;">' + esc(c.name.trim())
             + (c.issuer ? ' – ' + esc(c.issuer) : '')
             + (c.year ? ' (' + esc(c.year) + ')' : '') + '</p>';
      }).join(''));
    }

    // Hobbys
    var hobbys = (cv.hobbys || []).filter(Boolean);
    if (hobbys.length) {
      html += section('Hobbys', '<p style="font-size:9.5pt;">' + hobbys.map(esc).join('  ·  ') + '</p>');
    }

    html += '</div>';
    return html;
  };
})();
