"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
const database_1 = __importDefault(require("../config/database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
/**
 * 🔧 Initialisation automatique de la base de données
 * Cette fonction s'exécute au démarrage du serveur
 * Elle crée les tables et insère les données de test si nécessaire
 */
async function initializeDatabase() {
    try {
        console.log(`\n🔧 [DATABASE INIT] Vérification de la base de données...`);
        // Utiliser une connexion simple pour tester
        const conn = await database_1.default.getConnection();
        console.log(`✅ [DB] Connexion MySQL réussie!`);
        try {
            // 1. Vérifier si la DB existe, sinon créer les tables
            await createTablesIfNotExist(conn);
            // 2. Vérifier les données de test
            await ensureTestData(conn);
            console.log(`✅ [DATABASE INIT] Base de données initialisée avec succès!\n`);
            return true;
        }
        finally {
            conn.release();
        }
    }
    catch (error) {
        console.error(`\n❌ [DATABASE INIT] Erreur lors de l'initialisation:`);
        console.error(`   Message: ${error.message}`);
        console.error(`   Code: ${error.code}`);
        console.warn(`⚠️  [DATABASE INIT] Continuant malgré tout (les tables seront créées à la première requête)\n`);
        return false;
    }
}
/**
 * Créer les tables si elles n'existent pas
 */
async function createTablesIfNotExist(conn) {
    try {
        console.log(`📋 [DATABASE] Création des tables...`);
        // Table USERS
        await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        language VARCHAR(10) DEFAULT 'fr',
        currency VARCHAR(10) DEFAULT 'TND',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
        console.log(`   ✅ Table users`);
        // Table CATEGORIES
        await conn.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(10),
        icon VARCHAR(255),
        budget DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
        console.log(`   ✅ Table categories`);
        // Table TRANSACTIONS
        await conn.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        category_id INT NOT NULL,
        type ENUM('income', 'expense') DEFAULT 'expense',
        amount DECIMAL(10, 2) NOT NULL,
        date DATE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);
        console.log(`   ✅ Table transactions`);
        // Table BUDGETS
        await conn.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        category_id INT NOT NULL,
        limit_amount DECIMAL(10, 2) NOT NULL,
        month INT NOT NULL,
        year INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);
        console.log(`   ✅ Table budgets`);
        console.log(`✅ [DATABASE] Tables créées avec succès`);
    }
    catch (error) {
        console.error(`❌ Erreur création tables:`, error.message);
        throw error;
    }
}
/**
 * S'assurer qu'il existe au moins un utilisateur de test
 */
async function ensureTestData(conn) {
    try {
        console.log(`🧪 [TEST DATA] Vérification des données de test...`);
        // Vérifier si l'utilisateur de test existe
        const [users] = await conn.query("SELECT * FROM users WHERE email = ?", ["test@example.com"]);
        if (users && Array.isArray(users) && users.length > 0) {
            console.log(`   ✅ Utilisateur de test existe déjà`);
            return;
        }
        // Créer l'utilisateur de test avec mot de passe hashé
        // Mot de passe: "123456"
        const hashedPassword = await bcrypt_1.default.hash("123456", 10);
        await conn.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", ["Test User", "test@example.com", hashedPassword]);
        console.log(`   ✅ Utilisateur de test créé: test@example.com (password: 123456)`);
        // Récupérer l'ID du nouvel utilisateur
        const [newUsers] = await conn.query("SELECT id FROM users WHERE email = ?", ["test@example.com"]);
        if (newUsers && Array.isArray(newUsers) && newUsers.length > 0) {
            const userId = newUsers[0].id;
            // Créer des catégories de test
            const categories = [
                ["Nourriture", "#F9D5E5", "food-apple"],
                ["Transport", "#E1D5F7", "car"],
                ["Divertissement", "#D5E8F7", "movie"],
                ["Santé", "#D5F7E1", "medical-bag"],
                ["Logement", "#F7EDD5", "home"],
            ];
            for (const [name, color, icon] of categories) {
                await conn.query("INSERT IGNORE INTO categories (user_id, name, color, icon) VALUES (?, ?, ?, ?)", [userId, name, color, icon]);
            }
            console.log(`   ✅ Catégories de test créées (${categories.length})`);
        }
    }
    catch (error) {
        console.error(`❌ Erreur données test:`, error.message);
        throw error;
    }
}
