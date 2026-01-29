-- ✅ Script pour créer un utilisateur de test
-- Utiliser cette requête dans MySQL pour avoir un compte de test

USE spendio;

-- Créer un utilisateur de test avec mot de passe: "password123"
-- Hash bcrypt de "password123" avec salt 10
INSERT INTO users (name, email, password, created_at) VALUES 
(
  'Test User',
  'test@example.com',
  '$2b$10$jS7WGfJfLPr0/K6VaJ3Ru.XYK8VgS0/MQ5e0L2UPqL4d4bZbVYJQK',
  NOW()
)
ON DUPLICATE KEY UPDATE 
  password = '$2b$10$jS7WGfJfLPr0/K6VaJ3Ru.XYK8VgS0/MQ5e0L2UPqL4d4bZbVYJQK';

-- Vérifier si l'utilisateur a été créé
SELECT id, name, email, created_at FROM users WHERE email = 'test@example.com';
