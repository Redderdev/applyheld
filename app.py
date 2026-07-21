from flask import Flask
import os
import secrets

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
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',   # blockt Cross-Site-POSTs (CSRF-Mitigation)
    REMEMBER_COOKIE_HTTPONLY=True,
    REMEMBER_COOKIE_SAMESITE='Lax',
    MAX_CONTENT_LENGTH=10 * 1024 * 1024,   # Upload-Limit 10 MB
)

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
