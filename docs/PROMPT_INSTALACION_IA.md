# Prompt para IA – Instalación y configuración

**Copia y pega esto cuando pidas ayuda a una IA para instalar o configurar el proyecto:**

---

Cuando ayudes con instalación, configuración o problemas de entorno del proyecto NeuroFile-API (flujo audio → expediente), usa **siempre** como guía oficial el documento:

**`docs/SETUP_AND_INSTALLATION_GUIDE.md`**

Ahí están: requisitos previos, variables de entorno (`.env`), orden en que levantar servicios (MySQL, LocalStack, SQS, MinIO, whisper-service, API, workers), diferencias entre “todo en Docker” y “API/workers en local”, cómo comprobar el flujo hasta Fase 5 y una tabla de **problemas frecuentes** (puertos 3000/8000, Docker daemon, dependencia `requests` en whisper-service, 429 OpenAI, etc.). Sigue esa guía paso a paso y refiere a ella antes de proponer cambios.

---
