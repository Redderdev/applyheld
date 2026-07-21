from flask import Flask, request, jsonify, render_template
from flask_wtf.csrf import CSRFProtect, CSRFError
from werkzeug.middleware.proxy_fix import ProxyFix
import os
import secrets
from datetime import timedelta

from extensions import login_manager, bcrypt
from db import init_db, get_db, User


def _load_secret_key():
    """SECRET_KEY aus der Umgebung; sonst einmalig generieren und in Datei
    persistieren (stabil über Worker/Neustarts, kein bekannter Default)."""
    sk = os.environ.get('SECRET_KEY')
    if sk:
        return sk
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.secret_key')
    try:
        with open(path, 'x') as f:          # exklusiv: nur ein Prozess erzeugt den Key
            sk = secrets.token_hex(32)
            f.write(sk)
            return sk
    except FileExistsError:
        with open(path) as f:
            return f.read().strip()
    except OSError:                          # Dateisystem read-only o.ä.
        return secrets.token_hex(32)


app = Flask(__name__)
app.secret_key = _load_secret_key()

# ── Produktionsschalter ───────────────────────────────────────────────────────
# Steuert drei sicherheitsrelevante Dinge auf einmal:
#   1. Secure-Flag auf Session-/Remember-Cookies (sonst per HTTP abgreifbar)
#   2. HSTS-Header
#   3. ProxyFix (echte Besucher-IP hinter dem Reverse-Proxy -> Rate-Limits)
# Lokal muss das AUS bleiben, sonst verhindert das Secure-Flag jedes Login
# ueber http://localhost.
#
# ACHTUNG: 'FLASK_ENV' wird hier nur aus Kompatibilitaet weiter akzeptiert.
# Flask selbst ignoriert die Variable seit 3.x — sie zu loeschen wuerde die
# obigen Schutzmassnahmen still abschalten. Bevorzugt PRODUCTION=1 setzen.
_PROD = (os.environ.get('PRODUCTION') == '1'
         or os.environ.get('SECURE_COOKIES') == '1'
         or os.environ.get('FLASK_ENV') == 'production')

app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',   # blockt Cross-Site-POSTs (CSRF-Mitigation)
    SESSION_COOKIE_SECURE=_PROD,
    REMEMBER_COOKIE_HTTPONLY=True,
    REMEMBER_COOKIE_SAMESITE='Lax',
    REMEMBER_COOKIE_SECURE=_PROD,
    REMEMBER_COOKIE_DURATION=timedelta(days=14),
    PERMANENT_SESSION_LIFETIME=timedelta(days=14),
    MAX_CONTENT_LENGTH=10 * 1024 * 1024,   # Upload-Limit 10 MB
)


# Hinter einem Reverse-Proxy (Railway, Heroku, Azure) ist remote_addr die IP des
# Proxys — ohne diese Korrektur teilen sich ALLE Besucher eine IP und die
# Rate-Limits wuerden wechselseitig ausloesen.
# x_for=1 = genau eine vertrauenswuerdige Proxy-Ebene. Hoehere Werte wuerden es
# Clients erlauben, per gefaelschtem X-Forwarded-For eine IP vorzutaeuschen.
# Nur in Produktion aktiv, denn lokal ist der Header frei faelschbar.
if _PROD:
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)


# ── CSRF ──────────────────────────────────────────────────────────────────────
# Schuetzt automatisch alle POST/PUT/PATCH/DELETE-Routen. Formulare senden das
# Token als verstecktes Feld, fetch()-Aufrufe als X-CSRFToken-Header (siehe
# main.js — dort wird window.fetch einmal zentral umhuellt).
csrf = CSRFProtect(app)


@app.errorhandler(CSRFError)
def _csrf_error(e):
    app.logger.warning('CSRF abgelehnt: %s %s (%s)', request.method, request.path, e.description)
    if request.path.startswith('/api/') or request.is_json:
        return jsonify({'error': 'Sicherheits-Token abgelaufen. Bitte Seite neu laden.'}), 400
    return render_template('login.html',
                           error='Sicherheits-Token abgelaufen. Bitte erneut versuchen.'), 400


@app.after_request
def _security_headers(resp):
    resp.headers.setdefault('X-Content-Type-Options', 'nosniff')
    resp.headers.setdefault('X-Frame-Options', 'DENY')            # Clickjacking
    resp.headers.setdefault('Referrer-Policy', 'strict-origin-when-cross-origin')
    resp.headers.setdefault('Permissions-Policy',
                            'geolocation=(), microphone=(), camera=(), payment=()')
    if _PROD:
        resp.headers.setdefault('Strict-Transport-Security',
                                'max-age=31536000; includeSubDomains')
    # CSP als zweite Verteidigungslinie gegen XSS. 'unsafe-inline' ist noetig,
    # weil die Templates Inline-Styles/Skripte nutzen; externe Skripte sind
    # dennoch auf die CDNs begrenzt und Frames/Objekte komplett gesperrt.
    resp.headers.setdefault('Content-Security-Policy', '; '.join([
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
    ]))
    return resp

login_manager.init_app(app)
bcrypt.init_app(app)


@login_manager.user_loader
def load_user(user_id):
    conn = get_db()
    row  = conn.execute('SELECT id, email, name, plan FROM users WHERE id = ?', (int(user_id),)).fetchone()
    conn.close()
    if row:
        return User(row['id'], row['email'], row['name'], row['plan'])
    return None


# Route modules are imported after `app` is defined.
# Each module does `from app import app` to register its routes.
import routes.auth         # noqa: F401, E402
import routes.pages        # noqa: F401, E402
import routes.bewerbungen  # noqa: F401, E402
import routes.jobs         # noqa: F401, E402
import routes.cv           # noqa: F401, E402
import routes.ai           # noqa: F401, E402

init_db()

# Konfiguration beim Start protokollieren. Eine fehlende Produktions-Variable
# hat sonst KEIN sichtbares Symptom — man saehe erst im Schadensfall, dass die
# Cookies ungeschuetzt waren. So steht es direkt im Railway-Log.
app.logger.warning(
    'ApplyHeld startet | Modus=%s | Secure-Cookies=%s | ProxyFix=%s | DB=%s | SECRET_KEY=%s',
    'PRODUKTION' if _PROD else 'LOKAL/UNGESCHUETZT',
    app.config['SESSION_COOKIE_SECURE'],
    _PROD,
    'PostgreSQL' if os.environ.get('DATABASE_URL') else 'SQLite (lokal)',
    'aus Umgebung' if os.environ.get('SECRET_KEY') else 'DATEI-FALLBACK (bei Neustart alle ausgeloggt!)',
)

if __name__ == '__main__':
    print('\n  ApplyHeld laeuft auf  http://localhost:5000\n')
    app.run(debug=False, port=5000)
