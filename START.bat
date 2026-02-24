@echo off
title Ludo Tournament - Running
color 0B
echo ============================================================
echo  Threads Ludo Star Tournament
echo  Organizer: @datsleeepyhead
echo ============================================================
echo.

:: Check Node
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    :: Try common install path
    if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=%PATH%;C:\Program Files\nodejs"
    ) else (
        echo [ERROR] Node.js not found. Please run SETUP.bat first.
        pause
        exit /b 1
    )
)

echo [*] Starting backend server on http://localhost:3001 ...
start "Ludo Server" cmd /k "cd /d "%~dp0server" && node index.js"

timeout /t 2 /nobreak >nul

echo [*] Starting frontend (Vite) on http://localhost:5173 ...
start "Ludo Client" cmd /k "cd /d "%~dp0client" && npx vite"

timeout /t 3 /nobreak >nul

echo.
echo ============================================================
echo  App is running!
echo  Open your browser to:  http://localhost:5173
echo  Admin login at:        http://localhost:5173/admin/login
echo  Admin email:           aliawab888@gmail.com
echo ============================================================
echo.
echo  Press any key to open the app in your browser...
pause >nul
start "" "http://localhost:5173"
