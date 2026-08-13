/**
 * MAA ENTERPRISES - FAQ Dynamic Rendering, Search, and Accordion Logic
 */

const FAQ_DATA = [
    {
        id: 1,
        category: 'services',
        question: "How long does a New PAN card application take?",
        answer: "Normally, an e-PAN is generated within 3 working days. The physical physical PAN card is dispatched to your registered address and usually arrives in 15-20 working days."
    },
    {
        id: 2,
        category: 'services',
        question: "What is the fee for an Aadhaar Address change?",
        answer: "The standard fee for applying for an Aadhaar Address change through our portal is ₹250. This covers the processing and secure document verification."
    },
    {
        id: 3,
        category: 'documents',
        question: "Is my Aadhaar data secure?",
        answer: "Yes, absolutely. To protect your privacy, we do NOT ask you to upload sensitive documents on the public form. Instead, we use a secure Business WhatsApp workflow to collect your documents after you receive your Acknowledgement Number."
    },
    {
        id: 4,
        category: 'applications',
        question: "Do I need to create an account to apply?",
        answer: "Yes. To ensure the security of your application and to allow you to easily access your application history, we require a simple, secure Google Sign-In before you can submit an application."
    },
    {
        id: 5,
        category: 'tracking',
        question: "How do I check the status of my application?",
        answer: "You do not need to log in to track an application. Simply visit the 'Track Application' page and enter the 12-digit Acknowledgement Number (e.g., ME-2026-XXXXXX) provided to you after submission."
    },
    {
        id: 6,
        category: 'documents',
        question: "What documents are required for an Income Certificate?",
        answer: "You will generally need a valid identity proof (Aadhaar/Voter ID), proof of address, an affidavit stating your income, and a recent passport-size photograph. Specific details will be shared on the service page."
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('faq-list');
    const searchInput = document.getElementById('faq-search');
    const catButtons = document.querySelectorAll('.faq-cat-btn');
    const emptyState = document.getElementById('faq-empty-state');
    const clearBtn = document.getElementById('clear-search-btn');

    let currentCategory = 'all';
    let currentSearch = '';

    // Initial Render
    renderFAQs();

    // Search Listener
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        renderFAQs();
    });

    // Category Listener
    catButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            catButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-cat');
            renderFAQs();
        });
    });

    // Clear Search
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentSearch = '';
        renderFAQs();
    });

    function renderFAQs() {
        listContainer.innerHTML = '';
        
        // Filter logic
        const filtered = FAQ_DATA.filter(faq => {
            const matchSearch = faq.question.toLowerCase().includes(currentSearch) || faq.answer.toLowerCase().includes(currentSearch);
            const matchCat = currentCategory === 'all' || faq.category === currentCategory;
            return matchSearch && matchCat;
        });

        if (filtered.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            
            // Build DOM
            filtered.forEach(faq => {
                const item = document.createElement('div');
                item.className = 'faq-item';
                
                item.innerHTML = `
                    <button class="faq-question" aria-expanded="false">
                        ${faq.question}
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer-wrapper">
                        <div class="faq-answer">
                            ${faq.answer}
                        </div>
                    </div>
                `;

                // Accordion interaction
                const questionBtn = item.querySelector('.faq-question');
                const answerWrapper = item.querySelector('.faq-answer-wrapper');

                questionBtn.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    
                    // Close all others (optional accordion behavior)
                    document.querySelectorAll('.faq-item').forEach(otherItem => {
                        otherItem.classList.remove('active');
                        otherItem.querySelector('.faq-answer-wrapper').style.maxHeight = null;
                        otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                    });

                    // Toggle current
                    if (!isActive) {
                        item.classList.add('active');
                        questionBtn.setAttribute('aria-expanded', 'true');
                        answerWrapper.style.maxHeight = answerWrapper.scrollHeight + "px";
                    }
                });

                listContainer.appendChild(item);
            });
        }
    }
});
