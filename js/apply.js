import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, collection, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { generateWhatsAppLink } from "./whatsapp.js";

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('id');
    let currentService = null;
    let currentUser = null;

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            document.getElementById("application-container").classList.remove("hidden");
            
            // Load service info for context
            if (serviceId) {
                const docSnap = await getDoc(doc(db, "services", serviceId));
                if (docSnap.exists()) {
                    currentService = docSnap.data();
                    document.getElementById("form-service-name").innerText = currentService.name;
                }
            }
        } else {
            document.getElementById("auth-warning").classList.remove("hidden");
        }
    });

    document.getElementById("apply-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("submit-btn");
        const errorDiv = document.getElementById("form-error");
        
        if (!currentUser || !currentService) return;

        btn.disabled = true;
        btn.innerText = "Submitting...";
        errorDiv.innerText = "";

        try {
            // Generate Acknowledgement Number (ME-2026-[6 chars time][3 random])
            const timeChunk = Date.now().toString().slice(-6);
            const randChunk = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            const ackNo = `ME-2026-${timeChunk}${randChunk}`;

            const appData = {
                userId: currentUser.uid, 
                acknowledgementNumber: ackNo,
                serviceId: serviceId,
                serviceName: currentService.name,
                customerName: document.getElementById("app-name").value,
                mobile: document.getElementById("app-mobile").value,
                email: currentUser.email,
                formData: {
                    details: document.getElementById("app-details").value
                },
                status: "Pending",
                paymentStatus: "Pending",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            // Using setDoc on a newly generated doc ID ensures we can embed the ID and respect rules
            const newAppRef = doc(collection(db, "applications"));
            appData.applicationId = newAppRef.id;

            await setDoc(newAppRef, appData);

            // Hide form, show success
            document.getElementById("apply-form").classList.add("hidden");
            const successBlock = document.getElementById("success-block");
            successBlock.classList.remove("hidden");
            
            document.getElementById("display-ack").innerText = ackNo;
            document.getElementById("whatsapp-btn").href = generateWhatsAppLink(appData);

        } catch (error) {
            console.error(error);
            errorDiv.innerText = "Submission failed. Please try again.";
            btn.disabled = false;
            btn.innerText = "Submit Application";
        }
    });
});
