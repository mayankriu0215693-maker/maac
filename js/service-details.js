import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('id');

    if (!serviceId) {
        document.getElementById("loading-state").innerText = "Service not found.";
        return;
    }

    try {
        const docRef = doc(db, "services", serviceId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            document.getElementById("s-name").innerText = data.name || 'Service';
            document.getElementById("s-desc").innerText = data.description || '';
            document.getElementById("s-fee").innerText = data.fee ? `₹${data.fee}` : 'Unavailable';
            document.getElementById("s-time").innerText = data.processingTime || 'Standard';
            
            const docsList = document.getElementById("s-docs");
            if (data.requiredDocuments && data.requiredDocuments.length > 0) {
                data.requiredDocuments.forEach(docText => {
                    const li = document.createElement("li");
                    li.innerText = docText;
                    docsList.appendChild(li);
                });
            } else {
                docsList.innerHTML = "<li>No specific documents listed.</li>";
            }

            document.getElementById("apply-btn").href = `apply.html?id=${docSnap.id}`;
            document.getElementById("loading-state").classList.add("hidden");
            document.getElementById("details-card").classList.remove("hidden");
        } else {
            document.getElementById("loading-state").innerText = "Service does not exist.";
        }
    } catch (error) {
        console.error(error);
        document.getElementById("loading-state").innerText = "Error loading details.";
    }
});
