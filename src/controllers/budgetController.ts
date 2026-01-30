import { Request, Response } from "express";
import db from "../config/database";
import { RowDataPacket } from "mysql2";

// Récupérer tous les budgets de l'utilisateur
export const getBudgets = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    console.log(`📊 [BUDGETS] Requête GET /budgets`);
    console.log(`   User ID: ${userId || "❌ Non trouvé"}`);
    
    if (!userId) {
      console.warn(`⚠️  [BUDGETS] Utilisateur non authentifié`);
      return res.status(401).json({ message: "Non autorisé" });
    }

    console.log(`🔍 [BUDGETS] Recherche des budgets pour l'utilisateur ${userId}...`);
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 
        b.id,
        b.month,
        b.limit_amount AS budget_limit,
        IFNULL(SUM(t.amount), 0) AS spent
       FROM budgets b
       LEFT JOIN transactions t ON t.user_id = b.user_id 
         AND t.type = 'expense' 
         AND DATE_FORMAT(t.date, '%Y-%m') = b.month
       WHERE b.user_id = ?
       GROUP BY b.id, b.month
       ORDER BY b.month DESC`,
      [userId]
    );

    console.log(`✅ [BUDGETS] ${rows.length} budget(s) trouvé(s)`);
    res.json(rows);
  } catch (error: any) {
    console.error(`❌ [BUDGETS] Erreur:`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    console.error(`   Stack: ${error.stack}`);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Ajouter ou mettre à jour un budget
export const saveBudget = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: "Non autorisé" });

    const { month, amount, category_id } = req.body;
    
    console.log(`💰 [BUDGET] Sauvegarde budget:`, { userId, month, amount, category_id });
    
    if (!month || !amount) {
      return res.status(400).json({ message: "month et amount requis" });
    }

    if (!category_id) {
      return res.status(400).json({ message: "category_id est requis" });
    }

    // Extraire year et month du format "YYYY-MM"
    const [year, monthNum] = month.split("-");
    const yearNum = parseInt(year);
    const monthNumInt = parseInt(monthNum);

    if (isNaN(yearNum) || isNaN(monthNumInt)) {
      return res.status(400).json({ message: "Format de mois invalide (utilisez YYYY-MM)" });
    }

    console.log(`🔍 Vérification budget existant...`);
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM budgets WHERE user_id = ? AND category_id = ? AND month = ? AND year = ?",
      [userId, category_id, monthNumInt, yearNum]
    );

    if (rows.length > 0) {
      console.log(`✏️  Mise à jour du budget existant`);
      await db.query(
        "UPDATE budgets SET limit_amount = ? WHERE user_id = ? AND category_id = ? AND month = ? AND year = ?",
        [amount, userId, category_id, monthNumInt, yearNum]
      );
      res.json({ message: "Budget mis à jour" });
    } else {
      console.log(`➕ Création nouveau budget`);
      await db.query(
        "INSERT INTO budgets (user_id, category_id, limit_amount, month, year) VALUES (?, ?, ?, ?, ?)",
        [userId, category_id, amount, monthNumInt, yearNum]
      );
      res.json({ message: "Budget ajouté" });
    }
  } catch (error: any) {
    console.error("❌ Erreur saveBudget:", error.message);
    console.error("   Code:", error.code);
    console.error("   SQL:", error.sql);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Récupérer dépenses par catégorie pour un mois
export const getMonthlyBudget = async (req: Request, res: Response) => {
  const { month } = req.params;
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ message: "Non autorisé" });

  try {
    // Récupérer budget total
    const [budgetRows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM budgets WHERE user_id = ? AND month = ?",
      [userId, month]
    );
    const budget = budgetRows.length > 0 ? budgetRows[0].amount : 0;

    // Dépenses totales
    const [expenseRows] = await db.query<RowDataPacket[]>(
      "SELECT SUM(amount) AS total FROM transactions WHERE user_id = ? AND type = 'expense' AND DATE_FORMAT(date, '%Y-%m') = ?",
      [userId, month]
    );
    const totalExpenses = expenseRows[0].total || 0;

    // Dépenses par catégorie avec count
    const [categoryRows] = await db.query<RowDataPacket[]>(
      `SELECT 
        c.id,
        c.name AS name,
        c.color AS color,
        COUNT(t.id) AS count,
        IFNULL(SUM(t.amount), 0) AS total
       FROM categories c
       LEFT JOIN transactions t ON t.category_id = c.id AND t.user_id = ? AND t.type = 'expense' AND DATE_FORMAT(t.date, '%Y-%m') = ?
       WHERE c.user_id = ?
       GROUP BY c.id, c.name, c.color`,
      [userId, month, userId]
    );

    res.json({
      budget,
      expenses: totalExpenses,
      remaining: budget - totalExpenses,
      percentage: budget ? (totalExpenses / budget) * 100 : 0,
      categories: categoryRows,
    });
  } catch (error) {
    console.error("Erreur getMonthlyBudget :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Historique des budgets (6 derniers mois)
export const getBudgetHistory = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ message: "Non autorisé" });
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT month, amount AS budget,
        (SELECT IFNULL(SUM(amount), 0)
         FROM transactions
         WHERE user_id = ? AND type = 'expense' AND DATE_FORMAT(date, '%Y-%m') = budgets.month) AS expenses
       FROM budgets
       WHERE user_id = ?
       ORDER BY month DESC
       LIMIT 6`,
      [userId, userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Erreur getBudgetHistory :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
