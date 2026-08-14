import { auth, db } from '../firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// Determine if we are currently on the admin login page
const currentPath = window.location.pathname;
const isAdminLoginPage = currentPath.includes('/admin/login.html');

// --- 1. ADMIN AUTHORIZATION LISTENER ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            // Check Firestore for admin verification
            const adminDocRef = doc(db, "admins", user.uid);
            const adminDoc = await getDoc(adminDocRef);
            
            if (adminDoc.exists() && adminDoc.data().role === "admin" && adminDoc.data().active === true) {
                // Case C & D: Valid Admin
                if (isAdminLoginPage) {
                    window.location.href = 'index.html'; // Redirect to dashboard
                }
            } else {
                // Case B, E, F: User exists but is NOT an active admin
                throw new Error("Unauthorized");
            }
        } catch (error) {
            // Eject unauthorized users
            await signOut(auth);
            if (isAdminLoginPage) {
                showAdminError("You are not authorized to access the Admin Panel.");
            } else {
                window.location.href = 'login.html';
            }
        }
    } else {
        // Case A: No user logged in
        if (!isAdminLoginPage) {
            window.location.href = 'login.html';
        }
    }
});

// --- 2. ADMIN LOGIN LOGIC ---
window.adminLogin = async function() {
    const adminId = document.getElementById('admin-id').value.trim();
    const adminPwd = document.getElementById('admin-pwd').value;
    const btn = document.getElementById('btn-admin-login');

    if (!adminId || !adminPwd) {
        showAdminError("Please enter Admin ID and password.");
        return;
    }

    // Exact required mapping
    let loginEmail = "";
    if (adminId === "K0403488") {
        loginEmail = "mayankriu0.2156@gmail.com";
    } else {
        showAdminError("Invalid Admin ID or password.");
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Authenticating...';
    }

    try {
        await signInWithEmailAndPassword(auth, loginEmail, adminPwd);
        // Success -> The onAuthStateChanged listener will handle the redirect
    } catch (error) {
        console.error("Admin Login Error:", error.code, error.message);
        
        // Handle specific Firebase errors cleanly
        if (error.code === 'auth/too-many-requests') {
            showAdminError("Too many failed attempts. Please try again later.");
        } else if (error.code === 'auth/network-request-failed') {
            showAdminError("Network error. Please check your connection.");
        } else {
            showAdminError("Invalid Admin ID or password.");
        }

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Secure Login';
        }
    }
};

// Bind to button if onclick isn't inline
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-admin-login');
    if (btn && !btn.onclick) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.adminLogin();
        });
    }
});

// --- 3. ADMIN LOGOUT ---
window.adminLogout = async function() {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error("Admin logout failed:", error);
    }
};

function showAdminError(msg) {
    const errDiv = document.getElementById('admin-error') || document.getElementById('admin-alert');
    if (errDiv) {
        errDiv.innerText = msg;
        errDiv.style.display = 'block';
        errDiv.style.color = 'red';
    }
}
