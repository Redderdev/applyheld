import re
import base64
import difflib
import urllib.parse
from datetime import datetime, timezone

from flask import request, jsonify
from flask_login import login_required, current_user
from app import app
from db import get_setting
from constants import COMMON_JOB_TITLES
from services.sanitize import clean_html, has_markup

try:
    import requests as http_requests
    _REQUESTS_OK = True
except ImportError:
    _REQUESTS_OK = False

_BA_JOBS_URL   = 'https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs'
_BA_DETAIL_URL = 'https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobdetails/{}'
_BA_HEADERS    = {'X-API-Key': 'jobboerse-jobsuche', 'User-Agent': 'ApplyHeld/1.0'}


def _safe_url(url):
    """Nur http(s) durchlassen. Verhindert javascript:/data:-Links, die aus
    arbeitgeber-gelieferten Feldern (BA externeUrl) stammen koennen."""
    u = (url or '').strip()
    if not u:
        return ''
    try:
        scheme = urllib.parse.urlparse(u).scheme.lower()
    except ValueError:
        return ''
    return u if scheme in ('http', 'https') else ''


def _format_job_age(iso_str):
    if not iso_str:
        return '', 9999
    try:
        dt = datetime.fromisoformat(iso_str.replace('Z', '+00:00'))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        delta = (datetime.now(timezone.utc) - dt).days
        if delta <= 0:   label = 'heute'
        elif delta == 1: label = 'gestern'
        elif delta < 7:  label = f'vor {delta} Tagen'
        elif delta < 30: label = f'vor {delta // 7} Wo.'
        else:            label = f'vor {delta // 30} Mon.'
        return label, delta
    except Exception:
        return '', 9999


# ── Adzuna job search ──────────────────────────────────────────────────────────

@app.route('/api/jobs/search')
@login_required
def jobs_search():
    if not _REQUESTS_OK:
        return jsonify({'error': 'requests-Bibliothek fehlt'}), 500

    import os
    stelle     = request.args.get('stelle', '').strip()
    ort        = request.args.get('ort', '').strip()
    umkreis    = request.args.get('umkreis', '25')
    alter      = request.args.get('alter', '').strip()
    sortierung = request.args.get('sortierung', 'date').strip()
    page       = max(1, request.args.get('page', 1, type=int) or 1)

    if not stelle:
        return jsonify({'error': 'Bitte eine Stelle eingeben.'}), 400

    app_id  = os.environ.get('ADZUNA_APP_ID') or get_setting('adzuna_app_id')
    app_key = os.environ.get('ADZUNA_APP_KEY') or get_setting('adzuna_app_key')
    if not app_id or not app_key:
        return jsonify({'error': 'Adzuna API-Key nicht konfiguriert.'}), 400

    sort_by = sortierung if sortierung in ('relevance', 'date', 'salary') else 'date'
    params  = {
        'app_id':           app_id,
        'app_key':          app_key,
        'results_per_page': 50,
        'what_and':         stelle,
        'sort_by':          sort_by,
    }
    if alter:
        try:
            params['max_days_old'] = int(alter)
        except ValueError:
            pass
    if ort:
        params['where'] = ort
        try:
            params['distance'] = int(umkreis)
        except ValueError:
            params['distance'] = 25

    try:
        resp = http_requests.get(
            f'https://api.adzuna.com/v1/api/jobs/de/search/{page}',
            params=params, timeout=12,
            headers={'User-Agent': 'ApplyHeld/1.0'}
        )
        resp.raise_for_status()
        raw = resp.json()
    except Exception as e:
        app.logger.error('Adzuna: %s', e)
        return jsonify({'error': 'Die Jobsuche ist gerade nicht erreichbar.'}), 502

    jobs_out = []
    for r in raw.get('results', []):
        created = r.get('created', '')
        age, age_days = _format_job_age(created)

        desc      = r.get('description', '')
        desc      = re.sub(r'<[^>]+>', ' ', desc)
        desc      = re.sub(r'\s+', ' ', desc).strip()
        full_desc = desc
        desc      = desc[:220] + '…' if len(desc) > 220 else desc

        sal_min = r.get('salary_min')
        sal_max = r.get('salary_max')
        salary  = ''
        if sal_min and sal_max:
            salary = f'{int(sal_min):,} – {int(sal_max):,} €'
        elif sal_min:
            salary = f'ab {int(sal_min):,} €'

        jobs_out.append({
            'title':       r.get('title', ''),
            'company':     r.get('company', {}).get('display_name', ''),
            'location':    r.get('location', {}).get('display_name', ''),
            'url':         _safe_url(r.get('redirect_url', '')),
            'age':         age,
            'age_days':    age_days,
            'description': desc,
            'full_desc':   full_desc,
            'salary':      salary,
            'contract':    r.get('contract_type', ''),
        })

    total       = raw.get('count', 0)
    suggestions = []
    if total == 0:
        titles_lower = {t.lower(): t for t in COMMON_JOB_TITLES}
        matches      = difflib.get_close_matches(stelle.lower(), titles_lower.keys(), n=4, cutoff=0.4)
        suggestions  = [titles_lower[m] for m in matches]

    return jsonify({'success': True, 'jobs': jobs_out, 'total': total,
                    'page': page, 'suggestions': suggestions})


# ── BA job search ──────────────────────────────────────────────────────────────

