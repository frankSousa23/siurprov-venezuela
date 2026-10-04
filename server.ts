import { createServer as createViteServer } from 'vite';
import { createApp } from './src/server/app';

const app = createApp();
const port = Number(process.env.PORT) || 3000;

/**
 * server.ts: Punto de Entrada Principal del Servidor de Producción y Desarrollo Local
 *
 * PATRÓN VITE MIDDLEWARE MODE:
 * - En lugar de ejecutar Vite en un puerto (e.g. 5173) y Express en otro (3000) requiriendo proxies,
 *   Vite se instancia en modo middleware (`middlewareMode: true`).
 * - Express recibe todas las peticiones: las rutas `/api/*` las procesa el backend con sus cabeceras
 *   y rate-limiting, mientras que el resto de las peticiones las atiende el motor HMR de Vite.
 * - Resultado: Una experiencia fullstack integrada y ligera en un único puerto (`localhost:3000`).
 */
async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);

  app.listen(port, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🌍 SIURPROV Workstation Activo en http://localhost:${port}`);
    console.log(`👤 Autor: Ing. Frank Sousa (UNERG 2025)`);
    console.log(`🛡️ Seguridad: Cabeceras defensivas & Rate Limiting activos`);
    console.log(`📁 Modo: Simulación Local Offline-First & Portabilidad .siurprov`);
    console.log(`=======================================================`);
  });
}

startServer();
