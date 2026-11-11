const fs = require('node:fs');
const path = require('node:path');

function validateConfig(config) {
  const requiredKeys = ['projectId', 'apiKey', 'authDomain', 'storageBucket', 'messagingSenderId', 'appId'];
  for (const key of requiredKeys) {
    if (!config[key] || typeof config[key] !== 'string') {
      throw new Error(`Missing or invalid required Firebase configuration field: "${key}".`);
    }
  }

  // 1. Staging project validation
  if (config.projectId !== 'nikah-pakka-staging') {
    throw new Error(`FAIL-CLOSED: Expected projectId to be "nikah-pakka-staging", found "${config.projectId}".`);
  }

  if (config.messagingSenderId !== '593974062791') {
    throw new Error(`FAIL-CLOSED: Expected messagingSenderId to be "593974062791", found "${config.messagingSenderId}".`);
  }

  if (config.authDomain !== 'nikah-pakka-staging.firebaseapp.com') {
    throw new Error(`FAIL-CLOSED: authDomain must be "nikah-pakka-staging.firebaseapp.com", found "${config.authDomain}".`);
  }

  if (config.storageBucket !== 'nikah-pakka-staging.firebasestorage.app') {
    throw new Error(`FAIL-CLOSED: storageBucket must be "nikah-pakka-staging.firebasestorage.app", found "${config.storageBucket}".`);
  }

  // 2. Reject placeholders
  if (config.appId.endsWith(':staging') || config.appId.includes('staging') || config.appId.includes('placeholder')) {
    throw new Error(`FAIL-CLOSED: Placeholder appId detected ("${config.appId}"). The real Web App ID from Firebase Console must be supplied.`);
  }

  // 3. Absolute production protection: reject production project ID and project number 655818278889
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

module.exports = { validateConfig };
