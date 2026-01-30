#!/usr/bin/env node

/**
 * 🧪 Script de Test du Backend
 * Teste la connexion, la BD, et les endpoints
 */

const http = require('http');

const BASE_URL = process.env.BACKEND_URL || 'http://192.168.1.36:5000';

console.log(`\n🧪 TEST BACKEND SPENDIO`);
console.log(`📍 URL: ${BASE_URL}\n`);

// Fonction pour faire des requêtes HTTP
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data ? JSON.parse(data) : null,
          headers: res.headers,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Tests séquentiels
async function runTests() {
  try {
    // Test 1: Ping
    console.log(`✅ Test 1: Ping`);
    const ping = await makeRequest('GET', '/api/auth/ping');
    console.log(`   Status: ${ping.status}`);
    console.log(`   Response: ${ping.body}\n`);

    // Test 2: Health Check
    console.log(`✅ Test 2: Health Check (Diagnostic)`);
    const health = await makeRequest('GET', '/api/auth/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   DB Connected: ${health.body?.database?.connected}`);
    console.log(`   Users Table: ${health.body?.database?.usersTableExists ? 'EXISTS' : 'MISSING'}`);
    if (health.body?.database?.error) {
      console.log(`   ❌ Error: ${health.body.database.error}`);
    }
    console.log('');

    // Test 3: Login avec test@example.com
    console.log(`✅ Test 3: Login (test@example.com)`);
    const login = await makeRequest('POST', '/api/auth/login', {
      email: 'test@example.com',
      password: '123456',
    });
    console.log(`   Status: ${login.status}`);
    if (login.status === 200) {
      console.log(`   ✅ Login réussi!`);
      console.log(`   Token: ${login.body?.token?.substring(0, 20)}...`);
    } else {
      console.log(`   ❌ Erreur: ${login.body?.message || login.body?.error}`);
    }
    console.log('');

    // Résumé
    console.log(`\n📋 RÉSUMÉ:`);
    console.log(`  ✅ Ping: ${ping.status === 200 ? 'OK' : 'FAIL'}`);
    console.log(`  ${health.body?.database?.connected ? '✅' : '❌'} BD: ${health.body?.database?.connected ? 'CONNECTÉE' : 'ERREUR'}`);
    console.log(`  ${health.body?.database?.usersTableExists ? '✅' : '❌'} Table users: ${health.body?.database?.usersTableExists ? 'EXISTS' : 'MISSING'}`);
    console.log(`  ${login.status === 200 ? '✅' : '❌'} Login: ${login.status === 200 ? 'OK' : 'FAIL'}`);

  } catch (error) {
    console.error(`\n❌ ERREUR CRITIQUE:`);
    console.error(`   ${error.message}`);
    console.error(`\n   Vérifiez que le backend est lancé sur: ${BASE_URL}`);
  }
}

runTests();
