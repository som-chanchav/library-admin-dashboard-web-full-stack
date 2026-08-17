from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.config import FINE_RATE_PER_DAY
from app.models import BorrowStatus, Borrowing, Fine, Notification


def calculate_fine(due_date: datetime, returned_at: datetime | None = None) -> float:
    end = returned_at or datetime.utcnow()
    if end <= due_date:
        return 0.0
    days_overdue = (end - due_date).days
    return round(days_overdue * FINE_RATE_PER_DAY, 2)


def apply_overdue_fine(db: Session, borrowing: Borrowing) -> Fine | None:
    if borrowing.status != BorrowStatus.ACTIVE:
        return None

    now = datetime.utcnow()
    if now <= borrowing.due_date:
        return None

    borrowing.status = BorrowStatus.OVERDUE
    amount = calculate_fine(borrowing.due_date, now)

    existing = db.query(Fine).filter(Fine.borrowing_id == borrowing.id, Fine.is_paid == False).first()
    if existing:
        existing.amount = amount
        return existing

    fine = Fine(
        member_id=borrowing.member_id,
        borrowing_id=borrowing.id,
        amount=amount,
        reason=f"Late return — {borrowing.copy.copy_code}",
    )
    db.add(fine)
    return fine


def process_all_overdue(db: Session) -> int:
    active = db.query(Borrowing).filter(Borrowing.status == BorrowStatus.ACTIVE).all()
    count = 0
    for b in active:
        if datetime.utcnow() > b.due_date:
            apply_overdue_fine(db, b)
            count += 1
    db.commit()
    return count


def send_due_reminder(db: Session, borrowing: Borrowing) -> Notification:
    days_left = (borrowing.due_date - datetime.utcnow()).days
    if days_left <= 0:
        title = "សៀវភៅហួសកំណត់ — Book Overdue"
        message = (
            f"សៀវភៅ '{borrowing.copy.book.title}' ហួសកំណត់សងហើយ។ "
            f"សូមសងឱ្យបានឆាប់តាមដែលអាចធ្វើបាន។"
        )
    else:
        title = "ការជូនដំណឹងសងសៀវភៅ — Due Date Reminder"
        message = (
            f"សៀវភៅ '{borrowing.copy.book.title}' "
            f"ត្រូវសងក្នុងរយៈពេល {days_left} ថ្ងៃ "
            f"({borrowing.due_date.strftime('%d/%m/%Y')})"
        )

    notification = Notification(
        member_id=borrowing.member_id,
        title=title,
        message=message,
    )
    db.add(notification)
    return notification


def send_due_reminders(db: Session) -> int:
    soon = datetime.utcnow() + timedelta(days=3)
    borrowings = (
        db.query(Borrowing)
        .filter(
            Borrowing.status.in_([BorrowStatus.ACTIVE, BorrowStatus.OVERDUE]),
            Borrowing.due_date <= soon,
        )
        .all()
    )
    count = 0
    for b in borrowings:
        send_due_reminder(db, b)
        count += 1
    db.commit()
    return count
