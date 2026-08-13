import { db } from "./firebase-config.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.getElementById("services-grid");
    const loading = document.getElementById("loading-state");
    const empty = document.getElementById("empty-state");

    try {
        const q = query(collection(db, "services"), where("active", "==", true));
        const querySnapshot = await getDocs(q);
        
        loading.classList.add("hidden");

        if (querySnapshot.empty) {
            empty.classList.remove("hidden");
            return;
        }

        grid.classList.remove("hidden");
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const fee = data.fee ? `₹${data.fee}` : "Fee info unavailable";
            const time = data.processingTime || "Standard processing";
            
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <h3>${data.name || 'Service'}</h3>
                <p class="text-muted">${data.shortDescription || ''}</p>
                <br>
                <p><strong>Fee:</strong> ${fee}</p>
                <p><strong>Time:</strong> ${time}</p>
                <br>
                <a href="service-details.html?id=${doc.id}" class="btn btn-outline">View Details</a>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        loading.innerHTML = `<span class="error-msg">Error loading services. Please check your connection.</span>`;
        console.error(error);
    }
});
