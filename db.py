import os
import time
from flask_login import UserMixin, current_user

BASE_DIR      = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

DATABASE_URL = os.environ.get('DATABASE_URL')
_PG          = bool(DATABASE_URL)

if _PG:
    import psycopg2
    import psycopg2.extras
else:
    import sqlite3
    DATABASE = os.path.join(BASE_DIR, 'bewerbungen.db')


class _Conn:
    """Thin wrapper so psycopg2 and sqlite3 share one call interface."""

    def __init__(self, raw):
        self._raw = raw

    def execute(self, sql, params=()):
        if _PG:
            cur = self._raw.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cur.execute(sql.replace('?', '%s'), params)
        else:
            cur = self._raw.cursor()
            cur.execute(sql, params)
        return cur

    def commit(self): self._raw.commit()
    def close(self):  self._raw.close()


class User(UserMixin):
    def __init__(self, id, email, name, plan='free'):
        self.id    = id
        self.email = email
        self.name  = name
        self.plan  = plan


def get_db():
    if _PG:
        return _Conn(psycopg2.connect(DATABASE_URL))
    raw = sqlite3.connect(DATABASE)
    raw.row_factory = sqlite3.Row
    return _Conn(raw)


def init_db():
    if _PG:
        for attempt in range(10):
            try:
                psycopg2.connect(DATABASE_URL).close()
                break
            except psycopg2.OperationalError:
                if attempt == 9:
                    raise
                time.sleep(3)
    conn = get_db()
    if _PG:
        conn.execute('''CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT DEFAULT '',
            plan TEXT DEFAULT 'free',
            created_at TEXT DEFAULT CURRENT_DATE::TEXT
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS bewerbungen (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            firma TEXT NOT NULL DEFAULT '',
            stelle TEXT DEFAULT '',
            url TEXT DEFAULT '',
            stellenanzeige TEXT DEFAULT '',
            anschreiben TEXT DEFAULT '',
            status TEXT DEFAULT 'Entwurf',
            datum_erstellt TEXT DEFAULT CURRENT_DATE::TEXT,
            datum_gesendet TEXT,
            notizen TEXT DEFAULT ''
        )''')
        conn.execute('ALTER TABLE bewerbungen ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE')
        needs_settings_migration = not conn.execute(
            "SELECT 1 FROM information_schema.columns WHERE table_name=? AND column_name=?",
            ('settings', 'user_id')
        ).fetchone()
        if needs_settings_migration:
            conn.execute('DROP TABLE IF EXISTS settings CASCADE')
        conn.execute('''CREATE TABLE IF NOT EXISTS settings (
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            key TEXT NOT NULL,
            value TEXT DEFAULT '',
            PRIMARY KEY (user_id, key)
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS chat_nachrichten (
            id SERIAL PRIMARY KEY,
            bewerbung_id INTEGER NOT NULL,
            rolle TEXT NOT NULL,
            inhalt TEXT NOT NULL,
            erstellt_am TEXT DEFAULT TO_CHAR(CURRENT_TIMESTAMP, 'YYYY-MM-DD HH24:MI:SS'),
            FOREIGN KEY (bewerbung_id) REFERENCES bewerbungen(id) ON DELETE CASCADE
        )''')
        needs_cv_migration = not conn.execute(
            "SELECT 1 FROM information_schema.columns WHERE table_name=? AND column_name=?",
            ('cv_data', 'user_id')
        ).fetchone()
        if needs_cv_migration:
            conn.execute('DROP TABLE IF EXISTS cv_data CASCADE')
        conn.execute('''CREATE TABLE IF NOT EXISTS cv_data (
            user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            data TEXT DEFAULT '{}',
            template TEXT DEFAULT 'klassisch',
            updated_at TEXT DEFAULT TO_CHAR(CURRENT_TIMESTAMP, 'YYYY-MM-DD HH24:MI:SS')
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS cv_versions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name TEXT DEFAULT 'Lebenslauf',
            cv_json TEXT DEFAULT '{}',
            cv_template TEXT DEFAULT 'klassisch',
            updated_at TEXT DEFAULT TO_CHAR(CURRENT_TIMESTAMP, 'YYYY-MM-DD HH24:MI:SS')
        )''')
    else:
        conn.execute('''CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT DEFAULT '',
            plan TEXT DEFAULT 'free',
            created_at TEXT DEFAULT (strftime('%Y-%m-%d', 'now'))
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS bewerbungen (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            firma TEXT NOT NULL DEFAULT '',
            stelle TEXT DEFAULT '',
            url TEXT DEFAULT '',
            stellenanzeige TEXT DEFAULT '',
            anschreiben TEXT DEFAULT '',
            status TEXT DEFAULT 'Entwurf',
            datum_erstellt TEXT DEFAULT (strftime('%Y-%m-%d', 'now')),
            datum_gesendet TEXT,
            notizen TEXT DEFAULT ''
        )''')
        cur = conn.execute("SELECT 1 FROM pragma_table_info('bewerbungen') WHERE name='user_id'")
        if not cur.fetchone():
            conn.execute('ALTER TABLE bewerbungen ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE')
        cur = conn.execute("SELECT 1 FROM pragma_table_info('settings') WHERE name='user_id'")
        if not cur.fetchone():
            conn.execute('DROP TABLE IF EXISTS settings')
        conn.execute('''CREATE TABLE IF NOT EXISTS settings (
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            key TEXT NOT NULL,
            value TEXT DEFAULT '',
            PRIMARY KEY (user_id, key)
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS chat_nachrichten (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bewerbung_id INTEGER NOT NULL,
            rolle TEXT NOT NULL,
            inhalt TEXT NOT NULL,
            erstellt_am TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (bewerbung_id) REFERENCES bewerbungen(id) ON DELETE CASCADE
        )''')
        cur = conn.execute("SELECT 1 FROM pragma_table_info('cv_data') WHERE name='user_id'")
        if not cur.fetchone():
            conn.execute('DROP TABLE IF EXISTS cv_data')
        conn.execute('''CREATE TABLE IF NOT EXISTS cv_data (
            user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            data TEXT DEFAULT '{}',
            template TEXT DEFAULT 'klassisch',
            updated_at TEXT DEFAULT (datetime('now'))
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS cv_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name TEXT DEFAULT 'Lebenslauf',
            cv_json TEXT DEFAULT '{}',
            cv_template TEXT DEFAULT 'klassisch',
            updated_at TEXT DEFAULT (datetime('now'))
        )''')
    # Fehlgeschlagene Logins (Brute-Force-Bremse). Unix-Timestamp als INTEGER,
    # damit SQLite und Postgres identisch behandelt werden koennen.
    conn.execute('''CREATE TABLE IF NOT EXISTS login_versuche (
        email TEXT NOT NULL,
        ip TEXT NOT NULL,
        ts INTEGER NOT NULL
    )''')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_login_versuche_ts ON login_versuche (ts)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_login_versuche_email ON login_versuche (email, ts)')

    conn.execute('''
        INSERT INTO cv_versions (user_id, name, cv_json, cv_template, updated_at)
        SELECT user_id, 'Lebenslauf', data, template, updated_at
        FROM cv_data
        WHERE data != '{}'
        AND user_id NOT IN (SELECT DISTINCT user_id FROM cv_versions)
    ''')
    conn.execute('''
        UPDATE bewerbungen SET user_id = (SELECT id FROM users ORDER BY id LIMIT 1)
        WHERE user_id IS NULL AND EXISTS (SELECT 1 FROM users)
    ''')
    conn.commit()
    conn.close()


def get_setting(key, default=''):
    if not current_user.is_authenticated:
        return default
    uid = current_user.id
    conn = get_db()
    row = conn.execute('SELECT value FROM settings WHERE user_id = ? AND key = ?', (uid, key)).fetchone()
    conn.close()
    return row['value'] if row and row['value'] else default


def set_setting(key, value):
    if not current_user.is_authenticated:
        return
    uid = current_user.id
    conn = get_db()
    if _PG:
        conn.execute(
            'INSERT INTO settings (user_id, key, value) VALUES (?, ?, ?)'
            ' ON CONFLICT (user_id, key) DO UPDATE SET value = EXCLUDED.value',
            (uid, key, value)
        )
    else:
        conn.execute('INSERT OR REPLACE INTO settings (user_id, key, value) VALUES (?, ?, ?)', (uid, key, value))
    conn.commit()
    conn.close()
