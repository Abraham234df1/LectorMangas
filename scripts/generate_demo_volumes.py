from pathlib import Path

from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A5
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf"
OUTPUT.mkdir(parents=True, exist_ok=True)

PAGE_W, PAGE_H = A5
PALETTE = [
    ("#E63946", "#171B24"), ("#FF7A45", "#231815"),
    ("#8B5CF6", "#17152A"), ("#00A8A8", "#102225"),
    ("#E3B341", "#262114"), ("#3B82F6", "#111C31"),
    ("#EC4899", "#2A1421"), ("#22C55E", "#102419"),
    ("#F97316", "#2A1910"), ("#6366F1", "#17182B"),
    ("#14B8A6", "#102724"), ("#EF4444", "#2B1518"),
]

styles = getSampleStyleSheet()
body_style = ParagraphStyle(
    "BodyDemo", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=11, leading=16, textColor=HexColor("#252936"),
    spaceAfter=9,
)
center_style = ParagraphStyle(
    "CenterDemo", parent=body_style, alignment=TA_CENTER,
)


def page_background(pdf, color="#F7F4ED"):
    pdf.setFillColor(HexColor(color))
    pdf.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)


def footer(pdf, volume, page):
    pdf.setFillColor(HexColor("#767B88"))
    pdf.setFont("Helvetica", 7.5)
    pdf.drawString(15 * mm, 9 * mm, f"MangaReadV1 - Demo original - Tomo {volume}")
    pdf.drawRightString(PAGE_W - 15 * mm, 9 * mm, f"Pagina {page}")


def draw_paragraph(pdf, text, x, y, width, style=body_style):
    paragraph = Paragraph(text, style)
    _, height = paragraph.wrap(width, PAGE_H)
    paragraph.drawOn(pdf, x, y - height)
    return y - height


def content_header(pdf, volume, title, accent):
    page_background(pdf)
    pdf.setFillColor(HexColor(accent))
    pdf.roundRect(15 * mm, PAGE_H - 35 * mm, PAGE_W - 30 * mm, 18 * mm, 4 * mm, fill=1, stroke=0)
    pdf.setFillColor(white)
    pdf.setFont("Helvetica-Bold", 8)
    pdf.drawString(20 * mm, PAGE_H - 24 * mm, f"TOMO {volume:02d}")
    pdf.setFont("Helvetica-Bold", 15)
    pdf.drawRightString(PAGE_W - 20 * mm, PAGE_H - 25 * mm, title)


