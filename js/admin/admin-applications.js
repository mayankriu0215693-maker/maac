import { db } from "../firebase-config.js";
import { collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { requireAdminAuth } from "./admin-auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    requireAdminAuth();
    
    const alertBox = document.getElementById("backend-alert");
    const loading = document.getElementById("loading-state");
    const list = document.getElementById("app-list");
    const modal = document.getElementById("edit-modal");

    async function loadApps() {
        loading.classList.remove("hidden");
        list.innerHTML = "";
        
        try {
            // WILL FAIL if rules restrict global read
            const snap = await getDocs(collection(db, "applications"));
            loading.classList.add("hidden");
            
            if(snap.empty) {
                alertBox.innerText = "No applications found.";
                alertBox.classList.remove("hidden");
                return;
            }

            list.classList.remove("hidden");
            snap.forEach(docSnap => {
                const data = docSnap.data();
                const card = document.createElement("div");
                card.className = "card";
                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between;">
                        <strong>${data.acknowledgementNumber}</strong>
                        <span class="badge badge-${data.status.toLowerCase()}">${data.status}</span>
                    </div>
                    <p class="text-muted">${data.serviceName}</p>
                    <p><strong>Customer:</strong> ${data.customerName}</p>
                    <p><strong>Phone:</strong> ${data.mobile}</p>
                    <hr style="margin:10px 0; border:0; border-top:1px solid #e5e7eb;">
                    <p><strong>Payment:</strong> <span class="badge badge-${data.paymentStatus.toLowerCase()}">${data.paymentStatus}</span></p>
                    <br>
                    <button class="btn btn-outline edit-btn" data-id="${docSnap.id}" data-status="${data.status}" data-pay="${data.paymentStatus}">Manage</button>
                `;
                list.appendChild(card);
            });

            // Attach edit listeners
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
            if (error.code === 'permission-denied') {
                alertBox.innerHTML = "<strong>Backend Authorization Required:</strong> Current Firestore Rules block reading applications. Action required by developer.";
            } else {
                alertBox.innerText = error.message;
            }
            alertBox.classList.remove("hidden");
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

        btn.disabled = true;
        btn.innerText = "Saving...";
        
        try {
            // WILL FAIL if rules restrict client-side update
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
                alert("Permission Denied: You do not have backend authorization to update records. Contact the developer to update Firestore rules.");
            } else {
                alert("Error: " + error.message);
            }
        } finally {
            btn.disabled = false;
            btn.innerText = "Save Changes";
        }
    });
});
