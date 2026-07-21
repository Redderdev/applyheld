import os
import anthropic

from flask import request, jsonify
from flask_login import login_required, current_user
from app import app
from db import get_db, get_setting


@app.route('/api/generate', methods=['POST'])
@login_required
def generate():
    data           = request.get_json()
    stellenanzeige = (data.get('stellenanzeige') or '').strip()
    firma          = (data.get('firma') or '').strip()
    stelle         = (data.get('stelle') or '').strip()

    if not stellenanzeige:
        return jsonify({'error': 'Bitte eine Stellenanzeige einfügen.'}), 400

    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        return jsonify({'error': 'Anthropic API-Key nicht konfiguriert (Server-Fehler).'}), 500

    cv_text = get_setting('cv_text')
    if not cv_text:
        return jsonify({'error': 'Kein Lebenslauf hochgeladen. Bitte zuerst hochladen.'}), 400

    name = get_setting('name', 'Bewerberin/Bewerber')
    ort  = get_setting('ort', 'Meine Stadt')

    prompt = f"""Du bist ein Experte für professionelle deutsche Bewerbungsschreiben.

Erstelle ein vollständiges, überzeugendes Anschreiben basierend auf:

**LEBENSLAUF:**
{cv_text[:3500]}

**STELLENANZEIGE ({firma} – {stelle}):**
{stellenanzeige[:2500]}

**BEWERBER:** {name}, wohnhaft in {ort}

Anforderungen:
- Professionell, persönlich und überzeugend
- Relevante Qualifikationen aus dem Lebenslauf gezielt hervorheben
- Konkrete Bezüge zur Stellenanzeige herstellen
- Deutsche Bewerbungsstandards einhalten
- Max. 180 Wörter, kurz und prägnant, passt auf eine Seite
- Mit passender Anrede beginnen
- Mit "Mit freundlichen Grüßen," + Leerzeile + Name enden
- Keine Gedankenstriche (–) oder Bindestriche (-) als Satzzeichen verwenden; stattdessen Komma oder Punkt nutzen

Gib NUR den Brieftext zurück (von Anrede bis Unterschrift), ohne Absenderblock oder Datum."""

    try:
        client = anthropic.Anthropic(api_key=api_key)
        msg    = client.messages.create(
            model='claude-sonnet-4-6',
            max_tokens=1024,
            messages=[{'role': 'user', 'content': prompt}]
        )
        return jsonify({'success': True, 'anschreiben': msg.content[0].text})

    except anthropic.AuthenticationError:
        return jsonify({'error': 'Ungültiger API-Key. Bitte in den Einstellungen prüfen.'}), 400
    except Exception as e:
        return jsonify({'error': f'Fehler: {str(e)}'}), 500


@app.route('/api/chat/<int:bid>', methods=['POST'])
@login_required
def chat(bid):
    data    = request.get_json()
    message = (data.get('message') or '').strip()

    if not message:
        return jsonify({'error': 'Nachricht fehlt'}), 400

    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        return jsonify({'error': 'Anthropic API-Key nicht konfiguriert (Server-Fehler).'}), 500

    conn = get_db()
    b    = conn.execute(
        'SELECT * FROM bewerbungen WHERE id = ? AND user_id = ?', (bid, current_user.id)
    ).fetchone()
    conn.close()
    if not b:
        return jsonify({'error': 'Bewerbung nicht gefunden'}), 404

    cv_text     = get_setting('cv_text', '')
    anschreiben = b['anschreiben'] or ''

    system = f"""Du bist ein Experte für deutsche Bewerbungsschreiben und hilfst dem Nutzer,
sein Anschreiben zu verbessern.

Kontext:
- Stelle: {b['stelle']} bei {b['firma']}
- Stellenanzeige (Auszug): {(b['stellenanzeige'] or '')[:800]}
- Lebenslauf (Auszug): {cv_text[:1200]}

Aktuelles Anschreiben:
---
{anschreiben}
---

Stilregel: Keine Gedankenstriche (–) oder Bindestriche (-) als Satzzeichen; stattdessen Komma oder Punkt.
Längenvorgabe: Max. 180 Wörter, sofern der Nutzer nicht ausdrücklich mehr verlangt.

Wenn der Nutzer eine Änderung oder Überarbeitung wünscht:
1. Erkläre in 1-2 Sätzen was du geändert hast.
2. Gib das vollständig überarbeitete Anschreiben aus, genau so formatiert:
[ANSCHREIBEN_START]
<vollständiges Anschreiben hier>
[ANSCHREIBEN_ENDE]

Wenn der Nutzer eine Frage stellt oder nur Feedback gibt, antworte kurz ohne die Tags."""

    try:
        client   = anthropic.Anthropic(api_key=api_key)
        msg      = client.messages.create(
            model='claude-sonnet-4-6',
            max_tokens=1500,
            system=system,
            messages=[{'role': 'user', 'content': message}]
        )
        response = msg.content[0].text

        updated_anschreiben = None
        display_text        = response

        if '[ANSCHREIBEN_START]' in response and '[ANSCHREIBEN_ENDE]' in response:
            s = response.index('[ANSCHREIBEN_START]') + len('[ANSCHREIBEN_START]')
            e = response.index('[ANSCHREIBEN_ENDE]')
            updated_anschreiben = response[s:e].strip()
            display_text        = response[:response.index('[ANSCHREIBEN_START]')].strip()
            if not display_text:
                display_text = 'Anschreiben wurde aktualisiert.'

            conn = get_db()
            conn.execute('UPDATE bewerbungen SET anschreiben = ? WHERE id = ? AND user_id = ?',
                         (updated_anschreiben, bid, current_user.id))
            conn.commit()
            conn.close()

        conn = get_db()
        conn.execute('INSERT INTO chat_nachrichten (bewerbung_id, rolle, inhalt) VALUES (?,?,?)',
                     (bid, 'user', message))
        conn.execute('INSERT INTO chat_nachrichten (bewerbung_id, rolle, inhalt) VALUES (?,?,?)',
                     (bid, 'assistant', display_text))
        conn.commit()
        conn.close()

        return jsonify({'success': True, 'message': display_text,
                        'updated_anschreiben': updated_anschreiben})

    except anthropic.AuthenticationError:
        return jsonify({'error': 'Ungültiger API-Key'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
