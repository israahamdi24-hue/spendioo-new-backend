"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistoryStats = exports.getDailyStats = exports.getMonthlyStats = void 0;
const database_1 = __importDefault(require("../config/database"));
// 🔹 1. Récupérer les statistiques mensuelles
const getMonthlyStats = async (req, res) => {
    const { userId, month } = req.params;
    try {
        console.log(`📊 Fetching monthly stats for user ${userId}, month ${month}`);
        // --- Budget du mois ---
        const [budgetRows] = await database_1.default.query("SELECT amount FROM budgets WHERE user_id = ? AND month = ?", [userId, month]);
        const budget = budgetRows[0]?.amount || 0;
        // --- Dépenses du mois ---
        const [expenseRows] = await database_1.default.query("SELECT IFNULL(SUM(amount), 0) AS total FROM transactions WHERE user_id = ? AND type = 'expense' AND DATE_FORMAT(date, '%Y-%m') = ?", [userId, month]);
        const expenses = expenseRows[0]?.total || 0;
        // --- Revenus du mois ---
        const [incomeRows] = await database_1.default.query("SELECT IFNULL(SUM(amount), 0) AS total FROM transactions WHERE user_id = ? AND type = 'income' AND DATE_FORMAT(date, '%Y-%m') = ?", [userId, month]);
        const revenues = incomeRows[0]?.total || 0;
        // --- Répartition par catégorie ---
        const [categoryRows] = await database_1.default.query(`SELECT 
         c.id, 
         c.name, 
         c.color, 
         c.icon,
         c.budget,
         COUNT(t.id) AS count, 
         IFNULL(SUM(t.amount), 0) AS total 
       FROM categories c
       LEFT JOIN transactions t ON t.category_id = c.id 
         AND t.user_id = ? 
         AND t.type = 'expense' 
         AND DATE_FORMAT(t.date, '%Y-%m') = ?
       WHERE c.user_id = ?
       GROUP BY c.id, c.name, c.color, c.icon, c.budget
       ORDER BY total DESC`, [userId, month, userId]);
        // --- Calculs globaux ---
        const remaining = budget - expenses;
        const percentage = budget > 0 ? (expenses / budget) * 100 : 0;
        console.log(`✅ Monthly stats retrieved: Budget=${budget}, Expenses=${expenses}, Revenues=${revenues}`);
        res.json({
            month,
            budget: Number(budget),
            expenses: Number(expenses),
            revenues: Number(revenues),
            remaining: Number(remaining),
            percentage: Number(percentage),
            categories: categoryRows.map((c) => ({
                id: c.id,
                name: c.name,
                color: c.color,
                icon: c.icon,
                budget: Number(c.budget) || 0,
                count: Number(c.count),
                total: Number(c.total),
            })),
        });
    }
    catch (error) {
        console.error("❌ Erreur getMonthlyStats:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques mensuelles" });
    }
};
exports.getMonthlyStats = getMonthlyStats;
// 🔹 2. Évolution journalière (LineChart)
const getDailyStats = async (req, res) => {
    const { userId, month } = req.params;
    try {
        console.log(`📈 Fetching daily stats for user ${userId}, month ${month}`);
        const [rows] = await database_1.default.query(`SELECT 
        DAY(date) AS day,
        DATE_FORMAT(date, '%Y-%m-%d') AS date,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expenses,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS revenues
       FROM transactions
       WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?
       GROUP BY DAY(date), DATE_FORMAT(date, '%Y-%m-%d')
       ORDER BY DAY(date) ASC`, [userId, month]);
        const formattedRows = rows.map((r) => ({
            day: Number(r.day),
            date: r.date,
            expenses: Number(r.expenses) || 0,
            revenues: Number(r.revenues) || 0,
        }));
        console.log(`✅ Daily stats retrieved: ${formattedRows.length} days`);
        res.json(formattedRows);
    }
    catch (error) {
        console.error("❌ Erreur getDailyStats:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques journalières" });
    }
};
exports.getDailyStats = getDailyStats;
// 🔹 3. Historique sur 6 mois (BarChart)
const getHistoryStats = async (req, res) => {
    const { userId } = req.params;
    try {
        console.log(`📊 Fetching history stats for user ${userId} (last 6 months)`);
        const [rows] = await database_1.default.query(`SELECT 
         b.month,
         IFNULL(b.amount, 0) AS budget,
         (SELECT IFNULL(SUM(amount), 0)
          FROM transactions
          WHERE user_id = ? AND type = 'expense' AND DATE_FORMAT(date, '%Y-%m') = b.month) AS expenses,
         (SELECT IFNULL(SUM(amount), 0)
          FROM transactions
          WHERE user_id = ? AND type = 'income' AND DATE_FORMAT(date, '%Y-%m') = b.month) AS revenues
       FROM budgets b
       WHERE b.user_id = ?
       ORDER BY b.month DESC
       LIMIT 6`, [userId, userId, userId]);
        const formattedRows = rows
            .reverse()
            .map((r) => ({
            month: r.month,
            budget: Number(r.budget) || 0,
            expenses: Number(r.expenses) || 0,
            revenues: Number(r.revenues) || 0,
        }));
        console.log(`✅ History stats retrieved: ${formattedRows.length} months`);
        res.json(formattedRows);
    }
    catch (error) {
        console.error("❌ Erreur getHistoryStats:", error);
        res.status(500).json({ message: "Erreur lors de la récupération de l'historique" });
    }
};
exports.getHistoryStats = getHistoryStats;
