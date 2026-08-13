import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { generateWhatsAppLink, getStatusBadgeClass } from "./whatsapp.js";

function safeText(id, text) {
    const el = document.getElementById(id);
    if(el) el.textContent = text || "N/A";
}

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("track-btn");
    
    document.getElementById("track-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const ackInput = document.getElementById("track-ack").value.trim();
        const errorDiv = document.getElementById("track-error");
        const resultDiv = document.getElementById("track-result");
        
        btn.disabled = true; btn.textContent = "Searching...";
        errorDiv.classList.add("hidden"); resultDiv.classList.add("hidden");

        try {
            // Architecture: We read from a publicTracking collection designed specifically 
            // for safe public exposure without full PII. 
            const docRef = doc(db, "publicTracking", ackInput);
            const snap = await getDoc(docRef);
            
            if (!snap.exists()) {
                errorDiv.textContent = "Application not found. Ensure the Acknowledgement Number is correct.";
                errorDiv.className = "alert alert-error";
            } else {
                const data = snap.data();
                safeText("res-ack", ackInput);
                safeText("res-service", data.serviceName);
                
                const dateStr = (data.createdAt && typeof data.createdAt.toDate === 'function') 
                    ? data.createdAt.toDate().toLocaleDateString() : "N/A";
                safeText("res-date", "Submitted: " + dateStr);
                
                const statusEl = document.getElementById("res-status");
                statusEl.textContent = data.status || "Pending";
                statusEl.className = "badge " + getStatusBadgeClass(data.status);

                const payEl = document.getElementById("res-payment");
                payEl.textContent = data.paymentStatus || "Pending";
                payEl.className = "badge " + getStatusBadgeClass(data.paymentStatus);

                resultDiv.classList.remove("hidden");
            }
        } catch (error) {
            // If the backend has not yet created the publicTracking collection or rules block it
            if (error.code === 'permission-denied') {
                errorDiv.textContent = "Tracking system requires backend authorization setup by the administrator. Please check back later.";
            } else {
                errorDiv.textContent = "Error searching records: " + error.message;
            }
            errorDiv.className = "alert alert-error";
        } finally {
            btn.disabled = false; btn.textContent = "Track Status";
        }
    });
});
