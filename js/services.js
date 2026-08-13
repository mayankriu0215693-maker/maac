/**
 * MAA ENTERPRISES - Services Rendering & Firebase Fetch Logic
 * 
 * This file attempts to load active services from Firestore.
 * If Firestore is unavailable or fails, it elegantly degrades 
 * to a hardcoded fallback containing the 6 required services.
 */

const FALLBACK_SERVICES = [
    {
        id: "aadhaar-address",
        name: "Aadhaar Address Change",
        description: "Update your residential address on your Aadhaar card securely online.",
        fee: 250,
        time: "2–8 Working Days",
        icon: "fa-address-card"
    },
    {
        id: "pan-new",
        name: "New PAN Card",
        description: "Apply for a new Permanent Account Number (PAN) card.",
        fee: 250,
        time: "e-PAN ~3 days / Physical ~15-20 days",
        icon: "fa-id-card"
    },
    {
        id: "pan-correction",
        name: "PAN Correction",
        description: "Correct name, DOB, or other details on your existing PAN card.",
        fee: 250,
        time: "15-20 Working Days",
        icon: "fa-pen-to-square"
    },
    {
        id: "domicile",
        name: "Domicile / Residence Certificate",
        description: "Official proof of permanent residence in the state.",
        fee: 40,
        time: "14–16 Working Days",
        icon: "fa-house-user"
    },
    {
        id: "caste",
        name: "Caste Certificate",
        description: "Official document certifying your caste category.",
        fee: 40,
        time: "14–16 Working Days",
        icon: "fa-users"
    },
    {
        id: "income",
        name: "Income Certificate",
        description: "Official proof of annual family income.",
        fee: 40,
        time: "14–16 Working Days",
        icon: "fa-file-invoice-dollar"
    }
];

/**
 * Fetches services from Firebase or uses fallback
 */
async function fetchServices() {
    try {
        // Check if Firebase and Firestore are initialized via app.js/firebase-config.js
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            const snapshot = await db.collection('services').where('active', '==', true).get();
            
            if (!snapshot.empty) {
                const services = [];
                snapshot.forEach(doc => {
                    services.push({ id: doc.id, ...doc.data() });
                });
                return services;
            }
        }
        // If empty or Firebase undefined, throw to trigger fallback
        throw new Error("Firestore not initialized or collection empty.");
    } catch (error) {
        console.warn("Using local fallback services. Reason:", error.message);
        return FALLBACK_SERVICES;
    }
}

/**
 * Generates the HTML string for a single service card
 */
function createServiceCardHTML(service) {
    const iconClass = service.icon || "fa-file-lines";
    return `
        <div class="service-card">
            <div class="service-card-icon">
                <i class="fa-solid ${iconClass}"></i>
            </div>
            <h3 class="service-card-title">${service.name}</h3>
            <p class="service-card-description">${service.description}</p>
            
            <div class="service-card-meta">
                <span class="service-fee"><i class="fa-solid fa-indian-rupee-sign"></i> ₹${service.fee}</span>
                <span class="service-time"><i class="fa-solid fa-clock"></i> ${service.time}</span>
            </div>
            
            <div class="service-card-actions">
                <a href="service-details.html?id=${service.id}" class="btn btn-outline">View Details</a>
                <a href="apply.html?id=${service.id}" class="btn btn-primary">Apply Securely</a>
            </div>
        </div>
    `;
}

/**
 * Main render function called from HTML files
 * @param {string} containerId - The ID of the DOM element to render into
 * @param {number} limit - Optional limit for homepage display
 */
window.renderServices = async function(containerId, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Fetch data
    const services = await fetchServices();
    
    // Apply limit if specified (e.g., for homepage)
    const servicesToRender = limit ? services.slice(0, limit) : services;

    // Build HTML and inject
    if (servicesToRender.length > 0) {
        const html = servicesToRender.map(svc => createServiceCardHTML(svc)).join('');
        container.innerHTML = html;
    } else {
        container.innerHTML = `<div class="text-center" style="grid-column: 1 / -1;"><p>No services currently available.</p></div>`;
    }
};
