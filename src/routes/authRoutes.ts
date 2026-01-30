import express from "express";
import { register, login } from "../controllers/authController";
import db from "../config/database";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

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
    const conn = await db.getConnection();
    const [result] = await conn.query("SELECT 1");
    conn.release();
    console.log(`  ✅ Connexion BD: OK`);
    
    // Test 2: Table users existe?
    console.log(`  2️⃣ Test table users...`);
    const [tables] = await db.query(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'",
      [process.env.MYSQL_DB || process.env.DB_NAME || "spendio"]
    );
    const usersTableExists = (tables as any[]).length > 0;
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
  } catch (error: any) {
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

export default router;


