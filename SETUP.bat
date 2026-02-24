@echo off
title Ludo Tournament - Setup
color 0A
echo ============================================================
echo  Threads Ludo Star Tournament - First-Time Setup
echo ============================================================
echo.

:: Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js is already installed.
    node --version
    goto :install_deps
)

echo [!] Node.js not found. Installing via winget...
echo.
winget install OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Auto-install failed. Please install Node.js manually:
    echo   1. Go to https://nodejs.org
    echo   2. Download the LTS version
    echo   3. Run the installer
    echo   4. Re-run this script
    pause
    exit /b 1
)

echo.
echo [OK] Node.js installed! Refreshing PATH...
:: Refresh PATH so npm is available in this session
set "PATH=%PATH%;C:\Program Files\nodejs"

:install_deps
echo.
echo ============================================================
echo  Installing server dependencies...
echo ============================================================
cd /d "%~dp0server"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Server npm install failed.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo  Installing client dependencies...
echo ============================================================
cd /d "%~dp0client"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Client npm install failed.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo  [SUCCESS] Setup complete!
echo  Now run: START.bat to launch the app
echo ============================================================
pause
