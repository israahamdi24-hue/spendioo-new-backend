"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const database_1 = __importDefault(require("./config/database"));
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
app.use(errorHandler_1.errorHandler);
const PORT = Number(process.env.PORT) || 5000;
database_1.default.getConnection()
    .then((conn) => {
    conn.release();
    console.log("✅ Connexion MySQL réussie");
})
    .catch((err) => console.error("❌ Erreur MySQL :", err));
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
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Serveur lancé sur http://0.0.0.0:${PORT}`);
    console.log(`📱 Accessible à: http://${localIP}:${PORT}`);
});
