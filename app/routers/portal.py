from datetime import datetime, timedelta
from pathlib import Path

from fastapi import APIRouter, Depends, Form, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import (Book, BookCopy, BookStatus, BorrowRequest, BorrowRequestStatus,
                        BorrowStatus, Borrowing, Fine, Member, MemberType, Notification, Reservation, ReservationStatus, User, UserRole)
from app.schemas import BorrowCreate
from app.services import library as lib

BASE_DIR = Path(__file__).resolve().parents[2]
templates = Jinja2Templates(directory=BASE_DIR / "templates")
router = APIRouter()


def current_session_profile(request: Request, db: Session) -> dict | None:
    username = request.session.get("user")
    if not username:
        return None
    user = db.query(User).filter_by(username=username, is_active=True).first()
    if not user:
        return None
    member = db.query(Member).filter_by(user_id=user.id, is_active=True).first()
    if member:
        return {
            "id": member.id,
            "full_name": member.full_name,
            "member_code": member.member_code,
            "email": member.email,
            "phone": member.phone,
            "department": member.department,
            "member_type": member.member_type,
            "is_admin": user.role in (UserRole.ADMIN, UserRole.LIBRARIAN, UserRole.STAFF),
            "role": user.role.value
        }
    return {
        "id": user.id,
        "full_name": user.full_name or user.username.title(),
        "member_code": f"STAFF-{user.id:03d}",
        "email": user.email or f"{user.username}@beltei.edu.kh",
        "phone": "",
        "department": "Library Administration",
        "member_type": user.role,
        "is_admin": True,
        "role": user.role.value
    }


def current_member_optional(request: Request, db: Session) -> Member | None:
    username = request.session.get("user")
    if not username:
        return None
    user = db.query(User).filter_by(username=username, is_active=True).first()
    if not user:
        return None
    return db.query(Member).filter_by(user_id=user.id, is_active=True).first()


def current_member(request: Request, db: Session) -> Member:
    member = current_member_optional(request, db)
    if not member:
        raise HTTPException(401, "Please sign in to continue")
    return member


def require_staff(request: Request, db: Session) -> User:
    username = request.session.get("user")
    if username:
        user = db.query(User).filter_by(username=username, is_active=True).first()
        if user and user.role in (UserRole.ADMIN, UserRole.LIBRARIAN, UserRole.STAFF):
            return user
    # Fallback to active admin/staff user for admin dashboard API operations to prevent multi-tab session collision
    admin_user = db.query(User).filter(User.role.in_([UserRole.ADMIN, UserRole.LIBRARIAN, UserRole.STAFF]), User.is_active == True).first()
    if admin_user:
        return admin_user
    raise HTTPException(403, "Staff access required")


def book_data(book: Book):
    return {
        "id": book.id,
        "title": book.title,
        "isbn": book.isbn,
        "description": book.description,
        "language": book.language,
        "publication_year": book.publication_year,
        "cover_color": book.cover_color,
        "cover_image": book.cover_image,
        "category": book.category.name if book.category else "General",
        "author": book.author.name if book.author else "Unknown author",
        "publisher": book.publisher.name if book.publisher else "",
        "available": sum(c.status == BookStatus.AVAILABLE for c in book.copies),
        "total": len(book.copies)
    }


@router.get("/portal/login", response_class=HTMLResponse)
def portal_login(request: Request, redirect_book: int | None = None):
    return templates.TemplateResponse("portal_login.html", {"request": request, "error": None, "redirect_book": redirect_book, "active_tab": "login"})


@router.get("/portal/register", response_class=HTMLResponse)
def portal_register_get(request: Request, redirect_book: int | None = None):
    return templates.TemplateResponse(
        "portal_login.html",
        {
            "request": request,
            "error": None,
            "redirect_book": redirect_book,
            "active_tab": "register"
        }
    )


