@echo off
title Sistema LGP - Presupuestos y Tarifas
color 0B
echo ========================================================
echo       SISTEMA LGP - PRESUPUESTOS Y TARIFAS
echo ========================================================
echo.
echo [1/2] Iniciando el servidor local de LGP...

:: Open the browser after a short delay
start /b cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3001"

:: Start the Node.js server
node server/index.js

pause
