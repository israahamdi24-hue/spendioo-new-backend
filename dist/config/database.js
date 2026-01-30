"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// 🌐 Support pour Clever Cloud + Local Dev
const dbConfig = {
    host: process.env.MYSQL_HOST || process.env.DB_HOST || "localhost",
    user: process.env.MYSQL_USER || process.env.DB_USER || "root",
    password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || "",
    database: process.env.MYSQL_DB || process.env.DB_NAME || "spendio",
    port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 1, // 🔴 Clever Cloud max_user_connections = 5, use 1 to avoid conflicts
    queueLimit: 10, // Queue up to 10 requests while waiting for connection
    enableKeepAlive: true,
    keepAliveInitialDelayMs: 0,
};
console.log(`\n🔗 [DATABASE CONFIG]`);
console.log(`   Host: ${dbConfig.host}`);
console.log(`   Port: ${dbConfig.port}`);
console.log(`   User: ${dbConfig.user}`);
console.log(`   Database: ${dbConfig.database}`);
console.log(`   Password: ${dbConfig.password ? "***" + dbConfig.password.substring(dbConfig.password.length - 3) : "[EMPTY]"}`);
console.log(`   Connection Limit: ${dbConfig.connectionLimit}`);
console.log(`   Tentative de connexion...\n`);
const db = promise_1.default.createPool(dbConfig);
exports.default = db;
