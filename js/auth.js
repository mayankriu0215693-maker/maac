// js/auth.js
import { auth, db } from './firebase-config.js';
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- 1. GOOGLE POPUP LOGIN ---
export async function loginWithGoogle() {
    const alertBox = document.getElementById('auth-alert');
    const googleBtn = document.getElementById('btn-google');

    if (alertBox) {
        alertBox.style.display = 'none';
        alertBox.textContent = '';
    }
    if (googleBtn) {
        googleBtn.disabled = true;
    }

    try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Sync user with Firestore 'users' collection
        try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    name: user.displayName || "Customer",
                    email: user.email,
                    photoURL: user.photoURL || "",
                    createdAt: new Date()
                }, { merge: true });
            }
        } catch (dbErr) {
            console.warn("Firestore user sync warning:", dbErr.message);
        }

        handlePostLoginRedirect();
    } catch (error) {
        console.error("Google Auth Error:", error);
        if (alertBox) {
            alertBox.textContent = "Login Failed: " + (error.message || "Unknown error");
            alertBox.style.display = 'block';
        }
    } finally {
        if (googleBtn) {
            googleBtn.disabled = false;
        }
    }
}

window.loginWithGoogle = loginWithGoogle;

// Bind Button Click
document.addEventListener('DOMContentLoaded', () => {
    const googleBtn = document.getElementById('btn-google') || document.querySelector('.btn-google');
    if (googleBtn) {
        googleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginWithGoogle();
        });
    }
});

// --- 2. POST LOGIN REDIRECT ---
function handlePostLoginRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect');
    const serviceParam = urlParams.get('service') || urlParams.get('id');

    const allowedRoutes = ['apply.html', 'index.html', 'profile.html', 'track-application.html', 'service-details.html', 'applications.html'];
    let safeRedirect = 'index.html';

    if (redirectParam && allowedRoutes.some(r => redirectParam.includes(r))) {
        safeRedirect = redirectParam;
    }

    if (serviceParam && !safeRedirect.includes('?')) {
        window.location.href = `${safeRedirect}?id=${encodeURIComponent(serviceParam)}`;
    } else {
        window.location.href = safeRedirect;
    }
}

// --- 3. GLOBAL NAV AUTH STATE LISTENER ---
onAuthStateChanged(auth, (user) => {
    const loginNav = document.getElementById('nav-login');
    const profileNav = document.getElementById('nav-profile');
    const myAppsNav = document.getElementById('nav-my-apps');

    if (user) {
        if (loginNav) loginNav.classList.add('hidden');
        if (profileNav) profileNav.classList.remove('hidden');
        if (myAppsNav) myAppsNav.classList.remove('hidden');
    } else {
        if (loginNav) loginNav.classList.remove('hidden');
        if (profileNav) profileNav.classList.add('hidden');
        if (myAppsNav) myAppsNav.classList.add('hidden');
    }
});

// --- 4. CUSTOMER LOGOUT ---
export async function customerLogout() {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Logout failed:", error);
    }
}
window.customerLogout = customerLogout;
