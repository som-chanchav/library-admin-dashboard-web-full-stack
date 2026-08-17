from io import BytesIO
from pathlib import Path
from io import BytesIO
from pathlib import Path
from datetime import datetime
import re

from app.models import Receipt

BASE_DIR = Path(__file__).resolve().parents[2]
RECEIPTS_DIR = BASE_DIR / "receipts"

THERMAL_SIZES_RAW = {
    "58mm": (58, 200),
    "80mm": (80, 200),
}


def ensure_receipts_folder():
    (RECEIPTS_DIR / "borrow").mkdir(parents=True, exist_ok=True)
    (RECEIPTS_DIR / "return").mkdir(parents=True, exist_ok=True)


def _parse_seq(receipt_number: str) -> int:
    m = re.search(r"-(\d{5})$", receipt_number)
    if not m:
        return 0
    return int(m.group(1))


def generate_receipt_number(db, prefix: str):
    year = datetime.utcnow().year
    like = f"{prefix}-{year}-%"
    last = db.query(Receipt).filter(Receipt.receipt_number.like(like)).order_by(Receipt.id.desc()).first()
    if last and last.receipt_number:
        seq = _parse_seq(last.receipt_number) + 1
    else:
        seq = 1
    return f"{prefix}-{year}-{seq:05d}"


def _make_qr(data: str) -> BytesIO:
    try:
        import qrcode
    except Exception as e:
        raise ImportError("qrcode library is required to generate QR codes. Install with `pip install qrcode`") from e
    img = qrcode.make(data)
    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf


def create_receipt(db, transaction_type: str, transaction_id: str, member=None, book=None, borrow_date=None, due_date=None, return_date=None, late_days=0, fine_rate=0.0, fine_amount=0.0, created_by=None):
    ensure_receipts_folder()
    prefix = "LIB" if transaction_type.upper() == "BORROW" else "RET"
    receipt_number = generate_receipt_number(db, prefix)
    total = fine_amount or 0.0
    r = Receipt(
        receipt_number=receipt_number,
        transaction_id=transaction_id,
        member_id=getattr(member, 'id', None) if member else None,
        member_name=getattr(member, 'full_name', '') if member else (member or ""),
        book_id=getattr(book, 'id', None) if book else None,
        book_title=getattr(book, 'title', '') if book else (book or ""),
        transaction_type=transaction_type.upper(),
        borrow_date=borrow_date,
        due_date=due_date,
        return_date=return_date,
        late_days=late_days or 0,
        fine_rate=fine_rate or 0.0,
        fine_amount=fine_amount or 0.0,
        total_amount=total,
        created_by=created_by,
    )
    db.add(r)
    db.commit()
    db.refresh(r)

    # generate PDF and save (lazy import of heavy libs)
    try:
        pdf_bytes = build_pdf(r, paper_size="A4")
    except ImportError:
        # PDF generation not available; return receipt record without saving PDF
        return r

    folder = RECEIPTS_DIR / ("borrow" if r.transaction_type == "BORROW" else "return")
    filename = f"{r.receipt_number}.pdf"
    path = folder / filename
    with path.open("wb") as f:
        f.write(pdf_bytes.getvalue())

    return r


