const fs = require('node:fs');
const path = require('node:path');

// Exact registered Firebase Web App configuration for staging:
const EXPECTED_STAGING_CONFIG = {
  projectId: 'nikah-pakka-staging',
  messagingSenderId: '593974062791',
  authDomain: 'nikah-pakka-staging.firebaseapp.com',
  storageBucket: 'nikah-pakka-staging.firebasestorage.app',
  appId: '1:593974062791:web:a197d5d58974836af858e2',
  apiKey: 'AIzaSyDxj2kaWnp1hiT80roblkfhn2XMfrX9iNY',
  measurementId: 'G-B320MVNCF1',
};

function validateConfig(config) {
  if (!config || typeof config !== 'object') {
    throw new Error('FAIL-CLOSED: Configuration must be a non-null object.');
  }

  const requiredKeys = ['projectId', 'apiKey', 'authDomain', 'storageBucket', 'messagingSenderId', 'appId'];
  for (const key of requiredKeys) {
    if (!config[key] || typeof config[key] !== 'string') {
      throw new Error(`FAIL-CLOSED: Missing or invalid required Firebase configuration field: "${key}".`);
    }
  }

  // 1. Staging project validation
  if (config.projectId !== EXPECTED_STAGING_CONFIG.projectId) {
    throw new Error(`FAIL-CLOSED: Expected projectId to be "${EXPECTED_STAGING_CONFIG.projectId}", found "${config.projectId}".`);
  }

  if (config.messagingSenderId !== EXPECTED_STAGING_CONFIG.messagingSenderId) {
    throw new Error(`FAIL-CLOSED: Expected messagingSenderId to be "${EXPECTED_STAGING_CONFIG.messagingSenderId}", found "${config.messagingSenderId}".`);
  }

  if (config.authDomain !== EXPECTED_STAGING_CONFIG.authDomain) {
    throw new Error(`FAIL-CLOSED: authDomain must be "${EXPECTED_STAGING_CONFIG.authDomain}", found "${config.authDomain}".`);
  }

  if (config.storageBucket !== EXPECTED_STAGING_CONFIG.storageBucket) {
    throw new Error(`FAIL-CLOSED: storageBucket must be "${EXPECTED_STAGING_CONFIG.storageBucket}", found "${config.storageBucket}".`);
  }

  // 2. Reject placeholders
  if (config.appId.endsWith(':staging') || config.appId.includes('staging') || config.appId.includes('placeholder')) {
    throw new Error(`FAIL-CLOSED: Placeholder appId detected ("${config.appId}"). The real Web App ID from Firebase Console must be supplied.`);
  }

  // 3. Exact Web App ID verification: Must match registered staging Web App ID
  if (config.appId !== EXPECTED_STAGING_CONFIG.appId) {
    throw new Error(`FAIL-CLOSED: Expected registered staging appId "${EXPECTED_STAGING_CONFIG.appId}", found "${config.appId}".`);
  }

  // 4. API key verification
  if (config.apiKey !== EXPECTED_STAGING_CONFIG.apiKey) {
    throw new Error(`FAIL-CLOSED: Expected registered staging apiKey "${EXPECTED_STAGING_CONFIG.apiKey}", found "${config.apiKey}".`);
  }

  // 5. Measurement ID verification if present
  if (config.measurementId && config.measurementId !== EXPECTED_STAGING_CONFIG.measurementId) {
    throw new Error(`FAIL-CLOSED: Expected measurementId to be "${EXPECTED_STAGING_CONFIG.measurementId}", found "${config.measurementId}".`);
  }

  // 6. Absolute production protection: reject production project ID and project number 655818278889
  const stringified = JSON.stringify(config);
  if (
    stringified.includes('nikah-pakka.firebaseapp.com') ||
    stringified.includes('nikah-pakka.firebasestorage.app') ||
    stringified.includes('655818278889') ||
    config.projectId === 'nikah-pakka'
  ) {
    throw new Error('FAIL-CLOSED: Production project ID "nikah-pakka" or project number 655818278889 detected! Deployment rejected.');
  }

  return true;
}

if (require.main === module) {
  const configPath = path.resolve(__dirname, '..', 'firebase-applet-config.json');

  if (!fs.existsSync(configPath)) {
    console.error('ERROR: firebase-applet-config.json is missing.');
    process.exit(1);
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (err) {
    console.error('ERROR: Failed to parse firebase-applet-config.json:', err.message);
    process.exit(1);
  }

  try {
    validateConfig(config);
    console.log('✔ Staging Firebase configuration validated successfully for project: "nikah-pakka-staging" (593974062791).');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = { validateConfig, EXPECTED_STAGING_CONFIG };
