import { getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID
}
// Initialize Firebase App
let firebase_app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
console.log("Firebase App Initialized:", firebaseConfig.apiKey); // For Firebase JS SDK v7.20.0 and later, `measurementId` is optional
export default firebase_app;