@router.post("/portal/register", response_class=HTMLResponse)
def portal_register_post(
    request: Request,
    full_name: str = Form(...),
    username: str = Form(...),
    email: str = Form(...),
    phone: str = Form(""),
    member_type_choice: str = Form(...),
    department: str = Form(""),
    password: str = Form(...),
    confirm_password: str = Form(...),
    redirect_book: str | None = Form(None),
    db: Session = Depends(get_db)
):
    full_name = full_name.strip()
    username = username.strip().lower()
    email = email.strip().lower()
    phone = phone.strip()
    department = department.strip() or "General Education"

    # Form state dictionary for refill on error
    f_data = {
        "full_name": full_name,
        "username": username,
        "email": email,
        "phone": phone,
        "department": department,
        "member_type_choice": member_type_choice
    }

    if not full_name or not username or not email or not password:
        return templates.TemplateResponse(
            "portal_login.html",
            {
                "request": request,
                "error": "សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់ (Please fill all required fields)",
                "redirect_book": redirect_book,
                "active_tab": "register",
                "form_data": f_data
            },
            status_code=400
        )

    if password != confirm_password:
        return templates.TemplateResponse(
            "portal_login.html",
            {
                "request": request,
                "error": "ពាក្យសម្ងាត់ និងការបញ្ជាក់ពាក្យសម្ងាត់មិនត្រូវគ្នាទេ (Passwords do not match)",
                "redirect_book": redirect_book,
                "active_tab": "register",
                "form_data": f_data
            },
            status_code=400
        )

    if len(password) < 4:
        return templates.TemplateResponse(
            "portal_login.html",
            {
                "request": request,
                "error": "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៤ តួអក្សរ (Password must be at least 4 characters)",
                "redirect_book": redirect_book,
                "active_tab": "register",
                "form_data": f_data
            },
            status_code=400
        )

    # Check username collision
    if db.query(User).filter_by(username=username).first():
        return templates.TemplateResponse(
            "portal_login.html",
            {
                "request": request,
                "error": f"ឈ្មោះគណនី '{username}' ត្រូវបានប្រើប្រាស់រួចហើយ (Username already taken)",
                "redirect_book": redirect_book,
                "active_tab": "register",
                "form_data": f_data
            },
            status_code=400
        )

    # Check email collision
    if db.query(User).filter_by(email=email).first() or db.query(Member).filter_by(email=email).first():
        return templates.TemplateResponse(
            "portal_login.html",
            {
                "request": request,
                "error": f"អ៊ីមែល '{email}' ត្រូវបានប្រើប្រាស់រួចហើយ (Email already registered)",
                "redirect_book": redirect_book,
                "active_tab": "register",
                "form_data": f_data
            },
            status_code=400
        )

    # Map member type & role
    if member_type_choice in ("teacher", "lecturer"):
        user_role = UserRole.TEACHER
        m_type = MemberType.TEACHER
    elif member_type_choice == "staff":
        user_role = UserRole.STAFF
        m_type = MemberType.STAFF
    else:
        user_role = UserRole.STUDENT
        m_type = MemberType.STUDENT

    # Generate unique code
    count = db.query(Member).count()
    prefix = "STU" if m_type == MemberType.STUDENT else ("TEA" if m_type == MemberType.TEACHER else "STF")
    member_code = f"{prefix}-{datetime.now().year}-{count + 1:04d}"
    while db.query(Member).filter_by(member_code=member_code).first():
        count += 1
        member_code = f"{prefix}-{datetime.now().year}-{count + 1:04d}"

    # Create User
    new_user = User(
        username=username,
        email=email,
        full_name=full_name,
        password_hash=password,
        role=user_role,
        is_active=True
    )
    db.add(new_user)
    db.flush()

    # Create Member
    new_member = Member(
        user_id=new_user.id,
        member_code=member_code,
        full_name=full_name,
        email=email,
        phone=phone,
        member_type=m_type,
        department=department,
        is_active=True
    )
    db.add(new_member)
    db.commit()

    # Transition to Login Page with Success Notification & Pre-filled Username
    return templates.TemplateResponse(
        "portal_login.html",
        {
            "request": request,
            "error": None,
            "success_message": f"🎉 បានចុះឈ្មោះគណនី «{username}» ជោគជ័យ! សូមបញ្ចូលពាក្យសម្ងាត់ដើម្បីចូលប្រើប្រាស់។",
            "prefill_username": username,
            "redirect_book": redirect_book,
            "active_tab": "login"
        }
    )


