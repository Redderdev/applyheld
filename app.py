from flask import Flask
import os

from extensions import login_manager, bcrypt
from db import init_db, get_db, User

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-only-change-in-production')

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
    print('\n  BewerbungsKI laeuft auf  http://localhost:5000\n')
    app.run(debug=False, port=5000)
