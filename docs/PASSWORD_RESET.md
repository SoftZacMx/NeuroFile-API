# Recuperación de contraseña (Forgot / Reset Password)

Flujo completo de "¿Olvidaste tu contraseña?" en NeuroFile.

---

## Resumen del flujo

```
Frontend /login
  → clic "¿Olvidaste tu contraseña?"
  → /forgot-password (email)
  → POST /api/auth/forgot-password
  → correo SMTP/SES con enlace
  → /reset-password?token=...
  → POST /api/auth/reset-password
  → /login (nueva contraseña)
```

---

## Endpoints

### 1. Solicitar recuperación

| | |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/api/auth/forgot-password` |
| **Auth** | No requiere JWT |
| **Body** | `{ "email": "usuario@ejemplo.com" }` |

**Respuesta (siempre 200, por seguridad):**

```json
{
  "error": false,
  "data": {
    "message": "Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña."
  }
}
```

Si el email existe en la BD, se envía un correo con enlace:

```
{FRONTEND_URL}/reset-password?token={jwt}
```

### 2. Restablecer contraseña

| | |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/api/auth/reset-password` |
| **Auth** | No requiere JWT |
| **Body** | `{ "token": "...", "password": "nuevaContraseña" }` |

**Respuesta exitosa (200):**

```json
{
  "error": false,
  "data": {
    "message": "Password updated successfully"
  }
}
```

**Errores:**

| Código | Causa |
|--------|--------|
| 400 | Token inválido, expirado o no es de tipo `reset` |
| 404 | Usuario no encontrado |
| 500 | Error al actualizar contraseña |

---

## Variables de entorno (API)

| Variable | Descripción | Ejemplo local |
|----------|-------------|---------------|
| `SMTP_HOST` | Host SMTP (AWS SES u otro) | `email-smtp.us-east-1.amazonaws.com` |
| `SMTP_PORT` | Puerto SMTP | `587` |
| `SMTP_SECURE` | TLS directo (465) | `false` |
| `SMTP_USER` | Usuario SMTP | credencial SES |
| `SMTP_PASS` | Contraseña SMTP | credencial SES |
| `EMAIL_FROM` | Remitente (identidad verificada en SES) | `"NeuroFile <tech@luum-dev.com>"` |
| `FRONTEND_URL` | Base del enlace en el correo | `http://localhost:5173` |
| `JWT_SECRET` | Firma de tokens login y reset | secreto seguro |
| `RESET_TOKEN_EXPIRES_MINUTES` | Validez del enlace (opcional) | `30` |

Verificar SMTP: `npm run verify:smtp`

---

## Variables de entorno (Frontend)

| Variable | Descripción | Ejemplo local |
|----------|-------------|---------------|
| `VITE_API_BASE_URL` | URL base de la API | `http://localhost:3000/api` |

---

## Rutas del frontend

| Ruta | Pantalla |
|------|----------|
| `/login` | Inicio de sesión + enlace "¿Olvidaste tu contraseña?" |
| `/forgot-password` | Formulario para solicitar enlace |
| `/reset-password?token=...` | Formulario nueva contraseña |

---

## AWS SES (sandbox vs producción)

En **modo sandbox**:

- El remitente (`EMAIL_FROM`) debe estar verificado en SES.
- El **destinatario** también debe estar verificado.

Para enviar a cualquier email, solicita **Production access** en la consola de SES.

Alternativa local sin AWS: usar [Mailpit](https://github.com/axllent/mailpit) u otro SMTP de desarrollo.

---

## Pruebas con Bruno

Colección: `api-collection/`

1. **Auth → forgot-password** — envía email de prueba.
2. Copia el `token` del enlace del correo al environment `reset_token`.
3. **Auth → reset-password** — establece `new_password`.

Environment `local`: `test_email`, `reset_token`, `new_password`.

---

## Prueba manual E2E

1. API y frontend en marcha (`npm run dev` en ambos).
2. Ir a http://localhost:5173/login → "¿Olvidaste tu contraseña?".
3. Email de usuario existente y verificado en SES.
4. Abrir enlace del correo → nueva contraseña.
5. Login con la contraseña nueva.
