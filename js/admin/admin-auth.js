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
        
        btn.disabled = true; btn.textContent = "Authenticating Security Credentials..."; 
        err.className = "hidden";
        
        try {
            const adminId = document.getElementById("admin-id").value.trim();
            const pass = document.getElementById("admin-pass").value;

            // Secure Architecture Mapping: 
            // The user enters their provided Admin ID (e.g. K0403489). 
            // We map this internally to the dedicated Firebase Auth email you set up in the console.
            // DO NOT hardcode passwords here. The auth validation occurs entirely on Firebase servers.
            let email = adminId;
            if (!adminId.includes('@')) {
                // Example internal mapping. Set this up in your Firebase Authentication users tab.
                email = `admin_${adminId}@maaenterprises.internal`; 
            }

            await signInWithEmailAndPassword(auth, email, pass);
            window.location.href = "index.html";
        } catch (error) {
            err.className = "alert alert-error";
            safeText("auth-error", "Secure Login failed. Invalid Credentials or Unauthorized Access.");
            btn.disabled = false; btn.textContent = "Secure Login";
        }
    });
}

export function requireAdminAuth() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = "login.html";
        } else {
            safeText("admin-user-email", "Authorized Admin: " + user.email.split('@')[0]);
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
