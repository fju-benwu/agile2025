// firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCLep_kBhcEI0DrY9JBKKPKM5soNF8IPh0",
  authDomain: "agile2025-809a8.firebaseapp.com",
  projectId: "agile2025-809a8",
  storageBucket: "agile2025-809a8.firebasestorage.app",
  messagingSenderId: "1075429508525",
  appId: "1:1075429508525:web:5b4dee18086d8f810bcd24"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };