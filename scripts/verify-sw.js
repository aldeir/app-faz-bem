#!/usr/bin/env node
/**
 * Service Worker Verification Script
 * Verifies that service-worker.js exports proper version constant and structure
 */

const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, '..', 'service-worker.js');

function verifyServiceWorker() {
  console.log('🔍 Verifying service worker...');
  
  if (!fs.existsSync(swPath)) {
    console.error('❌ service-worker.js not found');
    process.exit(1);
  }
  
  const swContent = fs.readFileSync(swPath, 'utf8');
  
  // Check for version constant
  const versionMatch = swContent.match(/const\s+VERSION\s*=\s*['"`]([^'"`]+)['"`]/);
  if (!versionMatch) {
    console.error('❌ VERSION constant not found in service worker');
    process.exit(1);
  }
  
  const version = versionMatch[1];
  console.log(`✅ Found VERSION constant: ${version}`);
  
  // Check for essential event listeners
  const requiredEvents = ['install', 'activate', 'fetch'];
  for (const event of requiredEvents) {
    const eventRegex = new RegExp(`addEventListener\\s*\\(\\s*['"\`]${event}['"\`]`);
    if (!eventRegex.test(swContent)) {
      console.error(`❌ Missing ${event} event listener`);
      process.exit(1);
    }
    console.log(`✅ Found ${event} event listener`);
  }
  
  // Check for cache names
  if (!swContent.includes('CACHE_PAGES') && !swContent.includes('caches.open')) {
    console.error('❌ No cache management found');
    process.exit(1);
  }
  console.log('✅ Cache management found');
  
  console.log('🎉 Service worker verification passed!');
}

if (require.main === module) {
  verifyServiceWorker();
}

module.exports = { verifyServiceWorker };