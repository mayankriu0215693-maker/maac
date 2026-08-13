import { db } from "../firebase-config.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { requireAdminAuth } from "./admin-auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    requireAdminAuth();
    
    const alertBox = document.getElementById("backend-alert");
    
    try {
        // Attempt to read services (Public read allows this under current rules)
        const sSnap = await getDocs(collection(db, "services"));
        document.getElementById("stat-services").innerText = sSnap.size;

        // Attempt to read applications globally (THIS WILL FAIL UNDER CURRENT RULES)
        const appSnap = await getDocs(collection(db, "applications"));
        document.getElementById("stat-total").innerText = appSnap.size;
        
        let pending = 0;
        appSnap.forEach(doc => {
            if(doc.data().status === 'Pending') pending++;
        });
        document.getElementById("stat-pending").innerText = pending;

    } catch (error) {
        if (error.code === 'permission-denied') {
            alertBox.classList.remove("hidden");
        } else {
            console.error("Dashboard error:", error);
        }
    }
});
