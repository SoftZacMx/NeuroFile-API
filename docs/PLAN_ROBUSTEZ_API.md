# Plan de implementación: robustez de la API

Objetivo: mejorar la robustez de NeuroFile-API en fases pequeñas y acotadas, priorizando errores no capturados, validación y seguridad básica.

---

## Fase 1 — Manejador global de errores

**Objetivo:** Evitar que errores no capturados dejen peticiones colgadas o tiren el proceso.

| # | Tarea | Descripción |
|---|--------|-------------|
| 1.1 | Middleware de error global | Añadir middleware Express de 4 argumentos `(err, req, res, next)` que capture cualquier error, loguee (sin exponer stack al cliente en producción), responda con `errorResponse` y status 500. |
| 1.2 | Wrapper para controladores async | Crear utilidad `asyncHandler(fn)` que envuelva controladores async y pase rechazos de promesas a `next(err)`, para que el middleware global los capture. |
| 1.3 | Registrar middleware al final | Montar el middleware de error **después** de todas las rutas en `app.ts` (y antes de `setupSwagger` si aplica) para que sea el último en la cadena. |
| 1.4 | Probar flujo | Forzar un error no capturado en una ruta de prueba y verificar que se devuelve 500 y mensaje genérico sin crashear el servidor. |

**Criterio de éxito:** Ningún error no capturado deja la petición sin respuesta ni cierra el proceso.

**Estado:** ✅ Implementado — `asyncHandler`, `globalError.middleware.ts`, registro en `app.ts` y todos los controladores envueltos en las rutas (patients, auth, users, expedients, appointments, clinical-notes, conversations, dashboard).

---

## Fase 2 — Validación de entrada consistente

**Objetivo:** Validar body, params y query en los endpoints críticos para evitar datos mal formados.

| # | Tarea | Descripción |
|---|--------|-------------|
| 2.1 | Validadores para pacientes | Añadir `express-validator` en rutas de pacientes: POST (crear) y PUT (actualizar) con reglas para campos requeridos y tipos (nombre, teléfono, etc.). Usar `handleValidatons` antes del controlador. |
| 2.2 | Validadores para expedientes | Validar POST/PUT de expedients: `patient_id`, campos de texto con longitud máxima si aplica. Reutilizar esquema donde sea posible. |
| 2.3 | Validadores para citas | Validar POST/PUT de appointments: `patientId`, `date`, `status`, etc. |
| 2.4 | Validadores para notas clínicas | Validar POST/PUT de clinical-notes: `recordId`, `date`, `note` (longitud máxima). |
| 2.5 | Validadores para conversaciones | Sustituir validación manual de body en `createConversationController` por reglas de express-validator (exactamente uno de `recordId` o `patientId`, tipo number). |
| 2.6 | Respuesta unificada de validación | Asegurar que `handleValidatons` devuelva formato coherente (ej. `{ error: true, message: "...", errors: [...] }`) y status 400. |

**Criterio de éxito:** Todas las rutas que modifican datos validan entrada con express-validator y responden 400 con mensajes claros ante datos inválidos.

**Estado:** ✅ Implementado — `handleValidatons` unificado (formato `errorResponse` + status 400). Validadores: patients (create/update), expedients (create/update), appointments (create/update), clinical-notes (create/update), conversations (create). Login con `loginValidator` de nuevo en auth.

---

## Fase 3 — Límites y seguridad HTTP básica

**Objetivo:** Proteger contra payloads enormes y configurar CORS de forma explícita.

| # | Tarea | Descripción |
|---|--------|-------------|
| 3.1 | Límite de tamaño de body | Configurar `express.json({ limit: '...' })` con un valor razonable (ej. 1MB o 2MB) para evitar que peticiones gigantes consuman memoria. Documentar el valor en env o constantes. |
| 3.2 | CORS por entorno | Configurar `cors({ origin: ... })` según entorno: en desarrollo permitir `localhost`; en producción usar variable de entorno con el origen del frontend (ej. `FRONTEND_ORIGIN`). |
| 3.3 | Headers de seguridad (opcional) | Añadir `helmet` para cabeceras HTTP seguras (X-Content-Type-Options, etc.) en una sola tarea. |

**Criterio de éxito:** Body limitado, CORS explícito por entorno y, si se incluye, helmet aplicado sin romper rutas.

