#!/usr/bin/env node

/**
 * Backend Connection Test Script
 * Tests if backend is reachable and responding correctly
 */

const http = require('http');
const https = require('https');

const testUrls = [
  { name: 'Local Backend', url: 'http://localhost:5000/api/health' },
  { name: 'Vercel Backend', url: 'https://hostel-mangement-backend.vercel.app/api/health' }
];

const testUrl = (url, name) => {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`✅ ${name}: SUCCESS`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Response:`, json);
        } catch (e) {
          console.log(`❌ ${name}: FAILED (Invalid JSON)`);
          console.log(`   Response: ${data}`);
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log(`❌ ${name}: FAILED`);
      console.log(`   Error: ${err.message}`);
      resolve();
    });
  });
};

const runTests = async () => {
  console.log('🧪 Backend Connection Tests\n');
  
  for (const { name, url } of testUrls) {
    await testUrl(url, name);
    console.log();
  }
  
  console.log('✨ Tests complete!');
};

runTests();
