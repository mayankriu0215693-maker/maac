import { auth, db } from './firebase-config.js';
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    RecaptchaVerifier, 
    signInWithPhoneNumber, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// --- CUSTOMER AUTH STATE ---
onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById('nav-login-btn');
    const profileBtn = document.getElementById('nav-profile-btn');
    const logoutBtn = document.getElementById('nav-logout-btn');

    // Display UI based on auth state (ignores admin/customer boundary for public UI components)
    if (user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (profileBtn) profileBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (profileBtn) profileBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
});

// --- GOOGLE LOGIN ---
window.loginWithGoogle = async function() {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        handlePostLoginRedirect();
    } catch (error) {
        if (error.code !== 'auth/popup-closed-by-user') {
            showError("Google login failed. Please try again.");
        }
    }
}

// --- PHONE OTP LOGIN ---
let confirmationResult = null;
let recaptchaVerifier = null;

window.sendOTP = async function() {
    const phoneInput = document.getElementById('phone-number').value.trim();
    let normalizedPhone = phoneInput;

    // Auto-format Indian numbers missing +91 if length is exactly 10
    if (normalizedPhone.length === 10 && !normalizedPhone.startsWith('+')) {
        normalizedPhone = '+91' + normalizedPhone;
    }

    const phoneRegex = /^\+91[0-9]{10}$/;
    if (!phoneRegex.test(normalizedPhone)) {
        showError("Please enter a valid 10-digit Indian mobile number (+91).");
        return;
    }

    try {
        if (!recaptchaVerifier) {
            recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible'
            });
        }
        
        confirmationResult = await signInWithPhoneNumber(auth, normalizedPhone, recaptchaVerifier);
        document.getElementById('otp-section').style.display = 'block';
        document.getElementById('phone-section').style.display = 'none';
        showError(""); 
    } catch (error) {
        showError("Failed to send OTP. Check network or try again.");
        if (recaptchaVerifier) {
            recaptchaVerifier.clear();
            recaptchaVerifier = null;
        }
    }
}

window.verifyOTP = async function() {
    const otpInput = document.getElementById('otp-code').value.trim();
    if (otpInput.length !== 6) {
        showError("Please enter a valid 6-digit OTP.");
        return;
    }

    try {
        await confirmationResult.confirm(otpInput);
        handlePostLoginRedirect();
    } catch (error) {
        showError("Invalid OTP. Please check and try again.");
    }
}

// --- REDIRECT HANDLING (Sanitized) ---
function handlePostLoginRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect');
    const serviceParam = urlParams.get('service');

    // Only allow known internal routes to prevent arbitrary redirects
    const allowedRoutes = ['apply.html', 'index.html', 'profile.html', 'track-application.html'];
    let safeRedirect = 'index.html';

    if (redirectParam && allowedRoutes.includes(redirectParam)) {
        safeRedirect = redirectParam;
    }

    if (serviceParam) {
        window.location.href = `${safeRedirect}?service=${encodeURIComponent(serviceParam)}`;
    } else {
        window.location.href = safeRedirect;
    }
}

window.customerLogout = async function() {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Logout failed.");
    }
}

function showError(msg) {
    const errDiv = document.getElementById('auth-error');
    if (errDiv) {
        errDiv.innerText = msg;
        errDiv.style.display = msg ? 'block' : 'none';
    }
}

// --- LOAD ADMIN SETTINGS (Fail-safe Default) ---
export async function loadAuthSettings() {
    const mobileSection = document.getElementById('mobile-auth-wrapper');
    if (!mobileSection) return;

    try {
        const settingsDoc = await getDoc(doc(db, "settings", "auth"));
        if (settingsDoc.exists() && settingsDoc.data().mobileOtpEnabled === true) {
            mobileSection.style.display = 'block';
        } else {
            // Document missing, undefined, or strictly false
            mobileSection.style.display = 'none';
        }
    } catch (error) {
        // Network error / permission failure defaults to Google Only
        console.warn("Could not load auth settings, defaulting to Google login only.");
        mobileSection.style.display = 'none';
    }
}
