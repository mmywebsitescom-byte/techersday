// Firebase Client SDK Configuration
// Project: techxeraday
//
// HOW TO GET YOUR API KEY:
// 1. Go to https://console.firebase.google.com/project/techxeraday/settings/general
// 2. Scroll to "Your apps" → click your Web app (or "Add app" → Web)
// 3. Copy the firebaseConfig values and paste below.
//
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Paste your Firebase Web App config here from the Firebase Console:
  // Firebase Console → Project Settings → Your Apps → Web App → SDK setup
  apiKey: "PASTE_YOUR_WEB_API_KEY_HERE",
  authDomain: "techxeraday.firebaseapp.com",
  projectId: "techxeraday",
  storageBucket: "techxeraday.appspot.com",
  messagingSenderId: "102458743260963721977",
  appId: "PASTE_YOUR_APP_ID_HERE",
};

// Initialize only once (avoids hot-reload duplicates)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export default app;
