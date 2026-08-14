import { auth, db } from "./firebase-config.js";
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    RecaptchaVerifier, 
    signInWithPhoneNumber,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// DOM Elements
const errorMsg = document.getElementById("error-message");
const btnGoogle = document.getElementById("btn-google-login");
const otpWrapper = document.getElementById("otp-section-wrapper");
const phoneInputState = document.getElementById("phone-input-state");
const otpVerifyState = document.getElementById("otp-verify-state");
const phoneInput = document.getElementById("phone-number");
const otpInput = document.getElementById("otp-code");
const btnSendOtp = document.getElementById("btn-send-otp");
const btnVerifyOtp = document.getElementById("btn-verify-otp");
const navAuthState = document.getElementById("nav-auth-state");

let confirmationResult = null;

function showError(msg) {
    if(errorMsg) {
        errorMsg.innerText = msg;
        errorMsg.style.display = "block";
    }
}

// 1. Fetch Admin Settings (Toggle Mobile OTP)
async function fetchAuthSettings() {
    try {
        const docRef = doc(db, "settings", "auth");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.mobileOtpEnabled && otpWrapper) {
                otpWrapper.style.display = "block";
            }
        }
    } catch (error) {
        console.error("Error fetching auth settings.");
    }
}

// 2. Handle Google Login
if (btnGoogle) {
    btnGoogle.addEventListener("click", async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            handleSuccessfulLogin();
        } catch (error) {
            showError("Google sign-in failed. Please try again.");
        }
    });
}

// 3. Handle Phone Login (Send OTP)
if (btnSendOtp) {
    btnSendOtp.addEventListener("click", async () => {
        const number = phoneInput.value.trim();
        const indianPhoneRegex = /^[6-9]\d{9}$/;
        
        if (!indianPhoneRegex.test(number)) {
            showError("Please enter a valid 10-digit Indian mobile number.");
            return;
        }

        const fullNumber = `+91${number}`;

        try {
            if (!window.recaptchaVerifier) {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    'size': 'invisible'
                });
            }
            confirmationResult = await signInWithPhoneNumber(auth, fullNumber, window.recaptchaVerifier);
            phoneInputState.style.display = "none";
            otpVerifyState.style.display = "block";
            showError(""); // Clear error
        } catch (error) {
            showError("Failed to send OTP. Please check your network and try again.");
            if(window.recaptchaVerifier) window.recaptchaVerifier.clear();
        }
    });
}

// 4. Verify OTP
if (btnVerifyOtp) {
    btnVerifyOtp.addEventListener("click", async () => {
        const code = otpInput.value.trim();
        if (code.length !== 6) {
            showError("Please enter a valid 6-digit OTP.");
            return;
        }
        try {
            await confirmationResult.confirm(code);
            handleSuccessfulLogin();
        } catch (error) {
            showError("Invalid OTP. Please try again.");
        }
    });
}

// 5. Success Redirect Logic (Preserve Selected Service)
function handleSuccessfulLogin() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect') || 'index.html';
    const service = urlParams.get('service');
    
    if (service) {
        window.location.href = `${redirectUrl}?service=${service}`;
    } else {
        window.location.href = redirectUrl;
    }
}

// 6. Handle Auth State for Navbar & Customer Logout
onAuthStateChanged(auth, (user) => {
    if (navAuthState) {
        if (user) {
            navAuthState.innerHTML = `
                <a href="profile.html">Profile</a>
                <button id="btn-logout" style="margin-left: 10px;">Logout</button>
            `;
            document.getElementById("btn-logout").addEventListener("click", () => {
                signOut(auth).then(() => {
                    window.location.href = "index.html";
                });
            });
        } else {
            navAuthState.innerHTML = `<a href="login.html">Login</a>`;
        }
    }
});

// Init
if (window.location.pathname.includes("login.html")) {
    fetchAuthSettings();
}
