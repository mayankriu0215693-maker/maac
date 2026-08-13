import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

function safeText(id, text) {
    const el = document.getElementById(id);
    if(el) el.textContent = text || "Not available";
}

document.addEventListener("DOMContentLoaded", () => {
    const loading = document.getElementById("loading-state");
    const card = document.getElementById("profile-card");
    const errorDiv = document.getElementById("profile-error");

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                
                loading.classList.add("hidden");
                card.classList.remove("hidden");

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    safeText("prof-name", data.name);
                    safeText("prof-email", data.email || user.email);
                    if (data.createdAt && typeof data.createdAt.toDate === 'function') {
                        safeText("prof-date", data.createdAt.toDate().toLocaleDateString());
                    }
                } else {
                    safeText("prof-email", user.email);
                    errorDiv.textContent = "Profile details not found in database.";
                    errorDiv.className = "alert alert-warning";
                }
            } catch (error) {
                loading.classList.add("hidden");
                errorDiv.textContent = "Error loading profile data: " + error.message;
                errorDiv.className = "alert alert-error";
            }
        } else {
            window.location.href = "login.html";
        }
    });
});
