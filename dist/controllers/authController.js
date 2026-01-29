"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Vérifier si l'utilisateur existe déjà
        const [existing] = await database_1.default.query("SELECT * FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: "Email déjà utilisé" });
        }
        // Hash du mot de passe
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Insertion dans la base
        await database_1.default.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);
        // Récupérer le nouvel utilisateur pour créer le token
        const [rows] = await database_1.default.query("SELECT * FROM users WHERE email = ?", [email]);
        const user = rows[0];
        // Générer le token JWT
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "secretSpendio", { expiresIn: "7d" });
        // ✅ Réponse complète
        res.status(201).json({
            message: "Utilisateur créé avec succès",
            token,
            user: { id: user.id, name: user.name, email: user.email },
        });
    }
    catch (error) {
        console.error("Erreur register :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Vérifier si l'utilisateur existe
        const [rows] = await database_1.default.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }
        const user = rows[0];
        // Vérifier le mot de passe
        const isValidPassword = await bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }
        // Générer le token JWT
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role || "user" }, process.env.JWT_SECRET || "secretSpendio", { expiresIn: "7d" });
        res.json({
            message: "Connexion réussie",
            token,
            user: { id: user.id, name: user.name, role: user.role || "user" },
        });
    }
    catch (error) {
        console.error("Erreur login :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.login = login;
