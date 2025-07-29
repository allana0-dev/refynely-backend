import * as admin from 'firebase-admin';
import * as serviceAccount from './src/secrets/firebase-service-account.json'; // Adjust path if needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

async function run() {
  const testUid = 'test-user-uid'; // Use a unique Firebase UID
  const customToken = await admin.auth().createCustomToken(testUid);
  console.log('🔥 Custom Token:', customToken);
}

run().catch(console.error);
