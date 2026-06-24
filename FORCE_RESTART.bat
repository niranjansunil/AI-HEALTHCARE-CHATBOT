@echo off
echo ============================================
echo   AI Healthcare Assistant - Force Restart
echo ============================================
echo.
echo Killing any process on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a 2>nul
echo.
echo Starting Clinical Intelligence Backend...
echo.
cd /d "%~dp0"
npm start
pause
