// js/admin/admin-auth.js
import { auth, db } from '../firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const currentPath = window.location.pathname;
const isAdminLoginPage = currentPath.includes('login.html');

// --- 1. ADMIN AUTH GUARD (Used across all Admin dashboard pages) ---
export function requireAdminAuth() {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            if (!isAdminLoginPage) {
                window.location.href = 'login.html';
            }
            return;
        }

        try {
            const adminDocRef = doc(db, "admins", user.uid);
            const adminDoc = await getDoc(adminDocRef);

            if (adminDoc.exists() && adminDoc.data().role === "admin" && adminDoc.data().active === true) {
                if (isAdminLoginPage) {
                    window.location.href = 'index.html';
                } else {
                    const emailDisplay = document.getElementById('admin-user-email');
                    if (emailDisplay) {
                        emailDisplay.innerText = user.email || "Admin Authorized";
                    }
                }
            } else {
                throw new Error("Unauthorized: Admin privileges required.");
            }
        } catch (error) {
            console.error("Admin verification error:", error);
            await signOut(auth);
            if (!isAdminLoginPage) {
                window.location.href = 'login.html';
            } else {
                showError("Access Denied: You do not have admin privileges.");
            }
        }
    });
}

// Check auto-redirect on login page
if (isAdminLoginPage) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const adminDocRef = doc(db, "admins", user.uid);
                const adminDoc = await getDoc(adminDocRef);
                if (adminDoc.exists() && adminDoc.data().role === "admin" && adminDoc.data().active === true) {
                    window.location.href = 'index.html';
                }
            } catch (e) {
                // Stay on login page
            }
        }
    });
}

// --- 2. ADMIN LOGIN FORM SUBMISSION ---
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');
    const loginBtn = document.getElementById('btn-admin-login');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const adminId = document.getElementById('admin-id')?.value.trim();
            const adminPwd = document.getElementById('admin-pwd')?.value;
            const btn = loginBtn;

            if (!adminId || !adminPwd) {
                showError("Please enter Admin ID/Email and password.");
                return;
            }

            // Supports direct email or ID mapping
            const loginEmail = adminId.includes('@') ? adminId : `${adminId}@admin.maa-enterprises.com`;

            if (btn) {
                btn.disabled = true;
                btn.textContent = 'Authenticating...';
            }

            try {
                const userCredential = await signInWithEmailAndPassword(auth, loginEmail, adminPwd);
                const user = userCredential.user;

                // Verify admin record in Firestore
                const adminDocRef = doc(db, "admins", user.uid);
                const adminDoc = await getDoc(adminDocRef);

                if (adminDoc.exists() && adminDoc.data().role === "admin" && adminDoc.data().active === true) {
                    window.location.href = 'index.html';
                } else {
                    await signOut(auth);
                    showError("Access Denied: You do not have admin privileges.");
                }
            } catch (error) {
                console.error("Admin Login Error:", error.code, error.message);
                showError("Invalid Admin ID/Email or password.");
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = 'Secure Login';
                }
            }
        });
    }

    // Bind all Admin Logout Buttons
    const logoutBtns = document.querySelectorAll('#admin-logout, .admin-logout');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            adminLogout();
        });
    });
});

// --- 3. ADMIN LOGOUT ---
export async function adminLogout() {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error("Admin logout failed:", error);
    }
}
window.adminLogout = adminLogout;

function showError(msg) {
    const errDiv = document.getElementById('admin-alert') || document.getElementById('auth-error');
    if (errDiv) {
        errDiv.textContent = msg;
        errDiv.style.display = 'block';
    }
}
