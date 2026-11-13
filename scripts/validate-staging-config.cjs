const fs = require('node:fs');
const path = require('node:path');

// These values identify the one registered staging Web App. Keep this validator
// fail-closed: a different app, project, or credential must never be accepted.
const EXPECTED_STAGING_CONFIG = Object.freeze({
  projectId: 'nikah-pakka-staging',
  apiKey: 'AIzaSyDxj2kaWnp1hiT80roblkfhn2XMfrX9iNY',
  authDomain: 'nikah-pakka-staging.firebaseapp.com',
  storageBucket: 'nikah-pakka-staging.firebasestorage.app',
  messagingSenderId: '593974062791',
  appId: '1:593974062791:web:a197d5d58974836af858e2',
  measurementId: 'G-B320MVNCF1'
});

function validateConfig(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('FAIL-CLOSED: Firebase configuration must be a JSON object.');
  }

  // Explicitly reject known production identifiers before staging comparisons.
  const serialized = JSON.stringify(config);
  if (
    serialized.includes('nikah-pakka.firebaseapp.com') ||
    serialized.includes('nikah-pakka.firebasestorage.app') ||
    serialized.includes('655818278889') ||
    config.projectId === 'nikah-pakka'
  ) {
    throw new Error('FAIL-CLOSED: Production Firebase configuration detected; staging validation rejected.');
  }

  for (const [key, expectedValue] of Object.entries(EXPECTED_STAGING_CONFIG)) {
    const actualValue = config[key];

    if (typeof actualValue !== 'string' || actualValue.trim() === '') {
      throw new Error(`FAIL-CLOSED: Missing or invalid required Firebase configuration field: "${key}".`);
    }

    if (/placeholder|replace[-_ ]?me|your[-_ ]/i.test(actualValue) || actualValue.includes('<')) {
      throw new Error(`FAIL-CLOSED: Placeholder value detected for Firebase configuration field "${key}".`);
    }

    if (actualValue !== expectedValue) {
      throw new Error(
        `FAIL-CLOSED: Firebase configuration field "${key}" does not match the exact registered staging Web App value.`
      );
    }
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
    console.log('✔ Exact registered staging Firebase Web App configuration validated for project "nikah-pakka-staging" (593974062791).');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = { validateConfig, EXPECTED_STAGING_CONFIG };
