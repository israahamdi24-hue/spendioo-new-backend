import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/database";
import { RowDataPacket } from "mysql2";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    console.log(`\n📝 [REGISTER] Tentative d'inscription`);
    console.log(`   Email: ${email}`);

    // Vérifier les paramètres
    if (!name || !email || !password) {
      console.warn(`⚠️  [REGISTER] Paramètres manquants`);
      return res.status(400).json({ message: "Nom, email et mot de passe requis" });
    }

    // Vérifier si l'utilisateur existe déjà
    console.log(`🔍 [REGISTER] Vérification si email existe...`);
    const [existing] = await db.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    console.log(`✅ [REGISTER] Requête DB réussie`);

    if (existing.length > 0) {
      console.log(`⚠️  [REGISTER] Email déjà utilisé: ${email}`);
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // Hash du mot de passe
    console.log(`🔐 [REGISTER] Hash du mot de passe...`);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`✅ [REGISTER] Mot de passe hashé`);

    // Insertion dans la base
    console.log(`💾 [REGISTER] Insertion dans la BD...`);
    await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );
    console.log(`✅ [REGISTER] Utilisateur inséré`);

    // Récupérer le nouvel utilisateur pour créer le token
    console.log(`👤 [REGISTER] Récupération du nouvel utilisateur...`);
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    const user = rows[0];
    console.log(`✅ [REGISTER] Utilisateur récupéré: ID=${user.id}`);

    // Générer le token JWT
    console.log(`🎫 [REGISTER] Génération du JWT...`);
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "secretSpendio",
      { expiresIn: "7d" }
    );
    console.log(`✅ [REGISTER] JWT généré`);

    // ✅ Réponse complète
    console.log(`🎉 [REGISTER] Inscription réussie pour: ${email}`);
    res.status(201).json({
      message: "Utilisateur créé avec succès",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    console.error(`\n❌ [REGISTER] ERREUR:`, error);
    console.error(`📋 Stack:`, error.stack);
    console.error(`💬 Message:`, error.message);
    console.error(`🔧 Code:`, error.code);
    console.error(`🔧 Errno:`, error.errno);
    res.status(500).json({ 
      message: "Erreur serveur",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    console.log(`🔓 [LOGIN] Tentative avec email: ${email}`);

    // Vérifier si les paramètres sont présents
    if (!email || !password) {
      console.warn(`⚠️  [LOGIN] Email ou password manquant`);
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    // Vérifier si l'utilisateur existe
    console.log(`🔍 [LOGIN] Recherche utilisateur avec email: ${email}`);
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    console.log(`✅ [LOGIN] Requête DB réussie, ${rows.length} utilisateur(s) trouvé(s)`);

    if (rows.length === 0) {
      console.log(`⚠️  [LOGIN] Aucun utilisateur trouvé pour: ${email}`);
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const user = rows[0];
    console.log(`👤 [LOGIN] Utilisateur trouvé: ID=${user.id}, email=${user.email}`);

    // Vérifier le mot de passe
    console.log(`🔐 [LOGIN] Vérification du mot de passe...`);
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log(`❌ [LOGIN] Mot de passe incorrect pour: ${email}`);
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }
    console.log(`✅ [LOGIN] Mot de passe correct`);

    // Générer le token JWT
    console.log(`🎫 [LOGIN] Génération du JWT...`);
    const token = jwt.sign(
      { id: user.id, role: user.role || "user" },
      process.env.JWT_SECRET || "secretSpendio",
      { expiresIn: "7d" }
    );
    console.log(`✅ [LOGIN] JWT généré avec succès`);

    console.log(`🎉 [LOGIN] Connexion réussie pour: ${email}`);
    res.json({
      message: "Connexion réussie",
      token,
      user: { id: user.id, name: user.name, role: user.role || "user" },
    });
  } catch (error: any) {
    console.error(`❌ [LOGIN] ERREUR:`, error);
    console.error(`📋 Stack:`, error.stack);
    console.error(`💬 Message:`, error.message);
    console.error(`🔧 Code:`, error.code);
    res.status(500).json({ 
      message: "Erreur serveur",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};