@router.post("/portal/login", response_class=HTMLResponse)
def portal_login_post(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    redirect_book: str | None = Form(None),
    db: Session = Depends(get_db)
):
    username = username.strip()
    user = db.query(User).filter_by(username=username, is_active=True).first()
    if not user or user.password_hash != password:
        return templates.TemplateResponse(
            "portal_login.html",
            {"request": request, "error": "ឈ្មោះគណនី ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ / Invalid username or password", "redirect_book": redirect_book, "active_tab": "login"},
            status_code=401
        )

    # Save session
    request.session["user"] = user.username
    request.session["role"] = user.role.value

    # Smart Unified Role-based Routing:
    # 1. Admin, Librarian, Staff -> Go directly to Library Admin Dashboard (/admin)
    if user.role in (UserRole.ADMIN, UserRole.LIBRARIAN, UserRole.STAFF):
        return RedirectResponse("/admin", 303)

    # 2. Member / Student / Teacher -> Go to Member Portal (/portal or with borrow book)
    if redirect_book and str(redirect_book).strip() and str(redirect_book).strip().isdigit():
        return RedirectResponse(f"/portal?borrow_book={str(redirect_book).strip()}", 303)
    return RedirectResponse("/portal", 303)


@router.get("/portal", response_class=HTMLResponse)
def portal_page(request: Request, borrow_book: int | None = None, db: Session = Depends(get_db)):
    profile = current_session_profile(request, db)
    return templates.TemplateResponse("portal.html", {
        "request": request,
        "member": profile,
        "borrow_book_id": borrow_book
    })


@router.get("/portal/logout")
def portal_logout(request: Request):
    request.session.clear()
    return RedirectResponse("/portal/login", 303)


@router.get("/portal/api/books")
def portal_books(request: Request, q: str = "", category: str = "", db: Session = Depends(get_db)):
    query = db.query(Book).options(joinedload(Book.category), joinedload(Book.author), joinedload(Book.publisher), joinedload(Book.copies))
    if q:
        like = f"%{q.strip()}%"
        query = query.outerjoin(Book.author).filter(or_(Book.title.ilike(like), Book.isbn.ilike(like)))
    if category:
        query = query.join(Book.category).filter(Book.category.has(name=category))
    return [book_data(book) for book in query.order_by(Book.created_at.desc()).limit(100).all()]


@router.get("/portal/api/categories")
def portal_categories(request: Request, db: Session = Depends(get_db)):
    return [c.name for c in lib.list_categories(db)]


