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
            // Initialize document safely if not found
            await setDoc(authSettingsRef, { mobileOtpEnabled: false }, { merge: true });
            updateUI(false);
        }
    } catch (error) {
        statusText.innerText = "Error loading settings. Check your permissions.";
    }
}

window.toggleOTP = async function(state) {
    const statusText = document.getElementById('settings-status');
    statusText.innerText = "Saving update...";
    
    try {
        // Enforced securely by Firestore rules via the caller's Admin Token
        await setDoc(authSettingsRef, { mobileOtpEnabled: state }, { merge: true });
        updateUI(state);
    } catch (error) {
        statusText.innerText = "Update failed. You may lack permission.";
    }
}

function updateUI(isEnabled) {
    const statusText = document.getElementById('settings-status');
    statusText.innerText = isEnabled 
        ? "Currently ON (Customers can use Phone OTP)" 
        : "Currently OFF (Google Login ONLY)";
    
    document.getElementById('btn-enable-otp').style.display = isEnabled ? 'none' : 'inline-block';
    document.getElementById('btn-disable-otp').style.display = isEnabled ? 'inline-block' : 'none';
}

document.addEventListener("DOMContentLoaded", () => {
    loadCurrentSettings();
});
