// src/routes/statisticsRoutes.ts
import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { getMonthlyStats, getDailyStats, getHistoryStats } from "../controllers/statisticsController";

const router = Router();

// Statistiques principales du mois
// GET /api/statistics/month/:userId/:month
router.get("/month/:userId/:month", verifyToken, getMonthlyStats);

// Évolution journalière
// GET /api/statistics/daily/:userId/:month
router.get("/daily/:userId/:month", verifyToken, getDailyStats);

// Historique sur 6 mois
// GET /api/statistics/history/:userId
router.get("/history/:userId", verifyToken, getHistoryStats);

export default router;
