"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/statisticsRoutes.ts
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const statisticsController_1 = require("../controllers/statisticsController");
const router = (0, express_1.Router)();
// Statistiques principales du mois
// GET /api/statistics/month/:userId/:month
router.get("/month/:userId/:month", auth_1.verifyToken, statisticsController_1.getMonthlyStats);
// Évolution journalière
// GET /api/statistics/daily/:userId/:month
router.get("/daily/:userId/:month", auth_1.verifyToken, statisticsController_1.getDailyStats);
// Historique sur 6 mois
// GET /api/statistics/history/:userId
router.get("/history/:userId", auth_1.verifyToken, statisticsController_1.getHistoryStats);
exports.default = router;
