"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const database_1 = __importDefault(require("../config/database"));
const router = express_1.default.Router();
router.post("/register", authController_1.register);
router.post("/login", authController_1.login);
router.get("/ping", (req, res) => {
    res.send("pong");
});
/**
 * 🔍 Endpoint de diagnostic
 * Vérifie la connexion BD et retourne les infos
 */
router.get("/health", async (req, res) => {
    try {
        console.log(`\n🏥 [HEALTH CHECK] Diagnostic...`);
        // Test 1: Connexion BD
        console.log(`  1️⃣ Test connexion BD...`);
        const conn = await database_1.default.getConnection();
        const [result] = await conn.query("SELECT 1");
        conn.release();
        console.log(`  ✅ Connexion BD: OK`);
        // Test 2: Table users existe?
        console.log(`  2️⃣ Test table users...`);
        const [tables] = await database_1.default.query("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'", [process.env.MYSQL_DB || process.env.DB_NAME || "spendio"]);
        const usersTableExists = tables.length > 0;
        console.log(`  ${usersTableExists ? '✅' : '❌'} Table users: ${usersTableExists ? 'EXISTS' : 'MISSING'}`);
        res.json({
            status: "ok",
            database: {
                connected: true,
                host: process.env.MYSQL_HOST || process.env.DB_HOST || "localhost",
                database: process.env.MYSQL_DB || process.env.DB_NAME || "spendio",
                usersTableExists,
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error(`\n🏥 [HEALTH CHECK] ERREUR:`);
        console.error(`  Message: ${error?.message}`);
        console.error(`  Code: ${error?.code}`);
        console.error(`  Errno: ${error?.errno}`);
        res.status(500).json({
            status: "error",
            database: {
                connected: false,
                host: process.env.MYSQL_HOST || process.env.DB_HOST || "localhost",
                database: process.env.MYSQL_DB || process.env.DB_NAME || "spendio",
                error: error?.message,
                code: error?.code,
                errno: error?.errno,
            },
            timestamp: new Date().toISOString(),
        });
    }
});
exports.default = router;
