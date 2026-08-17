import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    LIBRARIAN = "librarian"
    STAFF = "staff"
    TEACHER = "teacher"
    STUDENT = "student"


class MemberType(str, enum.Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    STAFF = "staff"


class BookStatus(str, enum.Enum):
    AVAILABLE = "available"
    BORROWED = "borrowed"
    LOST = "lost"
    DAMAGED = "damaged"
    REPAIR = "repair"
    RESERVED = "reserved"


class BorrowStatus(str, enum.Enum):
    ACTIVE = "active"
    RETURNED = "returned"
    OVERDUE = "overdue"
    LOST = "lost"


class ReservationStatus(str, enum.Enum):
    PENDING = "pending"
    FULFILLED = "fulfilled"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class BorrowRequestStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(120), unique=True)
    full_name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.LIBRARIAN)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    name_km: Mapped[str] = mapped_column(String(100), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    books = relationship("Book", back_populates="category")


class Author(Base):
    __tablename__ = "authors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(150), index=True)
    bio: Mapped[str] = mapped_column(Text, default="")
    nationality: Mapped[str] = mapped_column(String(80), default="")
    books = relationship("Book", back_populates="author")


class Publisher(Base):
    __tablename__ = "publishers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(150), unique=True)
    address: Mapped[str] = mapped_column(String(255), default="")
    phone: Mapped[str] = mapped_column(String(30), default="")
    email: Mapped[str] = mapped_column(String(120), default="")
    books = relationship("Book", back_populates="publisher")


class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), index=True)
    isbn: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    language: Mapped[str] = mapped_column(String(30), default="Khmer")
    publication_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    cover_color: Mapped[str] = mapped_column(String(20), default="#6366f1")
    cover_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True, default=None)
    category_id: Mapped[Optional[int]] = mapped_column(ForeignKey("categories.id"), nullable=True)
    author_id: Mapped[Optional[int]] = mapped_column(ForeignKey("authors.id"), nullable=True)
    publisher_id: Mapped[Optional[int]] = mapped_column(ForeignKey("publishers.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    category: Mapped[Optional["Category"]] = relationship(back_populates="books")
    author: Mapped[Optional["Author"]] = relationship(back_populates="books")
    publisher: Mapped[Optional["Publisher"]] = relationship(back_populates="books")
    copies = relationship("BookCopy", back_populates="book", cascade="all, delete-orphan")
    reservations = relationship("Reservation", back_populates="book")


class BookCopy(Base):
    __tablename__ = "book_copies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    book_id: Mapped[int] = mapped_column(ForeignKey("books.id"), index=True)
    copy_code: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    status: Mapped[BookStatus] = mapped_column(Enum(BookStatus), default=BookStatus.AVAILABLE)
    location: Mapped[str] = mapped_column(String(50), default="Shelf A")
    condition_note: Mapped[str] = mapped_column(Text, default="")
    acquired_date: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    book = relationship("Book", back_populates="copies")
    borrowings = relationship("Borrowing", back_populates="copy")


class Member(Base):
    __tablename__ = "members"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), unique=True, nullable=True)
    member_code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120), index=True)
    email: Mapped[str] = mapped_column(String(120), unique=True)
    phone: Mapped[str] = mapped_column(String(30), default="")
    member_type: Mapped[MemberType] = mapped_column(Enum(MemberType), default=MemberType.STUDENT)
    department: Mapped[str] = mapped_column(String(100), default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    joined_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    borrowings = relationship("Borrowing", back_populates="member")
    fines = relationship("Fine", back_populates="member")
    reservations = relationship("Reservation", back_populates="member")
    notifications = relationship("Notification", back_populates="member")
    user = relationship("User", foreign_keys=[user_id])
    borrow_requests = relationship("BorrowRequest", back_populates="member")


class Borrowing(Base):
    __tablename__ = "borrowings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    member_id: Mapped[int] = mapped_column(ForeignKey("members.id"), index=True)
    copy_id: Mapped[int] = mapped_column(ForeignKey("book_copies.id"), index=True)
    borrowed_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    due_date: Mapped[datetime] = mapped_column(DateTime)
    returned_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    status: Mapped[BorrowStatus] = mapped_column(Enum(BorrowStatus), default=BorrowStatus.ACTIVE)
    notes: Mapped[str] = mapped_column(Text, default="")

    member = relationship("Member", back_populates="borrowings")
    copy = relationship("BookCopy", back_populates="borrowings")
    fine = relationship("Fine", back_populates="borrowing", uselist=False)


class BorrowRequest(Base):
    __tablename__ = "borrow_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    member_id: Mapped[int] = mapped_column(ForeignKey("members.id"), index=True)
    book_id: Mapped[int] = mapped_column(ForeignKey("books.id"), index=True)
    desired_days: Mapped[int] = mapped_column(Integer, default=14)
    status: Mapped[BorrowRequestStatus] = mapped_column(Enum(BorrowRequestStatus), default=BorrowRequestStatus.PENDING, index=True)
    requested_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    reviewed_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    review_note: Mapped[str] = mapped_column(Text, default="")
    borrowing_id: Mapped[Optional[int]] = mapped_column(ForeignKey("borrowings.id"), nullable=True)

    member = relationship("Member", back_populates="borrow_requests")
    book = relationship("Book")
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    borrowing = relationship("Borrowing")


class Fine(Base):
    __tablename__ = "fines"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    member_id: Mapped[int] = mapped_column(ForeignKey("members.id"), index=True)
    borrowing_id: Mapped[Optional[int]] = mapped_column(ForeignKey("borrowings.id"), nullable=True)
    amount: Mapped[float] = mapped_column(Float, default=0.0)
    reason: Mapped[str] = mapped_column(String(255), default="Late return")
    is_paid: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    member = relationship("Member", back_populates="fines")
    borrowing = relationship("Borrowing", back_populates="fine")


class Reservation(Base):
    __tablename__ = "reservations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    member_id: Mapped[int] = mapped_column(ForeignKey("members.id"), index=True)
    book_id: Mapped[int] = mapped_column(ForeignKey("books.id"), index=True)
    reserved_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    status: Mapped[ReservationStatus] = mapped_column(
        Enum(ReservationStatus), default=ReservationStatus.PENDING
    )

    member = relationship("Member", back_populates="reservations")
    book = relationship("Book", back_populates="reservations")


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    member_id: Mapped[int] = mapped_column(ForeignKey("members.id"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    message: Mapped[str] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    member = relationship("Member", back_populates="notifications")


class Receipt(Base):
    __tablename__ = "receipts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    receipt_number: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    transaction_id: Mapped[str] = mapped_column(String(80), index=True)
    member_id: Mapped[Optional[int]] = mapped_column(ForeignKey("members.id"), nullable=True, index=True)
    member_name: Mapped[str] = mapped_column(String(120), default="")
    book_id: Mapped[Optional[int]] = mapped_column(ForeignKey("books.id"), nullable=True, index=True)
    book_title: Mapped[str] = mapped_column(String(255), default="")
    transaction_type: Mapped[str] = mapped_column(String(20))  # 'BORROW' or 'RETURN'
    borrow_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    return_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    late_days: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    fine_rate: Mapped[Optional[float]] = mapped_column(Float, default=0.0)
    fine_amount: Mapped[Optional[float]] = mapped_column(Float, default=0.0)
    total_amount: Mapped[Optional[float]] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    created_by: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)

    member = relationship("Member", backref="receipts")
    book = relationship("Book", backref="receipts")