def generate_volume(volume):
    accent, dark = PALETTE[volume - 1]
    path = OUTPUT / f"classroom-of-the-elite-tomo-{volume:02d}-demo.pdf"
    pdf = canvas.Canvas(str(path), pagesize=A5, pageCompression=1)
    pdf.setTitle(f"Classroom of the Elite - Tomo {volume} - Demo MangaReadV1")
    pdf.setAuthor("MangaReadV1 - contenido original de demostracion")

    # Page 1 - cover
    page_background(pdf, dark)
    pdf.setFillColor(HexColor(accent))
    pdf.circle(PAGE_W * 0.78, PAGE_H * 0.79, 28 * mm, fill=1, stroke=0)
    pdf.setFillColor(Color(1, 1, 1, alpha=0.12))
    for index in range(6):
        pdf.roundRect(15 * mm + index * 6 * mm, 36 * mm + index * 5 * mm, 75 * mm, 9 * mm, 3 * mm, fill=1, stroke=0)
    pdf.setFillColor(white)
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(16 * mm, PAGE_H - 24 * mm, "MANGAREADV1 / EDICION DEMO")
    pdf.setFont("Helvetica-Bold", 27)
    pdf.drawString(16 * mm, PAGE_H - 72 * mm, "CLASSROOM")
    pdf.drawString(16 * mm, PAGE_H - 84 * mm, "OF THE ELITE")
    pdf.setFillColor(HexColor(accent))
    pdf.setFont("Helvetica-Bold", 38)
    pdf.drawString(16 * mm, PAGE_H - 111 * mm, f"{volume:02d}")
    pdf.setFillColor(white)
    pdf.setFont("Helvetica", 9)
    pdf.drawString(16 * mm, 24 * mm, "Contenido original para probar el lector 3D")
    pdf.drawString(16 * mm, 18 * mm, "No contiene paginas de la obra comercial")
    pdf.showPage()

    # Page 2 - disclaimer and reader guide
    content_header(pdf, volume, "Antes de leer", accent)
    y = PAGE_H - 50 * mm
    y = draw_paragraph(pdf, "<b>Esta es una demostracion academica original.</b> Su objetivo es comprobar la carga de PDFs, la navegacion por capitulos, el zoom y la animacion de cambio de hoja.", 18 * mm, y, PAGE_W - 36 * mm)
    y -= 7 * mm
    for label, value in [
        ("Direccion", "Derecha a izquierda"),
        ("Paginas", "6"),
        ("Capitulos demo", "2"),
        ("Formato", "PDF optimizado para navegador"),
    ]:
        pdf.setFillColor(HexColor("#FFFFFF"))
        pdf.roundRect(18 * mm, y - 13 * mm, PAGE_W - 36 * mm, 11 * mm, 3 * mm, fill=1, stroke=0)
        pdf.setFillColor(HexColor("#303543"))
        pdf.setFont("Helvetica-Bold", 8)
        pdf.drawString(22 * mm, y - 8 * mm, label.upper())
        pdf.setFont("Helvetica", 9)
        pdf.drawRightString(PAGE_W - 22 * mm, y - 8 * mm, value)
        y -= 15 * mm
    footer(pdf, volume, 2)
    pdf.showPage()

    # Page 3 - chapter one
    content_header(pdf, volume, "Capitulo 1", accent)
    y = PAGE_H - 50 * mm
    y = draw_paragraph(pdf, f"<b>La prueba comienza</b><br/><br/>El tablero del aula mostraba una sola instruccion: cada equipo debia convertir una cantidad limitada de puntos en una estrategia sostenible. En el tomo de demostracion {volume}, la dificultad inicial era aprender a observar antes de actuar.", 18 * mm, y, PAGE_W - 36 * mm)
    y -= 5 * mm
    y = draw_paragraph(pdf, "Nadie recibio una respuesta correcta de antemano. Las reglas premiaban la cooperacion, pero tambien dejaban espacio para que una decision apresurada afectara al grupo completo. La tension crecio cuando el contador empezo a descender.", 18 * mm, y, PAGE_W - 36 * mm)
    y -= 5 * mm
    draw_paragraph(pdf, "La primera leccion fue sencilla: la informacion tenia valor solamente cuando podia convertirse en una accion clara.", 18 * mm, y, PAGE_W - 36 * mm)
    footer(pdf, volume, 3)
    pdf.showPage()

    # Page 4 - visual interlude
    content_header(pdf, volume, "Mapa de decisiones", accent)
    labels = [("OBSERVAR", 0.78), ("COMPARAR", 0.61), ("DECIDIR", 0.46), ("REVISAR", 0.30)]
    y = PAGE_H - 58 * mm
    for label, score in labels:
        pdf.setFillColor(HexColor("#E4E1D9"))
        pdf.roundRect(22 * mm, y, PAGE_W - 44 * mm, 8 * mm, 4 * mm, fill=1, stroke=0)
        pdf.setFillColor(HexColor(accent))
        pdf.roundRect(22 * mm, y, (PAGE_W - 44 * mm) * score, 8 * mm, 4 * mm, fill=1, stroke=0)
        pdf.setFillColor(HexColor("#252936"))
        pdf.setFont("Helvetica-Bold", 9)
        pdf.drawString(22 * mm, y + 12 * mm, label)
        y -= 26 * mm
    footer(pdf, volume, 4)
    pdf.showPage()

    # Page 5 - chapter two
    content_header(pdf, volume, "Capitulo 2", accent)
    y = PAGE_H - 50 * mm
    y = draw_paragraph(pdf, "<b>Decisiones bajo presion</b><br/><br/>Cuando quedaban pocos minutos, el grupo dejo de discutir posibilidades abstractas. Cada integrante eligio una responsabilidad concreta y compartio sus avances en intervalos breves.", 18 * mm, y, PAGE_W - 36 * mm)
    y -= 5 * mm
    y = draw_paragraph(pdf, "El resultado no fue perfecto, pero era verificable. Esa diferencia transformo una coleccion de opiniones en un plan que todos podian mejorar.", 18 * mm, y, PAGE_W - 36 * mm)
    y -= 5 * mm
    draw_paragraph(pdf, "Al finalizar, el tablero mostro una frase nueva: la ventaja no siempre pertenece a quien sabe mas, sino a quien aprende mas rapido de sus errores.", 18 * mm, y, PAGE_W - 36 * mm)
    footer(pdf, volume, 5)
    pdf.showPage()

    # Page 6 - end
    page_background(pdf, dark)
    pdf.setFillColor(HexColor(accent))
    pdf.circle(PAGE_W / 2, PAGE_H * 0.65, 24 * mm, fill=1, stroke=0)
    pdf.setFillColor(white)
    pdf.setFont("Helvetica-Bold", 24)
    pdf.drawCentredString(PAGE_W / 2, PAGE_H * 0.46, "FIN DE LA DEMO")
    pdf.setFont("Helvetica", 10)
    pdf.drawCentredString(PAGE_W / 2, PAGE_H * 0.39, "Prueba ahora el salto de pagina, zoom y pantalla completa.")
    pdf.drawCentredString(PAGE_W / 2, PAGE_H * 0.34, "MangaReadV1 - Tomo de demostracion original")
    pdf.showPage()

    pdf.save()
    return path


if __name__ == "__main__":
    generated = [generate_volume(volume) for volume in range(1, 13)]
    for item in generated:
        print(item)
