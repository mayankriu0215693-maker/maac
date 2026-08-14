import { auth, db } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const currentPath = window.location.pathname;
const isAdminLoginPage = currentPath.includes('/admin/login.html');

// --- ADMIN AUTHORIZATION GUARD ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const adminDoc = await getDoc(doc(db, "admins", user.uid));
            
            if (adminDoc.exists() && adminDoc.data().role === "admin" && adminDoc.data().active === true) {
                // Authorized Admin
                if (isAdminLoginPage) {
                    window.location.href = 'index.html'; // Move to dashboard relative to admin folder
                }
            } else {
                throw new Error("Unauthorized customer account.");
            }
        } catch (error) {
            // Unauthorized (Customers attempting to access /admin/ route)
            await signOut(auth);
            if (!isAdminLoginPage) {
                window.location.href = 'login.html';
            } else {
                showAdminError("You are not authorized to access the Admin Panel.");
            }
        }
    } else {
        // Not logged in at all
        if (!isAdminLoginPage) {
            window.location.href = 'login.html';
        }
    }
});

// --- ADMIN LOGIN ---
window.adminLogin = async function() {
    const adminId = document.getElementById('admin-id').value.trim();
    const adminPwd = document.getElementById('admin-pwd').value;

    if (!adminId || !adminPwd) {
        showAdminError("Please enter Admin ID and password.");
        return;
    }

    // Direct mapping string - backend holds actual password securely
    const internalEmail = `admin_${adminId}@maa-internal.com`;

    try {
        // Sign in. Guard logic in onAuthStateChanged will handle redirect or ejection.
        await signInWithEmailAndPassword(auth, internalEmail, adminPwd);
    } catch (error) {
        showAdminError("Invalid Admin ID or password.");
    }
}

window.adminLogout = async function() {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error("Logout failed.");
    }
}

function showAdminError(msg) {
    const errDiv = document.getElementById('admin-error');
    if (errDiv) {
        errDiv.innerText = msg;
        errDiv.style.display = 'block';
    }
}
