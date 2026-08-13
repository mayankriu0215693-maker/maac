import { auth, db } from "./firebase-config.js";
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const loginBtn = document.getElementById("google-login-btn");
const errDiv = document.getElementById("auth-error");

function safeText(id, text) {
    const el = document.getElementById(id);
    if(el) el.textContent = text;
}

if (loginBtn) {
    loginBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        loginBtn.disabled = true;
        safeText("btn-text", "Connecting securely...");
        errDiv.className = "hidden";
        
        const provider = new GoogleAuthProvider();
        
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Securely create/update user document
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            
            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    uid: user.uid,
                    name: user.displayName || "Customer",
                    email: user.email,
                    photoURL: user.photoURL || "",
                    createdAt: serverTimestamp()
                });
            }

            // Redirect to intended page or home
            const urlParams = new URLSearchParams(window.location.search);
            const redirect = urlParams.get('redirect') || 'index.html';
            window.location.href = redirect;
            
        } catch (error) {
            errDiv.className = "alert alert-error";
            let msg = "Authentication failed. Please try again.";
            if (error.code === 'auth/popup-closed-by-user') {
                msg = "Login popup was closed before completion.";
            } else if (error.code === 'auth/popup-blocked') {
                msg = "Login popup blocked by your browser. Please allow popups.";
            } else if (error.code === 'auth/network-request-failed') {
                msg = "Network error. Please check your internet connection.";
            }
            safeText("auth-error", msg);
            loginBtn.disabled = false;
            safeText("btn-text", "Continue with Google");
        }
    });
}
