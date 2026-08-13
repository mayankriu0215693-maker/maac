import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");

if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("reg-btn");
        const err = document.getElementById("auth-error");
        
        btn.disabled = true; btn.innerText = "Processing..."; err.innerText = "";
        
        try {
            const email = document.getElementById("reg-email").value;
            const pass = document.getElementById("reg-pass").value;
            const name = document.getElementById("reg-name").value;

            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            const user = userCredential.user;

            // Security Rule: allow create: if request.auth != null && request.auth.uid == userId
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                createdAt: serverTimestamp()
            });

            window.location.href = "index.html";
        } catch (error) {
            err.innerText = error.message.replace("Firebase: ", "");
            btn.disabled = false; btn.innerText = "Sign Up";
        }
    });
}

// Logic for Login form (assuming login.html exists with id="login-form")
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        // Standard signInWithEmailAndPassword implementation...
        // For brevity, similar structure to signup error handling.
    });
}
