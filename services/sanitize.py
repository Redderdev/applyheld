"""HTML-Sanitisierung per Allowlist.

Warum ein Parser statt Regex: Regex-Filter sind grundsaetzlich umgehbar
(`<img/onerror=..>`, `<script src=x>` ohne schliessendes Tag, Entity-kodierte
`javascript:`-URLs). Hier wird die Ausgabe aus geparsten Tokens NEU AUFGEBAUT
statt Muster aus der Eingabe zu entfernen — was nicht explizit erlaubt ist,
existiert in der Ausgabe schlicht nicht.

Kernentscheidung: ALLE Attribute werden verworfen. Damit koennen weder
Event-Handler (on*), noch `href`/`src`/`style`/`formaction` ueberleben.
"""
from html import escape
from html.parser import HTMLParser

# Nur reine Struktur-/Textauszeichnung
_ALLOWED = {
    'p', 'br', 'div', 'span',
    'ul', 'ol', 'li',
    'strong', 'b', 'em', 'i', 'u',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'table', 'thead', 'tbody', 'tr', 'td', 'th',
}
_VOID = {'br'}

# Inhalt dieser Tags wird komplett verworfen (nicht nur die Tags)
_DROP_CONTENT = {'script', 'style', 'iframe', 'object', 'embed', 'template', 'noscript'}


class _Sanitizer(HTMLParser):
    def __init__(self):
        # convert_charrefs: Entities werden zu Text und danach neu escaped,
        # dadurch laufen Tricks wie `jav&#97;script:` ins Leere.
        super().__init__(convert_charrefs=True)
        self.out = []
        self._open = []
        self._skip_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag in _DROP_CONTENT:
            self._skip_depth += 1
            return
        if self._skip_depth:
            return
        if tag in _VOID:
            self.out.append('<br>')
        elif tag in _ALLOWED:
            self.out.append(f'<{tag}>')      # Attribute bewusst verworfen
            self._open.append(tag)

    def handle_startendtag(self, tag, attrs):
        if tag in _DROP_CONTENT or self._skip_depth:
            return
        if tag in _VOID:
            self.out.append('<br>')

    def handle_endtag(self, tag):
        if tag in _DROP_CONTENT:
            self._skip_depth = max(0, self._skip_depth - 1)
            return
        if self._skip_depth or tag in _VOID or tag not in _ALLOWED:
            return
        if tag in self._open:
            while self._open:                # verschachtelte Tags mitschliessen
                t = self._open.pop()
                self.out.append(f'</{t}>')
                if t == tag:
                    break

    def handle_data(self, data):
        if self._skip_depth:
            return
        self.out.append(escape(data, quote=False))

    def result(self):
        while self._open:                    # offene Tags sauber schliessen
            self.out.append(f'</{self._open.pop()}>')
        return ''.join(self.out)


def clean_html(raw, max_len=60000):
    """Gibt sicheres HTML zurueck (nur erlaubte Tags, keine Attribute)."""
    if not raw:
        return ''
    p = _Sanitizer()
    try:
        p.feed(str(raw)[:max_len])
        p.close()
        return p.result().strip()
    except Exception:
        # Im Zweifel alles als Text ausgeben statt HTML durchzulassen
        return escape(str(raw)[:max_len], quote=False)


def has_markup(cleaned):
    """True, wenn nach der Saeuberung noch Struktur-Tags uebrig sind."""
    return '<' in cleaned
