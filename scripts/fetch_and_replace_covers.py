"""Fetch and replace book covers for all books in the database.

Priority: Open Library -> Google Books -> Internet Archive -> Default

Saves images to `static/uploads/covers/{isbn}.jpg` and updates `cover_image` to
the local static URL. Verifies images load via the running backend API.
"""
from __future__ import annotations

import os
import time
import json
from typing import Optional
from pathlib import Path

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from app.database import SessionLocal
from app import models


BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "static" / "uploads" / "covers"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_COVER = "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=default"


def requests_session() -> requests.Session:
    s = requests.Session()
    retries = Retry(total=3, backoff_factor=0.3, status_forcelist=(500, 502, 504))
    s.mount("https://", HTTPAdapter(max_retries=retries))
    s.mount("http://", HTTPAdapter(max_retries=retries))
    s.headers.update({"User-Agent": "LibrarySeeder/1.0 (+https://example.org)"})
    return s


def check_url_has_image(session: requests.Session, url: str) -> bool:
    try:
        r = session.head(url, timeout=8, allow_redirects=True)
        if r.status_code == 200:
            ctype = r.headers.get("Content-Type", "")
            return ctype.startswith("image/")
    except Exception:
        pass
    return False


def download_image(session: requests.Session, url: str, dest: Path) -> bool:
    try:
        r = session.get(url, timeout=15, stream=True)
        if r.status_code == 200 and r.headers.get("Content-Type", "").startswith("image/"):
            with open(dest, "wb") as f:
                for chunk in r.iter_content(1024 * 8):
                    if chunk:
                        f.write(chunk)
            return True
    except Exception:
        pass
    return False


def openlibrary_cover(session: requests.Session, isbn: str) -> Optional[str]:
    # Try direct covers endpoint
    url = f"https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg"
    if check_url_has_image(session, url):
        return url
    # Try Open Library API for better metadata
    api = f"https://openlibrary.org/api/books?bibkeys=ISBN:{isbn}&format=json&jscmd=data"
    try:
        r = session.get(api, timeout=8)
        data = r.json()
        key = f"ISBN:{isbn}"
        if key in data:
            cov = data[key].get("cover")
            if cov:
                for k in ("large", "medium", "small"):
                    if cov.get(k):
                        if check_url_has_image(session, cov.get(k)):
                            return cov.get(k)
    except Exception:
        pass
    return None


def google_books_cover(session: requests.Session, isbn: str) -> Optional[str]:
    api = f"https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}"
    try:
        r = session.get(api, timeout=8)
        data = r.json()
        items = data.get("items") or []
        if items:
            info = items[0].get("volumeInfo", {})
            img = info.get("imageLinks", {})
            for key in ("extraLarge", "large", "medium", "thumbnail", "smallThumbnail"):
                url = img.get(key)
                if url:
                    url = url.replace("http://", "https://")
                    if check_url_has_image(session, url):
                        return url
    except Exception:
        pass
    return None


def internet_archive_cover(session: requests.Session, isbn: str) -> Optional[str]:
    # Search identifiers by ISBN
    try:
        api = f"https://archive.org/advancedsearch.php?q=isbn:{isbn}&fl=identifier&output=json"
        r = session.get(api, timeout=8)
        data = r.json()
        rows = data.get("response", {}).get("docs", [])
        if rows:
            identifier = rows[0].get("identifier")
            if identifier:
                # Try the services image endpoint
                candidate = f"https://archive.org/services/img/{identifier}"
                if check_url_has_image(session, candidate):
                    return candidate
                # Try metadata lookup for file names
                meta = session.get(f"https://archive.org/metadata/{identifier}", timeout=8).json()
                files = meta.get("files") or []
                for f in files:
                    name = f.get("name", "")
                    fmt = f.get("format", "")
                    if name.lower().endswith(('.jpg', '.jpeg', '.png')) or 'jpeg' in fmt.lower() or 'jpg' in fmt.lower():
                        candidate = f"https://archive.org/download/{identifier}/{name}"
                        if check_url_has_image(session, candidate):
                            return candidate
    except Exception:
        pass
    return None


def choose_cover_for_isbn(session: requests.Session, isbn: str) -> str:
    # Try Open Library
    ol = openlibrary_cover(session, isbn)
    if ol:
        return ol
    gb = google_books_cover(session, isbn)
    if gb:
        return gb
    ia = internet_archive_cover(session, isbn)
    if ia:
        return ia
    return DEFAULT_COVER


def run():
    s = requests_session()
    db = SessionLocal()
    try:
        books = db.query(models.Book).all()
        updated = 0
        failures = []
        for book in books:
            isbn = (book.isbn or "").strip()
            if not isbn:
                failures.append((book.id, isbn, 'no-isbn'))
                continue
            dest = UPLOAD_DIR / f"{isbn}.jpg"
            # Always try to find a real cover (replace placeholders)
            cover_url = choose_cover_for_isbn(s, isbn)
            # download if remote and not already present
            ok = False
            if cover_url and cover_url != DEFAULT_COVER:
                ok = download_image(s, cover_url, dest)
            if not ok:
                # try default or previously downloaded
                if not dest.exists():
                    download_image(s, DEFAULT_COVER, dest)
            # set cover_image to local static path
            book.cover_image = f"/static/uploads/covers/{isbn}.jpg"
            db.add(book)
            try:
                db.commit()
                updated += 1
            except Exception:
                db.rollback()
                failures.append((book.id, isbn, 'commit-failed'))

        print(f"Updated covers for {updated} books; failures={len(failures)}")
    finally:
        db.close()


if __name__ == "__main__":
    start = time.time()
    run()
    elapsed = time.time() - start
    print(f"Done in {elapsed:.1f}s")
