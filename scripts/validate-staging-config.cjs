const fs = require('node:fs');
const path = require('node:path');

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

const requiredKeys = ['projectId', 'apiKey', 'authDomain', 'storageBucket', 'messagingSenderId', 'appId'];
for (const key of requiredKeys) {
  if (!config[key] || typeof config[key] !== 'string') {
    console.error(`ERROR: Missing or invalid required Firebase configuration field: "${key}".`);
    process.exit(1);
  }
}

if (config.projectId !== 'nikah-pakka-staging') {
  console.error(`FAIL-CLOSED: Expected projectId to be "nikah-pakka-staging", found "${config.projectId}".`);
  process.exit(1);
}

if (config.authDomain !== 'nikah-pakka-staging.firebaseapp.com') {
  console.error(`FAIL-CLOSED: authDomain must be "nikah-pakka-staging.firebaseapp.com", found "${config.authDomain}".`);
  process.exit(1);
}

if (config.storageBucket !== 'nikah-pakka-staging.firebasestorage.app') {
  console.error(`FAIL-CLOSED: storageBucket must be "nikah-pakka-staging.firebasestorage.app", found "${config.storageBucket}".`);
  process.exit(1);
}

// Ensure no production project reference is leaked in config
const stringified = JSON.stringify(config);
if (stringified.includes('nikah-pakka.firebaseapp.com') || stringified.includes('nikah-pakka.firebasestorage.app') || stringified.includes('655818278889')) {
  console.error('FAIL-CLOSED: Found production project credentials or IDs in firebase-applet-config.json.');
  process.exit(1);
}

console.log('✔ Staging Firebase configuration validated successfully for project: "nikah-pakka-staging".');
