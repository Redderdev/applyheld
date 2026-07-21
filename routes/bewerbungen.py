import re
import socket
import ipaddress
from urllib.parse import urlparse, urljoin

from flask import request, jsonify, send_file, redirect, url_for
from flask_login import login_required, current_user
from app import app
from db import get_db, get_setting, _PG
from services.pdf import _build_pdf
from constants import STATUS_OPTIONS

try:
    import requests as http_requests
    from bs4 import BeautifulSoup
    _SCRAPE_OK = True
except ImportError:
    _SCRAPE_OK = False


def _clean_status(value):
    """Nur bekannte Status zulassen — sonst 'Entwurf'."""
    return value if value in STATUS_OPTIONS else 'Entwurf'


def _url_is_safe(url):
    """SSRF-Schutz: nur http(s) auf öffentliche IPs — blockt localhost,
    private Netze, Link-Local (Cloud-Metadaten 169.254.x.x) etc."""
    try:
        p = urlparse(url)
        if p.scheme not in ('http', 'https') or not p.hostname:
            return False
        for info in socket.getaddrinfo(p.hostname, None):
            ip = ipaddress.ip_address(info[4][0])
            if (ip.is_private or ip.is_loopback or ip.is_link_local
                    or ip.is_reserved or ip.is_multicast or ip.is_unspecified):
                return False
        return True
    except Exception:
        return False


# ── URL extraction ─────────────────────────────────────────────────────────────

@app.route('/api/extract-url', methods=['POST'])
@login_required
def extract_url():
    data = request.get_json()
    url  = (data.get('url') or '').strip()

    if not url:
        return jsonify({'error': 'URL fehlt'}), 400
    if not _SCRAPE_OK:
        return jsonify({'error': 'URL-Extraktion nicht verfügbar'}), 500
    if not _url_is_safe(url):
        return jsonify({'error': 'Diese URL ist nicht erlaubt.'}), 400

    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        # Redirects manuell folgen und jedes Ziel erneut prüfen (SSRF via Redirect)
        resp = http_requests.get(url, headers=headers, timeout=12, allow_redirects=False)
        hops = 0
        while resp.is_redirect and hops < 3:
            nxt = urljoin(resp.url, resp.headers.get('Location', ''))
            if not _url_is_safe(nxt):
                return jsonify({'error': 'Diese URL ist nicht erlaubt.'}), 400
            resp = http_requests.get(nxt, headers=headers, timeout=12, allow_redirects=False)
            hops += 1
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, 'html.parser')
        for tag in soup(['nav', 'header', 'footer', 'script', 'style', 'aside', 'iframe']):
            tag.decompose()

        title      = (soup.find('title') or soup.find('h1'))
        title_text = title.get_text(strip=True) if title else ''

        raw = soup.get_text(separator='\n', strip=True)
        raw = re.sub(r'\n{3,}', '\n\n', raw)

        return jsonify({'success': True, 'text': raw[:6000], 'title': title_text})
    except Exception as e:
        return jsonify({'error': f'Seite konnte nicht geladen werden: {str(e)}'}), 500


# ── Bewerbungen CRUD ───────────────────────────────────────────────────────────

@app.route('/api/save', methods=['POST'])
@login_required
def save():
    data   = request.get_json()
    uid    = current_user.id
    conn   = get_db()
    params = (uid, data.get('firma', ''), data.get('stelle', ''), data.get('url', ''),
              data.get('stellenanzeige', ''), data.get('anschreiben', ''),
              _clean_status(data.get('status', 'Entwurf')), data.get('notizen', ''),
              data.get('datum_gesendet') or None)
    if _PG:
        cur = conn.execute(
            'INSERT INTO bewerbungen (user_id, firma, stelle, url, stellenanzeige, anschreiben, status, notizen, datum_gesendet)'
            ' VALUES (?,?,?,?,?,?,?,?,?) RETURNING id', params
        )
        bid = cur.fetchone()['id']
    else:
        cur = conn.execute(
            'INSERT INTO bewerbungen (user_id, firma, stelle, url, stellenanzeige, anschreiben, status, notizen, datum_gesendet)'
            ' VALUES (?,?,?,?,?,?,?,?,?)', params
        )
        bid = cur.lastrowid
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'id': bid})


@app.route('/api/update/<int:bid>', methods=['POST'])
@login_required
def update(bid):
    data = request.get_json()
    conn = get_db()
    conn.execute(
        '''UPDATE bewerbungen SET firma=?, stelle=?, url=?, stellenanzeige=?,
           anschreiben=?, status=?, notizen=?, datum_gesendet=?
           WHERE id=? AND user_id=?''',
        (data.get('firma', ''), data.get('stelle', ''), data.get('url', ''),
         data.get('stellenanzeige', ''), data.get('anschreiben', ''),
         _clean_status(data.get('status', 'Entwurf')), data.get('notizen', ''),
         data.get('datum_gesendet') or None, bid, current_user.id)
    )
    conn.commit()
    conn.close()
    return jsonify({'success': True})


@app.route('/api/update-status/<int:bid>', methods=['POST'])
@login_required
def update_status(bid):
    data   = request.get_json()
    status = data.get('status', '')
    if status not in STATUS_OPTIONS:
        return jsonify({'error': 'Ungültiger Status'}), 400
    conn = get_db()
    conn.execute('UPDATE bewerbungen SET status = ? WHERE id = ? AND user_id = ?',
                 (status, bid, current_user.id))
    conn.commit()
    conn.close()
    return jsonify({'success': True})


@app.route('/api/delete/<int:bid>', methods=['POST'])
@login_required
def delete(bid):
    conn = get_db()
    conn.execute('DELETE FROM bewerbungen WHERE id = ? AND user_id = ?', (bid, current_user.id))
    conn.commit()
    conn.close()
    return jsonify({'success': True})


# ── Anschreiben PDF export ─────────────────────────────────────────────────────

@app.route('/bewerbung/<int:bid>/pdf')
@login_required
def export_pdf(bid):
    conn = get_db()
    row  = conn.execute(
        'SELECT * FROM bewerbungen WHERE id = ? AND user_id = ?', (bid, current_user.id)
    ).fetchone()
    conn.close()
    if not row:
        return 'Nicht gefunden', 404

    b    = dict(row)
    s    = {k: get_setting(k) for k in ['name', 'email', 'telefon', 'strasse', 'plz_ort', 'ort']}
    buf  = _build_pdf(b, s)
    safe = re.sub(r'[^\w\-.]', '_', f"Anschreiben_{b['firma']}_{b['stelle']}")
    return send_file(buf, as_attachment=True, download_name=f'{safe}.pdf',
                     mimetype='application/pdf')
