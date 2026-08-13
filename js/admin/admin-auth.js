import { auth } from "../firebase-config.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const loginForm = document.getElementById("admin-login-form");

function safeText(id, text) {
    const el = document.getElementById(id);
    if(el) el.textContent = text;
}

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("login-btn");
        const err = document.getElementById("auth-error");
        
        btn.disabled = true; btn.textContent = "Authenticating..."; 
        err.className = "hidden";
        
        try {
            const email = document.getElementById("admin-email").value.trim();
            const pass = document.getElementById("admin-pass").value;

            await signInWithEmailAndPassword(auth, email, pass);
            window.location.href = "index.html";
        } catch (error) {
            err.className = "alert alert-error";
            safeText("auth-error", "Login failed: " + error.message.replace("Firebase: ", ""));
            btn.disabled = false; btn.textContent = "Secure Login";
        }
    });
}

export function requireAdminAuth() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = "login.html";
        } else {
            safeText("admin-user-email", user.email);
        }
    });

    const logoutBtn = document.getElementById("admin-logout");
    if(logoutBtn) {
        logoutBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            await signOut(auth);
            window.location.href = "login.html";
        });
    }
}
