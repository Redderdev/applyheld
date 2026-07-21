from flask import render_template, request, redirect, url_for, flash, make_response
from flask_login import login_required, current_user
from app import app
from db import get_db, get_setting, set_setting
from constants import STATUS_CSS, STATUS_OPTIONS


@app.context_processor
def inject_globals():
    if not current_user.is_authenticated:
        return {'nav_total': 0, 'profile_name': '', 'profile_email': '',
                'status_css': STATUS_CSS, 'status_options': STATUS_OPTIONS}
    conn  = get_db()
    total = conn.execute(
        'SELECT COUNT(*) as n FROM bewerbungen WHERE user_id = ?', (current_user.id,)
    ).fetchone()['n']
    conn.close()
    return {
        'nav_total':     total,
        'profile_name':  current_user.name,
        'profile_email': current_user.email,
        'status_css':    STATUS_CSS,
        'status_options': STATUS_OPTIONS,
    }


@app.route('/landing')
def landing():
    return render_template('landing.html')


@app.route('/')
@login_required
def index():
    conn        = get_db()
    bewerbungen = conn.execute(
        'SELECT * FROM bewerbungen WHERE user_id = ? ORDER BY datum_erstellt DESC',
        (current_user.id,)
    ).fetchall()
    conn.close()

    # Zählung pro Status (alle 7 Status aus STATUS_OPTIONS)
    counts = {s: 0 for s in STATUS_OPTIONS}
    for b in bewerbungen:
        if b['status'] in counts:
            counts[b['status']] += 1

    total      = len(bewerbungen)
    entwurf    = counts['Entwurf']
    versendet  = total - entwurf                       # tatsächlich rausgeschickt
    aktiv      = (counts['Gesendet'] + counts['Telefoninterview']
                  + counts['Vorstellungsgespräch'] + counts['Angebot erhalten'])
    responded  = versendet - counts['Gesendet']        # über "Gesendet" hinausgekommen
    antwortquote = round(responded / versendet * 100) if versendet else 0

    stats = {
        'total':        total,
        'entwurf':      entwurf,
        'gesendet':     aktiv,                          # "Im Prozess" (Chip nutzt diesen Key)
        'angenommen':   counts['Angenommen'],
        'abgelehnt':    counts['Abgelehnt'],
        'versendet':    versendet,
        'antwortquote': antwortquote,
        'counts':       counts,
    }
    resp = make_response(render_template('index.html', bewerbungen=bewerbungen, stats=stats))
    resp.headers['Cache-Control'] = 'no-store'
    return resp


@app.route('/jobs')
@login_required
def jobs():
    import os
    has_adzuna = bool(os.environ.get('ADZUNA_APP_ID') or get_setting('adzuna_app_id'))
    return render_template('jobs.html', has_adzuna=has_adzuna)


@app.route('/neue-bewerbung')
@login_required
def neue_bewerbung():
    import os
    has_cv  = bool(get_setting('cv_text'))
    has_api = bool(os.environ.get('ANTHROPIC_API_KEY'))
    s = {k: get_setting(k) for k in ['name', 'email', 'telefon', 'strasse', 'plz_ort', 'ort']}
    return render_template('neue_bewerbung.html', has_cv=has_cv, has_api=has_api, s=s)


@app.route('/bewerbung/<int:bid>')
@login_required
def bewerbung(bid):
    conn = get_db()
    b    = conn.execute(
        'SELECT * FROM bewerbungen WHERE id = ? AND user_id = ?', (bid, current_user.id)
    ).fetchone()
    if not b:
        return redirect(url_for('index'))
    chat = conn.execute(
        'SELECT * FROM chat_nachrichten WHERE bewerbung_id = ? ORDER BY erstellt_am', (bid,)
    ).fetchall()
    s = {k: get_setting(k) for k in ['name', 'email', 'telefon', 'strasse', 'plz_ort', 'ort']}
    conn.close()
    return render_template('bewerbung.html', b=b, chat=chat, s=s)


@app.route('/profil')
def profil():
    return redirect(url_for('einstellungen'), 301)


@app.route('/einstellungen', methods=['GET', 'POST'])
@login_required
def einstellungen():
    if request.method == 'POST':
        for field in ['name', 'email', 'telefon', 'strasse', 'plz_ort', 'ort']:
            if field in request.form:
                set_setting(field, request.form[field].strip())
        flash('Einstellungen gespeichert!', 'success')
        return redirect(url_for('einstellungen'))
    s = {k: get_setting(k) for k in
         ['name', 'email', 'telefon', 'strasse', 'plz_ort', 'ort', 'cv_filename', 'cv_text']}
    return render_template('einstellungen.html', s=s)
