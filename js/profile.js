// js/profile.js
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

function safeText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text || "Not available";
}

document.addEventListener("DOMContentLoaded", () => {
    const loading = document.getElementById("loading-state");
    const card = document.getElementById("profile-card");
    const errorDiv = document.getElementById("profile-error");
    const profileImg = document.getElementById("prof-img");

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            if (profileImg && user.photoURL) {
                profileImg.src = user.photoURL;
                profileImg.classList.remove("hidden");
            }
            
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                
                if (loading) loading.classList.add("hidden");
                if (card) card.classList.remove("hidden");
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    safeText("prof-name", data.name || user.displayName || "Customer");
                    safeText("prof-email", data.email || user.email);
                    if (data.createdAt && typeof data.createdAt.toDate === 'function') {
                        safeText("prof-date", data.createdAt.toDate().toLocaleDateString());
                    } else if (user.metadata?.creationTime) {
                        safeText("prof-date", new Date(user.metadata.creationTime).toLocaleDateString());
                    }
                } else {
                    safeText("prof-name", user.displayName || "Customer");
                    safeText("prof-email", user.email);
                    if (user.metadata?.creationTime) {
                        safeText("prof-date", new Date(user.metadata.creationTime).toLocaleDateString());
                    }
                }
            } catch (error) {
                if (loading) loading.classList.add("hidden");
                if (errorDiv) {
                    errorDiv.textContent = "Error loading profile: " + error.message;
                    errorDiv.className = "alert alert-error";
                    errorDiv.classList.remove("hidden");
                }
            }
        } else {
            window.location.href = "login.html?redirect=profile.html";
        }
    });

    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            await signOut(auth);
            window.location.href = 'index.html';
        });
    });
});
