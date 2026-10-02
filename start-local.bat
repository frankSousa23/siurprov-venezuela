@echo off
REM ==============================================================================
REM SIURPROV - Lanzador Rápido para Entorno Local Windows (.bat)
REM Diseñado para ser probado de forma sencilla hasta por personas sin experiencia
REM Autor: Ing. Frank Sousa (Ingeniero en Informática, UNERG 2025)
REM San Juan de los Morros, Estado Guárico, Venezuela.
REM ==============================================================================

chcp 65001 >nul
cls
title SIURPROV - Simulador Urbano de Proyeccion para Venezuela

echo ==============================================================================
echo   🌍 SIURPROV - Simulador Urbano de Proyección para Venezuela (v1.3)
echo   👤 Autor: Ing. Frank Sousa (frankalfonso1988@gmail.com)
echo   🎓 UNERG 2025 - San Juan de los Morros, Estado Guárico
echo   ⭐ Repositorio: https://github.com/frankalfonso1988/SIURPROV
echo ==============================================================================
echo.

REM 1. Verificar si Node.js está instalado
echo [1/4] Comprobando entorno de ejecución Node.js en su PC...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: Node.js no está instalado en este equipo con Windows.
    echo.
    echo 👉 Por favor siga estos sencillos pasos:
    echo    1. Ingrese a https://nodejs.org en su navegador.
    echo    2. Descargue la versión recomendada (LTS) y ejecute el instalador.
    echo    3. Haga clic en "Siguiente" hasta finalizar.
    echo    4. Vuelva a hacer doble clic en este archivo "start-local.bat".
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo ✅ Node.js detectado con éxito: %NODE_VER%
echo.

REM 2. Comprobar e instalar dependencias
echo [2/4] Verificando dependencias locales del simulador...
if not exist "node_modules\" (
    echo 📦 Primera ejecución detectada. Descargando módulos necesarios...
    echo    (Esto solo se hace una vez y toma menos de un minuto).
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Hubo un inconveniente instalando dependencias. Verifique su conexión.
        pause
        exit /b 1
    )
    echo ✅ Módulos instalados correctamente.
) else (
    echo ✅ Módulos locales listos.
)
echo.

REM 3. Ejecutar suite de pruebas de integridad sismorresistente y de seguridad
echo [3/4] Ejecutando pruebas de cálculo COVENIN 1756 y seguridad...
call npm test
echo.

REM 4. Iniciar servidor local y abrir navegador
echo [4/4] Iniciando simulador local en el puerto 3000...
echo.
echo ==============================================================================
echo   🚀 El simulador se abrirá automáticamente en su navegador:
echo   🔗 http://localhost:3000
echo.
echo   💡 Para apagar el simulador: simplemente cierre esta ventana negra.
echo ==============================================================================
echo.

start "" "http://localhost:3000"
call npm run dev

pause
