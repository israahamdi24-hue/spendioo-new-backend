import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/database";
import User from "../models/User";

// Créer un nouvel utilisateur
export const registerUser = async (userData: User) => {
  const { name, email, password } = userData;

  // Vérifier que tous les champs existent
  if (!name || !email || !password) {
    throw new Error("Tous les champs sont obligatoires");
  }

  const connection = await db.getConnection();
  try {
    // Vérifier si l'email existe déjà
    const [existing] = await connection.query("SELECT * FROM users WHERE email = ?", [email]);
    if ((existing as any).length > 0) {
      throw new Error("Email déjà utilisé");
    }

    // Hasher le mot de passe et l'insérer
    const hashedPassword = bcrypt.hashSync(password, 10);
    await connection.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    return { message: "Utilisateur créé avec succès" };
  } finally {
    connection.release();
  }
};

// Connecter un utilisateur
export const loginUser = async (email: string, password: string) => {
  const connection = await db.getConnection();
  try {
    // Chercher l'utilisateur par email
    const [result] = await connection.query("SELECT * FROM users WHERE email = ?", [email]);

    if ((result as any).length === 0) {
      throw new Error("Utilisateur non trouvé");
    }

    const user = (result as any)[0];

    // Vérifier le mot de passe
    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      throw new Error("Mot de passe incorrect");
    }

    // Créer un JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return { token, user: { id: user.id, name: user.name, role: user.role } };
  } finally {
    connection.release();
  }
};

// Changer le mot de passe
export const changePassword = async (userId: number, newPassword: string, confirmPassword: string) => {
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

  const connection = await db.getConnection();
  try {
    // Hasher le nouveau mot de passe et le mettre à jour
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await connection.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, userId]
    );

    return { message: "Mot de passe modifié avec succès" };
  } finally {
    connection.release();
  }
};

// Mettre à jour le profil utilisateur
export const updateUserProfile = async (userId: number, name?: string, email?: string) => {
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

  const connection = await db.getConnection();
  try {
    // Si email est fourni, vérifier qu'il n'existe pas pour un autre utilisateur
    if (email) {
      const [existing] = await connection.query(
        "SELECT * FROM users WHERE email = ? AND id != ?",
        [email, userId]
      );
      
      if ((existing as any).length > 0) {
        throw new Error("Cet email est déjà utilisé");
      }
    }

    // Construire la requête UPDATE dynamiquement
    if (name && email) {
      // Mettre à jour nom et email
      await connection.query(
        "UPDATE users SET name = ?, email = ? WHERE id = ?",
        [name, email, userId]
      );
    } else if (name) {
      // Mettre à jour uniquement le nom
      await connection.query(
        "UPDATE users SET name = ? WHERE id = ?",
        [name, userId]
      );
    } else if (email) {
      // Mettre à jour uniquement l'email
      await connection.query(
        "UPDATE users SET email = ? WHERE id = ?",
        [email, userId]
      );
    }

    return { message: "Profil mis à jour avec succès" };
  } finally {
    connection.release();
  }
};
