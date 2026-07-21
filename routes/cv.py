import os
import io
import re
import json
import pdfplumber
import anthropic

try:
    from docx import Document as DocxDocument
    _DOCX_OK = True
except ImportError:
    _DOCX_OK = False

try:
    from xhtml2pdf import pisa
    _XHTML2PDF_OK = True
except ImportError:
    _XHTML2PDF_OK = False

from flask import (render_template, request, jsonify, redirect, url_for,
                   send_file, make_response, abort)
from flask_login import login_required, current_user
from app import app
from db import get_db, get_setting, set_setting, _PG, UPLOAD_FOLDER
from services.pdf import _cv_pdf_klassisch, _cv_pdf_modern, _cv_pdf_minimal

_CV_EMPTY = {
    'personal':       {'name': '', 'email': '', 'phone': '', 'address': '',
                       'city': '', 'linkedin': '', 'website': ''},
    'summary':        '',
    'experience':     [],
    'education':      [],
    'skills':         [],
    'languages':      [],
    'certifications': [],
}

_CV_TEMPLATES = ('klassisch', 'modern', 'minimal')


# ── CV data helpers ────────────────────────────────────────────────────────────

def _get_cv_json():
    if not current_user.is_authenticated:
        return {}, 'klassisch'
    conn = get_db()
    row  = conn.execute('SELECT data, template FROM cv_data WHERE user_id = ?',
                        (current_user.id,)).fetchone()
    conn.close()
    if row:
        try:
            return json.loads(row['data'] or '{}'), row['template'] or 'klassisch'
        except Exception:
            pass
    return {}, 'klassisch'


def _save_cv_json(data, template):
    if not current_user.is_authenticated:
        return
    uid     = current_user.id
    payload = (uid, json.dumps(data, ensure_ascii=False), template)
    conn    = get_db()
    if _PG:
        conn.execute(
            'INSERT INTO cv_data (user_id, data, template, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP::TEXT)'
            ' ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data,'
            ' template = EXCLUDED.template, updated_at = CURRENT_TIMESTAMP::TEXT',
            payload
        )
    else:
        conn.execute(
            'INSERT OR REPLACE INTO cv_data (user_id, data, template, updated_at) VALUES (?, ?, ?, datetime("now"))',
            payload
        )
    conn.commit()
    conn.close()


