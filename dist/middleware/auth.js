"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token)
        return res.status(401).json({ message: "Token manquant" });
    try {
        const decoded = jsonwebtoken_1.default.verify(token.split(" ")[1], process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Token invalide" });
    }
};
exports.verifyToken = verifyToken;
const isAdmin = (req, res, next) => {
    if (req.user?.role !== "admin")
        return res.status(403).json({ message: "Accès réservé à l'administrateur" });
    next();
};
exports.isAdmin = isAdmin;
