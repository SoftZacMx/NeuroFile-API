Actúa como un Senior Product Designer especializado en SaaS médicos responsive.

Estoy construyendo una aplicación web llamada NeuroFile.
Es un sistema de gestión clínica para clínicas psicológicas.

La aplicación debe ser:
- Web app responsive
- Mobile-first
- Escalable a escritorio y tablet

OBJETIVO:
Optimizar la gestión clínica con fluidez operativa sin saturación visual.

USUARIOS:
- Admin
- Therapist

PRINCIPIOS DE DISEÑO:
- Reducir carga cognitiva.
- No mostrar demasiados campos al mismo tiempo.
- Mucho espacio en blanco.
- Jerarquía visual clara.
- Interfaz limpia, moderna y profesional.
- Estados claros: loading, empty, error.
- Microinteracciones suaves.

ESTÉTICA:
- Paleta neutra con acentos azul/verde clínico.
- Sensación de calma.
- Bordes suaves (8–12px).
- Sombras sutiles.
- Tipografía limpia.
- Nada visualmente agresivo.

ARQUITECTURA:

Mobile:
- Bottom navigation.
- Formularios tipo wizard vertical.
- Botón fijo inferior.
- Indicadores claros de progreso.

Desktop:
- Sidebar fija.
- Header superior.
- Layout en grid.
- Stepper horizontal para formularios largos.

MÓDULO CRÍTICO — EXPEDIENTE CLÍNICO

Es un formulario largo con múltiples secciones y listas dinámicas.

Problema:
Genera saturación y fatiga.

Solución requerida:

1. Dividir el formulario en pasos claros:
   - Información general
   - Historia clínica
   - Diagnóstico
   - Estrategia terapéutica
   - Notas

2. Implementar un sistema visible de progreso que incluya:
   - Barra de progreso porcentual (ej. 0%–100%)
   - Indicador de pasos completados
   - Estado visual (pendiente / en progreso / completado)
   - Cálculo dinámico basado en campos completados

3. El usuario debe poder:
   - Ver cuánto lleva completado
   - Navegar entre pasos
   - Guardar borrador
   - Retomar después

4. Para listas dinámicas:
   - Botón “Agregar”
   - Elementos en tarjetas suaves
   - Animaciones ligeras

En mobile:
- Barra de progreso fija en la parte superior.
- Indicador de paso actual (ej. Paso 2 de 5).
- Botón fijo “Siguiente”.

En desktop:
- Stepper horizontal con estados visuales.
- Barra de progreso debajo del stepper.
- Panel lateral opcional mostrando:
   - % completado
   - Secciones pendientes

Evitar:
- Scroll infinito.
- Formularios completamente expandidos.
- Densidad alta de texto en una sola vista.

Sensación final:
Control, claridad, avance continuo y baja fricción cognitiva.

---

## Resumen de módulos API — qué se puede hacer

| Módulo | Crear | Listar | Ver uno | Editar | Eliminar | Notas |
|--------|:-----:|:------:|:-------:|:------:|:--------:|-------|
| **Auth** | — | — | — | — | — | Login (email + password), Verificar usuario por email. Sin CRUD. |
| **Users** | ✅ | ✅ | ✅ | ✅ | ✅ | CRUD completo. Crear usuario es público; listar/ver/editar/eliminar requieren JWT (admin). |
| **Patients** | ✅ | ✅ | ✅ | ✅ | ✅ | CRUD completo. Todas las acciones con JWT. Paciente se asocia a un user_id. |
| **Appointments (Citas)** | ✅ | ✅ | ✅ | ✅ | ✅ | CRUD completo. Cada cita tiene date, patientId, status, attended. |
| **Expedients (Expedientes)** | ✅ | ✅ | ✅ | ✅ | ✅ | CRUD completo. Expediente clínico por paciente (muchos textos + síntomas, diagnósticos, modalidades). |
| **Clinical notes (Notas clínicas)** | ✅ | ✅* | ✅ | ✅ | ✅ | CRUD completo. *Listar: por expediente (body con record_id). Cada nota tiene date, note, recordId. |

**Resumen por módulo:**

- **Auth:** Iniciar sesión (login); verificar si existe un usuario por email. No hay crear/editar/eliminar.
- **Users:** Crear usuario, listar usuarios, ver un usuario, editar usuario, eliminar usuario.
- **Patients:** Crear paciente, listar pacientes, ver un paciente, editar paciente, eliminar paciente.
- **Appointments:** Crear cita, listar citas, ver una cita, editar cita, eliminar cita.
- **Expedients:** Crear expediente, listar expedientes, ver un expediente, editar expediente, eliminar expediente.
- **Clinical notes:** Crear nota clínica, listar notas (por expediente), ver una nota, editar nota, eliminar nota.