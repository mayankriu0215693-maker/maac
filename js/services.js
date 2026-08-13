import { db } from "./firebase-config.js";
import { collection, getDocs, query } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { escapeHTML } from "./whatsapp.js";

document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.getElementById("services-grid");
    const loading = document.getElementById("loading-state");
    const empty = document.getElementById("empty-state");

    try {
        const q = query(collection(db, "services"));
        const snap = await getDocs(q);
        
        loading.classList.add("hidden");

        let hasActive = false;

        snap.forEach((docSnap) => {
            const data = docSnap.data();
            if(data.active === false) return;
            hasActive = true;
            
            const feeText = data.fee ? `₹${escapeHTML(data.fee.toString())}` : "Contact for fee";
            const timeText = escapeHTML(data.processingTime || "Standard Processing");
            const nameText = escapeHTML(data.name || "Service");
            const descText = escapeHTML(data.shortDescription || data.description || "");
            
            const card = document.createElement("div");
            card.className = "card";
            
            const title = document.createElement("h3");
            title.textContent = nameText;
            title.style.marginBottom = "12px";
            
            const desc = document.createElement("p");
            desc.className = "text-muted";
            desc.textContent = descText;
            desc.style.marginBottom = "16px";
            
            const infoDiv = document.createElement("div");
            infoDiv.style.marginBottom = "24px";
            infoDiv.style.background = "#f1f5f9";
            infoDiv.style.padding = "12px";
            infoDiv.style.borderRadius = "8px";
            
            const feeP = document.createElement("div");
            feeP.innerHTML = `<strong>Service Fee:</strong> ${feeText}`;
            feeP.style.marginBottom = "8px";
            
            const timeP = document.createElement("div");
            timeP.innerHTML = `<strong>Estimated Time:</strong> ${timeText}`;
            
            infoDiv.append(feeP, timeP);
            
            const link = document.createElement("a");
            link.className = "btn btn-outline";
            link.style.width = "100%";
            link.href = `apply.html?id=${encodeURIComponent(docSnap.id)}`;
            link.textContent = "Apply Securely";
            
            card.append(title, desc, infoDiv, link);
            grid.appendChild(card);
        });

        if (!hasActive) {
            empty.classList.remove("hidden");
        } else {
            grid.classList.remove("hidden");
        }

    } catch (error) {
        loading.innerHTML = `<div class="alert alert-error">Error loading services: ${escapeHTML(error.message)}</div>`;
    }
});
