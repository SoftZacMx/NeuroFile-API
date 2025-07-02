import "dotenv/config";

export const mysqlConfigConnection = {
  host: process.env.DEV_DB_HOST!,
  user: process.env.DEV_DB_USER!,
  password: process.env.DEV_DB_PASSWORD!,
  database: process.env.DEV_DB_NAME!,
  port: parseInt(process.env.DEV_DB_PORT!),
};
