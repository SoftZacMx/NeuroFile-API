import { createPool } from "mysql2/promise";
import { mysqlConfigConnection } from "./mysql.config";

export const pool = createPool(mysqlConfigConnection);

export async function tryConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL database");
    connection.release();
  } catch (error) {
    console.error("❌ Failed to connect to MySQL:", error);
  }
}
