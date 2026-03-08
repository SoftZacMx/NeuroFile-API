// index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { router } from "./interfaces/routes";
import { setupSwagger } from "./infrastructure/config/swagger";
import { globalErrorHandler } from "./shared/middelwares/globalError.middleware";
import { requestIdMiddleware } from "./shared/middelwares/requestId.middleware";
import prisma from "./infrastructure/database/prisma/prisma.client";

export const app = express();
app.use(requestIdMiddleware);
app.use(cors());
app.use(express.json());
app.use(router);
setupSwagger(app);
app.use(globalErrorHandler);

const PORT = process.env.PORT ?? 3000;

async function start() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado a la base de datos');
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Documentación Swagger en http://localhost:${PORT}/api/api-docs`);
  });
}

start();

