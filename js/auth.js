import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");

function getErrorMessage(code) {
    switch (code) {
        case 'auth/email-already-in-use': return "This email is already registered. Please login.";
        case 'auth/invalid-credential': return "Invalid email or password.";
        case 'auth/user-not-found': return "No account found with this email.";
        case 'auth/wrong-password': return "Incorrect password.";
        case 'auth/weak-password': return "Password must be at least 6 characters.";
        case 'auth/network-request-failed': return "Network error. Please check your connection.";
        default: return "Authentication failed. Please try again.";
    }
}

function safeText(id, text) {
    const el = document.getElementById(id);
    if(el) el.textContent = text;
}

if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("reg-btn");
        const errDiv = document.getElementById("auth-error");
        
        btn.disabled = true; btn.textContent = "Creating Account..."; 
        errDiv.className = "hidden";
        
        try {
            const email = document.getElementById("reg-email").value.trim();
            const pass = document.getElementById("reg-pass").value;
            const name = document.getElementById("reg-name").value.trim();

            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                createdAt: serverTimestamp()
            });

            window.location.href = "index.html";
        } catch (error) {
            errDiv.className = "alert alert-error";
            safeText("auth-error", getErrorMessage(error.code));
            btn.disabled = false; btn.textContent = "Sign Up";
        }
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("login-btn");
        const errDiv = document.getElementById("auth-error");
        
        btn.disabled = true; btn.textContent = "Logging in..."; 
        errDiv.className = "hidden";
        
        try {
            const email = document.getElementById("login-email").value.trim();
            const pass = document.getElementById("login-pass").value;

            await signInWithEmailAndPassword(auth, email, pass);
            window.location.href = "index.html";
        } catch (error) {
            errDiv.className = "alert alert-error";
            safeText("auth-error", getErrorMessage(error.code));
            btn.disabled = false; btn.textContent = "Login";
        }
    });
}
