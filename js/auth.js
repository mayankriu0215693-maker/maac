/**
 * MAA ENTERPRISES - Premium Authentication Flow
 * Handles Google Login, UI states, Error mapping, and Redirect preservation.
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('google-login-btn');
    if (!loginBtn) return;

    // Determine redirect URL from query params
    const urlParams = new URLSearchParams(window.location.search);
    const encodedRedirect = urlParams.get('redirect');
    const redirectUrl = encodedRedirect ? decodeURIComponent(encodedRedirect) : 'index.html';

    loginBtn.addEventListener('click', () => {
        // Prevent multiple clicks
        if (loginBtn.disabled) return;
        
        setLoadingState(true);
        hideError();

        if (typeof firebase !== 'undefined' && firebase.auth) {
            const provider = new firebase.auth.GoogleAuthProvider();
            
            firebase.auth().signInWithPopup(provider)
                .then((result) => {
                    // Success! Redirect to the preserved destination.
                    window.location.href = redirectUrl;
                })
                .catch((error) => {
                    setLoadingState(false);
                    handleAuthError(error);
                });
        } else {
            // Fallback for dev environments without Firebase
            setTimeout(() => {
                setLoadingState(false);
                window.location.href = redirectUrl;
            }, 1000);
        }
    });
});

function setLoadingState(isLoading) {
    const btn = document.getElementById('google-login-btn');
    const btnText = document.getElementById('btn-text');
    
    if (isLoading) {
        btn.disabled = true;
        btn.classList.add('loading');
        btnText.textContent = 'Signing you in...';
    } else {
        btn.disabled = false;
        btn.classList.remove('loading');
        btnText.textContent = 'Continue with Google';
    }
}

function handleAuthError(error) {
    let userFriendlyMsg = "Unable to sign you in right now. Please try again.";
    
    // Map Firebase technical errors to friendly UI messages
    if (error.code === 'auth/popup-closed-by-user') {
        userFriendlyMsg = "Google sign-in was cancelled. Please try again.";
    } else if (error.code === 'auth/network-request-failed') {
        userFriendlyMsg = "Network error. Please check your internet connection.";
    } else if (error.code === 'auth/account-exists-with-different-credential') {
        userFriendlyMsg = "An account already exists with the same email address.";
    }
    
    // Log technical detail to console for admin debugging
    console.warn("Auth Error:", error.code, error.message);
    
    showError(userFriendlyMsg);
}

function showError(message) {
    const errorBox = document.getElementById('auth-error');
    const errorMsg = document.getElementById('error-message');
    errorMsg.textContent = message;
    errorBox.classList.remove('hidden');
}

function hideError() {
    const errorBox = document.getElementById('auth-error');
    errorBox.classList.add('hidden');
}
