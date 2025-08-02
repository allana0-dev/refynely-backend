import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyA1KvAfOhfplwQNoIKokk2ViCxZ1qDH9gE',
  authDomain: 'refynely.firebaseapp.com',
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

async function run() {
  const customToken =
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTc1MzgxOTgzMiwiZXhwIjoxNzUzODIzNDMyLCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay1mYnN2Y0ByZWZ5bmVseS5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInN1YiI6ImZpcmViYXNlLWFkbWluc2RrLWZic3ZjQHJlZnluZWx5LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwidWlkIjoidGVzdC11c2VyLXVpZCJ9.Q1JMzZNumOzdeXmyx4aWNt0FPpPDKnj3p21DC7XJQEwYy2lBpNIrAs1Xr7nKvQ42byusTu_uqpZsMDV9clweOpEPZgk19YmGfcGBcLRbiN-lSWklSgT74o1-0B5q1LxvOp3ON3X2ylSsQn9dlpeE-TfPuwqTjSgD7tl4V5ah0DXsNT4kwZftxBxTAIMSTa5kEg7uKIHvoMEp6_XdlX8oNGT5hP2iEf6bG2rvgr-y-rJByJ5Et1t0wyik9LVjvZml37lZ2q1jGCkuviuNJy_SCaKrOXcdOfvOOi96U27yYIA83rRtr_La63LvEQ2pi3ef7veg4LlnYuQC8YzDzvzuzA';

  const userCredential = await signInWithCustomToken(auth, customToken);
  const idToken = await userCredential.user.getIdToken();
}

run().catch(console.error);
