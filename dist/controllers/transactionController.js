"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTransaction = exports.updateTransaction = exports.getTransactions = exports.createTransaction = void 0;
const database_1 = __importDefault(require("../config/database"));
const createTransaction = async (req, res) => {
    try {
        // ✅ Récupérer user_id depuis le middleware auth (req.user)
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: "Non autorisé" });
        const { category_id, type, amount, date, description } = req.body;
        // ✅ Valider les champs obligatoires
        if (!category_id || !type || !amount || !date) {
            return res.status(400).json({ message: "Champs obligatoires manquants: category_id, type, amount, date" });
        }
        const query = `
      INSERT INTO transactions (user_id, category_id, type, amount, date, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
        await database_1.default.query(query, [userId, category_id, type, amount, date, description || null]);
        res.status(201).json({ message: "Transaction ajoutée avec succès" });
    }
    catch (err) {
        console.error("Erreur createTransaction:", err);
        res.status(500).json({ error: err.message });
    }
};
exports.createTransaction = createTransaction;
const getTransactions = async (req, res) => {
    try {
        const { type, startDate, endDate } = req.query;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Utilisateur non authentifié" });
        }
        let query = `
      SELECT t.*, c.name AS category_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
    `;
        const params = [userId];
        if (type) {
            query += " AND t.type = ?";
            params.push(type);
        }
        if (startDate && endDate) {
            query += " AND t.date BETWEEN ? AND ?";
            params.push(startDate, endDate);
        }
        query += " ORDER BY t.date DESC";
        const [results] = await database_1.default.query(query, params);
        res.json(results);
    }
    catch (err) {
        console.error("Erreur getTransactions:", err);
        res.status(500).json({ error: err.message });
    }
};
exports.getTransactions = getTransactions;
const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: "Non autorisé" });
        const { category_id, type, amount, date, description } = req.body;
        // Vérifier que la transaction appartient à l'utilisateur
        const [existingTransaction] = await database_1.default.query("SELECT * FROM transactions WHERE id = ? AND user_id = ?", [id, userId]);
        if (!existingTransaction || existingTransaction.length === 0) {
            return res.status(403).json({ message: "Transaction non trouvée ou accès refusé" });
        }
        const query = `
      UPDATE transactions 
      SET category_id=?, type=?, amount=?, date=?, description=? 
      WHERE id=? AND user_id=?
    `;
        await database_1.default.query(query, [category_id, type, amount, date, description, id, userId]);
        res.json({ message: "Transaction modifiée" });
    }
    catch (err) {
        console.error("Erreur updateTransaction:", err);
        res.status(500).json({ error: err.message });
    }
};
exports.updateTransaction = updateTransaction;
const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: "Non autorisé" });
        // Vérifier que la transaction appartient à l'utilisateur
        const [existingTransaction] = await database_1.default.query("SELECT * FROM transactions WHERE id = ? AND user_id = ?", [id, userId]);
        if (!existingTransaction || existingTransaction.length === 0) {
            return res.status(403).json({ message: "Transaction non trouvée ou accès refusé" });
        }
        await database_1.default.query("DELETE FROM transactions WHERE id = ? AND user_id = ?", [id, userId]);
        res.json({ message: "Transaction supprimée" });
    }
    catch (err) {
        console.error("Erreur deleteTransaction:", err);
        res.status(500).json({ error: err.message });
    }
};
exports.deleteTransaction = deleteTransaction;
