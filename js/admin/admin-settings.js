import { db } from './firebase-config.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const authSettingsRef = doc(db, "settings", "auth");

async function loadCurrentSettings() {
    try {
        const docSnap = await getDoc(authSettingsRef);
        if (docSnap.exists()) {
            const isEnabled = docSnap.data().mobileOtpEnabled;
            updateUI(isEnabled);
        } else {
            // Default initialization if document doesn't exist
            await setDoc(authSettingsRef, { mobileOtpEnabled: true }, { merge: true });
            updateUI(true);
        }
    } catch (error) {
        document.getElementById('settings-status').innerText = "Error loading settings. Check your permissions.";
    }
}

window.toggleOTP = async function(state) {
    document.getElementById('settings-status').innerText = "Saving...";
    try {
        await setDoc(authSettingsRef, { mobileOtpEnabled: state }, { merge: true });
        updateUI(state);
    } catch (error) {
        document.getElementById('settings-status').innerText = "Update failed. You may lack permission.";
    }
}

function updateUI(isEnabled) {
    const statusText = isEnabled ? "Currently ON (Customers can use Phone OTP)" : "Currently OFF (Google Login ONLY)";
    document.getElementById('settings-status').innerText = statusText;
    
    document.getElementById('btn-enable-otp').style.display = isEnabled ? 'none' : 'inline-block';
    document.getElementById('btn-disable-otp').style.display = isEnabled ? 'inline-block' : 'none';
}

document.addEventListener("DOMContentLoaded", () => {
    loadCurrentSettings();
});
