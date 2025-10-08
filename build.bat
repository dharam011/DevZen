@echo off
REM AI Code Review App Build Script for Windows
setlocal enabledelayedexpansion

echo 🚀 Building AI Code Review App for Production...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18 or higher.
    exit /b 1
)

echo [INFO] Node.js version: 
node --version

REM Check if required environment file exists
if not exist "Backend\.env.production" (
    echo [WARNING] Production environment file not found. Creating from template...
    copy "Backend\.env" "Backend\.env.production"
    echo [WARNING] Please update Backend\.env.production with your production values!
)

REM Install Backend Dependencies
echo [INFO] Installing Backend dependencies...
cd Backend
call npm ci --only=production
cd ..

REM Install Frontend Dependencies and Build
echo [INFO] Installing Frontend dependencies...
cd Frontend
call npm ci
echo [INFO] Building Frontend for production...
call npm run build
cd ..

REM Create production directory structure
echo [INFO] Creating production build...
if exist dist rmdir /s /q dist
mkdir dist\backend
mkdir dist\frontend

REM Copy backend files
xcopy Backend\* dist\backend\ /E /I /Y
REM Copy frontend build
xcopy Frontend\dist\* dist\frontend\ /E /I /Y

REM Create production package.json
(
echo {
echo   "name": "ai-code-review-app",
echo   "version": "1.0.0",
echo   "description": "AI Code Review Application",
echo   "main": "backend/server.js",
echo   "scripts": {
echo     "start": "node backend/server.js"
echo   },
echo   "engines": {
echo     "node": ">=18.0.0"
echo   }
echo }
) > dist\package.json

REM Create startup script
(
echo @echo off
echo echo Starting AI Code Review App...
echo set NODE_ENV=production
echo node backend\server.js
) > dist\start.bat

echo [INFO] ✅ Build completed successfully!
echo [INFO] 📁 Production files are in the 'dist' directory
echo [INFO] 🚀 To run in production:
echo    cd dist ^&^& npm start
echo    or
echo    cd dist ^&^& start.bat
echo.
echo [WARNING] 📝 Don't forget to:
echo    1. Update Backend\.env.production with your production API keys
echo    2. Configure your reverse proxy (nginx) if needed
echo    3. Set up SSL certificates for HTTPS
echo    4. Configure firewall rules

pause
