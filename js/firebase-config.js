import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Preserving existing config exactly as requested
const firebaseConfig = {
  apiKey: "AIzaSyDt9NaK6Qcj7toLyJ2pFtsPSK_G9_2BK5A",
  authDomain: "maa-enterprises-cyber.firebaseapp.com",
  projectId: "maa-enterprises-cyber",
  storageBucket: "maa-enterprises-cyber.firebasestorage.app",
  messagingSenderId: "1083359884535",
  appId: "1:1083359884535:web:f3d22b6fe69d4df3cb4ff2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
