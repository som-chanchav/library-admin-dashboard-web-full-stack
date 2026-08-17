"""Seed script for Library Management System.

Creates authors, publishers, categories, and 200 realistic books
and inserts them into the SQLAlchemy-backed database configured
in `app.config.DATABASE_URL` (defaults to SQLite `library.db`).

Usage:
    python scripts/seed_books.py

The script is idempotent for ISBNs (skips existing books).
"""
from __future__ import annotations

import random
import string
from typing import List

from sqlalchemy.exc import IntegrityError

from app.database import engine, SessionLocal
from app import models


def ensure_schema() -> None:
    models.Base.metadata.create_all(bind=engine)


def random_isbn(existing: set[str]) -> str:
    # generate a 13-digit ISBN-like string starting with 978
    for _ in range(10000):
        body = "978" + "".join(random.choices(string.digits, k=10))
        if body not in existing:
            existing.add(body)
            return body
    raise RuntimeError("Unable to generate unique ISBN")


def random_title() -> str:
    prefixes = [
        "Advanced", "Foundations of", "Practical", "Essential", "Modern",
        "Introduction to", "Mastering", "The Art of", "Designing", "Principles of",
    ]
    subjects = [
        "Algorithms", "Data Structures", "Machine Learning", "Database Systems",
        "Computer Networks", "Cybersecurity", "Cloud Computing", "Software Engineering",
        "Distributed Systems", "Artificial Intelligence", "Statistics for Engineers",
        "Quantitative Finance", "Computational Biology", "Digital Signal Processing",
    ]
    suffixes = [
        "with Python", "in Practice", "for Professionals", "and Applications", "for Engineers",
        "A Comprehensive Guide", "Recipes and Techniques", "Case Studies", "Theory and Practice",
    ]
    return f"{random.choice(prefixes)} {random.choice(subjects)} {random.choice(suffixes)}"


