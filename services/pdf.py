import io
import re
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
from reportlab.lib import colors

# ── Shared colour palette ─────────────────────────────────────────────────────

NAVY  = colors.HexColor('#1e3a5f')
CYAN  = colors.HexColor('#06b6d4')
SLATE = colors.HexColor('#64748b')
INK   = colors.HexColor('#0f172a')
LIGHT = colors.HexColor('#f8fafc')
RULE  = colors.HexColor('#e2e8f0')


# ── Anschreiben PDF ────────────────────────────────────────────────────────────

def _build_pdf(b, s):
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            rightMargin=2*cm, leftMargin=2.5*cm,
                            topMargin=2.7*cm, bottomMargin=2*cm)

    ACCENT     = colors.HexColor('#1a56db')
    INK_LOCAL  = colors.HexColor('#111827')
    GREY       = colors.HexColor('#6b7280')
    ACCENT_HEX = '1a56db'
    GREY_HEX   = '6b7280'

    body_w = A4[0] - 2.5*cm - 2*cm

    def _style(name, **kw):
        base = ParagraphStyle(name, fontName='Helvetica', fontSize=11,
                              leading=16, textColor=INK_LOCAL)
        for k, v in kw.items():
            setattr(base, k, v)
        return base

    P      = _style('P')
    PBold  = _style('PB', fontName='Helvetica-Bold')
    PSmall = _style('PS', fontSize=9, leading=13, textColor=GREY)
    PRight = _style('PR', alignment=2)
    PSubj  = _style('PSub', fontName='Helvetica-Bold', fontSize=12, leading=18, textColor=INK_LOCAL)

    story = []

    sender_lines = []
    if s.get('name'):
        sender_lines.append(f"<font name='Helvetica-Bold' size='13' color='#{ACCENT_HEX}'>{s['name']}</font>")
    for field in ['strasse', 'plz_ort']:
        if s.get(field):
            sender_lines.append(s[field])

    contact_lines = []
    if s.get('telefon'):
        contact_lines.append(f"<font color='#{GREY_HEX}'>Tel:</font>  {s['telefon']}")
    if s.get('email'):
        contact_lines.append(f"<font color='#{GREY_HEX}'>Mail:</font> {s['email']}")

    if sender_lines or contact_lines:
        left_cell  = [Paragraph(l, PSmall) for l in sender_lines] or [Paragraph('', PSmall)]
        right_cell = [Paragraph(l, PSmall) for l in contact_lines] or [Paragraph('', PSmall)]
        hdr_table = Table([[left_cell, right_cell]], colWidths=[body_w*0.6, body_w*0.4])
        hdr_table.setStyle(TableStyle([
            ('VALIGN',        (0,0), (-1,-1), 'TOP'),
            ('LEFTPADDING',   (0,0), (-1,-1), 0),
            ('RIGHTPADDING',  (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING',    (0,0), (-1,-1), 0),
        ]))
        story.append(hdr_table)
        story.append(Spacer(1, 0.25*cm))
        story.append(HRFlowable(width='100%', thickness=1.5, color=ACCENT, spaceAfter=0.5*cm))

    if b.get('firma'):
        story.append(Paragraph(b['firma'], PBold))
        story.append(Spacer(1, 0.6*cm))

    ort      = s.get('ort', '').strip()
    today    = datetime.now().strftime('%d.%m.%Y')
    date_str = f"{ort + ', ' if ort else ''}{today}"
    story.append(Paragraph(date_str, PRight))
    story.append(Spacer(1, 0.7*cm))

    if b.get('stelle'):
        story.append(Paragraph(f"Bewerbung als {b['stelle']}", PSubj))
        story.append(Spacer(1, 0.6*cm))

    anschreiben_text = (b.get('anschreiben') or '').strip()
    if anschreiben_text:
        parts = re.split(r'(\n{2,})', anschreiben_text)
        for i, part in enumerate(parts):
            if i % 2 == 0:
                text = part.strip('\n')
                if text:
                    story.append(Paragraph(text.replace('\n', '<br/>'), P))
            else:
                extra_lines = len(part) - 2
                story.append(Spacer(1, (0.5 + extra_lines * 0.5) * cm))
    else:
        story.append(Paragraph('<i>Kein Anschreiben hinterlegt.</i>',
                               _style('PI', textColor=GREY, fontSize=11)))

    doc.build(story)
    buf.seek(0)
    return buf


# ── Lebenslauf PDF — klassisch ─────────────────────────────────────────────────

def _cv_pdf_klassisch(data, profile):
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            leftMargin=2.5*cm, rightMargin=2.5*cm,
                            topMargin=2*cm, bottomMargin=2*cm)
    p = data.get('personal', {})

    name_s    = ParagraphStyle('K_name', fontName='Helvetica-Bold', fontSize=22,
                                alignment=1, spaceAfter=4, textColor=INK)
    contact_s = ParagraphStyle('K_contact', fontName='Helvetica', fontSize=10,
                                alignment=1, textColor=SLATE, spaceAfter=14)
    section_s = ParagraphStyle('K_sec', fontName='Helvetica-Bold', fontSize=10,
                                textColor=NAVY, spaceBefore=14, spaceAfter=6)
    body_s    = ParagraphStyle('K_body', fontName='Helvetica', fontSize=10, leading=14, spaceAfter=2)
    bold_s    = ParagraphStyle('K_bold', fontName='Helvetica-Bold', fontSize=10, leading=14, spaceAfter=2)
    small_s   = ParagraphStyle('K_small', fontName='Helvetica', fontSize=9.5,
                                textColor=SLATE, leading=13, spaceAfter=2)
    bullet_s  = ParagraphStyle('K_bul', fontName='Helvetica', fontSize=10, leading=14,
                                leftIndent=10, spaceAfter=1)
    summary_s = ParagraphStyle('K_sum', fontName='Helvetica', fontSize=10.5, leading=16, spaceAfter=12)

    story = []

    name = p.get('name') or profile.get('name') or ''
    if name:
        story.append(Paragraph(name, name_s))

    contacts = [p.get('phone') or profile.get('telefon'), p.get('email') or profile.get('email'),
                p.get('city') or profile.get('plz_ort'), p.get('linkedin')]
    ct = ' · '.join(x for x in contacts if x)
    if ct:
        story.append(Paragraph(ct, contact_s))

    story.append(HRFlowable(width='100%', thickness=1.2, color=NAVY, spaceAfter=10))

    if data.get('summary'):
        story.append(Paragraph(data['summary'], summary_s))
        story.append(HRFlowable(width='100%', thickness=0.5, color=RULE, spaceAfter=4))

    def two_col(date_txt, parts):
        tbl = Table([[Paragraph(date_txt, small_s), parts]], colWidths=[3*cm, None])
        tbl.setStyle(TableStyle([
            ('VALIGN',        (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING',    (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('LEFTPADDING',   (0,0), (-1,-1), 0),
            ('RIGHTPADDING',  (0,0), (0,-1),  12),
            ('RIGHTPADDING',  (1,0), (1,-1),  0),
        ]))
        return tbl

    if data.get('experience'):
        story.append(Paragraph('BERUFSERFAHRUNG', section_s))
        story.append(HRFlowable(width='100%', thickness=0.5, color=NAVY, spaceAfter=8))
        for exp in data['experience']:
            end      = 'heute' if exp.get('current') else (exp.get('end') or '')
            date_txt = f"{exp.get('start', '')} –\n{end}"
            parts    = []
            if exp.get('role'):
                parts.append(Paragraph(f"<b>{exp['role']}</b>", bold_s))
            cl = ' · '.join(filter(None, [exp.get('company'), exp.get('location')]))
            if cl:
                parts.append(Paragraph(cl, small_s))
            for b in (exp.get('bullets') or []):
                if b.strip():
                    parts.append(Paragraph(f'• {b}', bullet_s))
            if parts:
                story.append(two_col(date_txt, parts))
                story.append(Spacer(1, 8))

    if data.get('education'):
        story.append(Paragraph('AUSBILDUNG', section_s))
        story.append(HRFlowable(width='100%', thickness=0.5, color=NAVY, spaceAfter=8))
        for edu in data['education']:
            date_txt = f"{edu.get('start', '')} –\n{edu.get('end', '')}"
            parts    = []
            df = ' – '.join(filter(None, [edu.get('degree'), edu.get('field')]))
            if df:
                parts.append(Paragraph(f'<b>{df}</b>', bold_s))
            inst = edu.get('institution', '')
            if edu.get('grade'):
                inst += f' · Note: {edu["grade"]}'
            if inst:
                parts.append(Paragraph(inst, small_s))
            if parts:
                story.append(two_col(date_txt, parts))
                story.append(Spacer(1, 8))

    if data.get('skills'):
        story.append(Paragraph('KENNTNISSE', section_s))
        story.append(HRFlowable(width='100%', thickness=0.5, color=NAVY, spaceAfter=8))
        story.append(Paragraph(' · '.join(s for s in data['skills'] if s), body_s))

    if data.get('languages'):
        story.append(Paragraph('SPRACHEN', section_s))
        story.append(HRFlowable(width='100%', thickness=0.5, color=NAVY, spaceAfter=8))
        lt = ' · '.join(f"{l.get('lang', '')}: {l.get('level', '')}" for l in data['languages'] if l.get('lang'))
        story.append(Paragraph(lt, body_s))

    if data.get('certifications'):
        story.append(Paragraph('ZERTIFIKATE', section_s))
        story.append(HRFlowable(width='100%', thickness=0.5, color=NAVY, spaceAfter=8))
        for cert in data['certifications']:
            txt = cert.get('name', '')
            if cert.get('issuer'):
                txt += f' · {cert["issuer"]}'
            if cert.get('year'):
                txt += f' ({cert["year"]})'
            story.append(Paragraph(txt, body_s))

    doc.build(story)
    buf.seek(0)
    return buf


# ── Lebenslauf PDF — modern ────────────────────────────────────────────────────

def _cv_pdf_modern(data, profile):
    buf  = io.BytesIO()
    L, R = 2.5*cm, 2.5*cm
    HDR_H = 3.6*cm

    doc = SimpleDocTemplate(buf, pagesize=A4,
                            leftMargin=L, rightMargin=R,
                            topMargin=HDR_H + 0.4*cm, bottomMargin=1.5*cm)
    p = data.get('personal', {})
    CONTENT_W = A4[0] - L - R

    name = p.get('name') or profile.get('name') or ''
    contacts = [p.get('phone') or profile.get('telefon'), p.get('email') or profile.get('email'),
                p.get('city') or profile.get('plz_ort'), p.get('linkedin')]
    ct = '  ·  '.join(x for x in contacts if x)

    def draw_header(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(NAVY)
        canvas.rect(0, A4[1] - HDR_H, A4[0], HDR_H, fill=1, stroke=0)
        y_name = A4[1] - 1.7*cm
        if name:
            canvas.setFillColor(colors.white)
            canvas.setFont('Helvetica-Bold', 22)
            canvas.drawString(L, y_name, name)
        if ct:
            canvas.setFillColor(colors.HexColor('#94a3b8'))
            canvas.setFont('Helvetica', 10)
            canvas.drawString(L, y_name - 0.8*cm, ct[:120])
        canvas.restoreState()

    sec_s    = ParagraphStyle('M_sec', fontName='Helvetica-Bold', fontSize=10,
                               textColor=NAVY, spaceBefore=14, spaceAfter=6)
    body_s   = ParagraphStyle('M_body', fontName='Helvetica', fontSize=10, leading=14, spaceAfter=2)
    bold_s   = ParagraphStyle('M_bold', fontName='Helvetica-Bold', fontSize=10, leading=14, spaceAfter=2)
    small_s  = ParagraphStyle('M_small', fontName='Helvetica', fontSize=9.5, textColor=SLATE, leading=13)
    bullet_s = ParagraphStyle('M_bul', fontName='Helvetica', fontSize=10, leading=14,
                               leftIndent=10, spaceAfter=1)
    sum_s    = ParagraphStyle('M_sum', fontName='Helvetica', fontSize=10.5, leading=16, spaceAfter=12)

    def section_title(txt):
        bar = Table([[Paragraph(txt.upper(), sec_s)]], colWidths=[CONTENT_W])
        bar.setStyle(TableStyle([
            ('LINEBEFORE',    (0,0), (0,-1), 3, CYAN),
            ('LEFTPADDING',   (0,0), (-1,-1), 8),
            ('TOPPADDING',    (0,0), (-1,-1), 2),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ]))
        return bar

    def two_col(date_txt, parts):
        tbl = Table([[Paragraph(date_txt, small_s), parts]], colWidths=[3*cm, None])
        tbl.setStyle(TableStyle([
            ('VALIGN',        (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING',    (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('LEFTPADDING',   (0,0), (-1,-1), 0),
            ('RIGHTPADDING',  (0,0), (0,-1),  12),
            ('RIGHTPADDING',  (1,0), (1,-1),  0),
        ]))
        return tbl

    story = []

    if data.get('summary'):
        story.append(Paragraph(data['summary'], sum_s))

    if data.get('experience'):
        story.append(section_title('Berufserfahrung'))
        story.append(HRFlowable(width='100%', thickness=0.5, color=RULE, spaceAfter=8))
        for exp in data['experience']:
            end      = 'heute' if exp.get('current') else (exp.get('end') or '')
            date_txt = f"{exp.get('start', '')} –\n{end}"
            parts    = []
            if exp.get('role'):
                parts.append(Paragraph(f"<b>{exp['role']}</b>", bold_s))
            cl = ' · '.join(filter(None, [exp.get('company'), exp.get('location')]))
            if cl:
                parts.append(Paragraph(cl, small_s))
            for b in (exp.get('bullets') or []):
                if b.strip():
                    parts.append(Paragraph(f'• {b}', bullet_s))
            if parts:
                story.append(two_col(date_txt, parts))
                story.append(Spacer(1, 8))

    if data.get('education'):
        story.append(section_title('Ausbildung'))
        story.append(HRFlowable(width='100%', thickness=0.5, color=RULE, spaceAfter=8))
        for edu in data['education']:
            date_txt = f"{edu.get('start', '')} –\n{edu.get('end', '')}"
            parts    = []
            df = ' – '.join(filter(None, [edu.get('degree'), edu.get('field')]))
            if df:
                parts.append(Paragraph(f'<b>{df}</b>', bold_s))
            inst = edu.get('institution', '')
            if edu.get('grade'):
                inst += f' · Note: {edu["grade"]}'
            if inst:
                parts.append(Paragraph(inst, small_s))
            if parts:
                story.append(two_col(date_txt, parts))
                story.append(Spacer(1, 8))

    if data.get('skills'):
        story.append(section_title('Kenntnisse'))
        story.append(HRFlowable(width='100%', thickness=0.5, color=RULE, spaceAfter=8))
        story.append(Paragraph(' · '.join(s for s in data['skills'] if s), body_s))
        story.append(Spacer(1, 4))

    if data.get('languages'):
        story.append(section_title('Sprachen'))
        story.append(HRFlowable(width='100%', thickness=0.5, color=RULE, spaceAfter=8))
        lt = ' · '.join(f"{l.get('lang', '')}: {l.get('level', '')}" for l in data['languages'] if l.get('lang'))
        story.append(Paragraph(lt, body_s))

    if data.get('certifications'):
        story.append(section_title('Zertifikate'))
        story.append(HRFlowable(width='100%', thickness=0.5, color=RULE, spaceAfter=8))
        for cert in data['certifications']:
            txt = cert.get('name', '')
            if cert.get('issuer'):
                txt += f' · {cert["issuer"]}'
            if cert.get('year'):
                txt += f' ({cert["year"]})'
            story.append(Paragraph(txt, body_s))

    doc.build(story, onFirstPage=draw_header, onLaterPages=draw_header)
    buf.seek(0)
    return buf


# ── Lebenslauf PDF — minimal ───────────────────────────────────────────────────

def _cv_pdf_minimal(data, profile):
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            leftMargin=3*cm, rightMargin=3*cm,
                            topMargin=2.5*cm, bottomMargin=2*cm)
    p = data.get('personal', {})

    name_s   = ParagraphStyle('N_name', fontName='Helvetica-Bold', fontSize=26,
                               textColor=INK, spaceAfter=6)
    ct_s     = ParagraphStyle('N_ct', fontName='Helvetica', fontSize=10,
                               textColor=SLATE, spaceAfter=20)
    sec_s    = ParagraphStyle('N_sec', fontName='Helvetica-Bold', fontSize=10.5,
                               textColor=NAVY, spaceBefore=18, spaceAfter=8)
    body_s   = ParagraphStyle('N_body', fontName='Helvetica', fontSize=10.5, leading=16, spaceAfter=2)
    bold_s   = ParagraphStyle('N_bold', fontName='Helvetica-Bold', fontSize=10.5, leading=16, spaceAfter=2)
    small_s  = ParagraphStyle('N_small', fontName='Helvetica', fontSize=10, textColor=SLATE, leading=14)
    bullet_s = ParagraphStyle('N_bul', fontName='Helvetica', fontSize=10.5, leading=16,
                               leftIndent=12, spaceAfter=2)
    sum_s    = ParagraphStyle('N_sum', fontName='Helvetica', fontSize=11, leading=18,
                               spaceAfter=16, textColor=colors.HexColor('#334155'))

    story = []

    story.append(HRFlowable(width='100%', thickness=3, color=CYAN, spaceAfter=20))

    name = p.get('name') or profile.get('name') or ''
    if name:
        story.append(Paragraph(name, name_s))

    contacts = [p.get('phone') or profile.get('telefon'), p.get('email') or profile.get('email'),
                p.get('city') or profile.get('plz_ort'), p.get('linkedin')]
    ct = '  ·  '.join(x for x in contacts if x)
    if ct:
        story.append(Paragraph(ct, ct_s))

    story.append(HRFlowable(width='100%', thickness=0.5, color=RULE, spaceAfter=8))

    if data.get('summary'):
        story.append(Paragraph(data['summary'], sum_s))

    def two_col(date_txt, parts):
        tbl = Table([[Paragraph(date_txt, small_s), parts]], colWidths=[3.2*cm, None])
        tbl.setStyle(TableStyle([
            ('VALIGN',        (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING',    (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('LEFTPADDING',   (0,0), (-1,-1), 0),
            ('RIGHTPADDING',  (0,0), (0,-1),  16),
            ('RIGHTPADDING',  (1,0), (1,-1),  0),
        ]))
        return tbl

    if data.get('experience'):
        story.append(Paragraph('Berufserfahrung', sec_s))
        story.append(HRFlowable(width='100%', thickness=0.5, color=RULE, spaceAfter=10))
        for exp in data['experience']:
            end      = 'heute' if exp.get('current') else (exp.get('end') or '')
            date_txt = f"{exp.get('start', '')} – {end}"
            parts    = []
            if exp.get('role'):
                parts.append(Paragraph(f"<b>{exp['role']}</b>", bold_s))
            cl = ' · '.join(filter(None, [exp.get('company'), exp.get('location')]))
            if cl:
                parts.append(Paragraph(cl, small_s))
            for b in (exp.get('bullets') or []):
                if b.strip():
                    parts.append(Paragraph(f'• {b}', bullet_s))
            if parts:
                story.append(two_col(date_txt, parts))
                story.append(Spacer(1, 10))

    if data.get('education'):
        story.append(Paragraph('Ausbildung', sec_s))
        story.append(HRFlowable(width='100%', thickness=0.5, color=RULE, spaceAfter=10))
        for edu in data['education']:
            date_txt = f"{edu.get('start', '')} – {edu.get('end', '')}"
            parts    = []
            df = ' – '.join(filter(None, [edu.get('degree'), edu.get('field')]))
            if df:
                parts.append(Paragraph(f'<b>{df}</b>', bold_s))
            inst = edu.get('institution', '')
            if edu.get('grade'):
                inst += f' · Note: {edu["grade"]}'
            if inst:
                parts.append(Paragraph(inst, small_s))
            if parts:
                story.append(two_col(date_txt, parts))
                story.append(Spacer(1, 10))

    if data.get('skills'):
        story.append(Paragraph('Kenntnisse', sec_s))
        story.append(HRFlowable(width='100%', thickness=0.5, color=RULE, spaceAfter=10))
        story.append(Paragraph(' · '.join(s for s in data['skills'] if s), body_s))

    if data.get('languages'):
        story.append(Paragraph('Sprachen', sec_s))
        story.append(HRFlowable(width='100%', thickness=0.5, color=RULE, spaceAfter=10))
        lt = ' · '.join(f"{l.get('lang', '')}: {l.get('level', '')}" for l in data['languages'] if l.get('lang'))
        story.append(Paragraph(lt, body_s))

    if data.get('certifications'):
        story.append(Paragraph('Zertifikate', sec_s))
        story.append(HRFlowable(width='100%', thickness=0.5, color=RULE, spaceAfter=10))
        for cert in data['certifications']:
            txt = cert.get('name', '')
            if cert.get('issuer'):
                txt += f' · {cert["issuer"]}'
            if cert.get('year'):
                txt += f' ({cert["year"]})'
            story.append(Paragraph(txt, body_s))

    doc.build(story)
    buf.seek(0)
    return buf