def _list_cv_versions():
    if not current_user.is_authenticated:
        return []
    conn = get_db()
    rows = conn.execute(
        'SELECT id, name, cv_template, updated_at FROM cv_versions WHERE user_id = ? ORDER BY updated_at DESC',
        (current_user.id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def _get_cv_version(cv_id):
    if not current_user.is_authenticated:
        return None
    conn = get_db()
    row  = conn.execute(
        'SELECT id, name, cv_json, cv_template FROM cv_versions WHERE id = ? AND user_id = ?',
        (cv_id, current_user.id)
    ).fetchone()
    conn.close()
    if not row:
        return None
    try:
        data = json.loads(row['cv_json'] or '{}')
    except Exception:
        data = {}
    return {'id': row['id'], 'name': row['name'], 'data': data, 'template': row['cv_template']}


def _create_cv_version(name, data, template):
    uid  = current_user.id
    conn = get_db()
    if _PG:
        row    = conn.execute(
            'INSERT INTO cv_versions (user_id, name, cv_json, cv_template, updated_at)'
            ' VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP::TEXT) RETURNING id',
            (uid, name, json.dumps(data, ensure_ascii=False), template)
        ).fetchone()
        new_id = row['id']
    else:
        cur    = conn.execute(
            'INSERT INTO cv_versions (user_id, name, cv_json, cv_template, updated_at)'
            ' VALUES (?, ?, ?, ?, datetime("now"))',
            (uid, name, json.dumps(data, ensure_ascii=False), template)
        )
        new_id = cur.lastrowid
    conn.commit()
    conn.close()
    return new_id


def _update_cv_version(cv_id, name, data, template):
    uid  = current_user.id
    conn = get_db()
    if _PG:
        conn.execute(
            'UPDATE cv_versions SET name=?, cv_json=?, cv_template=?, updated_at=CURRENT_TIMESTAMP::TEXT'
            ' WHERE id=? AND user_id=?',
            (name, json.dumps(data, ensure_ascii=False), template, cv_id, uid)
        )
    else:
        conn.execute(
            'UPDATE cv_versions SET name=?, cv_json=?, cv_template=?, updated_at=datetime("now")'
            ' WHERE id=? AND user_id=?',
            (name, json.dumps(data, ensure_ascii=False), template, cv_id, uid)
        )
    conn.commit()
    conn.close()


# ── CV page routes ─────────────────────────────────────────────────────────────

@app.route('/lebenslauf')
@login_required
def lebenslauf():
    versions = _list_cv_versions()
    return render_template('lebenslauf.html', versions=versions)


@app.route('/lebenslauf/neu')
@login_required
def lebenslauf_neu():
    return render_template('lebenslauf_edit.html',
                           cv_id=None, cv_name='Neuer Lebenslauf',
                           cv_json={}, cv_template='klassisch',
                           cv_text=get_setting('cv_text'),
                           cv_filename=get_setting('cv_filename'))


@app.route('/lebenslauf/<int:cv_id>')
@login_required
def lebenslauf_edit(cv_id):
    cv = _get_cv_version(cv_id)
    if not cv:
        abort(404)
    return render_template('lebenslauf_edit.html',
                           cv_id=cv['id'], cv_name=cv['name'],
                           cv_json=cv['data'], cv_template=cv['template'],
                           cv_text=get_setting('cv_text'),
                           cv_filename=get_setting('cv_filename'))


@app.route('/lebenslauf/<int:cv_id>/drucken')
@login_required
def lebenslauf_drucken(cv_id):
    cv = _get_cv_version(cv_id)
    if not cv:
        abort(404)
    return render_template('lebenslauf_print.html', cv_json=cv['data'], cv_template=cv['template'])


@app.route('/lebenslauf/<int:cv_id>/download.pdf')
@login_required
def lebenslauf_pdf(cv_id):
    cv = _get_cv_version(cv_id)
    if not cv:
        abort(404)
    if not _XHTML2PDF_OK:
        return redirect(url_for('lebenslauf_drucken', cv_id=cv_id))
    try:
        html   = render_template('cv_dl.html', cv=cv['data'], template=cv['template'])
        buf    = io.BytesIO()
        result = pisa.CreatePDF(io.StringIO(html), dest=buf)
        if result.err:
            raise RuntimeError('xhtml2pdf error')
        buf.seek(0)
        safe_name = re.sub(r'[^\w\-.]', '_', cv['name'] or 'Lebenslauf') + '.pdf'
        resp = make_response(buf.read())
        resp.headers['Content-Type'] = 'application/pdf'
        resp.headers['Content-Disposition'] = f'attachment; filename="{safe_name}"'
        return resp
    except Exception as e:
        app.logger.warning(f'PDF generation error: {e}')
        return redirect(url_for('lebenslauf_drucken', cv_id=cv_id))


@app.route('/cv/pdf/<template>')
@login_required
def cv_pdf(template):
    if template not in _CV_TEMPLATES:
        return 'Ungültige Vorlage', 400
    data, _ = _get_cv_json()
    if not data:
        return 'Kein Lebenslauf gespeichert', 400

    s = {k: get_setting(k) for k in ['name', 'email', 'telefon', 'strasse', 'plz_ort', 'ort']}
    builders = {
        'klassisch': _cv_pdf_klassisch,
        'modern':    _cv_pdf_modern,
        'minimal':   _cv_pdf_minimal,
    }
    buf   = builders[template](data, s)
    name  = (data.get('personal', {}).get('name') or s.get('name') or 'Lebenslauf').replace(' ', '_')
    fname = f'Lebenslauf_{name}_{template}.pdf'
    return send_file(buf, as_attachment=True, download_name=fname, mimetype='application/pdf')


# ── CV file upload / delete ────────────────────────────────────────────────────

@app.route('/api/upload-cv', methods=['POST'])
@login_required
def upload_cv():
    if 'cv' not in request.files:
        return jsonify({'error': 'Keine Datei ausgewählt'}), 400

    file  = request.files['cv']
    fname = file.filename.lower()

    if not (fname.endswith('.pdf') or fname.endswith('.docx')):
        return jsonify({'error': 'Nur PDF oder DOCX erlaubt'}), 400

    ext      = '.pdf' if fname.endswith('.pdf') else '.docx'
    # Pro User eine eigene Datei — sonst überschreiben sich User gegenseitig
    filepath = os.path.join(UPLOAD_FOLDER, f'cv_{current_user.id}{ext}')
    file.save(filepath)

    try:
        text = ''
        if ext == '.pdf':
            with pdfplumber.open(filepath) as pdf:
                for page in pdf.pages:
                    text += (page.extract_text() or '') + '\n'
        else:
            if not _DOCX_OK:
                return jsonify({'error': 'DOCX-Unterstützung nicht verfügbar'}), 500
            doc  = DocxDocument(filepath)
            text = '\n'.join(p.text for p in doc.paragraphs if p.text.strip())

        text = text.strip()
        set_setting('cv_text', text)
        set_setting('cv_filename', file.filename)
        return jsonify({'success': True, 'filename': file.filename, 'chars': len(text)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/delete-cv', methods=['POST'])
@login_required
def delete_cv():
    set_setting('cv_text', '')
    set_setting('cv_filename', '')
    for ext in ('.pdf', '.docx'):
        p = os.path.join(UPLOAD_FOLDER, f'cv_{current_user.id}{ext}')
        if os.path.exists(p):
            os.remove(p)
    return jsonify({'success': True})


# ── CV builder API ─────────────────────────────────────────────────────────────

@app.route('/api/parse-cv', methods=['POST'])
@login_required
def parse_cv():
    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        return jsonify({'error': 'Anthropic API-Key nicht konfiguriert (Server-Fehler).'}), 500

    cv_text = get_setting('cv_text')
    if not cv_text:
        return jsonify({'error': 'Kein Lebenslauf hochgeladen. Bitte zuerst hochladen.'}), 400

    prompt = f"""Analysiere diesen Lebenslauf und extrahiere ALLE Informationen strukturiert.

Lebenslauf-Text:
{cv_text[:5000]}

Antworte NUR mit validem JSON in diesem exakten Format (keine Erklärungen, kein Markdown, nur reines JSON):
{{
  "personal": {{"name": "", "email": "", "phone": "", "address": "", "city": "", "linkedin": "", "website": ""}},
  "summary": "",
  "experience": [
    {{
      "company": "", "role": "", "location": "",
      "start": "MM/YYYY", "end": "MM/YYYY", "current": false,
      "bullets": ["Aufgabe 1", "Aufgabe 2"]
    }}
  ],
  "education": [
    {{"institution": "", "degree": "", "field": "", "start": "YYYY", "end": "YYYY", "grade": ""}}
  ],
  "skills": ["Skill 1", "Skill 2"],
  "languages": [{{"lang": "", "level": ""}}],
  "certifications": [{{"name": "", "issuer": "", "year": ""}}]
}}

Regeln:
- Nutze leere Strings "" oder [] wenn etwas nicht vorhanden
- current=true wenn noch tätig
- Gib NUR das JSON zurück, sonst nichts"""

    try:
        client = anthropic.Anthropic(api_key=api_key)
        msg    = client.messages.create(
            model='claude-sonnet-4-6',
            max_tokens=2048,
            messages=[{'role': 'user', 'content': prompt}]
        )
        raw = msg.content[0].text.strip()
        if raw.startswith('```'):
            raw = re.sub(r'^```[a-z]*\n?', '', raw)
            raw = re.sub(r'\n?```$', '', raw)

        parsed = json.loads(raw)
        _save_cv_json(parsed, 'klassisch')
        return jsonify({'success': True, 'data': parsed})

    except json.JSONDecodeError as e:
        return jsonify({'error': f'KI hat ungültiges JSON zurückgegeben: {str(e)}'}), 500
    except anthropic.AuthenticationError:
        return jsonify({'error': 'Ungültiger API-Key.'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/cv-data', methods=['GET', 'POST'])
@login_required
def cv_data_api():
    if request.method == 'GET':
        data, template = _get_cv_json()
        return jsonify({'success': True, 'data': data, 'template': template})
    body     = request.get_json()
    data     = body.get('data', {})
    template = body.get('template', 'klassisch')
    if template not in _CV_TEMPLATES:
        template = 'klassisch'
    _save_cv_json(data, template)
    return jsonify({'success': True})


def _clean_cv_data(data):
    if 'certifications' in data:
        data['certifications'] = [c for c in data['certifications'] if (c.get('name') or '').strip()]
    if 'projects' in data:
        data['projects'] = [p for p in data['projects'] if (p.get('name') or '').strip()]
    return data


@app.route('/api/cv/neu', methods=['POST'])
@login_required
def cv_create():
    body     = request.get_json()
    name     = (body.get('name') or 'Lebenslauf').strip() or 'Lebenslauf'
    data     = _clean_cv_data(body.get('data', {}))
    template = body.get('template', 'klassisch')
    if template not in _CV_TEMPLATES:
        template = 'klassisch'
    new_id = _create_cv_version(name, data, template)
    return jsonify({'success': True, 'id': new_id})


@app.route('/api/cv/<int:cv_id>', methods=['POST'])
@login_required
def cv_save(cv_id):
    body     = request.get_json()
    name     = (body.get('name') or 'Lebenslauf').strip() or 'Lebenslauf'
    data     = _clean_cv_data(body.get('data', {}))
    template = body.get('template', 'klassisch')
    if template not in _CV_TEMPLATES:
        template = 'klassisch'
    _update_cv_version(cv_id, name, data, template)
    return jsonify({'success': True})


@app.route('/api/cv/<int:cv_id>/delete', methods=['POST'])
@login_required
def cv_delete(cv_id):
    conn = get_db()
    conn.execute('DELETE FROM cv_versions WHERE id = ? AND user_id = ?', (cv_id, current_user.id))
    conn.commit()
    conn.close()
    return jsonify({'success': True})
