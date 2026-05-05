import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = {
  projectId:         "gen-lang-client-0008224099",
  appId:             "1:299083734583:web:91d5eea65826015b2ae9b2",
  apiKey:            "AIzaSyDFki9Lnz0CSYSv_eiOhRSWO7TV7LySaGs",
  authDomain:        "gen-lang-client-0008224099.firebaseapp.com",
  storageBucket:     "gen-lang-client-0008224099.firebasestorage.app",
  messagingSenderId: "299083734583",
};

const FIRESTORE_DATABASE_ID = "ai-studio-c6f9a803-d8e1-488c-bfab-8c9457ff9904";

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, FIRESTORE_DATABASE_ID);

// Critical Constraint: Test connection on boot
async function testConnection() {
  try {
    const testDoc = doc(db, 'test', 'connection');
    await getDocFromServer(testDoc);
    console.log('Firebase connection successful');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or network. Firestore reports as offline.");
    }
  }
}

testConnection();

export const auth = getAuth(app);
// Explicitly set persistence to local (survives browser restarts)
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Failed to set auth persistence:", err);
});
