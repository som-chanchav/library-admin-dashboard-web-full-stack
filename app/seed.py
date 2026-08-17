from datetime import datetime

from sqlalchemy.orm import Session

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


def seed_database(db: Session) -> None:
    # This account is created even for imported databases that already have users.
    demo_user = db.query(User).filter_by(username="member").first()
    if not demo_user:
        demo_user = User(username="member", email="member@library.edu.kh", full_name="Demo Library Member", password_hash="member123", role=UserRole.STUDENT)
        db.add(demo_user)
        db.flush()
    demo_member = db.query(Member).filter(Member.user_id == demo_user.id).first()
    if not demo_member:
        demo_member = db.query(Member).filter_by(email="member@library.edu.kh").first()
        if not demo_member:
            demo_member = Member(member_code="MEM-DEMO", full_name="Demo Library Member", email="member@library.edu.kh", member_type=MemberType.STUDENT, department="Library Portal")
            db.add(demo_member)
        demo_member.user_id = demo_user.id
    db.commit()

    if db.query(Book).first():
        return

    admin = User(
        username="admin",
        email="admin@library.edu.kh",
        full_name="System Administrator",
        password_hash="admin123",
        role=UserRole.ADMIN,
    )
    librarian = User(
        username="librarian",
        email="librarian@library.edu.kh",
        full_name="Sokha Librarian",
        password_hash="lib123",
        role=UserRole.LIBRARIAN,
    )
    db.add_all([admin, librarian])

    categories = [
        Category(name="Literature", name_km="អត្ថបទ", description="Fiction and poetry"),
        Category(name="Science", name_km="វិទ្យាសាស្ត្រ", description="Natural sciences"),
        Category(name="History", name_km="ប្រវត្តិសាស្ត្រ", description="Historical works"),
        Category(name="Technology", name_km="បច្ចេកវិទ្យា", description="Computing and engineering"),
        Category(name="Education", name_km="អប់រំ", description="Textbooks and references"),
    ]
    db.add_all(categories)
    db.flush()

    authors = [
        Author(name="Hem Chieu", nationality="Cambodian", bio="Renowned Khmer scholar"),
        Author(name="George Orwell", nationality="British", bio="Author of 1984"),
        Author(name="Yuval Noah Harari", nationality="Israeli", bio="Historian and author"),
        Author(name="Robert C. Martin", nationality="American", bio="Software craftsmanship advocate"),
    ]
    db.add_all(authors)
    db.flush()

    publishers = [
        Publisher(name="Khmer Academic Press", email="info@kap.kh", phone="+855 23 123 456"),
        Publisher(name="Penguin Books", email="contact@penguin.com"),
        Publisher(name="O'Reilly Media", email="info@oreilly.com"),
    ]
    db.add_all(publishers)
    db.flush()

    books_data = [
        ("រឿងខ្មែរបុរាណ", "978-99950-1-001", "#8b5cf6", 0, 0, 0, 2018, 3),
        ("1984", "978-0451-524934", "#ef4444", 0, 1, 1, 1949, 4),
        ("Sapiens", "978-0062-318095", "#06b6d4", 1, 2, 1, 2011, 2),
        ("Clean Code", "978-0132-351088", "#10b981", 3, 3, 2, 2008, 3),
        ("រូបវិទ្យាមធ្យម", "978-99950-2-045", "#f59e0b", 1, 0, 0, 2020, 5),
        ("World History", "978-0393-284502", "#6366f1", 2, 2, 1, 2015, 2),
        ("Python Programming", "978-1593-279924", "#3b82f6", 3, 3, 2, 2022, 4),
        ("Khmer Grammar", "978-99950-3-112", "#ec4899", 4, 0, 0, 2019, 6),
    ]

    books = []
    for idx, (title, isbn, color, cat, auth, pub, year, copies) in enumerate(books_data):
        book = Book(
            title=title,
            isbn=isbn,
            cover_color=color,
            category_id=categories[cat].id,
            author_id=authors[auth].id,
            publisher_id=publishers[pub].id,
            publication_year=year,
            description=f"Library copy of {title}",
        )
        db.add(book)
        db.flush()
        books.append(book)
        for i in range(copies):
            status = BookStatus.AVAILABLE
            if idx == 1 and i == 0:
                status = BookStatus.BORROWED
            elif idx == 3 and i == 2:
                status = BookStatus.DAMAGED
            elif idx == 5 and i == 1:
                status = BookStatus.LOST
            copy = BookCopy(
                book_id=book.id,
                copy_code=f"BK{book.id:03d}-{i+1:03d}",
                status=status,
                location=f"Shelf {chr(65 + cat)}-{i+1}",
            )
            db.add(copy)

    members = [
        Member(member_code="STU-001", full_name="Chan Sophea", email="sophea@student.edu.kh", phone="+855 12 111 222", member_type=MemberType.STUDENT, department="Computer Science"),
        Member(member_code="STU-002", full_name="Lim Vannak", email="vannak@student.edu.kh", phone="+855 12 333 444", member_type=MemberType.STUDENT, department="Mathematics"),
        Member(member_code="TCH-001", full_name="Dr. Meas Sok", email="sok@teacher.edu.kh", phone="+855 12 555 666", member_type=MemberType.TEACHER, department="Literature"),
        Member(member_code="STF-001", full_name="Nary Admin", email="nary@staff.edu.kh", phone="+855 12 777 888", member_type=MemberType.STAFF, department="Administration"),
        Member(member_code="STU-003", full_name="Keo Piseth", email="piseth@student.edu.kh", phone="+855 12 999 000", member_type=MemberType.STUDENT, department="Physics"),
    ]
    db.add_all(members)
    db.flush()

    borrowed_copy = db.query(BookCopy).filter(BookCopy.status == BookStatus.BORROWED).first()
    if borrowed_copy:
        from datetime import timedelta

        overdue_borrow = Borrowing(
            member_id=members[0].id,
            copy_id=borrowed_copy.id,
            due_date=datetime.utcnow() - timedelta(days=5),
            status=BorrowStatus.OVERDUE,
        )
        db.add(overdue_borrow)

        available = db.query(BookCopy).filter(BookCopy.status == BookStatus.AVAILABLE).first()
        if available:
            active = Borrowing(
                member_id=members[2].id,
                copy_id=available.id,
                due_date=datetime.utcnow() + timedelta(days=7),
                status=BorrowStatus.ACTIVE,
            )
            available.status = BookStatus.BORROWED
            db.add(active)

    returned_copy = db.query(BookCopy).filter(BookCopy.status == BookStatus.AVAILABLE).offset(1).first()
    if returned_copy:
        from datetime import timedelta

        past = Borrowing(
            member_id=members[1].id,
            copy_id=returned_copy.id,
            borrowed_at=datetime.utcnow() - timedelta(days=30),
            due_date=datetime.utcnow() - timedelta(days=16),
            returned_at=datetime.utcnow() - timedelta(days=10),
            status=BorrowStatus.RETURNED,
        )
        db.add(past)

    fine = Fine(
        member_id=members[0].id,
        amount=2.50,
        reason="Late return — overdue book",
        is_paid=False,
    )
    db.add(fine)

    reservation = Reservation(
        member_id=members[4].id,
        book_id=books[2].id,
        expires_at=datetime.utcnow() + timedelta(days=5),
        status=ReservationStatus.PENDING,
    )
    db.add(reservation)

    notifications = [
        Notification(
            member_id=members[0].id,
            title="ការជូនដំណឹងសងសៀវភៅ",
            message="សៀវភៅ '1984' ហួសកំណត់សង 5 ថ្ងៃហើយ។",
        ),
        Notification(
            member_id=members[2].id,
            title="Due Date Reminder",
            message="Book 'Khmer Grammar' is due in 7 days.",
        ),
    ]
    db.add_all(notifications)
    db.commit()
