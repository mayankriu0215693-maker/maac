import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// COPY_FROM_FIREBASE_CONSOLE: Replace placeholder values with your exact config
const firebaseConfig = {
  apiKey: "COPY_FROM_FIREBASE_CONSOLE",
  authDomain: "COPY_FROM_FIREBASE_CONSOLE",
  projectId: "maa-enterprises-cyber",
  storageBucket: "COPY_FROM_FIREBASE_CONSOLE",
  messagingSenderId: "COPY_FROM_FIREBASE_CONSOLE",
  appId: "COPY_FROM_FIREBASE_CONSOLE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
