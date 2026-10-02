# SIURPROV - Dockerfile Multietapa Optimizado
# Autor: Ing. Frank Sousa (UNERG 2025)
FROM node:20-alpine AS base
WORKDIR /app

# Instalar dependencias
COPY package.json bun.lock* ./
RUN npm install

# Copiar código fuente
COPY . .

# Compilar aplicación estricta
RUN npm run lint && npm run test && npm run build

# Exponer puerto estándar 3000
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["npm", "run", "dev"]