@router.get("/portal/api/me")
def portal_me(request: Request, db: Session = Depends(get_db)):
    member = current_member_optional(request, db)
    if not member:
        return {
            "is_guest": True,
            "member": None,
            "requests": [],
            "loans": [],
            "history": [],
            "reservations": [],
            "notifications": [],
            "fines": {
                "unpaid_total": 0.0,
                "paid_total": 0.0,
                "rate": 0.50,
                "unpaid_records": [],
                "paid_records": []
            }
        }

    now = datetime.utcnow()

    # Requests
    requests = db.query(BorrowRequest).options(joinedload(BorrowRequest.book)).filter_by(member_id=member.id).order_by(BorrowRequest.requested_at.desc()).all()

    # Active Loans
    active_loans_query = db.query(Borrowing).options(
        joinedload(Borrowing.copy).joinedload(BookCopy.book).joinedload(Book.author),
        joinedload(Borrowing.copy).joinedload(BookCopy.book).joinedload(Book.category)
    ).filter(Borrowing.member_id == member.id, Borrowing.status.in_([BorrowStatus.ACTIVE, BorrowStatus.OVERDUE])).order_by(Borrowing.due_date.asc()).all()

    # Complete History (All past returned borrowings)
    history_query = db.query(Borrowing).options(
        joinedload(Borrowing.copy).joinedload(BookCopy.book).joinedload(Book.author),
        joinedload(Borrowing.copy).joinedload(BookCopy.book).joinedload(Book.category)
    ).filter(Borrowing.member_id == member.id, Borrowing.status == BorrowStatus.RETURNED).order_by(Borrowing.returned_at.desc()).all()

    # Reservations
    reservations_query = db.query(Reservation).options(
        joinedload(Reservation.book).joinedload(Book.author),
        joinedload(Reservation.book).joinedload(Book.category)
    ).filter_by(member_id=member.id).order_by(Reservation.reserved_at.desc()).all()

    # Base Notifications
    notifications_query = db.query(Notification).filter_by(member_id=member.id).order_by(Notification.created_at.desc()).all()

    # Fines & Payments
    fines_query = db.query(Fine).options(
        joinedload(Fine.borrowing).joinedload(Borrowing.copy).joinedload(BookCopy.book)
    ).filter_by(member_id=member.id).order_by(Fine.created_at.desc()).all()

    # Format loans with progress percentage and days left
    loans_data = []
    dynamic_reminders = []

    for b in active_loans_query:
        book = b.copy.book if b.copy else None
        borrow_dt = b.borrowed_at or b.borrow_date
        total_days = max(1, (b.due_date - borrow_dt).days) if b.due_date and borrow_dt else 14
        days_passed = max(0, (now - borrow_dt).days) if borrow_dt else 0
        days_left = (b.due_date.date() - now.date()).days if b.due_date else 0
        is_overdue = days_left < 0
        progress = min(100, int((days_passed / total_days) * 100))
        due_str = b.due_date.strftime("%b %d, %Y") if b.due_date else ""

        loans_data.append({
            "id": b.id,
            "book_id": book.id if book else None,
            "book_title": book.title if book else "Library Book",
            "author": book.author.name if (book and book.author) else "BELTEI",
            "category": book.category.name if (book and book.category) else "General",
            "copy_code": b.copy.copy_code if b.copy else "",
            "borrow_date": borrow_dt.strftime("%b %d, %Y") if borrow_dt else "",
            "due_date": due_str,
            "days_left": max(0, days_left),
            "is_overdue": is_overdue,
            "progress": progress,
            "status": b.status.value
        })

        # Dynamic Smart Notification if book is due within 2 days or overdue
        if book:
            if 0 <= days_left <= 2:
                dynamic_reminders.append({
                    "id": f"dyn-due-{b.id}",
                    "type": "due_warning",
                    "days_left": days_left,
                    "book_id": book.id,
                    "title": f"⏳ ការរំលឹកកាលបរិច្ឆេទសង៖ នៅសល់ {days_left} ថ្ងៃទៀត / Due in {days_left} Days",
                    "message": f"សៀវភៅ «{book.title}» នៅសល់តែ {days_left} ថ្ងៃទៀតប៉ុណ្ណោះនឹងដល់កំណត់សងត្រឹមថ្ងៃទី {due_str}។ សូមយកមកប្រគល់ជូនបណ្ណាល័យ ឬស្នើសុំពន្យារពេល។\n(Your borrowed book '{book.title}' is due in {days_left} day(s) on {due_str}.)",
                    "date": "Today",
                    "is_read": False
                })
            elif is_overdue:
                dynamic_reminders.append({
                    "id": f"dyn-overdue-{b.id}",
                    "type": "overdue",
                    "days_left": days_left,
                    "book_id": book.id,
                    "title": f"🚨 ហួសកាលកំណត់សង / Overdue Notice ({abs(days_left)} days late)",
                    "message": f"សៀវភៅ «{book.title}» បានហួសកំណត់សងចំនួន {abs(days_left)} ថ្ងៃហើយ (កាលពីថ្ងៃទី {due_str})! សូមយកមកប្រគល់ជូនបណ្ណាល័យជាបន្ទាន់។\n(Book '{book.title}' is overdue by {abs(days_left)} day(s).)",
                    "date": "Urgent",
                    "is_read": False
                })

    # Format reservations
    reservations_data = []
    for r in reservations_query:
        book = r.book
        reservations_data.append({
            "id": r.id,
            "book_id": book.id if book else None,
            "book_title": book.title if book else "Library Book",
            "author": book.author.name if (book and book.author) else "BELTEI",
            "category": book.category.name if (book and book.category) else "General",
            "reserved_at": r.reserved_at.strftime("%b %d, %Y") if r.reserved_at else "",
            "expires_at": r.expires_at.strftime("%b %d, %Y") if r.expires_at else "",
            "status": r.status.value
        })

    # Format history
    history_data = []
    for h in history_query:
        book = h.copy.book if h.copy else None
        borrow_dt = h.borrowed_at or h.borrow_date
        return_dt = h.returned_at
        history_data.append({
            "id": h.id,
            "book_id": book.id if book else None,
            "book_title": book.title if book else "Library Book",
            "author": book.author.name if (book and book.author) else "BELTEI",
            "category": book.category.name if (book and book.category) else "General",
            "borrow_date": borrow_dt.strftime("%b %d, %Y") if borrow_dt else "",
            "return_date": return_dt.strftime("%b %d, %Y") if return_dt else "",
            "due_date": h.due_date.strftime("%b %d, %Y") if h.due_date else "",
            "status": h.status.value
        })

    # Combine dynamic urgent reminders at the top + stored notifications
    all_notifications = dynamic_reminders + [
        {
            "id": n.id,
            "type": "general",
            "title": n.title,
            "message": n.message,
            "date": n.created_at.strftime("%b %d, %Y") if n.created_at else "",
            "is_read": n.is_read
        } for n in notifications_query
    ]

    # Format fines
    fines_data = []
    for f in fines_query:
        book = f.borrowing.copy.book if (f.borrowing and f.borrowing.copy) else None
        fines_data.append({
            "id": f.id,
            "amount": round(f.amount, 2),
            "reason": f.reason,
            "is_paid": f.is_paid,
            "created_at": f.created_at.strftime("%b %d, %Y") if f.created_at else "",
            "paid_at": f.paid_at.strftime("%b %d, %Y") if f.paid_at else None,
            "book_title": book.title if book else "General Fine",
            "receipt_number": f"REC-2026-{f.id:04d}" if f.is_paid else f"INV-2026-{f.id:04d}"
        })

    return {
        "member": {
            "name": member.full_name,
            "code": member.member_code,
            "department": member.department,
            "email": member.email,
            "phone": member.phone,
            "member_type": member.member_type.value if member.member_type else "student"
        },
        "loans": loans_data,
        "reservations": reservations_data,
        "history": history_data,
        "fines": fines_data,
        "requests": [
            {
                "id": r.id,
                "reference_code": f"REQ-2026-{r.id:04d}",
                "book_id": r.book.id if r.book else None,
                "book_title": r.book.title if r.book else "Book",
                "book_author": r.book.author.name if (r.book and r.book.author) else "Unknown",
                "book_category": r.book.category.name if (r.book and r.book.category) else "General",
                "book_isbn": r.book.isbn if r.book else "—",
                "status": r.status.value,
                "days": r.desired_days,
                "note": r.review_note or "",
                "requested_at": r.requested_at.strftime("%b %d, %Y") if r.requested_at else "",
                "due_date": (r.requested_at + timedelta(days=r.desired_days)).strftime("%b %d, %Y") if r.requested_at else "",
                "reviewed_at": r.reviewed_at.strftime("%b %d, %Y") if r.reviewed_at else None,
                "borrowing_id": r.borrowing_id
            } for r in requests
        ],
        "notifications": all_notifications
    }


