import { db } from "./firebase-config.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.getElementById("services-grid");
    const loading = document.getElementById("loading-state");
    const empty = document.getElementById("empty-state");

    try {
        const q = query(collection(db, "services"));
        const snap = await getDocs(q);
        
        loading.classList.add("hidden");

        // Filter active client-side in case index for where("active", "==", true) is missing
        let hasActive = false;

        snap.forEach((docSnap) => {
            const data = docSnap.data();
            if(data.active === false) return;
            hasActive = true;
            
            const feeText = data.fee ? `₹${data.fee}` : "Contact for fee";
            const timeText = data.processingTime || "Standard";
            
            const card = document.createElement("div");
            card.className = "card";
            
            const title = document.createElement("h3");
            title.textContent = data.name || "Service";
            
            const desc = document.createElement("p");
            desc.className = "text-muted";
            desc.textContent = data.shortDescription || data.description || "";
            
            const br1 = document.createElement("br");
            
            const feeP = document.createElement("p");
            feeP.innerHTML = `<strong>Fee:</strong> ${feeText}`;
            
            const timeP = document.createElement("p");
            timeP.innerHTML = `<strong>Time:</strong> ${timeText}`;
            
            const br2 = document.createElement("br");
            
            const link = document.createElement("a");
            link.className = "btn btn-outline";
            link.href = `apply.html?id=${docSnap.id}`;
            link.textContent = "Apply Now";
            
            card.append(title, desc, br1, feeP, timeP, br2, link);
            grid.appendChild(card);
        });

        if (!hasActive) {
            empty.classList.remove("hidden");
        } else {
            grid.classList.remove("hidden");
        }

    } catch (error) {
        loading.innerHTML = `<div class="alert alert-error">Error loading services: ${error.message}</div>`;
        console.error(error);
    }
});
