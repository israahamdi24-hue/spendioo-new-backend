"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const database_1 = __importDefault(require("./config/database"));
const initDatabase_1 = require("./utils/initDatabase");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const budgetRoutes_1 = __importDefault(require("./routes/budgetRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes"));
const statisticsRoutes_1 = __importDefault(require("./routes/statisticsRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 🚨 Capture les erreurs non gérées
process.on("uncaughtException", (error) => {
    console.error(`\n💥 [UNCAUGHT EXCEPTION]`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Stack:`, error.stack);
    process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
    console.error(`\n💥 [UNHANDLED REJECTION]`);
    console.error(`   Reason:`, reason);
    console.error(`   Promise:`, promise);
    process.exit(1);
});
// Debug middleware
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path} from ${req.ip}`);
    next();
});
app.get("/", (req, res) => {
    res.send("Bienvenue sur l'API Spendio");
});
app.use("/api/auth", authRoutes_1.default);
app.use("/api/transactions", transactionRoutes_1.default);
app.use("/api/budgets", budgetRoutes_1.default);
app.use("/api/categories", categoryRoutes_1.default);
app.use("/api/statistics", statisticsRoutes_1.default);
// ✅ Endpoint de test pour vérifier l'API
app.get("/api/test", (req, res) => {
    res.json({
        message: "✅ API Spendio fonctionne!",
        timestamp: new Date().toISOString(),
        environment: {
            nodeEnv: process.env.NODE_ENV || "development",
            dbHost: process.env.MYSQL_HOST || process.env.DB_HOST || "localhost",
        },
    });
});
// ✅ Endpoint pour tester la connexion DB
app.get("/api/health/db", async (req, res) => {
    try {
        console.log(`🔍 [HEALTH] Test connexion DB...`);
        const conn = await database_1.default.getConnection();
        await conn.query("SELECT 1");
        conn.release();
        console.log(`✅ [HEALTH] Connexion DB réussie`);
        res.json({
            status: "✅ Connexion OK",
            database: process.env.MYSQL_DB || process.env.DB_NAME || "spendio",
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error(`❌ [HEALTH] Erreur DB:`, error);
        res.status(500).json({
            status: "❌ Erreur connexion",
            error: error.message,
            code: error.code,
        });
    }
});
app.use(errorHandler_1.errorHandler);
// ✅ Middleware pour capturer les erreurs non traitées
app.use((err, req, res, next) => {
    console.error(`\n💥 [UNHANDLED ERROR] ${new Date().toISOString()}`);
    console.error(`  Route: ${req.method} ${req.path}`);
    console.error(`  IP: ${req.ip}`);
    console.error(`  Message: ${err.message}`);
    console.error(`  Code: ${err.code}`);
    console.error(`  Errno: ${err.errno}`);
    console.error(`  SQL: ${err.sql || "N/A"}`);
    console.error(`  Full Error:`, err);
    console.error(`  Stack:\n${err.stack}\n`);
    res.status(500).json({
        message: "❌ Erreur interne du serveur",
        error: err.message,
        code: err.code,
        timestamp: new Date().toISOString(),
        debug: process.env.NODE_ENV === "development" ? {
            message: err.message,
            code: err.code,
            errno: err.errno,
            sql: err.sql,
        } : undefined
    });
});
const PORT = Number(process.env.PORT) || 5000;
// 🔧 Test connexion DB au démarrage
console.log(`\n🔍 [STARTUP] Configuration de la base de données:`);
console.log(`  - Host: ${process.env.MYSQL_HOST || process.env.DB_HOST || "localhost"}`);
console.log(`  - User: ${process.env.MYSQL_USER || process.env.DB_USER || "root"}`);
console.log(`  - Database: ${process.env.MYSQL_DB || process.env.DB_NAME || "spendio"}`);
console.log(`  - Port: ${process.env.MYSQL_PORT || process.env.DB_PORT || 3306}`);
console.log(`  - Mode: ${process.env.NODE_ENV || "development"}\n`);
// Test connexion DB au démarrage
database_1.default.getConnection()
    .then((conn) => {
    conn.release();
    console.log(`✅ [DB] Connexion MySQL réussie!`);
})
    .catch((err) => {
    console.error(`❌ [DB] Erreur de connexion MySQL:`);
    console.error(`  Message: ${err.message}`);
    console.error(`  Code: ${err.code}`);
    console.error(`  Errno: ${err.errno}`);
    console.warn(`⚠️  [DB] Le serveur va continuer, mais les routes vont échouer`);
});
const os = require('os');
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}
const localIP = getLocalIP();
// 🚀 Lancer le serveur et initialiser la base de données
app.listen(PORT, "0.0.0.0", async () => {
    console.log(`\n🚀 Serveur lancé sur http://0.0.0.0:${PORT}`);
    console.log(`📱 Accessible à: http://${localIP}:${PORT}\n`);
    // Initialiser la base de données
    try {
        await (0, initDatabase_1.initializeDatabase)();
    }
    catch (error) {
        console.error(`\n❌ ERREUR FATALE lors de l'initialisation:`);
        console.error(error);
        process.exit(1);
    }
});
