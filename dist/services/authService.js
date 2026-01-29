"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.changePassword = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
// Créer un nouvel utilisateur
const registerUser = async (userData) => {
    const { name, email, password } = userData;
    // Vérifier que tous les champs existent
    if (!name || !email || !password) {
        throw new Error("Tous les champs sont obligatoires");
    }
    const connection = await database_1.default.getConnection();
    try {
        // Vérifier si l'email existe déjà
        const [existing] = await connection.query("SELECT * FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            throw new Error("Email déjà utilisé");
        }
        // Hasher le mot de passe et l'insérer
        const hashedPassword = bcryptjs_1.default.hashSync(password, 10);
        await connection.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);
        return { message: "Utilisateur créé avec succès" };
    }
    finally {
        connection.release();
    }
};
exports.registerUser = registerUser;
// Connecter un utilisateur
const loginUser = async (email, password) => {
    const connection = await database_1.default.getConnection();
    try {
        // Chercher l'utilisateur par email
        const [result] = await connection.query("SELECT * FROM users WHERE email = ?", [email]);
        if (result.length === 0) {
            throw new Error("Utilisateur non trouvé");
        }
        const user = result[0];
        // Vérifier le mot de passe
        const isValid = bcryptjs_1.default.compareSync(password, user.password);
        if (!isValid) {
            throw new Error("Mot de passe incorrect");
        }
        // Créer un JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return { token, user: { id: user.id, name: user.name, role: user.role } };
    }
    finally {
        connection.release();
    }
};
exports.loginUser = loginUser;
// Changer le mot de passe
const changePassword = async (userId, newPassword, confirmPassword) => {
    // Vérifier que les champs ne sont pas vides
    if (!newPassword || !confirmPassword) {
        throw new Error("Les champs sont obligatoires");
    }
    // Vérifier que les mots de passe correspondent
    if (newPassword !== confirmPassword) {
        throw new Error("Les mots de passe ne correspondent pas");
    }
    // Vérifier la longueur
    if (newPassword.length < 6) {
        throw new Error("Le mot de passe doit contenir au moins 6 caractères");
    }
    const connection = await database_1.default.getConnection();
    try {
        // Hasher le nouveau mot de passe et le mettre à jour
        const hashedPassword = bcryptjs_1.default.hashSync(newPassword, 10);
        await connection.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);
        return { message: "Mot de passe modifié avec succès" };
    }
    finally {
        connection.release();
    }
};
exports.changePassword = changePassword;
// Mettre à jour le profil utilisateur
const updateUserProfile = async (userId, name, email) => {
    // Vérifier qu'au moins un champ est fourni
    if (!name && !email) {
        throw new Error("Veuillez remplir au moins un champ");
    }
    // Vérifier que le nom a au moins 2 caractères s'il est fourni
    if (name && name.length < 2) {
        throw new Error("Le nom doit contenir au moins 2 caractères");
    }
    // Vérifier format email simple s'il est fourni
    if (email && !email.includes("@")) {
        throw new Error("Email invalide");
    }
    const connection = await database_1.default.getConnection();
    try {
        // Si email est fourni, vérifier qu'il n'existe pas pour un autre utilisateur
        if (email) {
            const [existing] = await connection.query("SELECT * FROM users WHERE email = ? AND id != ?", [email, userId]);
            if (existing.length > 0) {
                throw new Error("Cet email est déjà utilisé");
            }
        }
        // Construire la requête UPDATE dynamiquement
        if (name && email) {
            // Mettre à jour nom et email
            await connection.query("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, userId]);
        }
        else if (name) {
            // Mettre à jour uniquement le nom
            await connection.query("UPDATE users SET name = ? WHERE id = ?", [name, userId]);
        }
        else if (email) {
            // Mettre à jour uniquement l'email
            await connection.query("UPDATE users SET email = ? WHERE id = ?", [email, userId]);
        }
        return { message: "Profil mis à jour avec succès" };
    }
    finally {
        connection.release();
    }
};
exports.updateUserProfile = updateUserProfile;