def random_author_name() -> str:
    first = [
        "James", "Robert", "Michael", "William", "David", "Richard", "Joseph",
        "Thomas", "Charles", "Christopher", "Daniel", "Matthew", "Anthony", "Mark",
        "Paul", "Steven", "Andrew", "Kenneth", "Joshua", "Kevin",
    ]
    last = [
        "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
        "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
        "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    ]
    return f"{random.choice(first)} {random.choice(last)}"


def make_description(words_min=50, words_max=100) -> str:
    # build SEO-friendly, realistic descriptions
    phrases = [
        "This book provides a thorough introduction to",
        "Covering both theoretical foundations and practical techniques",
        "Readers will find clear examples and step-by-step explanations",
        "Ideal for students, researchers, and practicing engineers",
        "Includes case studies, exercises, and real-world projects",
        "The author draws on years of experience to explain",
        "A valuable resource for classroom use and professional reference",
        "This edition is updated with the latest advances and best practices",
        "Topics include algorithms, implementation patterns, performance tuning",
        "Emphasis on reproducible results and practical guidance",
    ]
    out: List[str] = []
    target = random.randint(words_min, words_max)
    while sum(len(s.split()) for s in out) < target:
        out.append(random.choice(phrases))
    text = " ".join(out)
    # finish with a concise SEO sentence
    seo_tail = (
        "Perfect for courses and self-study, this title helps readers build durable skills"
    )
    return f"{text}. {seo_tail}."


def create_authors(session, count=100) -> List[models.Author]:
    authors = []
    existing = set()
    for _ in range(count):
        name = None
        for _attempt in range(10):
            candidate = random_author_name()
            if candidate not in existing:
                name = candidate
                existing.add(name)
                break
        if not name:
            name = f"Author {_}"
        author = session.query(models.Author).filter_by(name=name).one_or_none()
        if author is None:
            author = models.Author(name=name, bio=make_description(20, 40))
            session.add(author)
            authors.append(author)
        else:
            authors.append(author)
    session.commit()
    return authors


def create_publishers(session, extras=None, count=50) -> List[models.Publisher]:
    base = extras or []
    base += [
        "O'Reilly Media",
        "Packt",
        "Manning",
        "Pearson",
        "McGraw-Hill",
        "Springer",
        "MIT Press",
        "Oxford University Press",
        "Cambridge University Press",
        "Wiley",
        "Addison-Wesley",
        "Prentice Hall",
        "CRC Press",
        "No Starch Press",
        "Apress",
        "Elsevier",
        "Sage Publications",
        "Bloomsbury",
    ]
    publishers = []
    existing = set()
    # expand base with generated realistic-sounding publishers if needed
    while len(base) < count:
        base.append(random.choice([f"Academic Press", f"Global Tech Press", f"Professional Books"]))

    for name in base[:count]:
        name = name.strip()
        if name in existing:
            continue
        existing.add(name)
        pub = session.query(models.Publisher).filter_by(name=name).one_or_none()
        if pub is None:
            pub = models.Publisher(name=name)
            session.add(pub)
            publishers.append(pub)
        else:
            publishers.append(pub)
    session.commit()
    return publishers


def create_categories(session, names=None, count=30) -> List[models.Category]:
    base = names or []
    base += [
        "Technology",
        "Programming",
        "Computer Science",
        "Artificial Intelligence",
        "Cyber Security",
        "Networking",
        "Database",
        "Business",
        "Economics",
        "Finance",
        "Marketing",
        "Management",
        "Psychology",
        "Education",
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "Medical",
        "Engineering",
        "Architecture",
        "History",
        "Literature",
        "Philosophy",
        "Religion",
        "Language",
        "Travel",
        "Cooking",
        "Children",
        "Novel",
    ]
    # ensure unique and trim/pad to desired count
    unique = []
    for n in base:
        if n not in unique:
            unique.append(n)
    while len(unique) < count:
        unique.append(f"Special Topics {len(unique)+1}")

    categories = []
    for name in unique[:count]:
        cat = session.query(models.Category).filter_by(name=name).one_or_none()
        if cat is None:
            cat = models.Category(name=name, description=make_description(10, 20))
            session.add(cat)
            categories.append(cat)
        else:
            categories.append(cat)
    session.commit()
    return categories


def seed_books(session, authors, publishers, categories, target=200) -> int:
    inserted = 0
    existing_isbns = {b.isbn for b in session.query(models.Book.isbn).all()}
    isbn_set = set(existing_isbns)

    for _ in range(target * 2):  # attempt more times for safety
        if inserted >= target:
            break
        isbn = random_isbn(isbn_set)
        # skip if exists (safety)
        if session.query(models.Book).filter_by(isbn=isbn).first():
            continue

        title = random_title()
        author = random.choice(authors)
        publisher = random.choice(publishers)
        category = random.choice(categories)
        year = random.randint(1990, 2025)
        copies = random.randint(1, 10)
        description = make_description(50, 100)
        cover = f"https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg"

        book = models.Book(
            title=title,
            isbn=isbn,
            description=description,
            publication_year=year,
            cover_image=cover,
            category=category,
            author=author,
            publisher=publisher,
        )
        session.add(book)
        try:
            session.flush()
        except IntegrityError:
            session.rollback()
            continue

        # create copies
        for i in range(copies):
            copy_code = f"COPY-{isbn}-{i+1}"
            copy = models.BookCopy(book_id=book.id, copy_code=copy_code)
            session.add(copy)

        try:
            session.commit()
            inserted += 1
            if inserted % 25 == 0:
                print(f"Inserted {inserted} books...")
        except IntegrityError:
            session.rollback()

    return inserted


def main():
    print("Ensuring database schema...")
    ensure_schema()
    session = SessionLocal()
    try:
        print("Creating authors...")
        authors = create_authors(session, count=100)
        print(f"Authors present: {len(authors)}")

        print("Creating publishers...")
        publishers = create_publishers(session, count=50)
        print(f"Publishers present: {len(publishers)}")

        print("Creating categories...")
        categories = create_categories(session, count=30)
        print(f"Categories present: {len(categories)}")

        print("Seeding books (this may take a moment)...")
        inserted = seed_books(session, authors, publishers, categories, target=250)
        print(f"Inserted {inserted} Books Successfully.")
    finally:
        session.close()


if __name__ == "__main__":
    main()