---

## Fase 4 — Rate limiting

**Objetivo:** Reducir riesgo de abuso y fuerza bruta (p. ej. en login).

| # | Tarea | Descripción |
|---|--------|-------------|
| 4.1 | Instalar y configurar rate limiter | Añadir `express-rate-limit` (o similar). Configurar límite global por IP (ej. 100 req/15 min por defecto). |
| 4.2 | Límite estricto en auth | Aplicar un límite más bajo solo a rutas de login/verify (ej. 5–10 req/15 min por IP) para mitigar fuerza bruta. |
| 4.3 | Variables de entorno | Hacer configurables límites y ventana (ej. `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`) para ajustar en producción. |

**Criterio de éxito:** Respuestas 429 cuando se supera el límite; login con límite más estricto.

---

## Fase 5 — Consistencia de respuestas y logging

**Objetivo:** Respuestas de error homogéneas y trazabilidad básica.

| # | Tarea | Descripción |
|---|--------|-------------|
| 5.1 | Formato único de error | Definir un formato estándar para errores (ej. `{ error: true, message, status_code, code? }`) y usarlo en el middleware global y en `errorResponse`. |
| 5.2 | Mensajes en español | Revisar controladores y reemplazar mensajes en inglés por español donde corresponda (pacientes, expedients, etc.). |
| 5.3 | Logging de errores | En el middleware global y en los catch de controladores, loguear con un nivel (error/warn) y un identificador de petición (req.id o timestamp) sin volcar el stack al cliente. |
| 5.4 | Documentar códigos de error | En Swagger o en un README, listar los `status_code` y opcionalmente `code` que devuelve la API (400, 401, 403, 404, 429, 500). |

**Criterio de éxito:** Todas las respuestas de error siguen el mismo formato; mensajes en español; errores logueados sin exponer detalles internos al cliente.

**Estado:** ✅ Implementado — Formato con `code` opcional (VALIDATION_ERROR, INTERNAL_ERROR). successResponse mensaje por defecto "Éxito". Middleware `requestIdMiddleware` y logging con requestId en globalErrorHandler. Mensajes en español en patients, expedients, appointments, users, auth. Documentación en `docs/API_ERROR_CODES.md`.

---

## Fase 6 — Salud y disponibilidad

**Objetivo:** Punto de salud para orquestadores y monitoreo.

| # | Tarea | Descripción |
|---|--------|-------------|
| 6.1 | Ruta de health check | Añadir `GET /api/health` (o `/health`) que responda 200 y un payload mínimo (ej. `{ ok: true }`). Sin JWT. |
| 6.2 | Health con dependencias (opcional) | Opcionalmente, que el health compruebe conexión a DB (y si se usa, S3/SQS) y devuelva 503 si algo falla, para que el balanceador no envíe tráfico a instancias rotas. |

**Criterio de éxito:** Un orquestador o balanceador puede comprobar salud con GET /api/health y actuar en consecuencia.

---

## Orden sugerido y dependencias

```
Fase 1 (errores globales)     → base para no dejar respuestas colgadas
    ↓
Fase 2 (validación)           → reduce datos inválidos
Fase 3 (límites y CORS)       → seguridad básica
    ↓
Fase 4 (rate limiting)        → mitigar abuso
Fase 5 (consistencia y logs)  → mantenibilidad
Fase 6 (health)               → operación y despliegue
```

- **Fase 1** conviene hacerla primero.
- **Fases 2 y 3** se pueden hacer en paralelo o una tras otra.
- **Fases 4, 5 y 6** pueden seguir en el orden que prefieras (4 y 6 suelen ser rápidas).

---

## Resumen por fase

| Fase | Enfoque | Esfuerzo estimado |
|------|---------|-------------------|
| 1 | Manejador global de errores + async wrapper | Bajo |
| 2 | Validación con express-validator en endpoints clave | Medio |
| 3 | Límite body, CORS, helmet | Bajo |
| 4 | Rate limiting global y en auth | Bajo |
| 5 | Formato de error, mensajes ES, logging | Medio |
| 6 | Ruta de health check | Bajo |

Cada fase se puede implementar en 1–3 sesiones cortas y validar con pruebas manuales o tests existentes antes de pasar a la siguiente.
