import { auth } from './firebase-config.js';
import { 
    GoogleAuthProvider, 
    signInWithRedirect, 
    getRedirectResult,
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

// --- UI ERROR HELPER ---
function showError(message) {
    const errorDiv = document.getElementById('auth-error') || document.getElementById('auth-alert');
    if (errorDiv) {
        errorDiv.innerText = message;
        errorDiv.style.display = message ? 'block' : 'none';
        errorDiv.style.color = 'red';
    }
    console.error("Auth Error:", message);
}

// --- GOOGLE LOGIN WITH REDIRECT ---
// 1. Process the result when Google redirects back to the website
getRedirectResult(auth).then((result) => {
    if (result !== null) {
        // Successful login
        handlePostLoginRedirect();
    }
}).catch((error) => {
    showError(`Login Failed: ${error.message} (${error.code})`);
});

// 2. Trigger the redirect flow
window.loginWithGoogle = function() {
    const provider = new GoogleAuthProvider();
    
    // Save state before leaving the page
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect');
    const serviceParam = urlParams.get('service');
    
    if (redirectParam) sessionStorage.setItem('maa_redirect', redirectParam);
    if (serviceParam) sessionStorage.setItem('maa_service', serviceParam);
    
    // Disable button to prevent double-clicks
    const btn = document.getElementById('btn-google') || document.querySelector('.btn-google');
    if (btn) btn.innerHTML = 'Connecting to Google...';

    // Start redirect
    signInWithRedirect(auth, provider);
};

// Bind to button if onclick isn't inline
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-google') || document.querySelector('.btn-google');
    if (btn && !btn.onclick) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.loginWithGoogle();
        });
    }
});

// --- SAFE REDIRECT ROUTING ---
function handlePostLoginRedirect() {
    // Retrieve state from URL or SessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    let redirectParam = urlParams.get('redirect') || sessionStorage.getItem('maa_redirect');
    let serviceParam = urlParams.get('service') || sessionStorage.getItem('maa_service');

    // Clean up
    sessionStorage.removeItem('maa_redirect');
    sessionStorage.removeItem('maa_service');

    // Whitelist allowed routes
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

// --- GENERAL AUTH STATE (Navbar/Logout) ---
onAuthStateChanged(auth, (user) => {
    // Only update UI if these elements exist on the current page
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

window.customerLogout = async function() {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Logout failed:", error);
    }
};
