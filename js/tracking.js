import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { generateWhatsAppLink } from "./whatsapp.js";

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
        
        btn.disabled = true;
        btn.innerText = "Searching...";
        errorDiv.classList.add("hidden");
        resultDiv.classList.add("hidden");

        try {
            // Secure Query: Enforce rules where userId == current Auth UID
            const q = query(
                collection(db, "applications"), 
                where("userId", "==", currentUser.uid),
                where("acknowledgementNumber", "==", ackInput)
            );
            
            const snap = await getDocs(q);
            
            if (snap.empty) {
                errorDiv.innerText = "Application not found. Ensure the number is correct and belongs to this account.";
                errorDiv.classList.remove("hidden");
            } else {
                const data = snap.docs[0].data();
                document.getElementById("res-ack").innerText = data.acknowledgementNumber;
                document.getElementById("res-service").innerText = data.serviceName;
                document.getElementById("res-date").innerText = "Submitted: " + (data.createdAt ? data.createdAt.toDate().toLocaleDateString() : "N/A");
                
                const statusBadge = document.getElementById("res-status");
                statusBadge.innerText = data.status;
                statusBadge.className = `badge badge-${data.status.toLowerCase()}`;

                const payBadge = document.getElementById("res-payment");
                payBadge.innerText = data.paymentStatus;
                payBadge.className = `badge badge-${data.paymentStatus.toLowerCase()}`;

                document.getElementById("res-whatsapp").href = generateWhatsAppLink(data);
                
                resultDiv.classList.remove("hidden");
            }
        } catch (error) {
            console.error(error);
            errorDiv.innerText = "Error searching records. " + error.message;
            errorDiv.classList.remove("hidden");
        } finally {
            btn.disabled = false;
            btn.innerText = "Track Status";
        }
    });
});
