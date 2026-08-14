import { auth, db } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// --- ADMIN PAGE PROTECTION ---
const isAdminLoginPage = window.location.pathname.includes('/admin/login.html');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Verify Authorization Role
        try {
            const adminDoc = await getDoc(doc(db, "admins", user.uid));
            if (!adminDoc.exists() || adminDoc.data().role !== "admin" || !adminDoc.data().active) {
                throw new Error("Unauthorized");
            }
            
            // Valid Admin
            if (isAdminLoginPage) {
                window.location.href = 'index.html'; // Redirect to dashboard
            }
        } catch (error) {
            // Normal customer wandered into admin area -> Kick them out
            await signOut(auth);
            if (!isAdminLoginPage) {
                window.location.href = 'login.html';
            } else {
                showAdminError("You are not authorized to access the Admin Panel.");
            }
        }
    } else {
        // Not logged in
        if (!isAdminLoginPage) {
            window.location.href = 'login.html';
        }
    }
});

// --- ADMIN LOGIN LOGIC ---
window.adminLogin = async function() {
    const adminId = document.getElementById('admin-id').value.trim();
    const adminPwd = document.getElementById('admin-pwd').value;

    if (!adminId || !adminPwd) {
        showAdminError("Please enter Admin ID and password.");
        return;
    }

    // Security Mapping: Obfuscate the visible Admin ID into a Firebase Email
    const internalEmail = `admin_${adminId}@maa-internal.com`;

    try {
        await signInWithEmailAndPassword(auth, internalEmail, adminPwd);
        // Authorization check happens automatically in onAuthStateChanged
    } catch (error) {
        // Generic error to prevent credential enumeration
        showAdminError("Invalid Admin ID or password.");
    }
}

window.adminLogout = async function() {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error("Logout failed");
    }
}

function showAdminError(msg) {
    const errDiv = document.getElementById('admin-error');
    if (errDiv) {
        errDiv.innerText = msg;
        errDiv.style.display = 'block';
    }
}
