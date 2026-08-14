import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, browserLocalPersistence, setPersistence } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Ensure you add your actual apiKey here from your Firebase Console
const firebaseConfig = {
  projectId: "maa-enterprises-ea055",
  authDomain: "maa-enterprises-ea055.firebaseapp.com",
  // apiKey: "AIzaSy...", 
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Ensure session persists across redirects and reloads
setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Auth persistence error:", error.code, error.message);
});

export { app, auth, db };
