import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStatusBadgeClass } from "./whatsapp.js";

document.addEventListener("DOMContentLoaded", () => {
    const list = document.getElementById("apps-list");
    const loading = document.getElementById("loading-apps");
    const empty = document.getElementById("empty-apps");
    const errorDiv = document.getElementById("apps-error");

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const q = query(collection(db, "applications"), where("userId", "==", user.uid));
                const snap = await getDocs(q);
                
                loading.classList.add("hidden");
                
                if (snap.empty) {
                    empty.classList.remove("hidden");
                    return;
                }

                list.classList.remove("hidden");
                snap.forEach(docSnap => {
                    const data = docSnap.data();
                    
                    const card = document.createElement("div");
                    card.className = "card";
                    
                    const header = document.createElement("div");
                    header.style = "display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;";
                    
                    const ackStrong = document.createElement("strong");
                    ackStrong.textContent = data.acknowledgementNumber || "No Ack#";
                    ackStrong.style.color = "var(--primary)";
                    
                    const statusSpan = document.createElement("span");
                    statusSpan.textContent = data.status || "Pending";
                    statusSpan.className = "badge " + getStatusBadgeClass(data.status);
                    
                    header.append(ackStrong, statusSpan);
                    
                    const srvName = document.createElement("h3");
                    srvName.textContent = data.serviceName || "Application";
                    srvName.style.marginBottom = "4px";
                    
                    const dateP = document.createElement("p");
                    dateP.className = "text-muted";
                    dateP.style.fontSize = "0.9rem";
                    const dateStr = (data.createdAt && typeof data.createdAt.toDate === 'function') 
                        ? data.createdAt.toDate().toLocaleDateString() : "N/A";
                    dateP.textContent = "Submitted: " + dateStr;
                    
                    const hr = document.createElement("hr");
                    hr.style = "margin:16px 0; border:0; border-top:1px solid var(--border);";
                    
                    const payP = document.createElement("p");
                    payP.style.display = "flex";
                    payP.style.justifyContent = "space-between";
                    payP.style.alignItems = "center";
                    
                    const pStrong = document.createElement("strong");
                    pStrong.textContent = "Payment Status";
                    
                    const paySpan = document.createElement("span");
                    paySpan.textContent = data.paymentStatus || "Pending";
                    paySpan.className = "badge " + getStatusBadgeClass(data.paymentStatus);
                    
                    payP.append(pStrong, paySpan);
                    card.append(header, srvName, dateP, hr, payP);
                    list.appendChild(card);
                });
            } catch (error) {
                loading.classList.add("hidden");
                errorDiv.textContent = "Error loading applications: " + error.message;
                errorDiv.className = "alert alert-error";
            }
        } else {
            window.location.href = "login.html";
        }
    });
});
