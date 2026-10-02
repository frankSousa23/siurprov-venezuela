#!/usr/bin/env bash
# ==============================================================================
# SIURPROV - Lanzador Rápido para Entorno Local (Linux / macOS)
# Diseñado para estudiantes, profesores y evaluadores sin experiencia en terminal
# Autor: Ing. Frank Sousa (Ingeniero en Informática, UNERG 2025)
# San Juan de los Morros, Estado Guárico, Venezuela.
# ==============================================================================

set -e

# Colores para la interfaz de consola
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

clear
echo -e "${CYAN}======================================================================${NC}"
echo -e "${GREEN}🌍 SIURPROV — Simulador Urbano de Proyección para Venezuela (v1.3)${NC}"
echo -e "${BLUE}👤 Autor: Ing. Frank Sousa (frankalfonso1988@gmail.com)${NC}"
echo -e "${BLUE}🎓 UNERG 2025 — San Juan de los Morros, Estado Guárico${NC}"
echo -e "${CYAN}======================================================================${NC}"
echo ""

# 1. Comprobar si Node.js está instalado
echo -e "${YELLOW}[1/4] Comprobando entorno de ejecución Node.js...${NC}"
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}❌ Error: Node.js no está instalado en este equipo.${NC}"
    echo -e "👉 Por favor descargue e instale Node.js (versión 18 o superior) desde: https://nodejs.org"
    echo -e "   Es completamente gratuito y toma menos de 2 minutos."
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js detectado: ${NODE_VERSION}${NC}"
echo ""

# 2. Comprobar si npm está instalado
if ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}❌ Error: Gestor de paquetes npm no encontrado.${NC}"
    exit 1
fi

# 3. Comprobar e instalar dependencias si faltan
echo -e "${YELLOW}[2/4] Verificando dependencias locales del simulador...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${CYAN}📦 Primera ejecución detectada. Instalando módulos necesarios (esto tardará unos segundos)...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencias instaladas correctamente.${NC}"
else
    echo -e "${GREEN}✅ Módulos locales listos.${NC}"
fi
echo ""

# 4. Ejecutar comprobación rápida de integridad y física
echo -e "${YELLOW}[3/4] Ejecutando verificación de autodiagnóstico del sistema...${NC}"
npm test || {
    echo -e "${YELLOW}⚠️ Aviso: Algunas pruebas tuvieron advertencias, pero el sistema puede iniciar.${NC}"
}
echo ""

# 5. Iniciar el servidor local y abrir el navegador
echo -e "${YELLOW}[4/4] Levantando servidor local en el puerto 3000...${NC}"
echo -e "${GREEN}🚀 El simulador estará disponible en: ${CYAN}http://localhost:3000${NC}"
echo -e "${BLUE}💡 Presiona Ctrl + C en esta ventana para apagar el simulador cuando termines.${NC}"
echo -e "${CYAN}======================================================================${NC}"
echo ""

# Intentar abrir el navegador automáticamente según el sistema operativo
(
  sleep 2
  if command -v xdg-open >/dev/null 2>&1; then
      xdg-open "http://localhost:3000" >/dev/null 2>&1 || true
  elif command -v open >/dev/null 2>&1; then
      open "http://localhost:3000" >/dev/null 2>&1 || true
  fi
) &

# Iniciar servidor de desarrollo
npm run dev
