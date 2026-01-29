import { Request, Response } from "express";
import db from "../config/database";
import { Transaction } from "../models/Transaction";
import { RowDataPacket } from "mysql2";

export const createTransaction = async (req: Request, res: Response) => {
  try {
    // ✅ Récupérer user_id depuis le middleware auth (req.user)
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: "Non autorisé" });

    const { category_id, type, amount, date, description } = req.body;

    // ✅ Valider les champs obligatoires
    if (!category_id || !type || !amount || !date) {
      return res.status(400).json({ message: "Champs obligatoires manquants: category_id, type, amount, date" });
    }

    const query = `
      INSERT INTO transactions (user_id, category_id, type, amount, date, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await db.query(query, [userId, category_id, type, amount, date, description || null]);
    
    res.status(201).json({ message: "Transaction ajoutée avec succès" });
  } catch (err: any) {
    console.error("Erreur createTransaction:", err);
    res.status(500).json({ error: err.message });
  }
};


export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { type, startDate, endDate } = req.query;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    let query = `
      SELECT t.*, c.name AS category_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
    `;
    const params: any[] = [userId];

    if (type) {
      query += " AND t.type = ?";
      params.push(type);
    }
    if (startDate && endDate) {
      query += " AND t.date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    query += " ORDER BY t.date DESC";

    const [results] = await db.query<RowDataPacket[]>(query, params);
    res.json(results);
  } catch (err: any) {
    console.error("Erreur getTransactions:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: "Non autorisé" });

    const { category_id, type, amount, date, description } = req.body as Transaction;

    // Vérifier que la transaction appartient à l'utilisateur
    const [existingTransaction] = await db.query<RowDataPacket[]>(
      "SELECT * FROM transactions WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    
    if (!existingTransaction || (existingTransaction as any[]).length === 0) {
      return res.status(403).json({ message: "Transaction non trouvée ou accès refusé" });
    }

    const query = `
      UPDATE transactions 
      SET category_id=?, type=?, amount=?, date=?, description=? 
      WHERE id=? AND user_id=?
    `;
    await db.query(query, [category_id, type, amount, date, description, id, userId]);
    res.json({ message: "Transaction modifiée" });
  } catch (err: any) {
    console.error("Erreur updateTransaction:", err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: "Non autorisé" });

    // Vérifier que la transaction appartient à l'utilisateur
    const [existingTransaction] = await db.query<RowDataPacket[]>(
      "SELECT * FROM transactions WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    
    if (!existingTransaction || (existingTransaction as any[]).length === 0) {
      return res.status(403).json({ message: "Transaction non trouvée ou accès refusé" });
    }

    await db.query("DELETE FROM transactions WHERE id = ? AND user_id = ?", [id, userId]);
    res.json({ message: "Transaction supprimée" });
  } catch (err: any) {
    console.error("Erreur deleteTransaction:", err);
    res.status(500).json({ error: err.message });
  }
};
