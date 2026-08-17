from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    name: str
    name_km: str = ""
    description: str = ""


class AuthorCreate(BaseModel):
    name: str
    bio: str = ""
    nationality: str = ""


class PublisherCreate(BaseModel):
    name: str
    address: str = ""
    phone: str = ""
    email: str = ""


class BookCreate(BaseModel):
    title: str
    isbn: str
    description: str = ""
    language: str = "Khmer"
    publication_year: Optional[int] = None
    cover_color: str = "#6366f1"
    cover_image: Optional[str] = None
    category_id: Optional[int] = None
    author_id: Optional[int] = None
    publisher_id: Optional[int] = None
    copies_count: int = Field(default=1, ge=1, le=50)


class BookUpdate(BaseModel):
    title: Optional[str] = None
    isbn: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = None
    publication_year: Optional[int] = None
    cover_color: Optional[str] = None
    cover_image: Optional[str] = None
    category_id: Optional[int] = None
    author_id: Optional[int] = None
    publisher_id: Optional[int] = None


class MemberCreate(BaseModel):
    member_code: str
    full_name: str
    email: str
    phone: str = ""
    member_type: str = "student"
    department: str = ""


class BorrowCreate(BaseModel):
    member_id: int
    copy_id: int
    days: int = Field(default=14, ge=1, le=90)


class ReturnBook(BaseModel):
    borrowing_id: int
    condition: str = "good"


class ReservationCreate(BaseModel):
    member_id: int
    book_id: int
    days: int = Field(default=7, ge=1, le=30)


class CopyStatusUpdate(BaseModel):
    status: str
    condition_note: str = ""


class SearchQuery(BaseModel):
    q: str = ""
    category_id: Optional[int] = None
    status: Optional[str] = None
