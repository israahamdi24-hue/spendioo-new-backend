#!/usr/bin/env node

/**
 * Script d'initialisation de la base de données
 * Exécute init.sql pour préparer la BD
 */

import db from "./config/database";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

async function initializeDatabase() {
  try {
    console.log("📊 Démarrage de l'initialisation de la base de données...");

    const connection = await db.getConnection();
    
    // Lire le fichier SQL
    const sqlPath = path.join(process.cwd(), "init.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");

    // Exécuter les requêtes SQL
    const queries = sql.split(";").filter((q) => q.trim().length > 0);

    for (const query of queries) {
      const trimmedQuery = query.trim();
      if (trimmedQuery.length === 0) continue;

      try {
        console.log(`\n⏳ Exécution: ${trimmedQuery.substring(0, 50)}...`);
        await connection.query(trimmedQuery);
        console.log(`✅ Succès`);
      } catch (err: any) {
        // Ignorer les erreurs "déjà existant"
        if (
          err.message.includes("already exists") ||
          err.message.includes("Duplicate entry")
        ) {
          console.log(`⚠️ Skipped: ${err.message}`);
        } else {
          console.error(`❌ Erreur: ${err.message}`);
        }
      }
    }

    connection.release();
    console.log("\n✅ Initialisation terminée avec succès!");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Erreur lors de l'initialisation:", error.message);
    process.exit(1);
  }
}

initializeDatabase();
