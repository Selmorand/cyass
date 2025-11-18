@echo off
echo =================================================
echo Running CYAss Tests
echo =================================================
echo.

echo Running client tests...
cd app\client
call npm test
if errorlevel 1 (
    echo Warning: Some tests failed
)

echo.
echo =================================================
echo Test run complete
echo =================================================
echo.
pause