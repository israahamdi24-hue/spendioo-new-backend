"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
// Classe simple User
class User {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.password = data.password;
        this.language = data.language || "fr";
        this.currency = data.currency || "TND";
        this.darkMode = data.darkMode || false;
        this.notifications = data.notifications || true;
    }
    // Récupérer un utilisateur par ID
    static async findByPk(id) {
        const [rows] = await database_1.default.query("SELECT * FROM users WHERE id = ?", [id]);
        return rows[0] ? new User(rows[0]) : null;
    }
    // Chercher par email
    static async findByEmail(email) {
        const [rows] = await database_1.default.query("SELECT * FROM users WHERE email = ?", [email]);
        return rows[0] ? new User(rows[0]) : null;
    }
    // Créer un utilisateur
    static async create(userData) {
        const user = new User(userData);
        await database_1.default.query("INSERT INTO users (name, email, password, language, currency, darkMode, notifications) VALUES (?, ?, ?, ?, ?, ?, ?)", [user.name, user.email, user.password, user.language, user.currency, user.darkMode, user.notifications]);
        return user;
    }
    // Sauvegarder les modifications
    async save() {
        await database_1.default.query("UPDATE users SET name = ?, email = ?, password = ?, language = ?, currency = ?, darkMode = ?, notifications = ? WHERE id = ?", [this.name, this.email, this.password, this.language, this.currency, this.darkMode, this.notifications, this.id]);
    }
    // Supprimer l'utilisateur
    async delete() {
        await database_1.default.query("DELETE FROM users WHERE id = ?", [this.id]);
    }
}
exports.default = User;
