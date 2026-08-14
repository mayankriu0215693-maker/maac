import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

// Check if customer is authenticated before allowing application
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Not logged in. Redirect to login and preserve the intended service application
        const urlParams = new URLSearchParams(window.location.search);
        const service = urlParams.get('service') || '';
        
        window.location.href = `login.html?redirect=apply.html&service=${service}`;
    } else {
        // User is logged in. Allow them to see the application form.
        document.body.style.display = "block";
        
        // Auto-fill selected service from URL if needed
        const urlParams = new URLSearchParams(window.location.search);
        const service = urlParams.get('service');
        if(service) {
            console.log("Applying for:", service);
            // Example: document.getElementById("service-selection").value = service;
        }
    }
});

// Important: Ensure apply.html has inline style="display: none;" on the body tag to prevent UI flash before auth check.
