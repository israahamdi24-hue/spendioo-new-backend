import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// 🌐 Support pour Clever Cloud + Local Dev
const dbConfig = {
  host: process.env.MYSQL_HOST || process.env.DB_HOST || "localhost",
  user: process.env.MYSQL_USER || process.env.DB_USER || "root",
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || "",
  database: process.env.MYSQL_DB || process.env.DB_NAME || "spendio",
  port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306),
};

console.log(`🔗 Tentative de connexion à: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);

const db = mysql.createPool(dbConfig as any);

export default db;
