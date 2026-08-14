import { auth, db } from './firebase-config.js';
import { 
    GoogleAuthProvider, 
    signInWithRedirect,
    getRedirectResult,
    RecaptchaVerifier, 
    signInWithPhoneNumber, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// --- STATE MANAGEMENT ---
onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById('nav-login-btn');
    const profileBtn = document.getElementById('nav-profile-btn');
    const logoutBtn = document.getElementById('nav-logout-btn');

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

// --- UI HELPER ---
function showAlert(msg, isError = true) {
    // Look for existing UI error elements
    const alertDiv = document.getElementById('auth-alert') || document.getElementById('auth-error');
    if (!alertDiv) return;
    if (msg) {
        alertDiv.innerText = msg;
        alertDiv.className = isError ? 'auth-alert error' : 'auth-alert success';
        alertDiv.style.display = 'block';
    } else {
        alertDiv.style.display = 'none';
    }
}

// --- GOOGLE LOGIN (MOBILE-FRIENDLY REDIRECT FLOW) ---
// 1. Process redirect result on page load
getRedirectResult(auth).then((result) => {
    if (result !== null) {
        // Successful Google login via redirect
        handlePostLoginRedirect();
    }
}).catch((error) => {
    showAlert(`Google Auth Error: ${error.code} - ${error.message}`);
    const googleBtn = document.getElementById('btn-google');
    if (googleBtn) {
        googleBtn.disabled = false;
        googleBtn.innerHTML = 'Continue with Google';
    }
});

// 2. Trigger Redirect flow
window.loginWithGoogle = function() {
    const provider = new GoogleAuthProvider();
    const googleBtn = document.getElementById('btn-google');
    
    if (googleBtn) {
        googleBtn.disabled = true;
        googleBtn.innerHTML = 'Connecting...';
    }
    
    // Preserve URL state in sessionStorage because the redirect will navigate away from the page
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect');
    const serviceParam = urlParams.get('service');
    
    if (redirectParam) sessionStorage.setItem('maa_redirect', redirectParam);
    if (serviceParam) sessionStorage.setItem('maa_service', serviceParam);
    
    // Initiate Firebase Redirect Flow
    signInWithRedirect(auth, provider);
};

// Bind to Google button if it exists
const googleBtn = document.getElementById('btn-google');
if (googleBtn) {
    googleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.loginWithGoogle();
    });
}

// --- PHONE OTP LOGIN ---
let confirmationResult = null;
let recaptchaVerifier = null;

const sendOtpBtn = document.getElementById('btn-send-otp');
const verifyOtpBtn = document.getElementById('btn-verify-otp');
const changeNumBtn = document.getElementById('btn-change-number');

if (sendOtpBtn) {
    sendOtpBtn.addEventListener('click', async () => {
        const phoneInput = document.getElementById('phone-number').value.replace(/\s+/g, '');
        let normalizedPhone = phoneInput;

        if (normalizedPhone.length === 10 && !normalizedPhone.startsWith('+')) {
            normalizedPhone = '+91' + normalizedPhone;
        }

        if (!/^\+91[0-9]{10}$/.test(normalizedPhone)) {
            showAlert("Please enter a valid 10-digit Indian mobile number.");
            return;
        }

        sendOtpBtn.disabled = true;
        sendOtpBtn.innerHTML = 'Sending...';
        showAlert("");

        try {
            if (!recaptchaVerifier) {
                recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 'size': 'invisible' });
            }
            
            confirmationResult = await signInWithPhoneNumber(auth, normalizedPhone, recaptchaVerifier);
            
            document.getElementById('phone-section').style.display = 'none';
            document.getElementById('otp-section').style.display = 'block';
            document.getElementById('otp-sent-msg').innerText = `OTP sent to ${normalizedPhone}`;
            
        } catch (error) {
            showAlert(`OTP Error: ${error.code} - ${error.message}`);
            sendOtpBtn.disabled = false;
            sendOtpBtn.innerHTML = 'Send OTP';
            if (recaptchaVerifier) {
                recaptchaVerifier.clear();
                recaptchaVerifier = null;
            }
        }
    });
}

if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener('click', async () => {
        const otpInput = document.getElementById('otp-code').value.trim();
        
        if (otpInput.length !== 6) {
            showAlert("Please enter a valid 6-digit OTP.");
            return;
        }

        verifyOtpBtn.disabled = true;
        verifyOtpBtn.innerHTML = 'Verifying...';
        showAlert("");

        try {
            await confirmationResult.confirm(otpInput);
            handlePostLoginRedirect();
        } catch (error) {
            showAlert(`Verification Error: ${error.code} - ${error.message}`);
            verifyOtpBtn.disabled = false;
            verifyOtpBtn.innerHTML = 'Verify OTP';
        }
    });
}

if (changeNumBtn) {
    changeNumBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('otp-section').style.display = 'none';
        document.getElementById('phone-section').style.display = 'block';
        sendOtpBtn.disabled = false;
        sendOtpBtn.innerHTML = 'Send OTP';
        showAlert("");
        if (recaptchaVerifier) {
            recaptchaVerifier.clear();
            recaptchaVerifier = null;
        }
    });
}

// --- REDIRECT SECURITY ---
function handlePostLoginRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Recover redirect targets either from current URL or from SessionStorage (if recovering from Google Redirect)
    let redirectParam = urlParams.get('redirect') || sessionStorage.getItem('maa_redirect');
    let serviceParam = urlParams.get('service') || sessionStorage.getItem('maa_service');

    // Clean up SessionStorage
    sessionStorage.removeItem('maa_redirect');
    sessionStorage.removeItem('maa_service');

    const allowedRoutes = ['apply.html', 'index.html', 'profile.html', 'track-application.html', 'service-details.html'];
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

// --- INITIALIZE SETTINGS ON LOGIN PAGE ---
document.addEventListener("DOMContentLoaded", async () => {
    const mobileSection = document.getElementById('mobile-auth-wrapper');
    if (!mobileSection) return;

    try {
        const settingsDoc = await getDoc(doc(db, "settings", "auth"));
        if (settingsDoc.exists() && settingsDoc.data().mobileOtpEnabled === true) {
            mobileSection.style.display = 'block';
        } else {
            mobileSection.style.display = 'none';
        }
    } catch (error) {
        console.warn("Could not load auth settings. Defaulting to Google Login only.");
        mobileSection.style.display = 'none';
    }
});

// --- GLOBAL LOGOUT (For Public Navbar) ---
window.customerLogout = async function() {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Logout failed.");
    }
}
