@echo off
echo =================================================
echo CYAss Setup Script
echo =================================================
echo.

echo Installing dependencies for CYAss client...
cd app\client
call npm install
if errorlevel 1 (
    echo Error installing client dependencies
    exit /b 1
)

echo.
echo =================================================
echo Setup Complete!
echo =================================================
echo.
echo Next steps:
echo 1. Configure your Supabase project
echo 2. Create a .env file in app/client with:
echo    VITE_SUPABASE_URL=your_supabase_url
echo    VITE_SUPABASE_ANON_KEY=your_anon_key
echo 3. Run database migrations in Supabase dashboard
echo 4. Run 'scripts\run.bat' to start the application
echo.
pause