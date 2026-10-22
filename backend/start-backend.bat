@echo off
REM ============================================================
REM  FurniShop - Start the full backend stack
REM  (MariaDB 3307 + PHP API server on port 8001)
REM ============================================================
setlocal EnableDelayedExpansion
set "BASEDIR=%~dp0"

REM If this is part of the dual-folder workspace layout where root has backend:
if exist "%BASEDIR%..\..\backend\start-backend.bat" if not exist "%BASEDIR%dbdata" (
  cd /d "%BASEDIR%..\..\backend"
  call start-backend.bat
  exit /b
)

set "PROJECT_ROOT=%BASEDIR%.."

REM ---------- Resolve PHP Executable ----------
set "PHP=C:\xampp\php\php.exe"
if not exist "%PHP%" (
  where php >nul 2>&1
  if !errorlevel! equ 0 (
    set "PHP=php"
  ) else (
    echo [ERROR] PHP executable not found at C:\xampp\php\php.exe or on PATH.
    echo Please install XAMPP or add PHP to your system PATH.
    pause
    exit /b 1
  )
)

REM ---------- Resolve MySQL/MariaDB Executables ----------
set "MYSQLD=C:\xampp\mysql\bin\mysqld.exe"
if not exist "%MYSQLD%" (
  if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" (
    set "MYSQLD=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe"
  )
)

set "MYSQL=C:\xampp\mysql\bin\mysql.exe"
if not exist "%MYSQL%" (
  if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
    set "MYSQL=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
  ) else (
    set "MYSQL=mysql"
  )
)

REM ---------- Load environment variables from backend\.env ----------
if exist "%BASEDIR%.env" (
  for /f "usebackq eol=# tokens=1,* delims==" %%a in ("%BASEDIR%.env") do (
    set "%%a=%%b"
  )
)

REM ---------- Port configuration ----------
if not defined API_PORT set API_PORT=8001
if not defined DB_PORT set DB_PORT=3307

echo ============================================================
echo   FurniShop Backend Stack Initializer
echo ============================================================

REM ---------- [1/3] Check / Start MariaDB ----------
echo [1/3] Checking MariaDB on port %DB_PORT%...
"%MYSQL%" -h 127.0.0.1 -P %DB_PORT% -u root -e "SELECT 1;" >nul 2>&1
if !errorlevel! equ 0 goto db_already_running

echo       Starting isolated MariaDB on port %DB_PORT%...
start "FurniShop MariaDB" /MIN "%MYSQLD%" --defaults-file="%BASEDIR%my.ini"

echo [2/3] Waiting for MariaDB to accept connections...
set /a tries=0

:waitdb
"%MYSQL%" -h 127.0.0.1 -P %DB_PORT% -u root -e "SELECT 1;" >nul 2>&1
if !errorlevel! equ 0 goto db_ready
set /a tries+=1
if !tries! lss 15 (
  timeout /t 1 /nobreak >nul
  goto waitdb
)
echo [ERROR] MariaDB did not start. Check %BASEDIR%mysqld.log or %BASEDIR%dbdata\*.err
pause
exit /b 1

:db_already_running
echo       MariaDB is already running on port %DB_PORT%.
goto check_php

:db_ready
echo       MariaDB is up and ready.

:check_php
REM ---------- [3/3] Check / Start PHP API ----------
echo [3/3] Checking PHP API on port %API_PORT%...
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:%API_PORT%/backend/api/health.php' -TimeoutSec 2 -UseBasicParsing; exit 0 } catch { exit 1 }" >nul 2>&1
if !errorlevel! equ 0 goto php_already_running

echo       Starting PHP API server on http://127.0.0.1:%API_PORT%
start "FurniShop PHP API" /MIN "%PHP%" -d expose_php=0 -S 0.0.0.0:%API_PORT% -t "%PROJECT_ROOT%"
timeout /t 2 /nobreak >nul

powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:%API_PORT%/backend/api/health.php' -TimeoutSec 3 -UseBasicParsing; exit 0 } catch { exit 1 }" >nul 2>&1
if !errorlevel! equ 0 (
  echo       PHP API server is verified and healthy!
) else (
  echo       [NOTE] PHP API process spawned on port %API_PORT%.
)
goto backend_done

:php_already_running
echo       PHP API server is already running and healthy on port %API_PORT%.

:backend_done
echo.
echo ============================================================
echo   FurniShop Backend Stack is READY:
echo     - PHP API:       http://127.0.0.1:%API_PORT%/backend/api/
echo     - Health Check:  http://127.0.0.1:%API_PORT%/backend/api/health.php
echo     - MariaDB:       127.0.0.1:%DB_PORT% (Database: furnishop, User: root)
echo     - Document Root: %PROJECT_ROOT%
echo.
echo   Frontend (in a separate terminal):
echo     cd furniture ^&^& npm run dev
echo ============================================================
echo.
pause
