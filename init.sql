-- =============================================
-- 📊 SPENDIO - Initialisation Complète de la Base de Données
-- =============================================

USE spendio;

-- ✅ ÉTAPE 1: Vérifier et corriger la table USERS
ALTER TABLE users
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'fr',
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'TND';

-- ✅ ÉTAPE 2: Corriger la table CATEGORIES
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS icon VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS budget DECIMAL(10, 2) NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS user_id INT NOT NULL DEFAULT 1;

-- Ajouter la contrainte de clé étrangère si elle n'existe pas
ALTER TABLE categories
ADD CONSTRAINT IF NOT EXISTS fk_categories_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ✅ ÉTAPE 3: Vérifier la table TRANSACTIONS
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS description TEXT NULL;

-- ✅ ÉTAPE 4: Vérifier la table BUDGETS
-- (Pas de modification nécessaire)

-- ✅ ÉTAPE 5: Créer des données de test
-- Utilisateur de test
INSERT IGNORE INTO users (id, name, email, password, language, currency, created_at) 
VALUES (
  12,
  'Alice Test',
  'alice.test@example.com',
  '$2b$10$jS7WGfJfLPr0/K6VaJ3Ru.XYK8VgS0/MQ5e0L2UPqL4d4bZbVYJQK',
  'fr',
  'TND',
  NOW()
);

-- Catégories de test
INSERT IGNORE INTO categories (name, color, icon, budget, user_id) VALUES
('Alimentation', '#F9D5E5', 'food-apple', 200, 12),
('Transport', '#E1D5F7', 'car', 150, 12),
('Divertissement', '#D5E8F7', 'movie', 100, 12),
('Santé', '#D5F7E1', 'medical-bag', 120, 12),
('Logement', '#F7EDD5', 'home', 500, 12);

-- ✅ ÉTAPE 6: Afficher les structures
SELECT '📋 USERS' as TableName;
DESCRIBE users;

SELECT '📋 CATEGORIES' as TableName;
DESCRIBE categories;

SELECT '📋 TRANSACTIONS' as TableName;
DESCRIBE transactions;

-- ✅ ÉTAPE 7: Vérifier les données
SELECT '✅ USERS:' as Status;
SELECT id, name, email, language, currency FROM users;

SELECT '✅ CATEGORIES:' as Status;
SELECT id, name, color, icon, budget, user_id FROM categories;

-- ✅ Fin de l'initialisation
SELECT '✅ Initialisation terminée avec succès!' as Status;
