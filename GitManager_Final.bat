@echo off
setlocal EnableExtensions

title Git Manager - Multi Account

set "SCRIPT_DIR=%~dp0"
set "PS_SCRIPT=%SCRIPT_DIR%GitManager_Final.ps1"

where git >nul 2>&1
if errorlevel 1 (
    echo.
    echo ============================================================
    echo ERROR: Git was not found in PATH.
    echo Install Git for Windows and reopen this window.
    echo ============================================================
    echo.
    pause
    exit /b 1
)

where powershell.exe >nul 2>&1
if errorlevel 1 (
    echo.
    echo ============================================================
    echo ERROR: Windows PowerShell was not found.
    echo ============================================================
    echo.
    pause
    exit /b 1
)

if not exist "%PS_SCRIPT%" (
    echo.
    echo ============================================================
    echo ERROR: GitManager_Final.ps1 was not found.
    echo Expected: %PS_SCRIPT%
    echo ============================================================
    echo.
    pause
    exit /b 1
)

rem Run the manager with the script's directory as the initial working directory.
rem The manager itself still works correctly when launched from any folder.
cd /d "%SCRIPT_DIR%"
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%"
set "EXIT_CODE=%ERRORLEVEL%"

if not "%EXIT_CODE%"=="0" (
    echo.
    echo ============================================================
    echo Git Manager exited with code %EXIT_CODE%.
    echo ============================================================
    echo.
    pause
)

endlocal & exit /b %EXIT_CODE%
