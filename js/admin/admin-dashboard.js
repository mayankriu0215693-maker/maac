import { db } from "../firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { requireAdminAuth } from "./admin-auth.js";

function safeText(id, text) {
    const el = document.getElementById(id);
    if(el) el.textContent = text;
}

document.addEventListener("DOMContentLoaded", async () => {
    requireAdminAuth();
    const alertBox = document.getElementById("backend-alert");
    
    try {
        const sSnap = await getDocs(collection(db, "services"));
        safeText("stat-services", sSnap.size.toString());
    } catch(e) {
        safeText("stat-services", "Denied");
    }

    try {
        // This will throw permission-denied under existing rules
        const appSnap = await getDocs(collection(db, "applications"));
        safeText("stat-total", appSnap.size.toString());
        
        let pending = 0;
        appSnap.forEach(doc => {
            if(doc.data().status === 'Pending') pending++;
        });
        safeText("stat-pending", pending.toString());
    } catch (error) {
        if (error.code === 'permission-denied') {
            alertBox.className = "alert alert-error";
            alertBox.textContent = "Backend Authorization Required: Current Firestore rules prevent admin dashboard reads. Fix rules to view global stats.";
        }
    }
});
