import { Router } from "express";
import { readdirSync } from "fs";

const PATH_ROUTER = `${__dirname}`;
const router = Router();

const cleanFileName = (fileName: string) => fileName.split(".").shift() ?? "";

const routeFiles = readdirSync(PATH_ROUTER).filter((fileName) => {
  const cleanName = cleanFileName(fileName);
  return cleanName && cleanName !== "index";
});

const routePromises = routeFiles.map((fileName) => {
  const cleanName = cleanFileName(fileName);
  return import(`./${cleanName}`)
    .then((moduleRouter) => {
      router.use(`/api/${cleanName}`, moduleRouter.router);
    })
    .catch((err) => {
      console.error(`[routes] Error loading route ${cleanName}:`, err);
    });
});

/** Esperar a que todas las rutas estén montadas antes de usar la app (evita promesas pendientes en teardown). */
export const routesReady = Promise.all(routePromises);

export { router };
