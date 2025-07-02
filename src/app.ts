// index.ts
import express from 'express';
import cors from 'cors';
import { router } from './interfaces/routes';
import { setupSwagger } from './infrastructure/config/swagger' 

export const app = express();
app.use(cors());
app.use(express.json());
app.use(router)
setupSwagger(app);

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
  console.log('Documentación Swagger en http://localhost:3000/api/api-docs');
});

