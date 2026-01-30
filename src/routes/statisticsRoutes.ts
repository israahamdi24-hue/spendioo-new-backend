// src/routes/statisticsRoutes.ts
import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { getMonthlyStats, getDailyStats, getHistoryStats } from "../controllers/statisticsController";

const router = Router();

// ✅ FIXED: Removed userId from URL, use req.user.id instead
// Statistiques principales du mois
// GET /api/statistics/month/:month
router.get("/month/:month", verifyToken, getMonthlyStats);

// Évolution journalière
// GET /api/statistics/daily/:month
router.get("/daily/:month", verifyToken, getDailyStats);

// Historique sur 6 mois
// GET /api/statistics/history
router.get("/history", verifyToken, getHistoryStats);

export default router;