def build_pdf(receipt: Receipt, paper_size: str = "A4") -> BytesIO:
    try:
        from reportlab.lib.pagesizes import A4, A5
        from reportlab.lib import colors
        from reportlab.lib.units import mm
        from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, Flowable
        from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
        from reportlab.lib.utils import ImageReader
        from PIL import Image
    except Exception as e:
        raise ImportError("reportlab and Pillow are required to generate PDFs. Install with `pip install reportlab Pillow`") from e

    mm_map = {k: (v[0] * mm, v[1] * mm) for k, v in THERMAL_SIZES_RAW.items()}
    pagesize = A4
    if paper_size == "A5":
        pagesize = A5
    elif paper_size in mm_map:
        pagesize = mm_map[paper_size]

    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=pagesize, rightMargin=12 * mm, leftMargin=12 * mm, topMargin=10 * mm, bottomMargin=10 * mm)

    styles = getSampleStyleSheet()
    normal = styles['Normal']
    normal.fontName = 'Helvetica'
    normal.fontSize = 9
    normal.leading = 12
    h1 = ParagraphStyle('h1', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=16, alignment=TA_CENTER, spaceAfter=6)
    h2 = ParagraphStyle('h2', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=12, spaceAfter=6)
    small = ParagraphStyle('small', parent=normal, fontSize=8)

    elems = []

    # Header block: logo + library details on left, receipt meta on right
    logo_path = BASE_DIR / 'static' / 'images' / 'beltei-logo.png'
    left_col = []
    if logo_path.exists():
        try:
            im = Image.open(logo_path)
            im.thumbnail((120, 120))
            left_col.append(RLImage(ImageReader(im), width=50, height=50))
        except Exception:
            left_col.append(Paragraph('<b>BELTEI LIBRARY</b>', h2))
    else:
        left_col.append(Paragraph('<b>BELTEI LIBRARY</b>', h2))

    left_col.append(Paragraph('BELTEI International University<br/>Library Services<br/>Phnom Penh, Cambodia', small))

    right_col = []
    right_col.append(Paragraph(f'<b>{receipt.transaction_type} RECEIPT</b>', ParagraphStyle('rt', parent=normal, fontSize=14, alignment=TA_RIGHT)))
    right_col.append(Paragraph(f'Receipt No: <b>{receipt.receipt_number}</b>', ParagraphStyle('rt2', parent=normal, alignment=TA_RIGHT)))
    right_col.append(Paragraph(f'Transaction: {receipt.transaction_id}', ParagraphStyle('rt3', parent=small, alignment=TA_RIGHT)))
    right_col.append(Paragraph(f'Date: {receipt.created_at.strftime("%d %b %Y %I:%M %p")}', ParagraphStyle('rt4', parent=small, alignment=TA_RIGHT)))

    # Build header table
    header_table = Table([[left_col, right_col]], colWidths=[doc.width * 0.6, doc.width * 0.4])
    header_table.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    elems.append(header_table)
    elems.append(Spacer(1, 6))

    # Member & Book details
    member_data = [
        ['Member ID', receipt.member_id or ''],
        ['Name', receipt.member_name or ''],
    ]
    book_data = [
        ['Book ID', receipt.book_id or ''],
        ['Title', receipt.book_title or ''],
    ]
    left_table = Table(member_data, colWidths=[60 * mm, doc.width * 0.4 - 60 * mm])
    right_table = Table(book_data, colWidths=[60 * mm, doc.width * 0.6 - 60 * mm])
    info_table = Table([[left_table, right_table]], colWidths=[doc.width * 0.5, doc.width * 0.5])
    info_table.setStyle(TableStyle([('BOX', (0, 0), (-1, -1), 0.5, colors.grey), ('INNERGRID', (0, 0), (-1, -1), 0.25, colors.lightgrey)]))
    elems.append(info_table)
    elems.append(Spacer(1, 8))

    # Transaction details and fine summary
    trans_rows = [
        ['Borrow Date', receipt.borrow_date.strftime('%d %b %Y') if receipt.borrow_date else ''],
        ['Due Date', receipt.due_date.strftime('%d %b %Y') if receipt.due_date else ''],
        ['Return Date', receipt.return_date.strftime('%d %b %Y') if receipt.return_date else ''],
        ['Late Days', str(receipt.late_days or 0)],
    ]
    trans_table = Table(trans_rows, colWidths=[doc.width * 0.5, doc.width * 0.5])
    trans_table.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), colors.whitesmoke), ('BOX', (0, 0), (-1, -1), 0.5, colors.grey), ('INNERGRID', (0, 0), (-1, -1), 0.25, colors.lightgrey)]))
    elems.append(trans_table)
    elems.append(Spacer(1, 8))

    # Fine summary box
    fine_table = Table([['Fine Rate', f'${receipt.fine_rate:.2f} / day' if receipt.fine_rate else '$0.00'], ['Fine', f'${receipt.fine_amount:.2f}'], ['Total', f'${receipt.total_amount:.2f}']], colWidths=[doc.width * 0.6, doc.width * 0.4])
    fine_table.setStyle(TableStyle([('BOX', (0, 0), (-1, -1), 0.5, colors.grey), ('BACKGROUND', (-1, -1), (-1, -1), colors.lightgrey), ('ALIGN', (-1, 0), (-1, -1), 'RIGHT')]))
    elems.append(fine_table)
    elems.append(Spacer(1, 10))

    # QR code (right side)
    qr_data = f"Receipt:{receipt.receipt_number};Txn:{receipt.transaction_id};Member:{receipt.member_id};Book:{receipt.book_id};Type:{receipt.transaction_type};Date:{receipt.created_at.isoformat()}"
    try:
        qr_buf = _make_qr(qr_data)
        qr_img = Image.open(qr_buf)
        qr_img.thumbnail((120, 120))
        qr_rl = RLImage(ImageReader(qr_img), width=60, height=60)
        qr_table = Table([[qr_rl, Paragraph('Scan for receipt details', small)]], colWidths=[60, doc.width - 60])
        elems.append(qr_table)
    except Exception:
        pass

    elems.append(Spacer(1, 12))
    elems.append(Paragraph('Librarian Signature: ____________________        Member Signature: ____________________', small))
    elems.append(Spacer(1, 6))
    elems.append(Paragraph('Thank you for using BELTEI Library. Please return books on or before the due date to avoid fines.', small))

    doc.build(elems)
    buf.seek(0)
    return buf
