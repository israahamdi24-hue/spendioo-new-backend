"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/statisticsRoutes.ts
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const statisticsController_1 = require("../controllers/statisticsController");
const router = (0, express_1.Router)();
// ✅ FIXED: Removed userId from URL, use req.user.id instead
// Statistiques principales du mois
// GET /api/statistics/month/:month
router.get("/month/:month", auth_1.verifyToken, statisticsController_1.getMonthlyStats);
// Évolution journalière
// GET /api/statistics/daily/:month
router.get("/daily/:month", auth_1.verifyToken, statisticsController_1.getDailyStats);
// Historique sur 6 mois
// GET /api/statistics/history
router.get("/history", auth_1.verifyToken, statisticsController_1.getHistoryStats);
exports.default = router;