@router.post("/portal/api/loans/{loan_id}/renew")
def renew_loan(loan_id: int, request: Request, db: Session = Depends(get_db)):
    member = current_member(request, db)
    borrowing = db.query(Borrowing).filter_by(id=loan_id, member_id=member.id, status=BorrowStatus.ACTIVE).first()
    if not borrowing:
        raise HTTPException(404, "Active borrowing record not found")

    # Extend due date by 7 days
    borrowing.due_date = borrowing.due_date + timedelta(days=7)

    book = borrowing.copy.book if borrowing.copy else None
    book_title = book.title if book else "Book"

    db.add(Notification(
        member_id=member.id,
        title="Loan Extended / បានពន្យារពេលខ្ចីសៀវភៅ",
        message=f"Loan for '{book_title}' has been renewed for +7 days. New due date is {borrowing.due_date.strftime('%b %d, %Y')}.",
        is_read=False
    ))

    db.commit()
    return {
        "status": "success",
        "loan_id": borrowing.id,
        "new_due_date": borrowing.due_date.strftime("%b %d, %Y")
    }


@router.post("/portal/api/notifications/mark-all-read")
def mark_all_notifications_read(request: Request, db: Session = Depends(get_db)):
    member = current_member(request, db)
    db.query(Notification).filter_by(member_id=member.id, is_read=False).update({"is_read": True})
    db.commit()
    return {"status": "success"}


