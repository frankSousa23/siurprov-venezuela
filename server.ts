import { createServer as createViteServer } from 'vite';
import { createApp } from './src/server/app';

const app = createApp();
const port = Number(process.env.PORT) || 3000;

// ==========================================
// 🚀 INICIALIZACIÓN DEL SERVIDOR VITE EXPRESS
// ==========================================
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
