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
  waitForConnections: true,
  connectionLimit: 2, // 🔴 Clever Cloud a une limite de 5 connections, on en prend 2 max
  queueLimit: 0,
};

console.log(`\n🔗 [DATABASE CONFIG]`);
console.log(`   Host: ${dbConfig.host}`);
console.log(`   Port: ${dbConfig.port}`);
console.log(`   User: ${dbConfig.user}`);
console.log(`   Database: ${dbConfig.database}`);
console.log(`   Password: ${dbConfig.password ? "***" + dbConfig.password.substring(dbConfig.password.length - 3) : "[EMPTY]"}`);
console.log(`   Tentative de connexion...\n`);

const db = mysql.createPool(dbConfig as any);

export default db;
