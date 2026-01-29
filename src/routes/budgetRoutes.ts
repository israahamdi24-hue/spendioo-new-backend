import express from "express";
import {
  getBudgets,
  getMonthlyBudget,
  saveBudget,
  getBudgetHistory,
} from "../controllers/budgetController";
import { verifyToken } from "../middleware/auth";

const router = express.Router();

// Vérification du token pour toutes les routes
router.use(verifyToken);

router.get("/", getBudgets);
router.post("/", saveBudget);
router.get("/history", getBudgetHistory);
router.get("/:month", getMonthlyBudget);

export default router;
