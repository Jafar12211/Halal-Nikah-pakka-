import { initializeApp } from 'firebase/app';
import { initializeFirestore, memoryLocalCache, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Use an in-memory Firestore cache on hosted builds. This avoids IndexedDB
// persistence initialization failures in restricted browsers and shared devices.
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
});

export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');

// Explicit emulator mode: ONLY enabled when import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true'
// Never automatically or silently routes live staging/production traffic to local emulators.
if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  const host = '127.0.0.1';
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, 8080);
  connectStorageEmulator(storage, host, 9199);
  connectFunctionsEmulator(functions, host, 5001);
}

export default app;
