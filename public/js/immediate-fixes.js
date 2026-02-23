// IMMEDIATE FIXES - Load this script to fix all issues immediately

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Applying immediate fixes...');
    
    // Force show all content immediately
    setTimeout(function() {
        // Show all sections
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            section.style.opacity = '1';
            section.style.visibility = 'visible';
            section.style.display = 'block';
        });
        
        // Show body
        document.body.style.opacity = '1';
        document.body.style.visibility = 'visible';
        
        // Force Albanian language
        const elements = document.querySelectorAll('[data-en][data-al]');
        elements.forEach(element => {
            const alText = element.getAttribute('data-al');
            if (alText) {
                element.textContent = alText;
            }
        });
        
        // Set Albanian as active language
        const languageOptions = document.querySelectorAll('.language-option');
        languageOptions.forEach(opt => opt.classList.remove('active'));
        const alOption = document.querySelector('.language-option[data-lang="al"]');
        if (alOption) alOption.classList.add('active');
        
        console.log('✅ Immediate fixes applied');
    }, 100);
    
    // Fix language toggle clicks with enhanced event handling
    setTimeout(function() {
        const languageOptions = document.querySelectorAll('.language-option');
        
        languageOptions.forEach(option => {
            option.style.pointerEvents = 'auto';
            option.style.cursor = 'pointer';
            
            // Remove all existing listeners first
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);
            
            newOption.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const selectedLang = this.getAttribute('data-lang');
                console.log('Language clicked via immediate fix:', selectedLang);
                
                // Update all text elements
                const elements = document.querySelectorAll('[data-en][data-al]');
                elements.forEach(element => {
                    const text = element.getAttribute('data-' + selectedLang);
                    if (text) {
                        element.textContent = text;
                    }
                });
                
                // Update placeholders
                const placeholderElements = document.querySelectorAll('[data-placeholder-en][data-placeholder-al]');
                placeholderElements.forEach(element => {
                    const placeholder = element.getAttribute('data-placeholder-' + selectedLang);
                    if (placeholder) {
                        element.setAttribute('placeholder', placeholder);
                    }
                });
                
                // Update active states
                const allOptions = document.querySelectorAll('.language-option');
                allOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                // Update document language
                document.documentElement.lang = selectedLang === 'al' ? 'sq' : 'en';
                
                console.log('Language switched to:', selectedLang);
            });
            
            // Add hover effects
            newOption.addEventListener('mouseenter', function() {
                if (!this.classList.contains('active')) {
                    this.style.background = 'rgba(255, 255, 255, 0.2)';
                }
            });
            
            newOption.addEventListener('mouseleave', function() {
                if (!this.classList.contains('active')) {
                    this.style.background = '';
                }
            });
        });
        
        console.log('✅ Language toggle fixed with enhanced event handling');
    }, 500);
    
    // Force hero section visibility and mobile fixes
    setTimeout(function() {
        forceHeroVisibility();
        console.log('✅ Hero section mobile fixes applied');
    }, 200);
    
    // Fix chatbot if present
    setTimeout(function() {
        const chatbotToggle = document.querySelector('.chatbot-toggle');
        if (chatbotToggle) {
            chatbotToggle.style.pointerEvents = 'auto';
            chatbotToggle.style.cursor = 'pointer';
            console.log('✅ Chatbot toggle fixed');
        }
    }, 1000);
});

// Hero section force visibility function
function forceHeroVisibility() {
    const hero = document.querySelector('.hero');
    if (hero) {
        // Force display and visibility
        hero.style.display = 'flex';
        hero.style.opacity = '1';
        hero.style.visibility = 'visible';
        hero.style.minHeight = '80vh';
        hero.style.position = 'relative';
        
        // Ensure background image is applied
        const computedStyle = window.getComputedStyle(hero);
        if (!computedStyle.backgroundImage || computedStyle.backgroundImage === 'none') {
            hero.style.backgroundImage = 'linear-gradient(135deg, rgba(42, 109, 78, 0.8) 0%, rgba(58, 142, 106, 0.7) 50%, rgba(42, 109, 78, 0.8) 100%), url("/images/outside-main.jpg")';
            hero.style.backgroundSize = 'cover';
            hero.style.backgroundPosition = 'center';
            hero.style.backgroundRepeat = 'no-repeat';
        }
        
        // Fix mobile background attachment
        if (window.innerWidth <= 768) {
            hero.style.backgroundAttachment = 'scroll';
        }
        
        // Force hero content visibility
        const heroContent = hero.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.opacity = '1';
            heroContent.style.visibility = 'visible';
            heroContent.style.display = 'block';
            heroContent.style.position = 'relative';
            heroContent.style.zIndex = '2';
        }
        
        // Force hero title visibility
        const heroTitle = hero.querySelector('.hero-title');
        if (heroTitle) {
            heroTitle.style.opacity = '1';
            heroTitle.style.visibility = 'visible';
            heroTitle.style.display = 'block';
            heroTitle.style.color = 'white';
            heroTitle.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
        }
        
        // Force hero buttons visibility
        const heroBtns = hero.querySelector('.hero-btns');
        if (heroBtns) {
            heroBtns.style.opacity = '1';
            heroBtns.style.visibility = 'visible';
            heroBtns.style.display = 'flex';
        }
        
        console.log('Hero section visibility forced with mobile optimizations');
    }
}

// Language toggle force fix function
function forceLanguageToggleFix() {
    // Desktop uses nav-lang inside .nav-links; mobile uses .language-toggle inside .mobile-nav
    // Only ensure pointer events work on all language options
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        option.style.pointerEvents = 'auto';
        option.style.cursor = 'pointer';
    });

    const languageToggle = document.querySelector('.language-toggle');
    if (languageToggle) {
        languageToggle.style.display = 'flex';
        languageToggle.style.pointerEvents = 'auto';
    }
}

// Run fixes on different loading states
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        forceHeroVisibility();
        forceLanguageToggleFix();
    });
} else {
    forceHeroVisibility();
    forceLanguageToggleFix();
}

// Run fixes on window resize for mobile
window.addEventListener('resize', function() {
    forceLanguageToggleFix();
    if (window.innerWidth <= 768) {
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.backgroundAttachment = 'scroll';
        }
    }
});

// Global function to manually trigger language update
window.forceLanguageUpdate = function(lang) {
    const elements = document.querySelectorAll('[data-en][data-al]');
    elements.forEach(element => {
        const text = element.getAttribute('data-' + lang);
        if (text) {
            element.textContent = text;
        }
    });
    
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(opt => opt.classList.remove('active'));
    const targetOption = document.querySelector('.language-option[data-lang="' + lang + '"]');
    if (targetOption) targetOption.classList.add('active');
    
    console.log('Language manually updated to:', lang);
};

// Export for debugging
window.immediateFixesFunctions = {
    forceHeroVisibility,
    forceLanguageToggleFix,
    forceLanguageUpdate: window.forceLanguageUpdate
};

console.log('🔧 Immediate fixes script loaded and ready');
