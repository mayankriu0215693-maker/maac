import { db } from "../firebase-config.js";
import { collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { requireAdminAuth } from "./admin-auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    requireAdminAuth();
    
    const alertBox = document.getElementById("backend-alert");
    const list = document.getElementById("service-list");
    const modal = document.getElementById("service-modal");

    async function loadServices() {
        try {
            const snap = await getDocs(collection(db, "services"));
            document.getElementById("loading-state").classList.add("hidden");
            list.classList.remove("hidden");
            list.innerHTML = "";

            snap.forEach(docSnap => {
                const data = docSnap.data();
                
                const card = document.createElement("div");
                card.className = "card";
                
                const title = document.createElement("h3");
                title.textContent = data.name || "Unnamed Service";
                
                const feeP = document.createElement("p");
                feeP.className = "text-muted";
                feeP.style.margin = "8px 0";
                feeP.textContent = `Fee: ₹${data.fee || 0}`;
                
                const editBtn = document.createElement("button");
                editBtn.className = "btn btn-outline edit-btn";
                editBtn.style.marginTop = "12px";
                editBtn.style.width = "100%";
                editBtn.textContent = "Edit Requirements";
                editBtn.dataset.id = docSnap.id;
                editBtn.dataset.name = data.name || "";
                editBtn.dataset.fee = data.fee || 0;
                
                card.append(title, feeP, editBtn);
                list.appendChild(card);
            });

            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.getElementById("srv-id").value = e.target.dataset.id;
                    document.getElementById("srv-name").value = e.target.dataset.name;
                    document.getElementById("srv-fee").value = e.target.dataset.fee;
                    modal.classList.remove("hidden");
                });
            });
        } catch (error) {
            alertBox.textContent = "Error loading services: " + error.message;
            alertBox.className = "alert alert-error";
        }
    }

    loadServices();

    document.getElementById("close-modal").addEventListener("click", () => modal.classList.add("hidden"));
    document.getElementById("add-new-btn").addEventListener("click", () => {
        document.getElementById("service-form").reset();
        document.getElementById("srv-id").value = "new_" + Date.now();
        modal.classList.remove("hidden");
    });

    document.getElementById("service-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("save-btn");
        btn.disabled = true; btn.textContent = "Authorizing Write...";

        const id = document.getElementById("srv-id").value;
        try {
            await setDoc(doc(db, "services", id), {
                name: document.getElementById("srv-name").value,
                fee: parseInt(document.getElementById("srv-fee").value),
                active: true
            }, { merge: true });
            
            alert("Backend Save Successful!");
            modal.classList.add("hidden");
            loadServices();
        } catch (error) {
            if (error.code === 'permission-denied') {
                alert("Permission Denied: Write access to 'services' is strictly blocked by backend rules.");
            } else {
                alert("Error: " + error.message);
            }
        } finally {
            btn.disabled = false; btn.textContent = "Save Changes";
        }
    });
});
