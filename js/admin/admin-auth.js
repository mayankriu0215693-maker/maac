import { auth, db } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const currentPath = window.location.pathname;
const isAdminLoginPage = currentPath.includes('/admin/login.html');

// --- ADMIN PAGE PROTECTION ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const adminDoc = await getDoc(doc(db, "admins", user.uid));
            
            if (adminDoc.exists() && adminDoc.data().role === "admin" && adminDoc.data().active === true) {
                // Authorized Admin
                if (isAdminLoginPage) {
                    window.location.href = 'index.html';
                }
            } else {
                throw new Error("Unauthorized");
            }
        } catch (error) {
            // Found a normal customer logged in but trying to access admin pages
            if (isAdminLoginPage) {
                showAdminError("You are not authorized to access the Admin Panel.");
                await signOut(auth);
            } else {
                window.location.href = 'login.html';
            }
        }
    } else {
        // No user logged in
        if (!isAdminLoginPage) {
            window.location.href = 'login.html';
        }
    }
});

// --- ADMIN LOGIN LOGIC ---
const adminLoginBtn = document.getElementById('btn-admin-login');

if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', async () => {
        const adminId = document.getElementById('admin-id').value.trim();
        const adminPwd = document.getElementById('admin-pwd').value;

        if (!adminId || !adminPwd) {
            showAdminError("Please enter Admin ID and password.");
            return;
        }

        // Exact ID Mapping logic (No password hardcoded, no fake emails generated)
        let loginEmail = "";
        if (adminId === "K0403488") {
            loginEmail = "mayankriu0.2156@gmail.com";
        } else {
            showAdminError("Invalid Admin ID or password.");
            return;
        }

        adminLoginBtn.disabled = true;
        adminLoginBtn.innerHTML = 'Authenticating...';

        try {
            await signInWithEmailAndPassword(auth, loginEmail, adminPwd);
            // Success -> The onAuthStateChanged listener handles the redirect
        } catch (error) {
            showAdminError("Invalid Admin ID or password.");
            adminLoginBtn.disabled = false;
            adminLoginBtn.innerHTML = 'Secure Login';
        }
    });
}

function showAdminError(msg) {
    const errDiv = document.getElementById('admin-alert');
    if (errDiv) {
        errDiv.innerText = msg;
        errDiv.style.display = 'block';
    }
}

// Global logout for admin navbar
window.adminLogout = async function() {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error("Logout failed.");
    }
}
