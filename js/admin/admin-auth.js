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

// --- 1. ADMIN AUTH GUARD ---
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
                        emailDisplay.innerText = user.email;
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
                showError("Access Denied: Aapke paas admin permissions nahi hain.");
            }
        }
    });
}

// Auto-run on login page
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

// --- 2. ADMIN LOGIN FORM HANDLER ---
document.addEventListener('DOMContentLoaded', () => {
    // Password Visibility Toggle (Eye icon)
    const togglePwdBtn = document.getElementById('toggle-pwd-btn');
    const pwdInput = document.getElementById('admin-pwd');
    const eyeIcon = document.getElementById('eye-icon');
    if (togglePwdBtn && pwdInput && eyeIcon) {
        togglePwdBtn.addEventListener('click', () => {
            const isPassword = pwdInput.getAttribute('type') === 'password';
            pwdInput.setAttribute('type', isPassword ? 'text' : 'password');
            eyeIcon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
        });
    }

    const loginForm = document.getElementById('admin-login-form');
    const loginBtn = document.getElementById('btn-admin-login');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const rawId = document.getElementById('admin-id')?.value.trim();
            const adminPwd = document.getElementById('admin-pwd')?.value;
            const btn = loginBtn;

            if (!rawId || !adminPwd) {
                showError("Kripya Admin ID/Email aur password enter karein.");
                return;
            }

            // Normalizing ID to lowercase email
            const loginEmail = rawId.includes('@') ? rawId.toLowerCase() : `${rawId.toLowerCase()}@admin.maa-enterprises.com`;

            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
            }

            try {
                const userCredential = await signInWithEmailAndPassword(auth, loginEmail, adminPwd);
                const user = userCredential.user;

                // Check Firestore Admin Role
                const adminDocRef = doc(db, "admins", user.uid);
                const adminDoc = await getDoc(adminDocRef);

                if (adminDoc.exists() && adminDoc.data().role === "admin" && adminDoc.data().active === true) {
                    window.location.href = 'index.html';
                } else {
                    await signOut(auth);
                    showError("Access Denied: Yeh account Admin ke roop me register nahi hai.");
                }
            } catch (error) {
                console.error("Admin Login Error:", error.code);
                if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    showError("Password galat hai. Agar password bhool gaye hain toh Firebase Console me User ke 3 dots par click karke 'Change password' karein.");
                } else if (error.code === 'auth/user-not-found') {
                    showError("Yeh Admin ID/Email Firebase me nahi mila.");
                } else {
                    showError("Login Error: " + error.message);
                }
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = 'Secure Admin Login';
                }
            }
        });
    }

    // Bind all Admin Logout buttons
    const logoutBtns = document.querySelectorAll('#admin-logout, .admin-logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            adminLogout();
        });
    });
});

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
        errDiv.classList.remove('hidden');
        errDiv.style.display = 'block';
    }
}
