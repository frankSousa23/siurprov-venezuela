## 1. Licencia y dependencias

- [x] 1.1 Simplificar LICENSE a MIT estándar con nota de cortesía
- [x] 1.2 Alinear README, memoria técnica, modal, metadatos y pruebas
- [x] 1.3 Corregir conflicto esbuild/vite en package.json

## 2. Vista 3D

- [x] 2.1 Instalar three, @react-three/fiber, @react-three/drei
- [x] 2.2 Crear `Structure3DView` (edificio, suelo, freático, agua, detritos)
- [x] 2.3 Integrar conmutador 3D/2D en `CanvasSimulator` con carga perezosa
- [x] 2.4 Mantener ambas vistas montadas (evitar error de desmontaje R3F)

## 3. Verificación

- [x] 3.1 `npm run lint` y `npm test` (11/11)
- [x] 3.2 Servidor en http://localhost:3000 y prueba visual en navegador
- [x] 3.3 Roadmap documentado: terreno 3D, formas modales, física Rapier, WebXR
