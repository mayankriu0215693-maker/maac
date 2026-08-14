import { auth } from './firebase-config.js';
import { 
    GoogleAuthProvider, 
    signInWithRedirect, 
    getRedirectResult,
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

// --- 1. PROCESS GOOGLE REDIRECT RESULT ---
getRedirectResult(auth).then((result) => {
    if (result !== null) {
        handlePostLoginRedirect();
    }
}).catch((error) => {
    console.error("Google Auth Error:", error.message);
    const errorDiv = document.getElementById('auth-error');
    if (errorDiv) {
        errorDiv.innerText = "Login Failed: " + error.message;
        errorDiv.classList.remove('hidden');
        errorDiv.style.display = 'block';
    }
});

// --- 2. TRIGGER GOOGLE SIGN-IN ---
window.loginWithGoogle = function() {
    const provider = new GoogleAuthProvider();
    
    // Save URL parameters safely before redirect
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect');
    const serviceParam = urlParams.get('service');
    
    if (redirectParam) sessionStorage.setItem('maa_redirect', redirectParam);
    if (serviceParam) sessionStorage.setItem('maa_service', serviceParam);
    
    // Start Redirect Authentication
    signInWithRedirect(auth, provider);
};

// Bind to Login Button securely
document.addEventListener('DOMContentLoaded', () => {
    const googleBtn = document.getElementById('btn-google-login') || document.querySelector('.btn-google');
    if (googleBtn && !googleBtn.onclick) {
        googleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.loginWithGoogle();
        });
    }
});

// --- 3. HANDLE REDIRECT AFTER SUCCESSFUL LOGIN ---
function handlePostLoginRedirect() {
    let redirectParam = sessionStorage.getItem('maa_redirect');
    let serviceParam = sessionStorage.getItem('maa_service');

    // Clean up temporary session storage
    sessionStorage.removeItem('maa_redirect');
    sessionStorage.removeItem('maa_service');

    // Whitelist to prevent open redirect vulnerabilities
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

// --- 4. GLOBAL AUTH STATE LISTENER (For Navbar/UI) ---
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

// --- 5. LOGOUT FUNCTION ---
window.customerLogout = async function() {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Logout failed:", error);
    }
};
