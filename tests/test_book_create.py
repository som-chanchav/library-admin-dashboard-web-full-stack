from app.main import app
from app.schemas import BookCreate


def test_book_create_accepts_cover_image():
    payload = BookCreate(
        title="Sample Book",
        isbn="978-1-2345-6789-0",
        cover_image="sample-cover.png",
    )

    assert payload.cover_image == "sample-cover.png"


def test_app_imports():
    assert app is not None
