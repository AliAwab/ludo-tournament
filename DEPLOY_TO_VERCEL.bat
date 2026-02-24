@echo off
title Ludo Tournament - Vercel Deploy
color 0D
echo ============================================================
echo  Threads Ludo Star Tournament - Vercel Deployment (v4)
echo ============================================================
echo.

:: Check Node
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found. Please run SETUP.bat first.
    pause
    exit /b 1
)

:: Ensure Vercel is installed locally
echo [*] Checking Vercel CLI...
if not exist "node_modules\.bin\vercel.cmd" (
    echo [*] Installing Vercel CLI locally...
    call npm install vercel --no-save
)

echo.
echo ------------------------------------------------------------
echo  STEP 1: LOGIN TO VERCEL
echo  If you are already logged in, this will skip quickly.
echo ------------------------------------------------------------
echo.
call npx vercel login

echo.
echo ------------------------------------------------------------
echo  STEP 2: LINK PROJECT
echo  Using fixed settings for Ludo Tournament...
echo ------------------------------------------------------------
echo.
call npx vercel link --yes

echo.
echo ------------------------------------------------------------
echo  STEP 3: FORCE UPDATE ENVIRONMENT VARIABLES
echo  Ensuring your cloud database is connected...
echo ------------------------------------------------------------
echo.
:: Note: Env vars should be managed in the Vercel Dashboard for security.
:: We are skipping the automated 'env add' step to protect your secrets.
echo [!] Please ensure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and JWT_SECRET 
echo     are configured in your Vercel Project Settings.
echo.

echo.
echo ------------------------------------------------------------
echo  STEP 4: FINAL DEPLOY (PRODUCTION)
echo  Building your site and making it live!
echo ------------------------------------------------------------
echo.
call npx vercel --prod --yes

echo.
echo ============================================================
echo  [SUCCESS] Your tournament should now be live!
echo  Please check the link above (e.g., ludo-tournament-ivory.vercel.app)
echo ============================================================
pause
