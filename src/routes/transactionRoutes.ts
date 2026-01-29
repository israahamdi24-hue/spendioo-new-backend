import express from "express";
import { createTransaction, getTransactions, updateTransaction, deleteTransaction } from "../controllers/transactionController";
import { verifyToken } from "../middleware/auth";

const router = express.Router();

// Toutes les routes nécessitent que l'utilisateur soit connecté
router.use(verifyToken);

router.get("/", getTransactions);        // Récupérer + filtrer
router.post("/", createTransaction);     // Ajouter
router.put("/:id", updateTransaction);   // Modifier
router.delete("/:id", deleteTransaction); // Supprimer

export default router;
