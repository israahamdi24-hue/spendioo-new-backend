import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./config/database";
import authRoutes from "./routes/authRoutes";
import budgetRoutes from "./routes/budgetRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import statisticsRoutes from "./routes/statisticsRoutes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} from ${req.ip}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Bienvenue sur l'API Spendio");
});

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

db.getConnection()
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

