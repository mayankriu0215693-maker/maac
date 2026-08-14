import { auth } from './firebase-config.js';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const provider = new GoogleAuthProvider();

// 1. Handle the return from Google Auth
getRedirectResult(auth).then((result) => {
    if (result && result.user) {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectPage = urlParams.get('redirect') || 'index.html';
        
        // Prevent open redirect vulnerabilities
        const allowedRedirects = ['apply.html', 'index.html', 'profile.html', 'track-application.html', 'service-details.html'];
        
        if (allowedRedirects.includes(redirectPage)) {
            let finalUrl = redirectPage;
            const serviceParam = urlParams.get('service');
            if (serviceParam) finalUrl += `?service=${serviceParam}`;
            window.location.href = finalUrl;
        } else {
            window.location.href = 'index.html';
        }
    }
}).catch((error) => {
    console.error("Google Auth Error:", error.code, error.message);
    const errorMsgElement = document.getElementById('login-error-message'); // Ensure this ID exists in your HTML
    if (errorMsgElement) {
        if (error.code === 'auth/unauthorized-domain') {
            errorMsgElement.innerText = "Domain not authorized. Please check Firebase Console.";
        } else if (error.code === 'auth/popup-blocked') {
            errorMsgElement.innerText = "Sign-in popup blocked by browser.";
        } else {
            errorMsgElement.innerText = "Authentication failed. Please try again.";
        }
    }
});

// 2. Trigger Google Login
const googleLoginBtn = document.getElementById('google-login-btn'); // Ensure this ID matches your HTML
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
        signInWithRedirect(auth, provider);
    });
}