@app.route('/api/jobs/search-ba')
@login_required
def jobs_search_ba():
    if not _REQUESTS_OK:
        return jsonify({'error': 'requests-Bibliothek fehlt'}), 500

    stelle  = request.args.get('stelle', '').strip()
    ort     = request.args.get('ort', '').strip()
    umkreis = request.args.get('umkreis', '25')
    alter   = request.args.get('alter', '')
    page    = max(1, request.args.get('page', 1, type=int) or 1)

    if not stelle:
        return jsonify({'error': 'Bitte eine Stelle eingeben.'}), 400

    params = {'was': stelle, 'page': page, 'size': 50}
    if ort:
        params['wo'] = ort
        try:
            params['umkreis'] = int(umkreis)
        except ValueError:
            params['umkreis'] = 25
    if alter:
        try:
            params['veroeffentlichtseit'] = int(alter)
        except ValueError:
            pass

    try:
        resp = http_requests.get(_BA_JOBS_URL, params=params, headers=_BA_HEADERS, timeout=15)
        if not resp.ok:
            body = resp.text[:400]
            app.logger.error('BA API %s: %s', resp.status_code, body)
            return jsonify({'error': 'Die Jobsuche ist gerade nicht erreichbar.'}), 502
        raw = resp.json()
    except Exception as e:
        app.logger.error('BA API request error: %s', e)
        return jsonify({'error': 'Die Jobsuche ist gerade nicht erreichbar.'}), 502

    items = raw.get('stellenangebote') or raw.get('stellenAngebote') or []
    if not items:
        app.logger.warning('BA API: no jobs in response. Keys: %s', list(raw.keys()))

    jobs_out = []
    for r in items:
        created       = r.get('aktuelleVeroeffentlichungsdatum', '')
        age, age_days = _format_job_age(created)

        arbeitsort = r.get('arbeitsort', {}) or {}
        loc_parts  = [arbeitsort.get('ort', ''), arbeitsort.get('region', '')]
        location   = ', '.join(p for p in loc_parts if p)

        modelle  = r.get('arbeitszeitmodelle', []) or []
        contract = ', '.join(modelle) if modelle else ''

        ref_nr      = r.get('refnr', '') or r.get('referenznummer', '')
        externe_url = r.get('externeUrl', '')
        encoded_ref = base64.b64encode(ref_nr.encode()).decode() if ref_nr else ''

        externe_url = _safe_url(externe_url)
        if externe_url:
            portal_url   = externe_url
            portal_label = 'Original öffnen'
        elif ref_nr:
            portal_url   = ('https://www.arbeitsagentur.de/jobsuche/suche?'
                            + urllib.parse.urlencode({'angebotsart': '1',
                                                      'was': r.get('titel', ''),
                                                      'wo':  arbeitsort.get('ort', '')}))
            portal_label = 'Auf BA.de suchen'
        else:
            portal_url   = ''
            portal_label = ''

        jobs_out.append({
            'title':        r.get('titel', ''),
            'company':      r.get('arbeitgeber', ''),
            'location':     location,
            'url':          portal_url,
            'portal_label': portal_label,
            'hash_id':      encoded_ref,
            'ref_nr':       ref_nr,
            'age':          age,
            'age_days':     age_days,
            'description':  '',
            'full_desc':    '',
            'salary':       '',
            'contract':     contract,
            'source':       'ba',
        })

    total       = raw.get('maxErgebnisse', 0)
    suggestions = []
    if total == 0:
        titles_lower = {t.lower(): t for t in COMMON_JOB_TITLES}
        matches      = difflib.get_close_matches(stelle.lower(), titles_lower.keys(), n=4, cutoff=0.4)
        suggestions  = [titles_lower[m] for m in matches]

    return jsonify({'success': True, 'jobs': jobs_out, 'total': total,
                    'page': page, 'suggestions': suggestions, 'source': 'ba'})


# ── BA job detail ──────────────────────────────────────────────────────────────

@app.route('/api/jobs/detail-ba/<hash_id>')
@login_required
def job_detail_ba(hash_id):
    if not _REQUESTS_OK:
        return jsonify({'error': 'requests-Bibliothek fehlt'}), 500
    # Nur Base64-Zeichen zulassen — hash_id wird in die BA-URL eingesetzt
    if not re.fullmatch(r'[A-Za-z0-9+/=_-]+', hash_id or ''):
        return jsonify({'error': 'Ungültige Job-Referenz'}), 400

    try:
        resp = http_requests.get(
            _BA_DETAIL_URL.format(hash_id),
            headers=_BA_HEADERS, timeout=12,
        )
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        app.logger.warning('BA detail: %s', e)
        return jsonify({'error': 'Die Stellenbeschreibung konnte nicht geladen werden.'}), 502

    raw_desc = (data.get('stellenangebotsBeschreibung')
                or data.get('stellenbeschreibung')
                or '')

    # Allowlist-Sanitisierung per Parser. Fremde Inhalte (von Arbeitgebern
    # eingestellte Anzeigen) landen im Client per innerHTML — Regex-Filterung
    # war umgehbar, siehe services/sanitize.py.
    desc = clean_html(raw_desc)

    return jsonify({'success': True, 'description': desc,
                    'is_html': has_markup(desc),
                    'salary': str(data.get('verguetung', '') or '')[:200]})
