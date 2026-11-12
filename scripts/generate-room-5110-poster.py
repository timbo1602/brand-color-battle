#!/usr/bin/env python3
"""Generate the A4 Brand Color Battle room poster as a print-ready PDF."""

from pathlib import Path

from reportlab.graphics import renderPDF
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.lib.colors import Color, HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "brand-color-battle-raum-5110-a4.pdf"
TARGET_URL = "https://timbo1602.github.io/brand-color-battle/games/brand-color-battle/"

FONT_REGULAR = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"

BG = HexColor("#090B12")
SURFACE = HexColor("#10141F")
WHITE = HexColor("#F7F8FC")
MUTED = HexColor("#A7ADBD")
CYAN = HexColor("#00D9FF")
MAGENTA = HexColor("#FF2E9A")
YELLOW = HexColor("#FFE14F")
GREEN = HexColor("#7CFF6B")
GRID = HexColor("#202636")


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont("Arial", FONT_REGULAR))
    pdfmetrics.registerFont(TTFont("ArialBold", FONT_BOLD))
    pdfmetrics.registerFont(TTFont("ArialBlack", FONT_BLACK))


def draw_grid(pdf: canvas.Canvas, width: float, height: float) -> None:
    pdf.saveState()
    pdf.setStrokeColor(GRID)
    pdf.setStrokeAlpha(0.42)
    pdf.setLineWidth(0.45)
    step = 34
    x = 0
    while x <= width:
        pdf.line(x, 0, x, height)
        x += step
    y = 0
    while y <= height:
        pdf.line(0, y, width, y)
        y += step
    pdf.restoreState()


def draw_brand_mark(pdf: canvas.Canvas, x: float, y: float) -> None:
    pdf.saveState()
    pdf.setFillAlpha(0.9)
    for dx, dy, color in ((0, 8, CYAN), (18, 8, MAGENTA), (9, -8, YELLOW)):
        pdf.setFillColor(color)
        pdf.circle(x + dx, y + dy, 12, stroke=0, fill=1)
    pdf.restoreState()


def draw_qr(pdf: canvas.Canvas, x: float, y: float, size: float) -> None:
    padding = 16
    pdf.saveState()
    pdf.setFillColor(Color(0, 0, 0, alpha=0.28))
    pdf.roundRect(x + 7, y - 7, size, size, 19, stroke=0, fill=1)
    pdf.setFillColor(WHITE)
    pdf.roundRect(x, y, size, size, 19, stroke=0, fill=1)

    widget = QrCodeWidget(TARGET_URL, barLevel="H")
    x1, y1, x2, y2 = widget.getBounds()
    qr_width = x2 - x1
    qr_height = y2 - y1
    inner = size - 2 * padding
    scale = min(inner / qr_width, inner / qr_height)
    drawing = Drawing(inner, inner, transform=[scale, 0, 0, scale, 0, 0])
    drawing.add(widget)
    renderPDF.draw(drawing, pdf, x + padding, y + padding)
    pdf.restoreState()


