import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/database";
import { RowDataPacket } from "mysql2";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    const [existing] = await db.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertion dans la base
    await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    // Récupérer le nouvel utilisateur pour créer le token
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    const user = rows[0];

    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "secretSpendio",
      { expiresIn: "7d" }
    );

    // ✅ Réponse complète
    res.status(201).json({
      message: "Utilisateur créé avec succès",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Erreur register :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const user = rows[0];

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role || "user" },
      process.env.JWT_SECRET || "secretSpendio",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Connexion réussie",
      token,
      user: { id: user.id, name: user.name, role: user.role || "user" },
    });
  } catch (error) {
    console.error("Erreur login :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
