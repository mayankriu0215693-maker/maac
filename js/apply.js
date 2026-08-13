import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, collection, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { generateWhatsAppLink } from "./whatsapp.js";

function safeText(id, text) {
    const el = document.getElementById(id);
    if(el) el.textContent = text;
}

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('id');
    let currentService = null;
    let currentUser = null;

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            document.getElementById("application-container").classList.remove("hidden");
            if (serviceId) {
                try {
                    const docSnap = await getDoc(doc(db, "services", serviceId));
                    if (docSnap.exists()) {
                        currentService = docSnap.data();
                        safeText("form-service-name", currentService.name || "Selected Service");
                    } else {
                        safeText("form-service-name", "Unknown Service");
                    }
                } catch(e) {
                    safeText("form-service-name", "Service (Error loading name)");
                }
            } else {
                safeText("form-service-name", "General Application");
            }
        } else {
            document.getElementById("auth-warning").classList.remove("hidden");
            document.getElementById("login-redirect-btn").href = `login.html?redirect=apply.html?id=${serviceId || ''}`;
        }
    });

    document.getElementById("apply-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("submit-btn");
        const errorDiv = document.getElementById("form-error");
        
        if (!currentUser) return;
        btn.disabled = true; btn.textContent = "Submitting Securely..."; errorDiv.className = "hidden";

        try {
            const timeChunk = Date.now().toString().slice(-6);
            const randChunk = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            const ackNo = `ME-2026-${timeChunk}${randChunk}`;

            const serviceName = currentService ? currentService.name : "General Application";

            const appData = {
                userId: currentUser.uid, 
                acknowledgementNumber: ackNo,
                serviceId: serviceId || "none",
                serviceName: serviceName,
                customerName: document.getElementById("app-name").value.trim(),
                mobile: document.getElementById("app-mobile").value.trim(),
                email: currentUser.email,
                formData: {
                    details: document.getElementById("app-details").value.trim()
                },
                status: "Pending",
                paymentStatus: "Pending",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const newAppRef = doc(collection(db, "applications"));
            appData.applicationId = newAppRef.id;

            await setDoc(newAppRef, appData);

            document.getElementById("apply-form").classList.add("hidden");
            document.getElementById("success-block").classList.remove("hidden");
            safeText("display-ack", ackNo);
            document.getElementById("whatsapp-btn").href = generateWhatsAppLink(appData);
            window.scrollTo(0, 0);

        } catch (error) {
            errorDiv.textContent = "Submission failed: " + error.message;
            errorDiv.className = "alert alert-error";
            btn.disabled = false; btn.textContent = "Submit Application";
        }
    });
});
