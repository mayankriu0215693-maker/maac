import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
    const list = document.getElementById("faq-list");
    const loading = document.getElementById("loading-state");
    const errorBox = document.getElementById("faq-error");
    const staticFaq = document.getElementById("static-faq");

    try {
        const querySnapshot = await getDocs(collection(db, "faqs"));
        loading.classList.add("hidden");

        if (querySnapshot.empty) {
            staticFaq.classList.remove("hidden"); // Show static fallback if empty
            return;
        }

        list.classList.remove("hidden");
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <h3>${data.question}</h3>
                <p class="text-muted" style="margin-top: 8px;">${data.answer}</p>
            `;
            list.appendChild(card);
        });
    } catch (error) {
        loading.classList.add("hidden");
        staticFaq.classList.remove("hidden"); // Show fallback
        
        if (error.code === 'permission-denied') {
            console.warn("Backend rules currently deny reading FAQs. Displaying static fallback.");
        } else {
            errorBox.textContent = "Error loading FAQs: " + error.message;
            errorBox.classList.remove("hidden");
        }
    }
});
