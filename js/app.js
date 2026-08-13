import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const authLinks = document.querySelectorAll(".auth-link");
    const guestLinks = document.querySelectorAll(".guest-link");
    const logoutBtns = document.querySelectorAll(".logout-btn");
    const profilePic = document.getElementById("nav-profile-pic");

    onAuthStateChanged(auth, (user) => {
        if (user) {
            authLinks.forEach(el => el.classList.remove("hidden"));
            guestLinks.forEach(el => el.classList.add("hidden"));
            if (profilePic && user.photoURL) {
                profilePic.src = user.photoURL;
                profilePic.classList.remove("hidden");
            }
        } else {
            authLinks.forEach(el => el.classList.add("hidden"));
            guestLinks.forEach(el => el.classList.remove("hidden"));
            if (profilePic) profilePic.classList.add("hidden");
        }
    });

    logoutBtns.forEach(btn => {
        btn.addEventListener("click", async (e) => {
            e.preventDefault();
            try {
                await signOut(auth);
                window.location.href = "index.html";
            } catch (error) {
                console.error("Logout error:", error);
            }
        });
    });
});
