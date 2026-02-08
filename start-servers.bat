start "Frontend Server" cmd /c "cd /d %~dp0 && node start-frontend.js"netstat -ano | findstr :3000const PORT = process.env.PORT || 3000;@echo off
chcp 65001 >nul
echo ========================================
echo    نبض اليمن برو - تشغيل السيرفرات
echo ========================================
echo.

:: Kill any existing node processes
taskkill /F /IM node.exe 2>nul

timeout /t 2 /nobreak >nul

echo [1/2] تشغيل سيرفر البيانات (Backend)...
start "Backend Server" cmd /c "cd /d %~dp0 && node server.js"

timeout /t 3 /nobreak >nul

echo [2/2] تشغيل سيرفر الموقع (Frontend)...
start "Frontend Server" cmd /c "cd /d %~dp0 && node start-frontend.js"

echo.
echo ========================================
echo    تم تشغيل السيرفرات بنجاح!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:8000
echo.
echo اضغط أي مفتاح لإغلاق هذه النافذة...
pause >nul
