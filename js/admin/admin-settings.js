import { db } from "../firebase-config.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { requireAdminAuth } from "./admin-auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    requireAdminAuth();
    
    const alertBox = document.getElementById("backend-alert");
    const form = document.getElementById("settings-form");
    const btn = document.getElementById("save-btn");
    
    try {
        const docSnap = await getDoc(doc(db, "settings", "general"));
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById("set-name").value = data.businessName || "";
            document.getElementById("set-phone").value = data.phone || "";
            document.getElementById("set-address").value = data.address || "";
        }
    } catch (error) {
        if(error.code === 'permission-denied') {
            alertBox.textContent = "Cannot read settings: Permission denied.";
        } else {
            alertBox.textContent = "Error: " + error.message;
        }
        alertBox.className = "alert alert-warning";
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        btn.disabled = true; btn.textContent = "Saving...";
        alertBox.className = "hidden";
        
        try {
            await setDoc(doc(db, "settings", "general"), {
                businessName: document.getElementById("set-name").value,
                phone: document.getElementById("set-phone").value,
                address: document.getElementById("set-address").value
            }, { merge: true });
            
            alert("Settings saved successfully.");
        } catch (error) {
            if (error.code === 'permission-denied') {
                alertBox.textContent = "Permission Denied: Cannot update settings under current rules.";
                alertBox.className = "alert alert-error";
            } else {
                alertBox.textContent = "Error: " + error.message;
                alertBox.className = "alert alert-error";
            }
        } finally {
            btn.disabled = false; btn.textContent = "Save Settings";
        }
    });
});
