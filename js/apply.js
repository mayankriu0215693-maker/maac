import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

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
        // Customer is authenticated, proceed with application logic
        console.log("Customer authenticated, loading application data...");
    }
});
