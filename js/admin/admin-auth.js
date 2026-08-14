import { auth, db } from '../firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const currentPath = window.location.pathname;
const isAdminLoginPage = currentPath.includes('login.html');

// --- 1. ADMIN AUTHORIZATION & SECURITY GUARD ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            // Strictly check Firestore for proper authorization
            const adminDocRef = doc(db, "admins", user.uid);
            const adminDoc = await getDoc(adminDocRef);

            if (adminDoc.exists() && adminDoc.data().role === "admin" && adminDoc.data().active === true) {
                // Authorized Admin
                if (isAdminLoginPage) {
                    window.location.href = 'index.html'; // Go to Dashboard
                } else {
                    const emailDisplay = document.getElementById('admin-user-email');
                    if (emailDisplay) emailDisplay.innerText = "Secure Admin Authorized";
                }
            } else {
                // FAILED: Not an admin (e.g. Normal Google User)
                throw new Error("Unauthorized");
            }
        } catch (error) {
            // Reject and Kick out unauthorized users safely
            await signOut(auth);
            if (!isAdminLoginPage) {
                window.location.href = 'login.html';
            } else {
                showError("Access Denied: You do not have admin privileges.");
            }
        }
    } else {
        // No user logged in
        if (!isAdminLoginPage) {
            window.location.href = 'login.html';
        }
    }
});

// --- 2. ADMIN SECURE LOGIN LOGIC ---
const loginForm = document.getElementById('admin-login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const adminId = document.getElementById('admin-id').value.trim();
        const adminPwd = document.getElementById('admin-pass').value;
        const btn = document.getElementById('login-btn');

        if (!adminId || !adminPwd) {
            showError("Please enter Admin ID and password.");
            return;
        }

        // MAP ID SECURELY (e.g., K0403488 becomes K0403488@admin.maa-enterprises.com)
        // Never exposes personal email or password in frontend source code.
        const loginEmail = adminId.includes('@') ? adminId : `${adminId}@admin.maa-enterprises.com`;

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = 'Authenticating...';
        }

        try {
            await signInWithEmailAndPassword(auth, loginEmail, adminPwd);
            // Success -> onAuthStateChanged handles the secure redirect
        } catch (error) {
            console.error("Admin Login Error:", error.code);
            showError("Invalid Admin ID or password.");
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = 'Secure Login';
            }
        }
    });
}

// --- 3. ADMIN SECURE LOGOUT ---
const logoutBtn = document.getElementById('admin-logout');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await signOut(auth);
            window.location.href = 'login.html';
        } catch (error) {
            console.error("Admin logout failed:", error);
        }
    });
}

// --- 4. UI HELPER ---
function showError(msg) {
    const errDiv = document.getElementById('auth-error');
    if (errDiv) {
        errDiv.innerText = msg;
        errDiv.classList.remove('hidden');
        errDiv.style.color = '#ef4444';
        errDiv.style.marginBottom = '16px';
        errDiv.style.textAlign = 'center';
    }
}
