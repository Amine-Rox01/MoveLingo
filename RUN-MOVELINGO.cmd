@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 22.13 or newer from nodejs.org, then run this file again.
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Install Node.js with npm enabled, then reopen this file.
  pause
  exit /b 1
)
set "MOVELINGO_INSTALL=0"
if not exist "node_modules\vinext\package.json" set "MOVELINGO_INSTALL=1"
if not exist "node_modules\gsap\package.json" set "MOVELINGO_INSTALL=1"
if "%MOVELINGO_INSTALL%"=="1" (
  echo Installing project dependencies. Internet access is needed on the first run.
  call npm ci
  if errorlevel 1 (
    echo Installation failed. Check your internet connection and the message above.
    pause
    exit /b 1
  )
)
echo Keep this window open while using MoveLingo.
echo Open the Local URL printed below. The website will guide you through local sign-in.
call npm run dev
pause
