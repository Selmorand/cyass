@echo off
echo =================================================
echo Starting CYAss Application
echo =================================================
echo.

echo Starting development server...
cd app\client
call npm run dev

echo.
echo Application is running at http://localhost:5173
echo Press Ctrl+C to stop
echo.