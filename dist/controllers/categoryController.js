"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.addCategory = exports.getCategories = void 0;
const database_1 = __importDefault(require("../config/database"));
// Récupérer toutes les catégories avec dépenses totales
const getCategories = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: "Non autorisé" });
        const [rows] = await database_1.default.query(`SELECT 
        c.id,
        c.name,
        c.color,
        c.icon,
        c.budget,
        c.user_id,
        IFNULL(SUM(t.amount), 0) AS total,
        COUNT(t.id) AS count
       FROM categories c
       LEFT JOIN transactions t ON t.category_id = c.id 
         AND t.user_id = c.user_id
         AND t.type = 'expense'
       WHERE c.user_id = ?
       GROUP BY c.id, c.name, c.color, c.icon, c.budget, c.user_id
       ORDER BY c.name`, [userId]);
        res.json(rows);
    }
    catch (error) {
        console.error("Erreur getCategories :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.getCategories = getCategories;
// Ajouter une catégorie
const addCategory = async (req, res) => {
    try {
        const { name, color, budget, icon } = req.body;
        const userId = req.user?.id;
        console.log("📝 addCategory - Données reçues:", { name, color, budget, icon, userId });
        if (!userId)
            return res.status(401).json({ message: "Non autorisé" });
        if (!name || !color) {
            console.warn("❌ Champs obligatoires manquants:", { name, color });
            return res.status(400).json({ message: "name et color sont obligatoires" });
        }
        console.log("🔍 Avant INSERT - Préparation des paramètres");
        const [result] = await database_1.default.query("INSERT INTO categories (name, color, budget, icon, user_id) VALUES (?, ?, ?, ?, ?)", [name, color, budget || 0, icon || null, userId]);
        console.log("✅ INSERT réussi - ID généré:", result.insertId);
        res.json({
            message: "Catégorie ajoutée",
            id: result.insertId,
            name,
            color,
            budget: budget || 0,
            icon: icon || null
        });
    }
    catch (error) {
        console.error("❌ Erreur addCategory - Code:", error.code);
        console.error("❌ Erreur addCategory - Message:", error.message);
        console.error("❌ Erreur addCategory - SQL:", error.sql);
        console.error("❌ Erreur addCategory - Stack:", error.stack);
        res.status(500).json({ message: "Erreur serveur", details: error.message });
    }
};
exports.addCategory = addCategory;
// Supprimer une catégorie
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: "Non autorisé" });
        await database_1.default.query("DELETE FROM categories WHERE id = ?", [id]);
        res.json({ message: "Catégorie supprimée" });
    }
    catch (error) {
        console.error("Erreur deleteCategory :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.deleteCategory = deleteCategory;
