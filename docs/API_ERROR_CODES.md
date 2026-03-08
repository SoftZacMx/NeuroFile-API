# Códigos de error de la API

Todas las respuestas de error siguen el formato:

```json
{
  "error": true,
  "result": false,
  "data": null,
  "message": "Descripción legible del error",
  "status_code": 400,
  "code": "OPCIONAL_CODIGO_MAQUINA"
}
```

## status_code (HTTP)

| status_code | Significado |
|-------------|-------------|
| 400 | Bad Request — Datos de entrada inválidos, validación fallida o parámetros incorrectos. |
| 401 | Unauthorized — No hay token, token inválido o expirado. |
| 403 | Forbidden — No tiene permiso para el recurso. |
| 404 | Not Found — Recurso no encontrado (paciente, expediente, cita, etc.). |
| 429 | Too Many Requests — Límite de tasa superado (rate limiting). |
| 500 | Internal Server Error — Error interno del servidor. |

## code (opcional)

Código máquina para que el cliente pueda reaccionar por tipo de error:

| code | Cuándo se devuelve |
|------|--------------------|
| `VALIDATION_ERROR` | Validación de body/params fallida (express-validator). `data` contiene el array de errores. |
| `INTERNAL_ERROR` | Error no capturado en el servidor (middleware global). En producción el `message` es genérico. |

Otros errores (401, 403, 404, etc.) pueden no incluir `code`; el cliente puede usar `status_code` como referencia principal.
