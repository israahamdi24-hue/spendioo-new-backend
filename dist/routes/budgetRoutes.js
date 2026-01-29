"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const budgetController_1 = require("../controllers/budgetController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Vérification du token pour toutes les routes
router.use(auth_1.verifyToken);
router.get("/", budgetController_1.getBudgets);
router.post("/", budgetController_1.saveBudget);
router.get("/history", budgetController_1.getBudgetHistory);
router.get("/:month", budgetController_1.getMonthlyBudget);
exports.default = router;
