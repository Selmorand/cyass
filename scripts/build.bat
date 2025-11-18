@echo off
echo =================================================
echo Building CYAss for Production
echo =================================================
echo.

echo Building client application...
cd app\client
call npm run build
if errorlevel 1 (
    echo Error building client application
    exit /b 1
)

echo.
echo =================================================
echo Build Complete!
echo =================================================
echo.
echo Production files are in: app\client\dist
echo Deploy these files to your hosting service (Netlify, Vercel, etc.)
echo.
pause