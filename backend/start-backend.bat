@echo off
REM ============================================================
REM  FurniShop - start the full backend stack
REM  (MariaDB 3307 + PHP API server)
REM  Your main MySQL on 3306 is NOT touched.
REM ============================================================
setlocal EnableDelayedExpansion
set BASEDIR=%~dp0
set PHP=C:\xampp\php\php.exe
set MYSQLD=C:\xampp\mysql\bin\mysqld.exe
set MYSQL=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe

REM ---------- Load environment variables from backend\.env ----------
if exist "%BASEDIR%.env" (
  for /f "usebackq eol=# tokens=1,* delims==" %%a in ("%BASEDIR%.env") do (
    set "%%a=%%b"
  )
)

REM ---------- Port configuration ----------
if not defined API_PORT set API_PORT=8000
REM Set API_PORT=8001 in backend\.env if another app occupies 8000.

echo [1/3] Starting MariaDB (project database, port 3307)...
start "FurniShop MariaDB" /MIN "%MYSQLD%" --defaults-file="%BASEDIR%my.ini"

echo [2/3] Waiting for database...
set /a tries=0
:waitdb
"%MYSQL%" -h 127.0.0.1 -P 3307 -u root -e "SELECT 1;" >nul 2>&1
if errorlevel 1 (
  set /a tries+=1
  if %tries% lss 15 (
    timeout /t 1 /nobreak >nul
    goto waitdb
  )
  echo ERROR: MariaDB did not start. Check %BASEDIR%mysqld.log
  pause
  exit /b 1
)
echo       Database is up.

echo [3/3] Starting PHP API on http://127.0.0.1:%API_PORT% ...
REM Serve the PROJECT ROOT (one level up) so /backend/api/*.php is reachable.
REM PHP reads DB_* variables from this process environment (loaded from .env).
start "FurniShop PHP API" /MIN "%PHP%" -d expose_php=0 -S 0.0.0.0:%API_PORT% -t "%BASEDIR%.."

echo.
echo ============================================================
echo   Backend running:
echo     - PHP API:   http://127.0.0.1:%API_PORT%/backend/api/
echo     - MariaDB:   127.0.0.1:3307 (db: furnishop, user: root)
echo   Products upload folder: backend\uploads\products
echo.
echo   Frontend (separate terminal):
echo     cd furniture ^&^& npm run dev
echo     - then set VITE_API_BASE_URL=http://127.0.0.1:%API_PORT%/backend/api
echo       in furniture\.env if you changed the port.
echo ============================================================
pause
