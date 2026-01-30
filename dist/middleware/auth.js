"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    console.log(`🔐 [AUTH] Vérification du token pour: ${req.method} ${req.path}`);
    console.log(`   Authorization header: ${authHeader ? "✅ Présent" : "❌ Manquant"}`);
    if (!authHeader) {
        console.warn(`⚠️  [AUTH] Token manquant`);
        return res.status(401).json({ message: "Token manquant" });
    }
    try {
        // Format: "Bearer <token>"
        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            console.warn(`⚠️  [AUTH] Format de token invalide: ${authHeader.substring(0, 20)}...`);
            return res.status(401).json({ message: "Format de token invalide" });
        }
        const token = parts[1];
        const jwtSecret = process.env.JWT_SECRET || "secretSpendio";
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = decoded;
        console.log(`✅ [AUTH] Token valide pour l'utilisateur: ${decoded.id || "unknown"}`);
        next();
    }
    catch (err) {
        console.error(`❌ [AUTH] Erreur vérification token:`);
        console.error(`   Message: ${err.message}`);
        console.error(`   Name: ${err.name}`);
        return res.status(401).json({ message: "Token invalide", error: err.message });
    }
};
exports.verifyToken = verifyToken;
const isAdmin = (req, res, next) => {
    if (req.user?.role !== "admin")
        return res.status(403).json({ message: "Accès réservé à l'administrateur" });
    next();
};
exports.isAdmin = isAdmin;
