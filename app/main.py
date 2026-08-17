from contextlib import asynccontextmanager
from os import environ
from pathlib import Path

from fastapi import Depends, FastAPI, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy import select, text
from sqlalchemy.orm import Session
from starlette.middleware.sessions import SessionMiddleware

from app.database import Base, SessionLocal, engine, get_db
from app import models  # noqa: F401 — register ORM models
from app.routers import api
from app.routers import portal
from app.seed import seed_database

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = environ.get("SESSION_SECRET_KEY", "change-this-secret-key")


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with engine.begin() as connection:
        existing_columns = {
            row[1] for row in connection.execute(text("PRAGMA table_info(books)")).all()
        }
        if "cover_image" not in existing_columns:
            connection.execute(text("ALTER TABLE books ADD COLUMN cover_image VARCHAR(500)"))
        member_columns = {row[1] for row in connection.execute(text("PRAGMA table_info(members)")).all()}
        if "user_id" not in member_columns:
            connection.execute(text("ALTER TABLE members ADD COLUMN user_id INTEGER"))
            connection.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_members_user_id ON members(user_id)"))
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Library Admin Dashboard",
    description="World-class library management system",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=BASE_DIR / "templates")
app.include_router(api.router)
app.include_router(portal.router)


def authenticate_user(db: Session, username: str, password: str):
    stmt = select(models.User).filter_by(username=username)
    user = db.scalar(stmt)
    if user is None or not user.is_active:
        return None
    if user.password_hash != password:
        return None
    return user


@app.get("/login", response_class=HTMLResponse)
async def login_get(request: Request, redirect_book: int | None = None):
    url = f"/portal/login?redirect_book={redirect_book}" if redirect_book else "/portal/login"
    return RedirectResponse(url=url, status_code=302)


@app.post("/login", response_class=HTMLResponse)
async def login_post(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    redirect_book: str | None = Form(None),
    db: Session = Depends(get_db),
):
    username = username.strip()
    user = authenticate_user(db, username, password)
    if user is None:
        return templates.TemplateResponse(
            "portal_login.html",
            {
                "request": request,
                "error": "ឈ្មោះគណនី ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ / Invalid username or password",
                "redirect_book": redirect_book,
            },
            status_code=401,
        )

    request.session["user"] = user.username
    request.session["role"] = user.role.value

    if user.role in (models.UserRole.ADMIN, models.UserRole.LIBRARIAN, models.UserRole.STAFF):
        return RedirectResponse(url="/admin", status_code=303)

    if redirect_book and str(redirect_book).strip() and str(redirect_book).strip().isdigit():
        return RedirectResponse(url=f"/portal?borrow_book={str(redirect_book).strip()}", status_code=303)
    return RedirectResponse(url="/portal", status_code=303)


@app.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/portal/login", status_code=303)


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    # Root URL http://127.0.0.1:8000/ is ALWAYS the Homepage / Member Portal
    return RedirectResponse(url="/portal", status_code=302)


@app.get("/admin", response_class=HTMLResponse)
async def admin_dashboard(request: Request, db: Session = Depends(get_db)):
    username = request.session.get("user")
    if not username:
        return RedirectResponse(url="/portal/login", status_code=302)
    user = db.query(models.User).filter_by(username=username, is_active=True).first()
    if not user or user.role not in (models.UserRole.ADMIN, models.UserRole.LIBRARIAN, models.UserRole.STAFF):
        return RedirectResponse(url="/portal", status_code=302)
    return templates.TemplateResponse("index.html", {"request": request})
