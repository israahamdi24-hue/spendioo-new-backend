"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transactionController_1 = require("../controllers/transactionController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Toutes les routes nécessitent que l'utilisateur soit connecté
router.use(auth_1.verifyToken);
router.get("/", transactionController_1.getTransactions); // Récupérer + filtrer
router.post("/", transactionController_1.createTransaction); // Ajouter
router.put("/:id", transactionController_1.updateTransaction); // Modifier
router.delete("/:id", transactionController_1.deleteTransaction); // Supprimer
exports.default = router;
