import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";

import {
    getAuth,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

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

// Firebase Authentication
const auth = getAuth(app);

// Keep users/admin logged in across page refreshes
setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
        console.error("Firebase persistence error:", error);
    });

// Firestore
const db = getFirestore(app);

export {
    app,
    auth,
    db
};