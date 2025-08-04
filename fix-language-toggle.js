// LANGUAGE TOGGLE FIX for Vila Falo
// Add this code to the initLanguageSwitcher function in scripts.js

function initLanguageSwitcher() {
    console.log('Initializing language switcher...');
    
    const languageOptions = document.querySelectorAll('.language-option');
    
    if (languageOptions.length === 0) {
        console.error('Language options not found!');
        return;
    }
    
    // Set Albanian as default
    let currentLanguage = 'al';
    updateLanguage(currentLanguage);
    
    // Add click event listeners to language options
    languageOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const selectedLang = this.getAttribute('data-lang');
            console.log('Language clicked:', selectedLang);
            
            if (selectedLang && selectedLang !== currentLanguage) {
                currentLanguage = selectedLang;
                updateLanguage(currentLanguage);
                
                // Update active states
                languageOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                console.log('Language switched to:', currentLanguage);
            }
        });
    });
    
    console.log('Language switcher initialized successfully');
}

function updateLanguage(lang) {
    console.log('Updating language to:', lang);
    
    // Get all elements with language attributes
    const elements = document.querySelectorAll('[data-en][data-al]');
    
    console.log('Found', elements.length, 'elements to translate');
    
    elements.forEach(element => {
        const text = element.getAttribute('data-' + lang);
        if (text) {
            element.textContent = text;
        }
    });
    
    // Update placeholders
    const placeholderElements = document.querySelectorAll('[data-placeholder-en][data-placeholder-al]');
    placeholderElements.forEach(element => {
        const placeholder = element.getAttribute('data-placeholder-' + lang);
        if (placeholder) {
            element.setAttribute('placeholder', placeholder);
        }
    });
    
    // Update document language
    document.documentElement.lang = lang === 'al' ? 'sq' : 'en';
    
    console.log('Language update completed for:', lang);
}

// Export for use
if (typeof module !== 'undefined') {
    module.exports = { initLanguageSwitcher, updateLanguage };
}
