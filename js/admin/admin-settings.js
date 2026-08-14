import { db } from './firebase-config.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const authSettingsRef = doc(db, "settings", "auth");

async function loadCurrentSettings() {
    const statusText = document.getElementById('settings-status');
    try {
        const docSnap = await getDoc(authSettingsRef);
        if (docSnap.exists()) {
            updateUI(docSnap.data().mobileOtpEnabled);
        } else {
            // Default safe-state creation
            await setDoc(authSettingsRef, { mobileOtpEnabled: false }, { merge: true });
            updateUI(false);
        }
    } catch (error) {
        statusText.innerText = "Error loading settings. Check admin permissions.";
        statusText.style.background = "#fdeaea";
        statusText.style.color = "#e74c3c";
    }
}

window.toggleOTP = async function(state) {
    const statusText = document.getElementById('settings-status');
    statusText.innerText = "Saving configuration...";
    statusText.style.background = "#f1f3f4";
    statusText.style.color = "#5f6368";
    
    try {
        // Safe write protected by Firestore Rules (Role == Admin)
        await setDoc(authSettingsRef, { mobileOtpEnabled: state }, { merge: true });
        updateUI(state);
    } catch (error) {
        statusText.innerText = "Update failed. You lack permission.";
        statusText.style.background = "#fdeaea";
        statusText.style.color = "#e74c3c";
    }
}

function updateUI(isEnabled) {
    const statusText = document.getElementById('settings-status');
    
    if (isEnabled) {
        statusText.innerText = "STATUS: ON (Customers can use Mobile OTP & Google)";
        statusText.style.background = "#eafaf1";
        statusText.style.color = "#27ae60";
    } else {
        statusText.innerText = "STATUS: OFF (Customers can ONLY use Google)";
        statusText.style.background = "#f1f3f4";
        statusText.style.color = "#5f6368";
    }
    
    document.getElementById('btn-enable-otp').style.display = isEnabled ? 'none' : 'inline-block';
    document.getElementById('btn-disable-otp').style.display = isEnabled ? 'inline-block' : 'none';
}

document.addEventListener("DOMContentLoaded", () => {
    loadCurrentSettings();
});
