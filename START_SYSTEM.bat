@echo off
title BELTEI Library Management System
color 0b
echo ========================================================
echo   BELTEI Library Management System - Startup
echo ========================================================
echo.

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not found on your system!
    echo Please install Python 3.10+ and check "Add Python to PATH".
    echo.
    pause
    exit /b 1
)

echo [1/3] Checking environment...
if not exist .venv (
    echo [2/3] Setting up virtual environment...
    python -m venv .venv
)

if exist .venv\Scripts\pip.exe (
    set "PIP_CMD=.venv\Scripts\pip.exe"
    set "PY_CMD=.venv\Scripts\python.exe"
) else (
    set "PIP_CMD=pip"
    set "PY_CMD=python"
)

echo [2/3] Checking dependencies...
%PIP_CMD% install -r requirements.txt --quiet --disable-pip-version-check

echo.
echo ========================================================
echo   BELTEI Library System is now LIVE!
echo   Admin Dashboard: http://127.0.0.1:8000/admin
echo   Student Portal:  http://127.0.0.1:8000/portal
echo   (Press Ctrl+C to stop the server)
echo ========================================================
echo.

start http://127.0.0.1:8000/admin
%PY_CMD% run.py

pause
