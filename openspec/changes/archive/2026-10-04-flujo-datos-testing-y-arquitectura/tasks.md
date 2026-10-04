## 1. Modularización de Arquitectura y Lógica Pura

- [x] 1.1 Extraer la factoría `createApp` en `src/server/app.ts` desacoplada de Vite
- [x] 1.2 Añadir endpoints `/api/simulate/full` y `/api/catalog` usando el motor compartido
- [x] 1.3 Refactorizar `server.ts` como punto de entrada ligero
- [x] 1.4 Crear `src/services/visualization.ts` y enlazarlo con `Structure3DView.tsx`

## 2. Batería de Pruebas de Flujo Integral (Testing)

- [x] 2.1 Actualizar `runAllTests.ts` con soporte asíncrono y servidor efímero
- [x] 2.2 Implementar TEST-12: Lógica y geometría de visualización 3D (Park-Ang y suelos)
- [x] 2.3 Implementar TEST-13: Ciclo completo y detección de alteraciones (Tamper Detection)
- [x] 2.4 Implementar TEST-14: Flujo API de diagnóstico y cabeceras de seguridad (/api/health, /api/security/audit)
- [x] 2.5 Implementar TEST-15: Validación criptográfica y bloqueo de Prototype Pollution (/api/study/validate)
- [x] 2.6 Implementar TEST-16: Consistencia API vs Motor local (/api/simulate/full)
- [x] 2.7 Implementar TEST-17: Manejo defensivo de errores JSON y Rate Limiting

## 3. Verificación Integral y Despliegue

- [x] 3.1 Ejecutar `npm run lint` y `npm test` verificando 100% de pruebas aprobadas
- [x] 3.2 Validar OpenSpec con `openspec validate flujo-datos-testing-y-arquitectura`
- [x] 3.3 Archivar cambio en OpenSpec para sincronizar las especificaciones principales
- [x] 3.4 Verificar servidor en vivo http://localhost:3000
