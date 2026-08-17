from datetime import datetime, timedelta

from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.config import BORROW_DAYS_DEFAULT, FINE_RATE_PER_DAY, MAX_BOOKS_PER_MEMBER
from app.models import (
    Author,
    Book,
    BookCopy,
    BookStatus,
    BorrowStatus,
    Borrowing,
    Category,
    Fine,
    Member,
    MemberType,
    Notification,
    Publisher,
    Reservation,
    ReservationStatus,
    User,
    UserRole,
)
from app.schemas import (
    AuthorCreate,
    BookCreate,
    BookUpdate,
    BorrowCreate,
    CategoryCreate,
    MemberCreate,
    PublisherCreate,
    ReservationCreate,
)
from app.services.fines import apply_overdue_fine, calculate_fine, process_all_overdue, send_due_reminders
from app.services.receipts import create_receipt


def dashboard_stats(db: Session) -> dict:
    total_books = db.query(Book).count()
    total_copies = db.query(BookCopy).count()
    available = db.query(BookCopy).filter(BookCopy.status == BookStatus.AVAILABLE).count()
    borrowed = db.query(BookCopy).filter(BookCopy.status == BookStatus.BORROWED).count()
    lost = db.query(BookCopy).filter(BookCopy.status == BookStatus.LOST).count()
    damaged = db.query(BookCopy).filter(
        BookCopy.status.in_([BookStatus.DAMAGED, BookStatus.REPAIR])
    ).count()
    members = db.query(Member).filter(Member.is_active == True).count()
    active_borrows = db.query(Borrowing).filter(
        Borrowing.status.in_([BorrowStatus.ACTIVE, BorrowStatus.OVERDUE])
    ).count()
    overdue = db.query(Borrowing).filter(Borrowing.status == BorrowStatus.OVERDUE).count()
    unpaid_fines = db.query(func.sum(Fine.amount)).filter(Fine.is_paid == False).scalar() or 0
    pending_reservations = db.query(Reservation).filter(
        Reservation.status == ReservationStatus.PENDING
    ).count()

    return {
        "total_books": total_books,
        "total_copies": total_copies,
        "available_copies": available,
        "borrowed_copies": borrowed,
        "lost_copies": lost,
        "damaged_copies": damaged,
        "active_members": members,
        "active_borrowings": active_borrows,
        "overdue_borrowings": overdue,
        "unpaid_fines": round(unpaid_fines, 2),
        "pending_reservations": pending_reservations,
        "fine_rate": FINE_RATE_PER_DAY,
    }


def chart_borrow_trends(db: Session) -> dict:
    months = []
    counts = []
    now = datetime.utcnow()
    for i in range(5, -1, -1):
        start = (now.replace(day=1) - timedelta(days=30 * i)).replace(day=1, hour=0, minute=0)
        if i == 0:
            end = now
        else:
            end = (start + timedelta(days=32)).replace(day=1) - timedelta(seconds=1)
        count = db.query(Borrowing).filter(
            Borrowing.borrowed_at >= start, Borrowing.borrowed_at <= end
        ).count()
        months.append(start.strftime("%b"))
        counts.append(count)
    return {"labels": months, "data": counts}


def chart_status_distribution(db: Session) -> dict:
    statuses = [BookStatus.AVAILABLE, BookStatus.BORROWED, BookStatus.LOST, BookStatus.DAMAGED, BookStatus.REPAIR]
    labels = ["Available", "Borrowed", "Lost", "Damaged", "Repair"]
    data = [db.query(BookCopy).filter(BookCopy.status == s).count() for s in statuses]
    return {"labels": labels, "data": data}


def chart_member_types(db: Session) -> dict:
    types = [MemberType.STUDENT, MemberType.TEACHER, MemberType.STAFF]
    labels = ["Students", "Teachers", "Staff"]
    data = [db.query(Member).filter(Member.member_type == t, Member.is_active == True).count() for t in types]
    return {"labels": labels, "data": data}


