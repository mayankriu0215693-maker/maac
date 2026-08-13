import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const list = document.getElementById("apps-list");
    const loading = document.getElementById("loading-apps");
    const empty = document.getElementById("empty-apps");

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                // Rule: resource.data.userId == request.auth.uid
                const q = query(collection(db, "applications"), where("userId", "==", user.uid));
                const snap = await getDocs(q);
                
                loading.classList.add("hidden");
                
                if (snap.empty) {
                    empty.classList.remove("hidden");
                    return;
                }

                list.classList.remove("hidden");
                snap.forEach(doc => {
                    const data = doc.data();
                    const dateObj = data.createdAt ? data.createdAt.toDate() : new Date();
                    const dateStr = dateObj.toLocaleDateString();

                    const card = document.createElement("div");
                    card.className = "card";
                    card.innerHTML = `
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <strong>${data.acknowledgementNumber}</strong>
                            <span class="badge ${data.status === 'Pending' ? 'badge-pending' : 'badge-success'}">${data.status}</span>
                        </div>
                        <h3>${data.serviceName}</h3>
                        <p class="text-muted">Submitted: ${dateStr}</p>
                        <hr style="margin:12px 0; border:0; border-top:1px solid #e5e7eb;">
                        <p><strong>Payment:</strong> <span class="badge ${data.paymentStatus === 'Pending' ? 'badge-pending' : 'badge-success'}">${data.paymentStatus}</span></p>
                    `;
                    list.appendChild(card);
                });
            } catch (error) {
                console.error("Error fetching applications:", error);
                loading.innerText = "Error loading applications. Check connection or login status.";
            }
        } else {
            window.location.href = "login.html";
        }
    });
});
