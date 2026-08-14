// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCp_FNrSJld5R34WKbxXaWVghQdRLPoBKk",
  authDomain: "maa-enterprises-ea055.firebaseapp.com",
  projectId: "maa-enterprises-ea055",
  storageBucket: "maa-enterprises-ea055.firebasestorage.app",
  messagingSenderId: "861855732921",
  appId: "1:861855732921:web:9cfcc89d32258786b87768"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
