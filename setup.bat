@echo off
echo ========================================
echo cotizAR Fullstack - Setup Inicial
echo ========================================
echo.

:: Check if node_modules exists
if not exist "node_modules" (
    echo [1/4] Instalando dependencias...
    call npm install
    echo.
) else (
    echo [1/4] Dependencias ya instaladas ✓
    echo.
)

:: Check if .env exists
if not exist ".env" (
    echo [2/4] Copiando .env.example a .env...
    copy .env.example .env
    echo ⚠  IMPORTANTE: Edita .env con tus credenciales antes de continuar
    echo.
    pause
) else (
    echo [2/4] Archivo .env ya existe ✓
    echo.
)

:: Check if Prisma is generated
echo [3/4] Generando Prisma Client...
call npx prisma generate
echo.

echo [4/4] Listo para desarrollo!
echo.
echo ========================================
echo Proximos pasos:
echo ========================================
echo.
echo 1. Edita .env con tus credenciales:
echo    - DATABASE_URL
echo    - GOOGLE_CLIENT_ID
echo    - GOOGLE_CLIENT_SECRET
echo    - MERCADOPAGO_ACCESS_TOKEN
echo.
echo 2. Crea la base de datos:
echo    npm run db:push
echo.
echo 3. (Opcional) Seed con datos demo:
echo    npm run db:seed
echo.
echo 4. Inicia el servidor:
echo    npm run dev
echo.
echo 5. Abre http://localhost:3000
echo.
echo ========================================
pause