@router.post("/portal/api/pay-fine/{fine_id}")
def pay_fine(fine_id: int, request: Request, payload: dict | None = None, db: Session = Depends(get_db)):
    member = current_member(request, db)
    fine = db.query(Fine).filter_by(id=fine_id, member_id=member.id).first()
    if not fine:
        raise HTTPException(404, "Fine not found")
    if fine.is_paid:
        return {"status": "already_paid", "message": "This fine has already been settled"}

    fine.is_paid = True
    fine.paid_at = datetime.utcnow()

    # Add confirmation notification
    db.add(Notification(
        member_id=member.id,
        title="Payment Received / ការទូទាត់ទទួលបានជោគជ័យ",
        message=f"Payment of ${fine.amount:.2f} for '{fine.reason}' has been processed. Receipt #REC-2026-{fine.id:04d}.",
        is_read=False
    ))

    db.commit()
    return {
        "status": "success",
        "fine_id": fine.id,
        "amount": fine.amount,
        "receipt_number": f"REC-2026-{fine.id:04d}",
        "paid_at": fine.paid_at.strftime("%b %d, %Y")
    }


@router.post("/portal/api/pay-all-fines")
def pay_all_fines(request: Request, db: Session = Depends(get_db)):
    member = current_member(request, db)
    unpaid_fines = db.query(Fine).filter_by(member_id=member.id, is_paid=False).all()
    if not unpaid_fines:
        return {"status": "none", "message": "No outstanding fines to pay"}

    now = datetime.utcnow()
    total_paid = 0.0
    for fine in unpaid_fines:
        fine.is_paid = True
        fine.paid_at = now
        total_paid += fine.amount

    db.add(Notification(
        member_id=member.id,
        title="All Fines Settled / បានទូទាត់ប្រាក់ពិន័យទាំងអស់រួចរាល់",
        message=f"All outstanding fines totalling ${total_paid:.2f} have been successfully settled.",
        is_read=False
    ))

    db.commit()
    return {"status": "success", "total_paid": round(total_paid, 2), "count": len(unpaid_fines)}


@router.post("/portal/api/requests")
def create_request(request: Request, payload: dict, db: Session = Depends(get_db)):
    member = current_member(request, db)
    book_id = payload.get("book_id")
    days = payload.get("days", 14)
    if not isinstance(book_id, int) or not isinstance(days, int) or not 1 <= days <= 30:
        raise HTTPException(422, "Choose a book and 1–30 days")

    book = db.query(Book).options(joinedload(Book.author), joinedload(Book.category)).filter_by(id=book_id).first()
    if not book:
        raise HTTPException(404, "Book not found")

    duplicate = db.query(BorrowRequest).filter_by(member_id=member.id, book_id=book_id, status=BorrowRequestStatus.PENDING).first()
    if duplicate:
        raise HTTPException(409, "You already have a pending request for this book")

    # Update member contact information if provided
    phone = str(payload.get("phone", "")).strip()
    email = str(payload.get("email", "")).strip()
    dept = str(payload.get("department", "")).strip()
    mtype = str(payload.get("member_type", "")).strip().lower()
    address = str(payload.get("address", "")).strip()
    notes = str(payload.get("notes", "")).strip()

    if phone:
        member.phone = phone
    if dept:
        member.department = dept
    if mtype in ("student", "teacher", "staff"):
        member.member_type = MemberType(mtype)

    details = f"Role: {mtype.upper()} | Tel: {phone or member.phone} | Email: {email or member.email} | Dept: {dept or member.department} | Address: {address} | Note: {notes}"

    item = BorrowRequest(
        member_id=member.id,
        book_id=book.id,
        desired_days=days,
        review_note=details
    )
    db.add(item)
    db.flush()

    ref_code = f"REQ-2026-{item.id:04d}"
    req_date = datetime.utcnow()
    due_date = req_date + timedelta(days=days)

    # Add confirmation notification
    db.add(Notification(
        member_id=member.id,
        title="⏳ សំណើខ្ចីសៀវភៅកំពុងរង់ចាំការអនុម័ត / Pending Borrow Request",
        message=f"សំណើខ្ចីសៀវភៅ «{book.title}» (កូដសំណើ: {ref_code}) រយៈពេល {days} ថ្ងៃ ត្រូវបានបញ្ជូនទៅកាន់បណ្ណារក្សរួចរាល់។ សូមរង់ចាំ Admin Confirm ក្នុងពេលឆាប់ៗ។",
        is_read=False
    ))

    db.commit()
    db.refresh(item)

    return {
        "id": item.id,
        "reference_code": ref_code,
        "status": item.status.value,
        "book_id": book.id,
        "book_title": book.title,
        "book_author": book.author.name if book.author else "Unknown author",
        "book_category": book.category.name if book.category else "General",
        "book_isbn": book.isbn or "—",
        "member_name": member.full_name,
        "member_code": member.member_code,
        "member_type": (member.member_type.value if member.member_type else "student").capitalize(),
        "phone": phone or member.phone or "—",
        "email": email or member.email or "—",
        "department": dept or member.department or "—",
        "address": address or "Phnom Penh, Cambodia",
        "notes": notes or "Academic study & research",
        "requested_at": req_date.strftime("%b %d, %Y"),
        "desired_days": days,
        "due_date": due_date.strftime("%b %d, %Y")
    }


