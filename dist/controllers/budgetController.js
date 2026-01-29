"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBudgetHistory = exports.getMonthlyBudget = exports.saveBudget = exports.getBudgets = void 0;
const database_1 = __importDefault(require("../config/database"));
// Récupérer tous les budgets de l'utilisateur
const getBudgets = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: "Non autorisé" });
        const [rows] = await database_1.default.query(`SELECT 
        b.id,
        b.month,
        b.amount AS budget_limit,
        IFNULL(SUM(t.amount), 0) AS spent
       FROM budgets b
       LEFT JOIN transactions t ON t.user_id = b.user_id 
         AND t.type = 'expense' 
         AND DATE_FORMAT(t.date, '%Y-%m') = b.month
       WHERE b.user_id = ?
       GROUP BY b.id, b.month
       ORDER BY b.month DESC`, [userId]);
        res.json(rows);
    }
    catch (error) {
        console.error("Erreur getBudgets :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.getBudgets = getBudgets;
// Ajouter ou mettre à jour un budget
const saveBudget = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: "Non autorisé" });
        const { month, amount } = req.body;
        if (!month || !amount) {
            return res.status(400).json({ message: "month et amount requis" });
        }
        const [rows] = await database_1.default.query("SELECT * FROM budgets WHERE user_id = ? AND month = ?", [userId, month]);
        if (rows.length > 0) {
            await database_1.default.query("UPDATE budgets SET amount = ? WHERE user_id = ? AND month = ?", [
                amount,
                userId,
                month,
            ]);
            res.json({ message: "Budget mis à jour" });
        }
        else {
            await database_1.default.query("INSERT INTO budgets (user_id, month, amount) VALUES (?, ?, ?)", [
                userId,
                month,
                amount,
            ]);
            res.json({ message: "Budget ajouté" });
        }
    }
    catch (error) {
        console.error("Erreur saveBudget :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.saveBudget = saveBudget;
// Récupérer dépenses par catégorie pour un mois
const getMonthlyBudget = async (req, res) => {
    const { month } = req.params;
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ message: "Non autorisé" });
    try {
        // Récupérer budget total
        const [budgetRows] = await database_1.default.query("SELECT * FROM budgets WHERE user_id = ? AND month = ?", [userId, month]);
        const budget = budgetRows.length > 0 ? budgetRows[0].amount : 0;
        // Dépenses totales
        const [expenseRows] = await database_1.default.query("SELECT SUM(amount) AS total FROM transactions WHERE user_id = ? AND type = 'expense' AND DATE_FORMAT(date, '%Y-%m') = ?", [userId, month]);
        const totalExpenses = expenseRows[0].total || 0;
        // Dépenses par catégorie avec count
        const [categoryRows] = await database_1.default.query(`SELECT 
        c.id,
        c.name AS name,
        c.color AS color,
        COUNT(t.id) AS count,
        IFNULL(SUM(t.amount), 0) AS total
       FROM categories c
       LEFT JOIN transactions t ON t.category_id = c.id AND t.user_id = ? AND t.type = 'expense' AND DATE_FORMAT(t.date, '%Y-%m') = ?
       WHERE c.user_id = ?
       GROUP BY c.id, c.name, c.color`, [userId, month, userId]);
        res.json({
            budget,
            expenses: totalExpenses,
            remaining: budget - totalExpenses,
            percentage: budget ? (totalExpenses / budget) * 100 : 0,
            categories: categoryRows,
        });
    }
    catch (error) {
        console.error("Erreur getMonthlyBudget :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.getMonthlyBudget = getMonthlyBudget;
// Historique des budgets (6 derniers mois)
const getBudgetHistory = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ message: "Non autorisé" });
    try {
        const [rows] = await database_1.default.query(`SELECT month, amount AS budget,
        (SELECT IFNULL(SUM(amount), 0)
         FROM transactions
         WHERE user_id = ? AND type = 'expense' AND DATE_FORMAT(date, '%Y-%m') = budgets.month) AS expenses
       FROM budgets
       WHERE user_id = ?
       ORDER BY month DESC
       LIMIT 6`, [userId, userId]);
        res.json(rows);
    }
    catch (error) {
        console.error("Erreur getBudgetHistory :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.getBudgetHistory = getBudgetHistory;
