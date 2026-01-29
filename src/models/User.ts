import db from "../config/database";

// Classe simple User
class User {
  id?: number;
  name: string;
  email: string;
  password: string;
  language: string;
  currency: string;
  darkMode: boolean;
  notifications: boolean;

  constructor(data: any) {
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
  static async findByPk(id: number) {
    const [rows]: any = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0] ? new User(rows[0]) : null;
  }

  // Chercher par email
  static async findByEmail(email: string) {
    const [rows]: any = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0] ? new User(rows[0]) : null;
  }

  // Créer un utilisateur
  static async create(userData: any) {
    const user = new User(userData);
    await db.query(
      "INSERT INTO users (name, email, password, language, currency, darkMode, notifications) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [user.name, user.email, user.password, user.language, user.currency, user.darkMode, user.notifications]
    );
    return user;
  }

  // Sauvegarder les modifications
  async save() {
    await db.query(
      "UPDATE users SET name = ?, email = ?, password = ?, language = ?, currency = ?, darkMode = ?, notifications = ? WHERE id = ?",
      [this.name, this.email, this.password, this.language, this.currency, this.darkMode, this.notifications, this.id]
    );
  }

  // Supprimer l'utilisateur
  async delete() {
    await db.query("DELETE FROM users WHERE id = ?", [this.id]);
  }
}

export default User;