def list_books(db: Session, q: str = "", category_id: int | None = None):
    query = db.query(Book).options(
        joinedload(Book.author),
        joinedload(Book.category),
        joinedload(Book.publisher),
        joinedload(Book.copies),
    )
    if q:
        like = f"%{q}%"
        query = query.outerjoin(Author).filter(
            or_(
                Book.title.ilike(like),
                Book.isbn.ilike(like),
                Author.name.ilike(like),
            )
        )
    if category_id:
        query = query.filter(Book.category_id == category_id)
    return query.order_by(Book.title).all()


def create_book(db: Session, data: BookCreate) -> Book:
    book = Book(
        title=data.title,
        isbn=data.isbn,
        description=data.description,
        language=data.language,
        publication_year=data.publication_year,
        cover_color=data.cover_color,
        cover_image=data.cover_image,
        category_id=data.category_id,
        author_id=data.author_id,
        publisher_id=data.publisher_id,
    )
    db.add(book)
    db.flush()
    for i in range(data.copies_count):
        copy = BookCopy(
            book_id=book.id,
            copy_code=f"BK{book.id:03d}-{i+1:03d}",
            status=BookStatus.AVAILABLE,
        )
        db.add(copy)
    db.commit()
    db.refresh(book)
    return book


def get_or_create_category(db: Session, name: str) -> Category | None:
    name = (name or "").strip()
    if not name:
        return None
    category = db.query(Category).filter(func.lower(Category.name) == name.lower()).first()
    if category:
        return category
    category = Category(name=name)
    db.add(category)
    db.flush()
    db.refresh(category)
    return category


def get_or_create_author(db: Session, name: str) -> Author | None:
    name = (name or "").strip()
    if not name:
        return None
    author = db.query(Author).filter(func.lower(Author.name) == name.lower()).first()
    if author:
        return author
    author = Author(name=name)
    db.add(author)
    db.flush()
    db.refresh(author)
    return author


def get_or_create_publisher(db: Session, name: str) -> Publisher | None:
    name = (name or "").strip()
    if not name:
        return None
    publisher = db.query(Publisher).filter(func.lower(Publisher.name) == name.lower()).first()
    if publisher:
        return publisher
    publisher = Publisher(name=name)
    db.add(publisher)
    db.flush()
    db.refresh(publisher)
    return publisher


def create_book_with_copies(db: Session, data: BookCreate, available_count: int | None = None) -> Book:
    if available_count is None:
        available_count = data.copies_count
    if available_count < 0 or available_count > data.copies_count:
        raise ValueError("Available count must be between 0 and total copies")

    book = Book(
        title=data.title,
        isbn=data.isbn,
        description=data.description,
        language=data.language,
        publication_year=data.publication_year,
        cover_color=data.cover_color,
        cover_image=data.cover_image,
        category_id=data.category_id,
        author_id=data.author_id,
        publisher_id=data.publisher_id,
    )
    db.add(book)
    db.flush()

    for i in range(data.copies_count):
        status = BookStatus.AVAILABLE if i < available_count else BookStatus.BORROWED
        copy = BookCopy(
            book_id=book.id,
            copy_code=f"BK{book.id:03d}-{i+1:03d}",
            status=status,
        )
        db.add(copy)

    db.flush()
    db.refresh(book)
    return book


def update_book(db: Session, book_id: int, data: BookUpdate) -> Book | None:
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(book, field, value)
    db.commit()
    db.refresh(book)
    return book


def delete_book(db: Session, book_id: int) -> bool:
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        return False
    db.delete(book)
    db.commit()
    return True


def list_members(db: Session, q: str = ""):
    query = db.query(Member)
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(Member.full_name.ilike(like), Member.member_code.ilike(like), Member.email.ilike(like))
        )
    return query.order_by(Member.full_name).all()