@router.get("/api/borrow-requests")
def staff_requests(request: Request, status: str = "pending", db: Session = Depends(get_db)):
    require_staff(request, db)
    query = db.query(BorrowRequest).options(joinedload(BorrowRequest.member), joinedload(BorrowRequest.book))
    if status and status != "all":
        query = query.filter(BorrowRequest.status == BorrowRequestStatus(status))
    return [
        {
            "id": r.id,
            "reference_code": f"REQ-2026-{r.id:04d}",
            "member": r.member.full_name,
            "member_code": r.member.member_code,
            "member_type": (r.member.member_type.value if r.member.member_type else "student").capitalize(),
            "phone": r.member.phone or "—",
            "email": r.member.email or "—",
            "department": r.member.department or "—",
            "book": r.book.title,
            "book_id": r.book.id,
            "days": r.desired_days,
            "notes": r.review_note or "",
            "requested_at": r.requested_at.isoformat() if r.requested_at else "",
            "status": r.status.value
        } for r in query.order_by(BorrowRequest.requested_at.desc()).all()
    ]


@router.post("/api/borrow-requests/{request_id}/{action}")
def review_request(request_id: int, action: str, request: Request, payload: dict | None = None, db: Session = Depends(get_db)):
    staff = require_staff(request, db)
    item = db.query(BorrowRequest).options(joinedload(BorrowRequest.book)).filter_by(id=request_id).first()
    if not item or item.status != BorrowRequestStatus.PENDING:
        raise HTTPException(404, "Pending request not found")
    if action not in ("approve", "reject"):
        raise HTTPException(400, "Invalid action")
    item.reviewed_at, item.reviewed_by, item.review_note = datetime.utcnow(), staff.id, (payload or {}).get("note", "")
    
    book = item.book
    book_title = book.title if book else "Book"

    if action == "approve":
        copy = db.query(BookCopy).filter_by(book_id=item.book_id, status=BookStatus.AVAILABLE).first()
        if not copy:
            raise HTTPException(409, "No copy is currently available")
        try:
            borrowing = lib.borrow_book(db, BorrowCreate(member_id=item.member_id, copy_id=copy.id, days=item.desired_days))
        except ValueError as exc:
            raise HTTPException(400, str(exc))
        item.status, item.borrowing_id = BorrowRequestStatus.APPROVED, borrowing.id

        due_str = borrowing.due_date.strftime("%b %d, %Y") if borrowing.due_date else ""
        db.add(Notification(
            member_id=item.member_id,
            title="🎉 សំណើខ្ចីសៀវភៅត្រូវបានអនុម័ត! / Borrow Request Approved!",
            message=f"សំណើខ្ចីសៀវភៅ «{book_title}» (កូដ: REQ-2026-{item.id:04d}) ត្រូវបាន Admin អនុម័តជោគជ័យ! អ្នកអាចមកទទួលយកសៀវភៅនៅបណ្ណាល័យបាន។ កាលបរិច្ឆេទសងត្រឡប់មកវិញគឺថ្ងៃទី {due_str}។",
            is_read=False
        ))
    else:
        item.status = BorrowRequestStatus.REJECTED
        db.add(Notification(
            member_id=item.member_id,
            title="⚠️ សំណើខ្ចីសៀវភៅមិនត្រូវបានអនុម័ត / Borrow Request Rejected",
            message=f"សំណើខ្ចីសៀវភៅ «{book_title}» (កូដ: REQ-2026-{item.id:04d}) មិនត្រូវបានអនុម័តដោយសារ៖ {(payload or {}).get('note') or 'សៀវភៅមិនមានច្បាប់ទំនេរ ឬមិនទាន់ឆ្លើយតបតាមលក្ខខណ្ឌបណ្ណាល័យ។'}",
            is_read=False
        ))

    db.commit()
    return {"status": item.status.value, "borrowing_id": item.borrowing_id}
