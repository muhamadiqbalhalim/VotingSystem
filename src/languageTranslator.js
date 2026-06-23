import { translations } from './translation.js';

export function changeLanguage(lang) {
    localStorage.setItem('selectedLanguage', lang);

    // Menggunakan try-catch supaya ia tidak 'crash' jika elemen tiada
    try {
        document.querySelectorAll("[data-translate]").forEach(el => {
            const key = el.getAttribute("data-translate");
            if (translations[lang] && translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });

        document.querySelectorAll("[data-translate-placeholder]").forEach(el => {
            const key = el.getAttribute("data-translate-placeholder");
            if (translations[lang] && translations[lang][key]) {
                el.placeholder = translations[lang][key];
            }
        });
    } catch (e) {
        console.warn("Translation update skipped:", e);
    }
}

export function initializeWithDetection() {
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    changeLanguage(savedLang);
}

export function selectLanguage(lang) {
    changeLanguage(lang);
}