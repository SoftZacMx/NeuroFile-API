import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NextBuy',
      version: '1.0.0',
      description: 'Documentación de la API',
    },
  },
  // Ajusta la ruta según dónde estén tus controladores o rutas con JSDoc
  apis: ['src/interfaces/routes/*.ts'], 
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express) {
  app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
