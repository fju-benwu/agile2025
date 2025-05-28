// firebase/firebaseConfig.js
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

//避免APIkey洩漏
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID
};

// const app = initializeApp(firebaseConfig);
//如果已經初始化過Firebase App，則使用現有的App實例
const app = getApps().length === 0 ? 
  initializeApp(firebaseConfig) 
  : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };