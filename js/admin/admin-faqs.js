import { db } from "../firebase-config.js";
import { collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { requireAdminAuth } from "./admin-auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    requireAdminAuth();
    
    const alertBox = document.getElementById("backend-alert");
    const list = document.getElementById("faq-list");
    const modal = document.getElementById("faq-modal");

    async function loadFaqs() {
        try {
            const snap = await getDocs(collection(db, "faqs"));
            document.getElementById("loading-state").classList.add("hidden");
            list.classList.remove("hidden");
            list.innerHTML = "";

            snap.forEach(docSnap => {
                const data = docSnap.data();
                const card = document.createElement("div");
                card.className = "card";
                
                const q = document.createElement("h3");
                q.textContent = data.question || "N/A";
                q.style.marginBottom = "8px";
                
                const a = document.createElement("p");
                a.textContent = data.answer || "N/A";
                a.className = "text-muted";
                
                const btn = document.createElement("button");
                btn.className = "btn btn-outline edit-btn";
                btn.style.marginTop = "16px";
                btn.style.width = "100%";
                btn.textContent = "Edit FAQ";
                btn.dataset.id = docSnap.id;
                btn.dataset.q = data.question || "";
                btn.dataset.a = data.answer || "";
                
                card.append(q, a, btn);
                list.appendChild(card);
            });

            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.getElementById("faq-id").value = e.target.dataset.id;
                    document.getElementById("faq-q").value = e.target.dataset.q;
                    document.getElementById("faq-a").value = e.target.dataset.a;
                    modal.classList.remove("hidden");
                });
            });
        } catch (error) {
            alertBox.textContent = "Error loading FAQs: " + error.message;
            alertBox.className = "alert alert-error";
        }
    }

    loadFaqs();

    document.getElementById("close-modal").addEventListener("click", () => modal.classList.add("hidden"));
    document.getElementById("add-new-btn").addEventListener("click", () => {
        document.getElementById("faq-form").reset();
        document.getElementById("faq-id").value = "new_" + Date.now();
        modal.classList.remove("hidden");
    });

    document.getElementById("faq-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("save-btn");
        btn.disabled = true; btn.textContent = "Saving...";

        const id = document.getElementById("faq-id").value;
        try {
            await setDoc(doc(db, "faqs", id), {
                question: document.getElementById("faq-q").value,
                answer: document.getElementById("faq-a").value
            }, { merge: true });
            
            alert("Backend Save Successful!");
            modal.classList.add("hidden");
            loadFaqs();
        } catch (error) {
            if (error.code === 'permission-denied') {
                alert("Permission Denied: Write access to 'faqs' is strictly blocked by backend rules.");
            } else {
                alert("Error: " + error.message);
            }
        } finally {
            btn.disabled = false; btn.textContent = "Save FAQ";
        }
    });
});