def draw_poster(pdf: canvas.Canvas) -> None:
    width, height = A4
    pdf.setFillColor(BG)
    pdf.rect(0, 0, width, height, stroke=0, fill=1)
    draw_grid(pdf, width, height)

    # Full-height color rail from the game UI.
    rail = 9
    segments = ((height * 0.73, height, CYAN), (height * 0.46, height * 0.73, MAGENTA),
                (height * 0.19, height * 0.46, YELLOW), (0, height * 0.19, GREEN))
    for y1, y2, color in segments:
        pdf.setFillColor(color)
        pdf.rect(0, y1, rail, y2 - y1, stroke=0, fill=1)

    # Decorative translucent orbs.
    pdf.saveState()
    pdf.setFillAlpha(0.08)
    pdf.setFillColor(MAGENTA)
    pdf.circle(width - 28, height - 184, 118, stroke=0, fill=1)
    pdf.setFillColor(CYAN)
    pdf.circle(width - 8, 90, 102, stroke=0, fill=1)
    pdf.restoreState()

    margin = 43
    draw_brand_mark(pdf, margin + 3, height - 55)
    pdf.setFillColor(WHITE)
    pdf.setFont("ArialBold", 12)
    pdf.drawString(margin + 48, height - 52, "BRAND COLOR")
    pdf.setFillColor(CYAN)
    pdf.drawString(margin + 48, height - 67, "BATTLE")

    pdf.setFillColor(MUTED)
    pdf.setFont("ArialBold", 7.6)
    pdf.drawRightString(width - margin, height - 54, "MEDIENGESTALTUNG")
    pdf.drawRightString(width - margin, height - 66, "DIGITAL & PRINT")

    pdf.setFillColor(CYAN)
    pdf.setFont("ArialBold", 10)
    pdf.drawString(margin, height - 117, "DAS FARBQUIZ FÜR MARKENKENNER")

    pdf.setFillColor(WHITE)
    pdf.setFont("ArialBlack", 39)
    pdf.drawString(margin, height - 166, "SCAN.")
    pdf.setFillColor(MAGENTA)
    pdf.drawString(margin, height - 209, "PLAY.")

    pdf.saveState()
    pdf.setLineWidth(1.25)
    pdf.setStrokeColor(YELLOW)
    pdf.setFillColor(BG)
    title = pdf.beginText(margin, height - 252)
    title.setFont("ArialBlack", 39)
    title.setTextRenderMode(2)
    title.textOut("COMPETE.")
    pdf.drawText(title)
    pdf.restoreState()

    pdf.setFillColor(WHITE)
    pdf.setFont("ArialBold", 15)
    pdf.drawString(margin, height - 287, "Teste dein Farbgedächtnis.")
    pdf.setFillColor(MUTED)
    pdf.setFont("Arial", 10.5)
    pdf.drawString(margin, height - 307, "12 Aufgaben · 4 Runden · 1 globales Ranking")

    qr_x = margin
    qr_y = 190
    qr_size = 242
    draw_qr(pdf, qr_x, qr_y, qr_size)

    pdf.setFillColor(CYAN)
    pdf.setFont("ArialBold", 8.5)
    pdf.drawCentredString(qr_x + qr_size / 2, qr_y - 19, "KAMERA ÖFFNEN · QR-CODE SCANNEN")

    card_x = 320
    card_y = 246
    card_w = width - margin - card_x
    card_h = 186
    pdf.saveState()
    pdf.setFillColor(SURFACE)
    pdf.setFillAlpha(0.94)
    pdf.roundRect(card_x, card_y, card_w, card_h, 20, stroke=0, fill=1)
    pdf.setStrokeColor(MAGENTA)
    pdf.setStrokeAlpha(0.55)
    pdf.setLineWidth(1.3)
    pdf.roundRect(card_x, card_y, card_w, card_h, 20, stroke=1, fill=0)
    pdf.restoreState()

    pdf.setFillColor(GREEN)
    pdf.circle(card_x + 24, card_y + card_h - 27, 4, stroke=0, fill=1)
    pdf.setFont("ArialBold", 8.5)
    pdf.drawString(card_x + 35, card_y + card_h - 30, "LIVE SPIELBAR IN")

    pdf.setFillColor(WHITE)
    pdf.setFont("ArialBlack", 29)
    pdf.drawString(card_x + 20, card_y + 108, "RAUM")
    pdf.setFillColor(YELLOW)
    pdf.setFont("ArialBlack", 58)
    pdf.drawString(card_x + 17, card_y + 45, "5110")

    pdf.setFillColor(MUTED)
    pdf.setFont("Arial", 9.6)
    pdf.drawString(card_x + 2, 211, "Einfach scannen und direkt")
    pdf.drawString(card_x + 2, 197, "auf dem Smartphone mitspielen.")

    # CTA strip and footer.
    strip_y = 102
    strip_h = 54
    pdf.setFillColor(CYAN)
    pdf.roundRect(margin, strip_y, width - 2 * margin, strip_h, 17, stroke=0, fill=1)
    pdf.setFillColor(BG)
    pdf.setFont("ArialBlack", 17)
    pdf.drawCentredString(width / 2, strip_y + 31, "FARBE ZEIGEN. PUNKTE HOLEN.")
    pdf.setFont("ArialBold", 8)
    pdf.drawCentredString(width / 2, strip_y + 15, "JETZT BRAND COLOR BATTLE SPIELEN")

    pdf.setStrokeColor(GRID)
    pdf.setLineWidth(0.8)
    pdf.line(margin, 75, width - margin, 75)
    pdf.setFillColor(MUTED)
    pdf.setFont("Arial", 6.8)
    pdf.drawString(margin, 55, "timbo1602.github.io/brand-color-battle/games/brand-color-battle/")
    pdf.drawRightString(width - margin, 55, "CTRL + CREATE ARCADE")


def main() -> None:
    register_fonts()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1, pdfVersion=(1, 4))
    pdf.setTitle("Brand Color Battle - Raum 5110")
    pdf.setAuthor("CTRL + CREATE ARCADE")
    pdf.setSubject("A4-Plakat mit QR-Code zum Brand Color Battle")
    pdf.setCreator("Brand Color Battle poster generator")
    draw_poster(pdf)
    pdf.showPage()
    pdf.save()
    print(OUTPUT)


if __name__ == "__main__":
    main()
