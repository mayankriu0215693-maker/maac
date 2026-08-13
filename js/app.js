import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const authLinks = document.querySelectorAll(".auth-link");
    const guestLinks = document.querySelectorAll(".guest-link");
    const logoutBtn = document.getElementById("logout-btn");

    onAuthStateChanged(auth, (user) => {
        if (user) {
            authLinks.forEach(el => el.classList.remove("hidden"));
            guestLinks.forEach(el => el.classList.add("hidden"));
        } else {
            authLinks.forEach(el => el.classList.add("hidden"));
            guestLinks.forEach(el => el.classList.remove("hidden"));
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            try {
                await signOut(auth);
                window.location.href = "login.html";
            } catch (error) {
                console.error("Logout failed:", error);
            }
        });
    }
});
