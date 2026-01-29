#!/usr/bin/env node
"use strict";
/**
 * Script d'initialisation de la base de données
 * Exécute init.sql pour préparer la BD
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("./config/database"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function initializeDatabase() {
    try {
        console.log("📊 Démarrage de l'initialisation de la base de données...");
        const connection = await database_1.default.getConnection();
        // Lire le fichier SQL
        const sqlPath = path_1.default.join(process.cwd(), "init.sql");
        const sql = fs_1.default.readFileSync(sqlPath, "utf-8");
        // Exécuter les requêtes SQL
        const queries = sql.split(";").filter((q) => q.trim().length > 0);
        for (const query of queries) {
            const trimmedQuery = query.trim();
            if (trimmedQuery.length === 0)
                continue;
            try {
                console.log(`\n⏳ Exécution: ${trimmedQuery.substring(0, 50)}...`);
                await connection.query(trimmedQuery);
                console.log(`✅ Succès`);
            }
            catch (err) {
                // Ignorer les erreurs "déjà existant"
                if (err.message.includes("already exists") ||
                    err.message.includes("Duplicate entry")) {
                    console.log(`⚠️ Skipped: ${err.message}`);
                }
                else {
                    console.error(`❌ Erreur: ${err.message}`);
                }
            }
        }
        connection.release();
        console.log("\n✅ Initialisation terminée avec succès!");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Erreur lors de l'initialisation:", error.message);
        process.exit(1);
    }
}
initializeDatabase();
