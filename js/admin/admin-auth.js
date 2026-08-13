import { auth } from "../firebase-config.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const loginForm = document.getElementById("admin-login-form");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("login-btn");
        const err = document.getElementById("auth-error");
        
        btn.disabled = true; btn.innerText = "Authenticating..."; 
        err.innerText = ""; err.classList.remove("error-box");
        
        try {
            const email = document.getElementById("admin-email").value.trim();
            const pass = document.getElementById("admin-pass").value;

            await signInWithEmailAndPassword(auth, email, pass);
            // On success, redirect to dashboard. 
            // Note: Actual admin authorization reads will fail gracefully on the dashboard if rules aren't updated.
            window.location.href = "index.html";
        } catch (error) {
            err.classList.add("error-box");
            err.innerText = "Login failed: " + error.message.replace("Firebase: ", "");
            btn.disabled = false; btn.innerText = "Secure Login";
        }
    });
}

// Global Admin Session Guard (for other admin pages)
export function requireAdminAuth() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = "login.html";
        } else {
            // Optional: update UI with admin email
            const emailDisplay = document.getElementById("admin-user-email");
            if(emailDisplay) emailDisplay.textContent = user.email;
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
