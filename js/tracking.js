import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { generateWhatsAppLink, getStatusBadgeClass } from "./whatsapp.js";

function safeText(id, text) {
    const el = document.getElementById(id);
    if(el) el.textContent = text || "N/A";
}

document.addEventListener("DOMContentLoaded", () => {
    let currentUser = null;
    const btn = document.getElementById("track-btn");
    const warning = document.getElementById("auth-warning");

    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            btn.disabled = false;
            warning.classList.add("hidden");
        } else {
            currentUser = null;
            btn.disabled = true;
            warning.classList.remove("hidden");
        }
    });

    document.getElementById("track-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const ackInput = document.getElementById("track-ack").value.trim();
        const errorDiv = document.getElementById("track-error");
        const resultDiv = document.getElementById("track-result");
        
        btn.disabled = true; btn.textContent = "Searching...";
        errorDiv.classList.add("hidden"); resultDiv.classList.add("hidden");

        try {
            const q = query(
                collection(db, "applications"), 
                where("userId", "==", currentUser.uid),
                where("acknowledgementNumber", "==", ackInput)
            );
            
            const snap = await getDocs(q);
            
            if (snap.empty) {
                errorDiv.textContent = "Application not found. Ensure the number is correct and belongs to your account.";
                errorDiv.className = "alert alert-error";
            } else {
                const data = snap.docs[0].data();
                safeText("res-ack", data.acknowledgementNumber);
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

                document.getElementById("res-whatsapp").href = generateWhatsAppLink(data);
                resultDiv.classList.remove("hidden");
            }
        } catch (error) {
            errorDiv.textContent = "Error searching records: " + error.message;
            errorDiv.className = "alert alert-error";
        } finally {
            btn.disabled = false; btn.textContent = "Track Status";
        }
    });
});
