-- Ajouter les colonnes manquantes à la table categories si elles n'existent pas
-- Migration: Ajouter icon, budget et user_id à categories

USE spendio;

-- Vérifier si les colonnes existent et les ajouter si nécessaire
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS icon VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS budget DECIMAL(10, 2) NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS user_id INT NOT NULL DEFAULT 1;

-- Ajouter la clé étrangère si elle n'existe pas
ALTER TABLE categories
ADD CONSTRAINT IF NOT EXISTS fk_categories_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Afficher la structure finale
DESCRIBE categories;