def create_member(db: Session, data: MemberCreate) -> Member:
    member = Member(
        member_code=data.member_code,
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        member_type=MemberType(data.member_type),
        department=data.department,
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


def borrow_book(db: Session, data: BorrowCreate) -> Borrowing:
    copy = db.query(BookCopy).filter(BookCopy.id == data.copy_id).first()
    if not copy or copy.status != BookStatus.AVAILABLE:
        raise ValueError("Copy not available")

    member = db.query(Member).filter_by(id=data.member_id).first()
    max_limit = MAX_BOOKS_PER_MEMBER
    if member and member.member_type in (MemberType.TEACHER, MemberType.STAFF):
        max_limit = max(MAX_BOOKS_PER_MEMBER, 15)

    active_count = db.query(Borrowing).filter(
        Borrowing.member_id == data.member_id,
        Borrowing.status.in_([BorrowStatus.ACTIVE, BorrowStatus.OVERDUE]),
    ).count()
    if active_count >= max_limit:
        raise ValueError(f"សមាជិកបានខ្ចីដល់កម្រិតអតិបរមាហើយ ({max_limit} ក្បាល) / Member has reached maximum borrow limit of {max_limit} books")

    due = datetime.utcnow() + timedelta(days=data.days or BORROW_DAYS_DEFAULT)
    borrowing = Borrowing(
        member_id=data.member_id,
        copy_id=data.copy_id,
        due_date=due,
        status=BorrowStatus.ACTIVE,
    )
    copy.status = BookStatus.BORROWED
    db.add(borrowing)
    db.commit()
    db.refresh(borrowing)

    # create receipt record
    try:
        create_receipt(
            db,
            transaction_type="BORROW",
            transaction_id=f"TRX-{borrowing.id}",
            member=borrowing.member,
            book=borrowing.copy.book,
            borrow_date=borrowing.borrowed_at,
            due_date=borrowing.due_date,
            fine_rate=float(FINE_RATE_PER_DAY),
            fine_amount=0.0,
            created_by=None,
        )
    except Exception:
        pass
    return borrowing


def return_book(db: Session, borrowing_id: int) -> Borrowing:
    borrowing = (
        db.query(Borrowing)
        .options(joinedload(Borrowing.copy))
        .filter(Borrowing.id == borrowing_id)
        .first()
    )
    if not borrowing or borrowing.status == BorrowStatus.RETURNED:
        raise ValueError("Invalid borrowing")

    now = datetime.utcnow()
    borrowing.returned_at = now
    borrowing.status = BorrowStatus.RETURNED
    borrowing.copy.status = BookStatus.AVAILABLE

    fine_amount = calculate_fine(borrowing.due_date, now)
    if fine_amount > 0:
        fine = Fine(
            member_id=borrowing.member_id,
            borrowing_id=borrowing.id,
            amount=fine_amount,
            reason=f"Late return — {borrowing.copy.copy_code}",
        )
        db.add(fine)

    db.commit()
    db.refresh(borrowing)
    # create return receipt
    try:
        late_days = 0
        if borrowing.returned_at and borrowing.due_date:
            delta = borrowing.returned_at.date() - borrowing.due_date.date()
            late_days = max(0, delta.days)
        fine_amount = calculate_fine(borrowing.due_date, borrowing.returned_at)
        create_receipt(
            db,
            transaction_type="RETURN",
            transaction_id=f"TRX-{borrowing.id}",
            member=borrowing.member,
            book=borrowing.copy.book,
            borrow_date=borrowing.borrowed_at,
            due_date=borrowing.due_date,
            return_date=borrowing.returned_at,
            late_days=late_days,
            fine_rate=float(FINE_RATE_PER_DAY),
            fine_amount=fine_amount,
            created_by=None,
        )
    except Exception:
        pass
    return borrowing


def report_popular_books(db: Session, limit: int = 10):
    results = (
        db.query(Book.title, func.count(Borrowing.id).label("borrow_count"))
        .join(BookCopy, BookCopy.book_id == Book.id)
        .join(Borrowing, Borrowing.copy_id == BookCopy.id)
        .group_by(Book.id)
        .order_by(func.count(Borrowing.id).desc())
        .limit(limit)
        .all()
    )
    return [{"title": r[0], "count": r[1]} for r in results]


def report_damaged_lost(db: Session):
    copies = (
        db.query(BookCopy)
        .options(joinedload(BookCopy.book))
        .filter(BookCopy.status.in_([BookStatus.LOST, BookStatus.DAMAGED, BookStatus.REPAIR]))
        .all()
    )
    return copies


def report_members_with_borrows(db: Session):
    return (
        db.query(Member)
        .join(Borrowing)
        .filter(Borrowing.status.in_([BorrowStatus.ACTIVE, BorrowStatus.OVERDUE]))
        .distinct()
        .all()
    )


def report_members_with_fines(db: Session):
    return (
        db.query(Member)
        .join(Fine)
        .filter(Fine.is_paid == False)
        .distinct()
        .all()
    )


def create_reservation(db: Session, data: ReservationCreate) -> Reservation:
    reservation = Reservation(
        member_id=data.member_id,
        book_id=data.book_id,
        expires_at=datetime.utcnow() + timedelta(days=data.days),
        status=ReservationStatus.PENDING,
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation


def list_categories(db: Session):
    return db.query(Category).order_by(Category.name).all()


def create_category(db: Session, data: CategoryCreate) -> Category:
    cat = Category(name=data.name, name_km=data.name_km, description=data.description)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


def list_authors(db: Session):
    return db.query(Author).order_by(Author.name).all()


def create_author(db: Session, data: AuthorCreate) -> Author:
    author = Author(name=data.name, bio=data.bio, nationality=data.nationality)
    db.add(author)
    db.commit()
    db.refresh(author)
    return author


def list_publishers(db: Session):
    return db.query(Publisher).order_by(Publisher.name).all()


def create_publisher(db: Session, data: PublisherCreate) -> Publisher:
    pub = Publisher(
        name=data.name, address=data.address, phone=data.phone, email=data.email
    )
    db.add(pub)
    db.commit()
    db.refresh(pub)
    return pub


def list_borrowings(db: Session, status: str | None = None):
    query = db.query(Borrowing).options(
        joinedload(Borrowing.member),
        joinedload(Borrowing.copy).joinedload(BookCopy.book),
    )
    if status:
        query = query.filter(Borrowing.status == BorrowStatus(status))
    return query.order_by(Borrowing.borrowed_at.desc()).limit(100).all()


def list_reservations(db: Session):
    return (
        db.query(Reservation)
        .options(joinedload(Reservation.member), joinedload(Reservation.book))
        .order_by(Reservation.reserved_at.desc())
        .all()
    )


def list_fines(db: Session, unpaid_only: bool = True):
    query = db.query(Fine).options(joinedload(Fine.member))
    if unpaid_only:
        query = query.filter(Fine.is_paid == False)
    return query.order_by(Fine.created_at.desc()).all()


def pay_fine(db: Session, fine_id: int) -> Fine | None:
    fine = db.query(Fine).filter(Fine.id == fine_id).first()
    if not fine:
        return None
    fine.is_paid = True
    fine.paid_at = datetime.utcnow()
    db.commit()
    db.refresh(fine)
    return fine


def update_copy_status(db: Session, copy_id: int, status: str, note: str = "") -> BookCopy | None:
    copy = db.query(BookCopy).filter(BookCopy.id == copy_id).first()
    if not copy:
        return None
    copy.status = BookStatus(status)
    if note:
        copy.condition_note = note
    db.commit()
    db.refresh(copy)
    return copy


def list_users(db: Session):
    return db.query(User).order_by(User.full_name).all()


def member_history(db: Session, member_id: int):
    return (
        db.query(Borrowing)
        .options(joinedload(Borrowing.copy).joinedload(BookCopy.book))
        .filter(Borrowing.member_id == member_id)
        .order_by(Borrowing.borrowed_at.desc())
        .all()
    )


def recent_activity(db: Session, limit: int = 8):
    borrowings = list_borrowings(db)[:limit]
    activities = []
    for b in borrowings:
        activities.append({
            "type": "return" if b.status == BorrowStatus.RETURNED else "borrow",
            "member": b.member.full_name,
            "book": b.copy.book.title,
            "date": b.borrowed_at.isoformat(),
            "status": b.status.value,
        })
    return activities
