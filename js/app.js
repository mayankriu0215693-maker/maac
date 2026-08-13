/**
 * MAA ENTERPRISES - Core Frontend Logic
 * Handles Theme Management, Global Nav State, and Auth checking.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupThemeToggle();
    initGlobalAuthListener();
});

/* --- 1. THEME MANAGEMENT --- */
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
    updateThemeIcon();
}

function setupThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon();
    });
}

function updateThemeIcon() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    toggleBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
}

/* --- 2. GLOBAL AUTH LISTENER --- */
// Toggles the navigation links based on user authentication state
function initGlobalAuthListener() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged((user) => {
            const loginNav = document.getElementById('nav-login');
            const profileNav = document.getElementById('nav-profile');
            const myAppsNav = document.getElementById('nav-my-apps');

            if (user) {
                // User is signed in.
                if (loginNav) loginNav.classList.add('hidden');
                if (profileNav) profileNav.classList.remove('hidden');
                if (myAppsNav) myAppsNav.classList.remove('hidden');
            } else {
                // No user is signed in.
                if (loginNav) loginNav.classList.remove('hidden');
                if (profileNav) profileNav.classList.add('hidden');
                if (myAppsNav) myAppsNav.classList.add('hidden');
            }
        });
    }
}
