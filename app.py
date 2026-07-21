from flask import Flask
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

# In Produktion (HTTPS) muessen die Cookies das Secure-Flag tragen, sonst
# koennen sie ueber eine ungesicherte Verbindung abgegriffen werden.
# Lokal (HTTP) wuerde Secure das Login unmoeglich machen -> per ENV steuerbar.
_PROD = os.environ.get('FLASK_ENV') == 'production' or os.environ.get('SECURE_COOKIES') == '1'

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

if __name__ == '__main__':
    print('\n  ApplyHeld laeuft auf  http://localhost:5000\n')
    app.run(debug=False, port=5000)
