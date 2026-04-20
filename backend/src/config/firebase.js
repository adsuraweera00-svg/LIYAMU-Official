import admin from 'firebase-admin';

let firebaseApp;

const initFirebaseAdmin = () => {
  if (firebaseApp) return firebaseApp;

  // Use service account JSON from environment variable
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  
  if (!serviceAccountJson) {
    console.warn(
      '[Firebase Admin] FIREBASE_SERVICE_ACCOUNT_JSON not set. ' +
      'Firestore writes and ID token verification will be disabled.'
    );
    return null;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || 'liyamu',
    });

    console.log('[Firebase Admin] Initialized successfully.');
    return firebaseApp;
  } catch (err) {
    console.error('[Firebase Admin] Failed to initialize:', err.message);
    return null;
  }
};

initFirebaseAdmin();

export const adminAuth = () => {
  if (!admin.apps.length) return null;
  return admin.auth();
};

export const adminFirestore = () => {
  if (!admin.apps.length) return null;
  return admin.firestore();
};

export const FieldValue = admin.firestore.FieldValue;

export { admin };
