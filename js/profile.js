import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const loading = document.getElementById("loading-state");
    const card = document.getElementById("profile-card");
    const errorDiv = document.getElementById("profile-error");

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                // Rule: read own user doc
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                
                loading.classList.add("hidden");
                card.classList.remove("hidden");

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    document.getElementById("prof-name").textContent = data.name || "Not provided";
                    document.getElementById("prof-email").textContent = data.email || user.email;
                    
                    if (data.createdAt) {
                        document.getElementById("prof-date").textContent = data.createdAt.toDate().toLocaleDateString();
                    }
                } else {
                    document.getElementById("prof-email").textContent = user.email;
                    errorDiv.textContent = "Profile details not found in database.";
                    errorDiv.classList.remove("hidden");
                }
            } catch (error) {
                loading.classList.add("hidden");
                card.classList.remove("hidden");
                errorDiv.textContent = "Error loading profile data. " + error.message;
                errorDiv.classList.remove("hidden");
            }
        } else {
            window.location.href = "login.html";
        }
    });

    document.getElementById("logout-btn-profile").addEventListener("click", async (e) => {
        e.preventDefault();
        await signOut(auth);
        window.location.href = "login.html";
    });
});
