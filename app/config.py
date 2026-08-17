from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_URL = f"sqlite:///{BASE_DIR / 'library.db'}"
FINE_RATE_PER_DAY = 0.50  # USD per overdue day
BORROW_DAYS_DEFAULT = 14
MAX_BOOKS_PER_MEMBER = 10

