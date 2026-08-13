import { db } from "./firebase-config.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
    const list = document.getElementById("faq-list");
    const loading = document.getElementById("loading-state");
    const staticFaq = document.getElementById("static-faq");
    const errorBox = document.getElementById("faq-error");

    try {
        const q = query(collection(db, "faqs")); 
        const snap = await getDocs(q);
        loading.classList.add("hidden");

        if (snap.empty) {
            staticFaq.classList.remove("hidden");
            return;
        }

        list.classList.remove("hidden");
        snap.forEach((docSnap) => {
            const data = docSnap.data();
            const card = document.createElement("div");
            card.className = "card";
            
            const qEl = document.createElement("h3");
            qEl.textContent = data.question || "FAQ";
            
            const aEl = document.createElement("p");
            aEl.className = "text-muted";
            aEl.style.marginTop = "8px";
            aEl.textContent = data.answer || "";
            
            card.appendChild(qEl);
            card.appendChild(aEl);
            list.appendChild(card);
        });
    } catch (error) {
        loading.classList.add("hidden");
        staticFaq.classList.remove("hidden");
        if (error.code !== 'permission-denied') {
            errorBox.textContent = "Could not sync live FAQs. Displaying standard guidelines. (" + error.message + ")";
            errorBox.className = "alert alert-warning";
        }
    }
});
