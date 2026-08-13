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
            // Read is allowed under current rules (allow read: if true)
            const snap = await getDocs(collection(db, "services"));
            document.getElementById("loading-state").classList.add("hidden");
            list.classList.remove("hidden");
            list.innerHTML = "";

            snap.forEach(docSnap => {
                const data = docSnap.data();
                const card = document.createElement("div");
                card.className = "card";
                card.innerHTML = `
                    <h3>${data.name}</h3>
                    <p>Fee: ₹${data.fee || 0}</p>
                    <button class="btn btn-outline edit-btn" style="margin-top:10px;" data-id="${docSnap.id}" data-name="${data.name}" data-fee="${data.fee}">Edit</button>
                `;
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
            console.error(error);
            alertBox.innerText = "Error loading services.";
            alertBox.classList.remove("hidden");
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
        btn.disabled = true; btn.innerText = "Testing Write...";

        const id = document.getElementById("srv-id").value;
        try {
            // WILL FAIL because services rules are: allow write: if false
            await setDoc(doc(db, "services", id), {
                name: document.getElementById("srv-name").value,
                fee: parseInt(document.getElementById("srv-fee").value),
                active: true
            }, { merge: true });
            
            alert("Success!");
            modal.classList.add("hidden");
            loadServices();
        } catch (error) {
            if (error.code === 'permission-denied') {
                alert("Permission Denied: Write access to 'services' is blocked by current Firestore rules. Backend configuration required.");
            } else {
                alert("Error: " + error.message);
            }
        } finally {
            btn.disabled = false; btn.innerText = "Save";
        }
    });
});
