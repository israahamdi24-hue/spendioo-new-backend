#!/bin/bash

# Script pour tester le login sur Clever Cloud

echo "🔷 Test du endpoint /api/test"
curl -v https://app-92fbc2c7-21cc-4f40-beb1-ff76864f76f9.cleverapps.io/api/test

echo -e "\n\n🔷 Test du endpoint /api/health/db"
curl -v https://app-92fbc2c7-21cc-4f40-beb1-ff76864f76f9.cleverapps.io/api/health/db

echo -e "\n\n🔷 Test du login avec test@example.com / 123456"
curl -X POST https://app-92fbc2c7-21cc-4f40-beb1-ff76864f76f9.cleverapps.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}' \
  -v

echo -e "\n\n✅ Tests terminés"
echo "📋 Vérifie les logs Clever Cloud pour plus de détails"
echo "   Clever Cloud → ton app → Logs → Stdout/Stderr"
