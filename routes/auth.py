from flask import render_template, request, redirect, url_for
from flask_login import login_user, logout_user, login_required, current_user
from app import app
from extensions import bcrypt
from db import get_db, User, _PG


@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    error = None
    if request.method == 'POST':
        email    = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        conn = get_db()
        row  = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
        conn.close()
        if row and bcrypt.check_password_hash(row['password_hash'], password):
            login_user(User(row['id'], row['email'], row['name'], row['plan']), remember=True)
            return redirect(request.args.get('next') or url_for('index'))
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
            except Exception:
                conn.close()
                error = 'Diese E-Mail-Adresse ist bereits registriert.'
    return render_template('register.html', error=error)


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))
