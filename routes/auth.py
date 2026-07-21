import time

from flask import render_template, request, redirect, url_for
from flask_login import login_user, logout_user, login_required, current_user
from app import app
from extensions import bcrypt
from db import get_db, User, _PG

# ── Brute-Force-Bremse ────────────────────────────────────────────────────────
_FENSTER      = 15 * 60   # Sekunden
_MAX_PRO_MAIL = 8         # Versuche je Konto im Fenster
_MAX_PRO_IP   = 30        # lockerer, da hinter Proxy viele Nutzer eine IP teilen


def _client_ip():
    return (request.remote_addr or '?')[:45]


def _login_gesperrt(email):
    """True, wenn zu viele Fehlversuche im Zeitfenster liegen."""
    cutoff = int(time.time()) - _FENSTER
    conn = get_db()
    try:
        conn.execute('DELETE FROM login_versuche WHERE ts < ?', (cutoff,))
        conn.commit()
        n_mail = conn.execute(
            'SELECT COUNT(*) AS n FROM login_versuche WHERE email = ? AND ts >= ?',
            (email, cutoff)).fetchone()['n']
        n_ip = conn.execute(
            'SELECT COUNT(*) AS n FROM login_versuche WHERE ip = ? AND ts >= ?',
            (_client_ip(), cutoff)).fetchone()['n']
    finally:
        conn.close()
    return n_mail >= _MAX_PRO_MAIL or n_ip >= _MAX_PRO_IP


def _fehlversuch_merken(email):
    conn = get_db()
    conn.execute('INSERT INTO login_versuche (email, ip, ts) VALUES (?, ?, ?)',
                 (email, _client_ip(), int(time.time())))
    conn.commit()
    conn.close()


def _fehlversuche_loeschen(email):
    conn = get_db()
    conn.execute('DELETE FROM login_versuche WHERE email = ?', (email,))
    conn.commit()
    conn.close()


@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    error = None
    if request.method == 'POST':
        email    = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')

        if _login_gesperrt(email):
            app.logger.warning('Login gesperrt (zu viele Versuche): %s / %s', email, _client_ip())
            error = ('Zu viele fehlgeschlagene Anmeldeversuche. '
                     'Bitte warte 15 Minuten und versuche es erneut.')
            return render_template('login.html', error=error), 429

        conn = get_db()
        row  = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
        conn.close()
        if row and bcrypt.check_password_hash(row['password_hash'], password):
            _fehlversuche_loeschen(email)
            login_user(User(row['id'], row['email'], row['name'], row['plan']), remember=True)
            # Nur relative Pfade erlauben — verhindert Open Redirect auf fremde Seiten
            nxt = request.args.get('next') or ''
            if not nxt.startswith('/') or nxt.startswith('//') or '\\' in nxt:
                nxt = url_for('index')
            return redirect(nxt)

        _fehlversuch_merken(email)
        # Bewusst identische Meldung fuer "Konto unbekannt" und "Passwort falsch",
        # damit sich keine registrierten E-Mail-Adressen ausprobieren lassen.
        error = 'E-Mail oder Passwort falsch.'
    return render_template('login.html', error=error)


@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    error = None
    if request.method == 'POST':
        name     = request.form.get('name', '').strip()
        email    = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        if not name or not email or not password:
            error = 'Bitte alle Felder ausfüllen.'
        elif len(password) < 8:
            error = 'Passwort muss mindestens 8 Zeichen haben.'
        else:
            pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')
            conn = get_db()
            try:
                if _PG:
                    cur     = conn.execute(
                        'INSERT INTO users (email, password_hash, name) VALUES (?,?,?) RETURNING id',
                        (email, pw_hash, name)
                    )
                    user_id = cur.fetchone()['id']
                else:
                    cur     = conn.execute(
                        'INSERT INTO users (email, password_hash, name) VALUES (?,?,?)',
                        (email, pw_hash, name)
                    )
                    user_id = cur.lastrowid
                conn.commit()
                conn.close()
                login_user(User(user_id, email, name), remember=True)
                return redirect(url_for('index'))
            except Exception as e:
                conn.close()
                app.logger.warning('Registrierung fehlgeschlagen (%s): %s', email, e)
                error = 'Diese E-Mail-Adresse ist bereits registriert.'
    return render_template('register.html', error=error)


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))
