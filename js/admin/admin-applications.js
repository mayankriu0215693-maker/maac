import { db } from "../firebase-config.js";
import { collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { requireAdminAuth } from "./admin-auth.js";
import { getStatusBadgeClass } from "../whatsapp.js";

document.addEventListener("DOMContentLoaded", async () => {
    requireAdminAuth();
    
    const alertBox = document.getElementById("backend-alert");
    const loading = document.getElementById("loading-state");
    const list = document.getElementById("app-list");
    const modal = document.getElementById("edit-modal");

    async function loadApps() {
        loading.classList.remove("hidden");
        list.innerHTML = "";
        alertBox.className = "hidden";
        
        try {
            const snap = await getDocs(collection(db, "applications"));
            loading.classList.add("hidden");
            
            if(snap.empty) {
                alertBox.textContent = "No applications found.";
                alertBox.className = "alert alert-warning";
                return;
            }

            list.classList.remove("hidden");
            snap.forEach(docSnap => {
                const data = docSnap.data();
                
                const card = document.createElement("div");
                card.className = "card";
                
                const header = document.createElement("div");
                header.style = "display:flex; justify-content:space-between; margin-bottom:8px;";
                const ackS = document.createElement("strong");
                ackS.textContent = data.acknowledgementNumber || "N/A";
                const sBadge = document.createElement("span");
                sBadge.textContent = data.status || "Pending";
                sBadge.className = "badge " + getStatusBadgeClass(data.status);
                header.append(ackS, sBadge);
                
                const sName = document.createElement("p");
                sName.className = "text-muted";
                sName.textContent = data.serviceName || "Service";
                
                const cName = document.createElement("p");
                cName.innerHTML = `<strong>Customer:</strong> `;
                const cSpan = document.createElement("span");
                cSpan.textContent = data.customerName || "N/A";
                cName.appendChild(cSpan);
                
                const mob = document.createElement("p");
                mob.innerHTML = `<strong>Phone:</strong> `;
                const mSpan = document.createElement("span");
                mSpan.textContent = data.mobile || "N/A";
                mob.appendChild(mSpan);
                
                const hr = document.createElement("hr");
                hr.style = "margin:10px 0; border:0; border-top:1px solid var(--border);";
                
                const pName = document.createElement("p");
                pName.innerHTML = `<strong>Payment:</strong> `;
                const pBadge = document.createElement("span");
                pBadge.textContent = data.paymentStatus || "Pending";
                pBadge.className = "badge " + getStatusBadgeClass(data.paymentStatus);
                pName.appendChild(pBadge);
                
                const mngBtn = document.createElement("button");
                mngBtn.className = "btn btn-outline edit-btn";
                mngBtn.style.marginTop = "12px";
                mngBtn.textContent = "Manage";
                mngBtn.dataset.id = docSnap.id;
                mngBtn.dataset.status = data.status || "Pending";
                mngBtn.dataset.pay = data.paymentStatus || "Pending";
                
                card.append(header, sName, cName, mob, hr, pName, mngBtn);
                list.appendChild(card);
            });

            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.getElementById("edit-id").value = e.target.dataset.id;
                    document.getElementById("edit-status").value = e.target.dataset.status;
                    document.getElementById("edit-payment").value = e.target.dataset.pay;
                    modal.classList.remove("hidden");
                });
            });

        } catch (error) {
            loading.classList.add("hidden");
            alertBox.className = "alert alert-error";
            if (error.code === 'permission-denied') {
                alertBox.textContent = "Backend Authorization Required: Current rules block reading all applications. Please update Firestore security rules.";
            } else {
                alertBox.textContent = error.message;
            }
        }
    }

    loadApps();

    document.getElementById("close-modal").addEventListener("click", () => {
        modal.classList.add("hidden");
    });

    document.getElementById("update-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("save-btn");
        const id = document.getElementById("edit-id").value;
        const newStatus = document.getElementById("edit-status").value;
        const newPay = document.getElementById("edit-payment").value;

        btn.disabled = true; btn.textContent = "Saving...";
        
        try {
            await updateDoc(doc(db, "applications", id), {
                status: newStatus,
                paymentStatus: newPay,
                updatedAt: new Date()
            });
            modal.classList.add("hidden");
            alert("Updated successfully.");
            loadApps();
        } catch (error) {
            if (error.code === 'permission-denied') {
                alert("Permission Denied: You do not have write access under current rules.");
            } else {
                alert("Error: " + error.message);
            }
        } finally {
            btn.disabled = false; btn.textContent = "Save Changes";
        }
    });
});
