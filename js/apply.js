import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

// Ensure this only runs on apply.html
onAuthStateChanged(auth, (user) => {
    if (!user) {
        const urlParams = new URLSearchParams(window.location.search);
        let serviceId = urlParams.get('service');
        
        let redirectUrl = 'login.html?redirect=apply.html';
        if (serviceId) {
            redirectUrl += `&service=${encodeURIComponent(serviceId)}`;
        }
        
        window.location.href = redirectUrl;
    } else {
        console.log("Customer authenticated, application flow authorized.");
        // Phase 2 apply rendering code goes here
    }
});
