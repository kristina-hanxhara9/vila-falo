// Vila Falo - Fixed JavaScript File
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - Vila Falo starting...');
    
    // Set Albanian as default language
    let currentLang = 'al';

    // IMMEDIATE FALLBACK - Show content after 1 second regardless
    setTimeout(function() {
        const allSections = document.querySelectorAll('section');
        const body = document.body;
        
        allSections.forEach(section => {
            section.style.opacity = '1';
            section.style.visibility = 'visible';
            section.style.display = 'block';
        });
        
        // Ensure body is visible
        body.style.visibility = 'visible';
        body.style.opacity = '1';

        // Ensure bee video keeps playing in loop
        const beeVideo = document.querySelector('.bee-video-wrapper video');
        if (beeVideo) {
            beeVideo.loop = true;
            beeVideo.muted = true;
            beeVideo.play().catch(() => {});
            beeVideo.addEventListener('ended', () => { beeVideo.currentTime = 0; beeVideo.play(); });
        }
        
        console.log('FALLBACK: All content made visible');
    }, 1000);

    // Hide loader after 2.5 seconds - FIXED SELECTOR
    const loader = document.querySelector('.loader');
    if (loader) {
        console.log('Loader found');
        setTimeout(function() {
            try {
                loader.style.opacity = '0';
                loader.style.visibility = 'hidden';
                loader.style.pointerEvents = 'none';
                loader.style.zIndex = '-1';
                loader.style.display = 'none';
                console.log('Loader hidden successfully');
                
                // Force show all sections after loader is hidden
                const allSections = document.querySelectorAll('section');
                allSections.forEach(section => {
                    section.style.opacity = '1';
                    section.style.visibility = 'visible';
                    section.style.display = 'block';
                });
                
                // Show body
                document.body.style.visibility = 'visible';
                document.body.style.opacity = '1';
                
                console.log('All sections made visible after loader');
            } catch (error) {
                console.error('Error hiding loader:', error);
                // Force show everything anyway
                document.body.style.visibility = 'visible';
                document.body.style.opacity = '1';
            }
        }, 2500);
    } else {
        console.log('Loader not found - showing content immediately');
        // Ensure sections are visible even without loader
        const allSections = document.querySelectorAll('section');
        allSections.forEach(section => {
            section.style.opacity = '1';
            section.style.visibility = 'visible';
            section.style.display = 'block';
        });
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
    }

    // Initialize functionality
    initNavigation();
    initLanguageSwitcher();
    initScrollEffects();
    initSnowEffect();
    initBookingForm();
    initTestimonialSlider();
    initCalendar();
    initAOS();
    initRoomPreselection();
    initRoomDetailModals();
    initBookingBar();
    initRoomLightbox();
    initSeasonClicks();

    // Dynamic copyright year
    var yearEl = document.getElementById('copyrightYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // CRITICAL: Set initial language to Albanian immediately
    setTimeout(function() {
        updateLanguage('al');
        console.log('Language set to Albanian');
    }, 100);
    
    // Ensure all sections are visible immediately
    setTimeout(() => {
        const hiddenElements = document.querySelectorAll('[data-aos], .fade-in, .slide-in-left, .slide-in-right, .zoom-in');
        hiddenElements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
            el.style.visibility = 'visible';
        });
        console.log('All animated elements made visible');
    }, 100);

    function initNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const mobileNav = document.querySelector('.mobile-nav');
        const navLinks = document.querySelectorAll('.nav-link');

        // Mobile menu toggle
        if (hamburger && mobileNav) {
            hamburger.addEventListener('click', function() {
                mobileNav.classList.toggle('active');
                hamburger.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (mobileNav) mobileNav.classList.remove('active');
                if (hamburger) hamburger.classList.remove('active');
                
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // FIXED Language Switching Functionality
    function initLanguageSwitcher() {
        console.log('Initializing FIXED language switcher...');
        
        const languageOptions = document.querySelectorAll('.language-option');
        
        if (languageOptions.length === 0) {
            console.error('Language options not found!');
            return;
        }
        
        // Set Albanian as default and make it active
        let currentLanguage = 'al';
        
        // Remove active class from all options first
        languageOptions.forEach(opt => opt.classList.remove('active'));
        
        // Set Albanian as active
        const alOption = document.querySelector('.language-option[data-lang="al"]');
        if (alOption) {
            alOption.classList.add('active');
        }
        
        // Update language immediately
        updateLanguage(currentLanguage);
        
        // Add click event listeners with proper event handling
        languageOptions.forEach(option => {
            // Make sure the element is clickable
            option.style.pointerEvents = 'auto';
            option.style.cursor = 'pointer';
            
            // Remove any existing listeners
            option.removeEventListener('click', handleLanguageClick);
            
            // Add new listener
            option.addEventListener('click', handleLanguageClick);
            
            // Also add keyboard support
            option.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleLanguageClick.call(this, e);
                }
            });
        });
        
        function handleLanguageClick(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const selectedLang = this.getAttribute('data-lang');
            console.log('Language clicked:', selectedLang);
            
            if (selectedLang && selectedLang !== currentLanguage) {
                currentLanguage = selectedLang;
                currentLang = selectedLang; // Update global variable
                updateLanguage(currentLanguage);
                
                // Update active states
                languageOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                console.log('Language switched to:', currentLanguage);
            }
        }
        
       console.log('Language switcher initialized successfully with', languageOptions.length, 'options');
    }

    function updateLanguage(lang) {
        console.log('Updating language to:', lang);
        
        try {
            currentLang = lang;
            
            // Get all elements with language attributes
            const elements = document.querySelectorAll('[data-en][data-al]');
            
            console.log('Found', elements.length, 'elements to translate');
            
            elements.forEach((element, index) => {
                try {
                    const text = element.getAttribute('data-' + lang);
                    if (text && text.trim()) {
                        element.textContent = text;
                    }
                } catch (elementError) {
                    console.warn('Error updating element', index, ':', elementError);
                }
            });
            
            // Update placeholders
            const placeholderElements = document.querySelectorAll('[data-placeholder-en][data-placeholder-al]');
            placeholderElements.forEach(element => {
                try {
                    const placeholder = element.getAttribute('data-placeholder-' + lang);
                    if (placeholder) {
                        element.setAttribute('placeholder', placeholder);
                    }
                } catch (placeholderError) {
                    console.warn('Error updating placeholder:', placeholderError);
                }
            });
            
            // Update document language
            const langMap = { 'al': 'sq', 'gr': 'el', 'en': 'en' };
            document.documentElement.lang = langMap[lang] || 'en';
            
            // Update language toggle active state
            const languageOptions = document.querySelectorAll('.language-option');
            languageOptions.forEach(option => {
                option.classList.remove('active');
                if (option.getAttribute('data-lang') === lang) {
                    option.classList.add('active');
                }
            });
            
            console.log('Language update completed for:', lang);
            
        } catch (error) {
            console.error('Error in updateLanguage:', error);
        }
        
        // Legacy support for old placeholders
        const placeholderElements = document.querySelectorAll('[data-placeholder-en][data-placeholder-al]');
        placeholderElements.forEach(element => {
            const enPlaceholder = element.getAttribute('data-placeholder-en');
            const alPlaceholder = element.getAttribute('data-placeholder-al');
            
            if (lang === 'en' && enPlaceholder) {
                element.placeholder = enPlaceholder;
            } else if (lang === 'al' && alPlaceholder) {
                element.placeholder = alPlaceholder;
            }
        });
        
        console.log('Language updated successfully to:', lang);
    }

    // Placeholder functions to prevent errors
    function initScrollEffects() {
        console.log('Scroll effects initialized');
        // Add scroll-based animations here if needed
        window.addEventListener('scroll', function() {
            const header = document.querySelector('.header');
            if (header) {
                if (window.scrollY > 100) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            }
        });
    }

    function initSnowEffect() {
        console.log('Snow effect initialized');
        // Snow effect is already in CSS
    }

    function initBookingForm() {
        console.log('Booking form initialized');
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', function(e) {
                e.preventDefault();
                console.log('Booking form submitted');
                // Form handling logic here
            });
        }
    }

    function initTestimonialSlider() {
        // Actual implementation is below (hoisted function at line ~826)
    }

    function initAOS() {
        console.log('AOS initialized');
        // AOS animation library initialization
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 1000,
                once: true,
                offset: 100
            });
        }
    }

    function initCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const currentMonthEl = document.getElementById('currentMonth');
        const prevBtn = document.getElementById('prevMonth');
        const nextBtn = document.getElementById('nextMonth');
        
        if (!calendarGrid || !currentMonthEl) return;
        
        let currentDate = new Date();
        const months = {
            'en': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            'al': ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'],
            'gr': ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος']
        };
        
        function renderCalendar() {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            
            // Update month display
            const monthName = months[currentLang] ? months[currentLang][month] : months['en'][month];
            currentMonthEl.textContent = `${monthName} ${year}`;
            
            // Clear calendar grid
            calendarGrid.innerHTML = '';
            
            // Add day headers
            const dayHeaderMap = {
                'al': ['D', 'H', 'M', 'M', 'E', 'P', 'S'],
                'gr': ['Κ', 'Δ', 'Τ', 'Τ', 'Π', 'Π', 'Σ'],
                'en': ['S', 'M', 'T', 'W', 'T', 'F', 'S']
            };
            const dayHeaders = dayHeaderMap[currentLang] || dayHeaderMap['en'];
            dayHeaders.forEach(day => {
                const dayEl = document.createElement('div');
                dayEl.className = 'calendar-day-header';
                dayEl.textContent = day;
                calendarGrid.appendChild(dayEl);
            });
            
            // Get first day of month and number of days
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const today = new Date();
            
            // Add empty cells for days before month starts
            for (let i = 0; i < firstDay; i++) {
                const emptyEl = document.createElement('div');
                emptyEl.className = 'calendar-day empty';
                calendarGrid.appendChild(emptyEl);
            }
            
            // Add days of the month
            for (let day = 1; day <= daysInMonth; day++) {
                const dayEl = document.createElement('div');
                dayEl.className = 'calendar-day';
                dayEl.textContent = day;
                
                const dayDate = new Date(year, month, day);

                // Mark past days as unavailable
                if (dayDate < today) {
                    dayEl.classList.add('past');
                } else {
                    // All future days are available
                    dayEl.classList.add('available');
                    dayEl.addEventListener('click', function() {
                        // Remove previous selection
                        calendarGrid.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
                        // Add selection to clicked day
                        this.classList.add('selected');

                        // Auto-fill check-in date
                        const checkInInput = document.getElementById('checkInDate');
                        if (checkInInput) {
                            const selectedDate = new Date(year, month, day);
                            checkInInput.value = selectedDate.toISOString().split('T')[0];

                            // Auto-set check-out to +1 day
                            const checkOutInput = document.getElementById('checkOutDate');
                            if (checkOutInput) {
                                const nextDay = new Date(year, month, day + 1);
                                checkOutInput.value = nextDay.toISOString().split('T')[0];
                            }

                            // Scroll booking form into view
                            const bookingForm = document.querySelector('.booking-form');
                            if (bookingForm) {
                                bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }
                    });
                }
                
                calendarGrid.appendChild(dayEl);
            }
        }
        
        // Navigation event listeners
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                currentDate.setMonth(currentDate.getMonth() - 1);
                renderCalendar();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                currentDate.setMonth(currentDate.getMonth() + 1);
                renderCalendar();
            });
        }
        
        // Initial render
        renderCalendar();

        // Expose renderCalendar for language switching
        window._renderCalendar = renderCalendar;
    }

    function initLanguageSwitcher() {
        const languageOptions = document.querySelectorAll('.language-option');
        
        languageOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove active class from all options
                languageOptions.forEach(opt => opt.classList.remove('active'));
                // Add active class to clicked option
                this.classList.add('active');
                
                // Update language
                const selectedLang = this.getAttribute('data-lang');
                currentLang = selectedLang;
                updateLanguage(currentLang);
            });
        });
    }

    // FIXED TRANSLATION FUNCTION - works with data-en and data-al
    function updateLanguage(lang) {
        const elements = document.querySelectorAll('[data-en][data-al]');
        elements.forEach(element => {
            const text = element.getAttribute(`data-${lang}`);
            if (text) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = text;
                } else {
                    element.innerHTML = text;
                }
            }
        });
        
        // Update language toggle active state
        document.querySelectorAll('.language-option').forEach(opt => {
            opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
        });

        // Update HTML lang attribute
        document.documentElement.lang = lang === 'al' ? 'sq' : 'en';

        // Re-render calendar with new language
        if (typeof window._renderCalendar === 'function') {
            window._renderCalendar();
        }
    }

    function initScrollEffects() {
        const header = document.querySelector('.header');
        const backToTop = document.querySelector('.back-to-top');
        const scrollProgress = document.querySelector('.scroll-progress');

        window.addEventListener('scroll', function() {
            const scrollY = window.scrollY;

            // Header scroll effect
            if (header) {
                if (scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            }

            // Back to top button
            if (backToTop) {
                if (scrollY > 500) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }
            }

            // Scroll progress bar
            if (scrollProgress) {
                const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrollPercentage = (scrollY / windowHeight) * 100;
                scrollProgress.style.width = scrollPercentage + '%';
            }
        });

        // Back to top button click
        if (backToTop) {
            backToTop.addEventListener('click', function() {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    function initSnowEffect() {
        const snowContainer = document.getElementById('snowContainer');
        if (!snowContainer) return;

        var month = new Date().getMonth(); // 0-11
        var particleConfig;

        if (month >= 11 || month <= 1) {
            // Winter (Dec, Jan, Feb): snowflakes
            particleConfig = { chars: ['\u2744', '\u2745', '\u2746', '\u2727'], color: 'white', interval: 300, sizeRange: [10, 25] };
        } else if (month >= 2 && month <= 4) {
            // Spring (Mar, Apr, May): petals
            particleConfig = { chars: ['\uD83C\uDF38', '\u273F', '\u2740', '\uD83C\uDF43'], color: '#ffb7c5', interval: 500, sizeRange: [12, 22] };
        } else if (month >= 5 && month <= 7) {
            // Summer (Jun, Jul, Aug): fireflies
            particleConfig = { chars: ['\u2726', '\u2727', '\u00B7'], color: '#ffd700', interval: 600, sizeRange: [8, 16] };
        } else {
            // Autumn (Sep, Oct, Nov): falling leaves
            particleConfig = { chars: ['\uD83C\uDF42', '\uD83C\uDF41', '\uD83C\uDF43'], color: '#c97b2a', interval: 500, sizeRange: [14, 24] };
        }

        function createParticle() {
            var particle = document.createElement('div');
            particle.classList.add('snowflake');
            particle.innerHTML = particleConfig.chars[Math.floor(Math.random() * particleConfig.chars.length)];

            var size = Math.random() * (particleConfig.sizeRange[1] - particleConfig.sizeRange[0]) + particleConfig.sizeRange[0];
            var startPositionX = Math.random() * window.innerWidth;
            var animationDuration = Math.random() * 10 + 5;
            var opacity = Math.random() * 0.8 + 0.2;

            particle.style.position = 'absolute';
            particle.style.left = startPositionX + 'px';
            particle.style.top = '-20px';
            particle.style.fontSize = size + 'px';
            particle.style.color = particleConfig.color;
            particle.style.opacity = opacity;
            particle.style.pointerEvents = 'none';
            particle.style.animation = 'snowfall ' + animationDuration + 's linear forwards';

            snowContainer.appendChild(particle);

            setTimeout(function() {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, animationDuration * 1000);
        }

        setInterval(createParticle, particleConfig.interval);
    }

    function initBookingForm() {
        const bookingForm = document.getElementById('bookingForm');
        const modal = document.getElementById('bookingModal');
        const modalClose = document.querySelector('.modal-close');

        if (!bookingForm) return;

        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            console.log('Form submitted');
            
            if (validateBookingForm()) {
                console.log('Form validation passed');
                
                // Show loading state
                const submitBtn = bookingForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = currentLang === 'al' ? 'Duke dërguar...' : 'Submitting...';
                submitBtn.disabled = true;
                
                try {
                    // Collect form data and map to backend format
                    const formData = new FormData(bookingForm);
                    const adults = parseInt(formData.get('adults')) || 1;
                    const children = parseInt(formData.get('children')) || 0;

                    const bookingData = {
                        roomType: formData.get('roomType'),
                        checkInDate: formData.get('checkInDate'),
                        checkOutDate: formData.get('checkOutDate'),
                        guestName: formData.get('guestName'),
                        email: formData.get('email'),
                        phone: formData.get('phone'),
                        numberOfGuests: adults + children,
                        adults: adults,
                        children: children,
                        specialRequests: formData.get('specialRequests') || '',
                        addons: formData.getAll('addons') || [],
                        language: currentLang === 'en' ? 'en' : 'al'
                    };
                    
                    console.log('Sending booking data:', bookingData);
                    
                    // Send booking request
                    const response = await fetch('/api/booking', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(bookingData)
                    });
                    
                    const result = await response.json();
                    console.log('Booking response:', result);
                    
                    if (response.ok && result.success) {
                        // Success - show confirmation modal
                        showBookingConfirmation(result.data);
                        bookingForm.reset();
                    } else {
                        // Error - show error message
                        const errorMessage = result.message || (currentLang === 'al' ? 
                            'Ka ndodhur një gabim. Ju lutemi provoni përsëri.' : 
                            'An error occurred. Please try again.');
                        alert(errorMessage);
                        console.error('Booking error:', result);
                    }
                    
                } catch (error) {
                    console.error('Network error:', error);
                    const errorMessage = currentLang === 'al' ? 
                        'Gabim në lidhje. Ju lutemi kontrolloni internetin dhe provoni përsëri.' : 
                        'Connection error. Please check your internet and try again.';
                    alert(errorMessage);
                } finally {
                    // Reset button state
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            } else {
                console.log('Form validation failed');
            }
        });

        // Modal close events
        if (modalClose) {
            modalClose.addEventListener('click', function() {
                if (modal) {
                    modal.classList.remove('active');
                    setTimeout(() => {
                        modal.style.display = 'none';
                    }, 300);
                }
            });
        }
        
        // Additional close button functionality
        const modalCloseBtn = document.getElementById('modalCloseBtn');
        const modalCloseButton = document.getElementById('modalCloseButton');
        
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', function() {
                if (modal) {
                    modal.classList.remove('active');
                    setTimeout(() => {
                        modal.style.display = 'none';
                    }, 300);
                }
            });
        }
        
        if (modalCloseButton) {
            modalCloseButton.addEventListener('click', function() {
                if (modal) {
                    modal.classList.remove('active');
                    setTimeout(() => {
                        modal.style.display = 'none';
                    }, 300);
                }
            });
        }

        // Close modal when clicking outside
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    setTimeout(() => {
                        modal.style.display = 'none';
                    }, 300);
                }
            });
        }

        // Close modal on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            }
        });
    }

    function validateBookingForm() {
        const form = document.getElementById('bookingForm');
        const inputs = form.querySelectorAll('input[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            const errorMsg = input.parentNode.querySelector('.error-message');
            if (!input.value.trim()) {
                input.classList.add('error');
                if (errorMsg) errorMsg.style.display = 'block';
                isValid = false;
            } else {
                input.classList.remove('error');
                if (errorMsg) errorMsg.style.display = 'none';
            }
        });

        // Email validation
        const emailInput = document.getElementById('email');
        if (emailInput && emailInput.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value)) {
                emailInput.classList.add('error');
                const errorMsg = emailInput.parentNode.querySelector('.error-message');
                if (errorMsg) errorMsg.style.display = 'block';
                isValid = false;
            }
        }

        // Date validation
        const checkinInput = document.getElementById('checkIn');
        const checkoutInput = document.getElementById('checkOut');
        
        if (checkinInput && checkoutInput) {
            const checkinDate = new Date(checkinInput.value);
            const checkoutDate = new Date(checkoutInput.value);
            const today = new Date();
            
            if (checkinDate <= today) {
                checkinInput.classList.add('error');
                isValid = false;
            }
            
            if (checkoutDate <= checkinDate) {
                checkoutInput.classList.add('error');
                isValid = false;
            }
        }

        return isValid;
    }

    function initRoomPreselection() {
        var roomNameToValue = {
            'Standard Mountain Room': 'Standard',
            'Deluxe Family Suite': 'Deluxe',
            'Premium Panorama Suite': 'Premium'
        };

        document.querySelectorAll('.book-room-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                var roomName = this.getAttribute('data-room');
                var roomValue = roomNameToValue[roomName];

                if (roomValue) {
                    var roomSelect = document.getElementById('roomType');
                    if (roomSelect) {
                        roomSelect.value = roomValue;
                        roomSelect.dispatchEvent(new Event('change'));
                    }
                }

                var bookingSection = document.getElementById('booking');
                if (bookingSection) {
                    bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    function initRoomDetailModals() {
        var roomData = [
            {
                nameEn: 'Standard Mountain Room',
                nameAl: 'Dhom\u00eb Standard Malore',
                image: '/images/nice-room.jpg',
                priceAll: '5,000',
                priceEur: '~\u20ac46',
                guestsEn: 'Up to 2 Guests',
                guestsAl: 'Deri n\u00eb 2 Vizitor\u00eb',
                amenitiesEn: ['1 Double Bed', 'Mountain View', 'Free WiFi', 'Private Bathroom', 'Heating', 'Breakfast Included', 'Daily Housekeeping'],
                amenitiesAl: ['1 Krevat Dopio', 'Pamje Nga Mali', 'WiFi Falas', 'Banjo Private', 'Ngrohje', 'M\u00ebngjesi i P\u00ebrfshir\u00eb', 'Past\u00ebrtia Ditore'],
                descEn: 'You\'ll sleep well here. Open the window in the morning and the first thing you hear is birds. Mountain view, double bed, free WiFi \u2014 everything you actually need.',
                descAl: 'Do t\u00eb flini mir\u00eb k\u00ebtu. Hap dritaren n\u00eb m\u00ebngjjes dhe gj\u00ebja e par\u00eb q\u00eb d\u00ebgjon jan\u00eb zogjt\u00eb. Pamje mali, krevat dopio, WiFi falas \u2014 gjith\u00e7ka q\u00eb ju nevojitet v\u00ebrtet.',
                bookValue: 'Standard'
            },
            {
                nameEn: 'Deluxe Family Suite',
                nameAl: 'Suit\u00eb Familjare Deluxe',
                image: '/images/family-room.jpg',
                priceAll: '6,000',
                priceEur: '~\u20ac55',
                guestsEn: 'Up to 4 Guests',
                guestsAl: 'Deri n\u00eb 4 Vizitor\u00eb',
                amenitiesEn: ['2 Beds', 'Seating Area', 'Private Bathroom', 'Free WiFi', 'Heating', 'Breakfast Included', 'Mountain View', 'Daily Housekeeping'],
                amenitiesAl: ['2 Krevate', 'Zon\u00eb Ndenjeje', 'Banjo Private', 'WiFi Falas', 'Ngrohje', 'M\u00ebngjesi i P\u00ebrfshir\u00eb', 'Pamje Nga Mali', 'Past\u00ebrtia Ditore'],
                descEn: 'Enough space for everyone to spread out. Separate sleeping areas so the kids can crash early while you enjoy the evening. Clean, quiet, and the perfect size for a family.',
                descAl: 'Hap\u00ebsir\u00eb e mjaftueshme p\u00ebr t\u00eb gjith\u00eb. Zona gjumi t\u00eb ndara q\u00eb f\u00ebmij\u00ebt t\u00eb flen\u00eb her\u00ebt nd\u00ebrsa ju shijoni mbr\u00ebmjen. E past\u00ebr, e qet\u00eb, dhe madh\u00ebsia perfekte p\u00ebr nj\u00eb familje.',
                bookValue: 'Deluxe'
            },
            {
                nameEn: 'Premium Panorama Suite',
                nameAl: 'Suit\u00eb Premium Panoramike',
                image: '/images/double-bed-room.jpg',
                priceAll: '7,000',
                priceEur: '~\u20ac65',
                guestsEn: 'Up to 5 Guests',
                guestsAl: 'Deri n\u00eb 5 Vizitor\u00eb',
                amenitiesEn: ['King Size Bed', 'Jacuzzi', 'Private Balcony', 'Panoramic View', 'Free WiFi', 'Heating', 'Breakfast Included', 'Premium Toiletries', 'Daily Housekeeping'],
                amenitiesAl: ['Krevat King Size', 'Jakuzi', 'Ballkon Privat', 'Pamje Panoramike', 'WiFi Falas', 'Ngrohje', 'M\u00ebngjesi i P\u00ebrfshir\u00eb', 'Artikuj Premium Tualeti', 'Past\u00ebrtia Ditore'],
                descEn: 'Your private balcony looks out over the entire valley. There\'s a jacuzzi, a king bed, and nothing you need to do except be there. The kind of room you plan a trip around.',
                descAl: 'Ballkoni juaj privat shikon mbi gjith\u00eb lugin\u00ebn. Ka nj\u00eb jakuzi, nj\u00eb krevat king, dhe asgj\u00eb q\u00eb duhet t\u00eb b\u00ebni p\u00ebrve\u00e7se t\u00eb jeni aty. Lloji i dhom\u00ebs rreth s\u00eb cil\u00ebs planifikoni nj\u00eb udh\u00ebtim.',
                bookValue: 'Premium'
            }
        ];

        // Create modal HTML
        var modalHTML = '<div class="room-detail-modal" id="roomDetailModal">' +
            '<div class="room-detail-modal-content">' +
                '<button class="room-detail-modal-close" id="roomDetailClose"><i class="fas fa-times"></i></button>' +
                '<div class="room-detail-modal-body">' +
                    '<div class="room-detail-image"><img id="roomDetailImg" src="" alt="">' +
                        '<div class="room-detail-price" id="roomDetailPrice"></div>' +
                    '</div>' +
                    '<div class="room-detail-info">' +
                        '<h2 id="roomDetailName"></h2>' +
                        '<p class="room-detail-guests" id="roomDetailGuests"></p>' +
                        '<p class="room-detail-desc" id="roomDetailDesc"></p>' +
                        '<h4 id="roomDetailAmenitiesLabel"></h4>' +
                        '<ul class="room-detail-amenities" id="roomDetailAmenities"></ul>' +
                        '<a href="#booking" class="btn book-from-modal" id="roomDetailBookBtn"></a>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        var modal = document.getElementById('roomDetailModal');
        var closeBtn = document.getElementById('roomDetailClose');

        // Open modal on room details click
        document.querySelectorAll('.room-details-btn').forEach(function(btn, index) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                var room = roomData[index];
                if (!room) return;

                var lang = currentLang || 'al';

                document.getElementById('roomDetailImg').src = room.image;
                document.getElementById('roomDetailImg').alt = lang === 'en' ? room.nameEn : room.nameAl;
                document.getElementById('roomDetailName').textContent = lang === 'en' ? room.nameEn : room.nameAl;
                document.getElementById('roomDetailGuests').innerHTML = '<i class="fas fa-users"></i> ' + (lang === 'en' ? room.guestsEn : room.guestsAl);
                document.getElementById('roomDetailDesc').textContent = lang === 'en' ? room.descEn : room.descAl;
                document.getElementById('roomDetailPrice').textContent = room.priceAll + ' ALL / ' + room.priceEur;
                document.getElementById('roomDetailAmenitiesLabel').textContent = lang === 'en' ? 'Amenities' : 'Pajisjet';

                var amenitiesList = document.getElementById('roomDetailAmenities');
                amenitiesList.innerHTML = '';
                var amenities = lang === 'en' ? room.amenitiesEn : room.amenitiesAl;
                amenities.forEach(function(a) {
                    var li = document.createElement('li');
                    li.innerHTML = '<i class="fas fa-check"></i> ' + a;
                    amenitiesList.appendChild(li);
                });

                var bookBtn = document.getElementById('roomDetailBookBtn');
                bookBtn.textContent = lang === 'en' ? 'Book This Room' : 'Rezervo K\u00ebt\u00eb Dhom\u00eb';
                bookBtn.setAttribute('data-room-value', room.bookValue);

                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        // Close modal
        function closeRoomModal() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }

        closeBtn.addEventListener('click', closeRoomModal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeRoomModal();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) closeRoomModal();
        });

        // Book from modal button
        document.getElementById('roomDetailBookBtn').addEventListener('click', function(e) {
            e.preventDefault();
            var roomValue = this.getAttribute('data-room-value');
            var roomSelect = document.getElementById('roomType');
            if (roomSelect && roomValue) {
                roomSelect.value = roomValue;
                roomSelect.dispatchEvent(new Event('change'));
            }
            closeRoomModal();
            document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
        });
    }

    function showBookingConfirmation(bookingData) {
        const modal = document.getElementById('bookingModal');
        const bookingSummary = document.getElementById('bookingSummary');
        
        if (modal) {
            // Display booking summary if we have booking data
            if (bookingData && bookingSummary) {
                const checkinDate = new Date(bookingData.checkInDate).toLocaleDateString(currentLang === 'al' ? 'sq-AL' : 'en-US');
                const checkoutDate = new Date(bookingData.checkOutDate).toLocaleDateString(currentLang === 'al' ? 'sq-AL' : 'en-US');
                
                // Format prices
                const totalPrice = bookingData.totalPrice || 0;

                const summaryHTML = `
                    <div class="booking-summary">
                        <h4 style="color: #2c5f2d; margin-bottom: 20px;">${currentLang === 'al' ? '✅ Rezervimi i Suksesshëm!' : '✅ Reservation Successful!'}</h4>

                        <div class="summary-details">
                            <p><strong>${currentLang === 'al' ? 'Dhoma:' : 'Room:'}</strong> ${bookingData.roomType}</p>
                            <p><strong>${currentLang === 'al' ? 'Check-in:' : 'Check-in:'}</strong> ${checkinDate}</p>
                            <p><strong>${currentLang === 'al' ? 'Check-out:' : 'Check-out:'}</strong> ${checkoutDate}</p>
                            <p><strong>${currentLang === 'al' ? 'Net:' : 'Nights:'}</strong> ${bookingData.totalNights || 0}</p>
                            <p><strong>${currentLang === 'al' ? 'Vizitorët:' : 'Guests:'}</strong> ${bookingData.numberOfGuests}</p>
                            <p><strong>${currentLang === 'al' ? 'Email:' : 'Email:'}</strong> ${bookingData.email}</p>
                            ${bookingData.phone ? `<p><strong>${currentLang === 'al' ? 'Telefon:' : 'Phone:'}</strong> ${bookingData.phone}</p>` : ''}
                            ${bookingData.specialRequests ? `<p><strong>${currentLang === 'al' ? 'Kërkesa:' : 'Requests:'}</strong> ${bookingData.specialRequests}</p>` : ''}
                        </div>

                        <div class="booking-price" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2c5f2d;">
                            <h5 style="margin-bottom: 15px; color: #2c5f2d;">${currentLang === 'al' ? '💰 Çmimi i Përafërt' : '💰 Estimated Price'}</h5>
                            <p style="font-size: 24px; font-weight: bold; color: #2c5f2d; margin: 10px 0;">
                                ${currentLang === 'al' ? 'Totali:' : 'Total:'} <span style="color: #e67e22;">${totalPrice.toLocaleString()} Lek</span>
                            </p>
                            <p style="font-size: 14px; color: #666; margin-top: 10px;">
                                <i class="fas fa-info-circle" style="color: #2c5f2d; margin-right: 5px;"></i>
                                ${currentLang === 'al' ? 'Paguani në arritje — nuk kërkohet pagesë online.' : 'Pay at arrival — no online payment required.'}
                            </p>
                        </div>

                        <div class="booking-id" style="background: #e8f5e9; padding: 15px; border-radius: 8px; text-align: center;">
                            <p><strong>${currentLang === 'al' ? 'ID e Rezervimit:' : 'Reservation Reference:'}</strong></p>
                            <p style="font-size: 20px; font-weight: bold; color: #2c5f2d; letter-spacing: 2px;">${bookingData.reference || bookingData._id || 'N/A'}</p>
                        </div>

                        <div class="booking-instructions" style="margin-top: 20px; padding: 15px; background: #e8f5e9; border-radius: 8px;">
                            <p style="margin: 0; font-size: 14px;">
                                <strong>📧 ${currentLang === 'al' ? 'Konfirmimi i dërguar!' : 'Confirmation sent!'}</strong><br>
                                ${currentLang === 'al' ? 'Ju kemi dërguar një email me detajet e rezervimit. Paguani drejtpërdrejt në hotel kur të arrini.' : 'We have sent you an email with your reservation details. Pay directly at the hotel when you arrive.'}
                            </p>
                        </div>
                    </div>
                `;
                bookingSummary.innerHTML = summaryHTML;
            }
            
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
        }
    }

    function initTestimonialSlider() {
        let currentSlide = 0;
        const slides = document.querySelectorAll('.testimonial');
        const track = document.querySelector('.testimonials-track');
        const dotsContainer = document.querySelector('.testimonial-dots');

        if (!slides.length || !track) return;

        // Dynamically generate dots for all slides
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            slides.forEach(function(_, i) {
                var dot = document.createElement('span');
                dot.className = 'dot' + (i === 0 ? ' active' : '');
                dot.addEventListener('click', function() {
                    currentSlide = i;
                    showSlide(currentSlide);
                    resetAutoPlay();
                });
                dotsContainer.appendChild(dot);
            });
        }

        var dots = document.querySelectorAll('.dot');

        function showSlide(index) {
            var translateX = -index * 100;
            track.style.transform = 'translateX(' + translateX + '%)';

            // Update dots
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        // Auto-play with reset capability
        var autoPlayInterval;
        function startAutoPlay() {
            autoPlayInterval = setInterval(function() {
                currentSlide = (currentSlide + 1) % slides.length;
                showSlide(currentSlide);
            }, 5000);
        }
        function resetAutoPlay() {
            clearInterval(autoPlayInterval);
            startAutoPlay();
        }

        startAutoPlay();
        showSlide(0);
    }

    function initAOS() {
        // Initialize AOS (Animate On Scroll) if available
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 1000,
                easing: 'ease-in-out',
                once: true,
                disable: false
            });
            console.log('AOS initialized');
        } else {
            console.log('AOS not found - sections should still be visible');
            // Ensure all sections are visible even without AOS
            const sections = document.querySelectorAll('section[data-aos]');
            sections.forEach(section => {
                section.style.opacity = '1';
                section.style.transform = 'none';
            });
        }
    }

    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            if (email) {
                alert(currentLang === 'al' ? 'Faleminderit për abonimin!' : 'Thank you for subscribing!');
                this.reset();
            }
        });
    }

    // Gallery lightbox functionality
    const galleryItems = document.querySelectorAll('.gallery-item, .food-gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            if (!img) return;
            
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox-modal';
            lightbox.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                cursor: pointer;
            `;
            
            const lightboxImg = document.createElement('img');
            lightboxImg.src = img.src;
            lightboxImg.style.cssText = `
                max-width: 90%;
                max-height: 90%;
                border-radius: 10px;
                box-shadow: 0 0 30px rgba(255,255,255,0.3);
            `;
            
            lightbox.appendChild(lightboxImg);
            document.body.appendChild(lightbox);
            
            // Close lightbox on click
            lightbox.addEventListener('click', () => {
                document.body.removeChild(lightbox);
            });
            
            // Close on escape key
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    document.body.removeChild(lightbox);
                    document.removeEventListener('keydown', escapeHandler);
                }
            };
            document.addEventListener('keydown', escapeHandler);
        });
    });

    // Book now floating button
    const bookNowBtn = document.querySelector('.book-now-btn');
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', function() {
            document.getElementById('booking').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }

    function showVirtualTourModalLegacy() {
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'virtual-tour-modal-overlay';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'virtual-tour-modal-content';
        modalContent.style.cssText = `
            position: relative;
            width: 90%;
            max-width: 1000px;
            height: 80%;
            max-height: 600px;
            background: #000;
            border-radius: 12px;
            overflow: hidden;
            transform: scale(0.8);
            transition: transform 0.3s ease;
        `;
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.style.cssText = `
            position: absolute;
            top: 15px;
            right: 20px;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            font-size: 30px;
            cursor: pointer;
            z-index: 10001;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.3s ease;
        `;
        
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.background = 'rgba(255, 255, 255, 0.4)';
        });
        
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.background = 'rgba(255, 255, 255, 0.2)';
        });
        
        // Create video iframe - Replace this URL with your actual video URL
        const videoIframe = document.createElement('iframe');
        videoIframe.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
        `;
        
        // Vila Falo Virtual Tour
        videoIframe.src = 'https://www.youtube.com/embed/G3vLz2ZGffE?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1';
        videoIframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        videoIframe.allowFullscreen = true;
        
        // Assemble modal
        modalContent.appendChild(closeButton);
        modalContent.appendChild(videoIframe);
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
        
        // Show modal with animation
        setTimeout(() => {
            modalOverlay.style.opacity = '1';
            modalContent.style.transform = 'scale(1)';
        }, 10);
        
        // Close modal function
        function closeModal() {
            modalOverlay.style.opacity = '0';
            modalContent.style.transform = 'scale(0.8)';
            setTimeout(() => {
                if (modalOverlay.parentNode) {
                    modalOverlay.parentNode.removeChild(modalOverlay);
                }
            }, 300);
        }
        
        // Close modal events
        closeButton.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
        
        // Close on escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    console.log('All JavaScript initialized successfully');
});

// Add CSS for snowfall animation
const style = document.createElement('style');
style.textContent = `
    @keyframes snowfall {
        0% {
            transform: translateY(0) rotate(0deg);
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
        }
    }
    
    .snowflake {
        user-select: none;
        animation-fill-mode: forwards;
    }
    
    .header.scrolled {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    }
    
    .back-to-top.visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    .error {
        border-color: #e74c3c !important;
        box-shadow: 0 0 5px rgba(231, 76, 60, 0.3) !important;
    }
    
    .error-message {
        color: #e74c3c;
        font-size: 0.85em;
        margin-top: 5px;
        display: none;
    }
    
    /* Calendar Styles */
    .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;
        margin-top: 15px;
    }
    
    .calendar-day-header {
        text-align: center;
        font-weight: bold;
        color: #2c3e50;
        padding: 8px;
        font-size: 0.9em;
    }
    
    .calendar-day {
        text-align: center;
        padding: 12px 8px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
        border: 2px solid transparent;
    }
    
    .calendar-day:not(.empty):not(.past) {
        background: #f8f9fa;
        border-color: #e9ecef;
    }
    
    .calendar-day.available {
        background: #d4edda;
        border-color: #c3e6cb;
        color: #155724;
    }
    
    .calendar-day.available:hover {
        background: #c3e6cb;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .calendar-day.selected {
        background: #007bff;
        border-color: #0056b3;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,123,255,0.3);
    }
    
    .calendar-day.booked {
        background: #f8d7da;
        border-color: #f5c6cb;
        color: #721c24;
        cursor: not-allowed;
    }
    
    .calendar-day.past {
        background: #f8f9fa;
        color: #6c757d;
        cursor: not-allowed;
        opacity: 0.5;
    }
    
    .calendar-day.empty {
        background: transparent;
        cursor: default;
    }
    
    .availability-calendar {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        margin-top: 20px;
    }
    
    .availability-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }
    
    .calendar-controls {
        display: flex;
        gap: 10px;
    }
    
    .calendar-control {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #007bff;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .calendar-control:hover {
        background: #0056b3;
        transform: scale(1.1);
    }
    
    .calendar-month {
        text-align: center;
        font-size: 1.2em;
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 10px;
    }
    
    .availability-note {
        text-align: center;
        margin-top: 15px;
        font-size: 0.9em;
        color: #6c757d;
    }
`;
document.head.appendChild(style);

// Add calendar-specific styles
const calendarStyle = document.createElement('style');
calendarStyle.textContent = `
    @media (max-width: 768px) {
        .calendar-day {
            padding: 8px 4px;
            font-size: 0.9em;
        }
        
        .availability-calendar {
            padding: 15px;
        }
        
        .calendar-controls {
            gap: 5px;
        }
        
        .calendar-control {
            width: 32px;
            height: 32px;
        }
    }
`;
document.head.appendChild(calendarStyle);

    // ============ HOVER EFFECT INITIALIZATION ============
    function showFallbackImage(container, src, alt) {
        if (container && !container.querySelector('img')) {
            container.innerHTML = '<img src="' + src + '" alt="' + alt + '" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">';
        }
    }

    function initHoverEffects(retryCount) {
        retryCount = retryCount || 0;
        var aboutContainer = document.getElementById('about-hover-container');
        var restaurantContainer = document.getElementById('restaurant-hover-container');

        // If libraries didn't load yet, retry up to 5 times with delays
        if (typeof hoverEffect === 'undefined' || typeof THREE === 'undefined' || typeof TweenMax === 'undefined') {
            if (retryCount < 5) {
                console.log('Hover-effect dependencies not ready (attempt ' + (retryCount + 1) + '/5), retrying...');
                setTimeout(function() { initHoverEffects(retryCount + 1); }, 500 * (retryCount + 1));
                return;
            }
            console.warn('Hover-effect dependencies missing after retries: THREE=' + (typeof THREE) + ', TweenMax=' + (typeof TweenMax) + ', hoverEffect=' + (typeof hoverEffect));
            showFallbackImage(aboutContainer, '/images/outside-main.jpg', 'Vila Falo');
            showFallbackImage(restaurantContainer, '/images/restaurant-love.jpg', 'Vila Falo Restaurant');
            return;
        }

        var displacementImg = '/images/13.jpg';

        // About section hover effect (summer ↔ winter) - both 960x960
        if (aboutContainer && !aboutContainer.querySelector('canvas')) {
            try {
                new hoverEffect({
                    parent: aboutContainer,
                    intensity: 0.3,
                    image1: '/images/outside-main.jpg',
                    image2: '/images/outside-snow.jpg',
                    displacementImage: displacementImg,
                    speedIn: 1.6,
                    speedOut: 1.2
                });
                console.log('About hover effect initialized successfully');
            } catch (e) {
                console.warn('About hover effect failed:', e);
                showFallbackImage(aboutContainer, '/images/outside-main.jpg', 'Vila Falo');
            }
        }

        // Restaurant section hover effect (restaurant-love ↔ lakror) - both 960x720
        if (restaurantContainer && !restaurantContainer.querySelector('canvas')) {
            try {
                new hoverEffect({
                    parent: restaurantContainer,
                    intensity: 0.25,
                    image1: '/images/restaurant-love.jpg',
                    image2: '/images/lakror.jpg',
                    displacementImage: displacementImg,
                    speedIn: 1.4,
                    speedOut: 1.0
                });
                console.log('Restaurant hover effect initialized successfully');
            } catch (e) {
                console.warn('Restaurant hover effect failed:', e);
                showFallbackImage(restaurantContainer, '/images/restaurant-love.jpg', 'Vila Falo Restaurant');
            }
        }

        // Timeout fallback: if after 5 seconds containers are still empty, show static images
        setTimeout(function() {
            var about = document.getElementById('about-hover-container');
            var restaurant = document.getElementById('restaurant-hover-container');
            if (about && !about.querySelector('canvas') && !about.querySelector('img')) {
                showFallbackImage(about, '/images/outside-main.jpg', 'Vila Falo');
            }
            if (restaurant && !restaurant.querySelector('canvas') && !restaurant.querySelector('img')) {
                showFallbackImage(restaurant, '/images/restaurant-love.jpg', 'Vila Falo Restaurant');
            }
        }, 5000);
    }

    // Initialize new features - use slight delay to let external libs finish loading
    setTimeout(function() { initHoverEffects(0); }, 100);

    // ============ STICKY BOOKING BAR ============
    function initBookingBar() {
        var bar = document.getElementById('bookingBar');
        var hero = document.getElementById('home');
        var bookingSection = document.getElementById('booking');
        if (!bar || !hero) return;

        // Show bar when hero is not visible
        var heroObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (!entry.isIntersecting) {
                    bar.classList.add('visible');
                } else {
                    bar.classList.remove('visible');
                }
            });
        }, { threshold: 0 });
        heroObserver.observe(hero);

        // Hide bar when booking section is visible
        if (bookingSection) {
            var bookingObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        bar.classList.remove('visible');
                    }
                });
            }, { threshold: 0.2 });
            bookingObserver.observe(bookingSection);
        }

        // Check Availability click: transfer dates to booking form
        var checkBtn = document.getElementById('barCheckAvail');
        if (checkBtn) {
            checkBtn.addEventListener('click', function() {
                var ci = document.getElementById('barCheckIn').value;
                var co = document.getElementById('barCheckOut').value;
                var guests = document.getElementById('barGuests').value;
                if (ci) document.getElementById('checkInDate').value = ci;
                if (co) document.getElementById('checkOutDate').value = co;
                if (guests) document.getElementById('adults').value = guests;
                document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
            });
        }

        // Hero "Book Your Stay" opens bar and focuses check-in
        var heroBtn = document.getElementById('heroBookBtn');
        if (heroBtn) {
            heroBtn.addEventListener('click', function(e) {
                e.preventDefault();
                bar.classList.add('visible');
                setTimeout(function() {
                    document.getElementById('barCheckIn').focus();
                }, 400);
            });
        }
    }

    // ============ ROOM LIGHTBOX ============
    function initRoomLightbox() {
        var lightbox = document.getElementById('roomLightbox');
        var lbImg = document.getElementById('lightboxImg');
        var lbCounter = document.getElementById('lightboxCounter');
        if (!lightbox || !lbImg) return;

        var gallery = [];
        var currentIndex = 0;

        // Click room image to open lightbox
        document.querySelectorAll('.room-img img').forEach(function(img) {
            img.style.cursor = 'pointer';
            img.addEventListener('click', function() {
                var card = this.closest('.room-card');
                var extraImgs = this.getAttribute('data-gallery');
                gallery = [this.src];
                if (extraImgs) {
                    extraImgs.split(',').forEach(function(name) {
                        gallery.push('/images/' + name.trim());
                    });
                }
                currentIndex = 0;
                showSlide();
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        function showSlide() {
            lbImg.src = gallery[currentIndex];
            lbCounter.textContent = (currentIndex + 1) + ' / ' + gallery.length;
        }

        document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
        document.getElementById('lightboxPrev').addEventListener('click', function() {
            currentIndex = (currentIndex - 1 + gallery.length) % gallery.length;
            showSlide();
        });
        document.getElementById('lightboxNext').addEventListener('click', function() {
            currentIndex = (currentIndex + 1) % gallery.length;
            showSlide();
        });

        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', function(e) {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') {
                currentIndex = (currentIndex - 1 + gallery.length) % gallery.length;
                showSlide();
            }
            if (e.key === 'ArrowRight') {
                currentIndex = (currentIndex + 1) % gallery.length;
                showSlide();
            }
        });

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // ============ SEASON CARD CLICK-TO-SCROLL ============
    function initSeasonClicks() {
        var seasonTargets = {
            'season-winter': '#services',
            'season-spring': '#gallery',
            'season-summer': '#about',
            'season-autumn': '#gallery'
        };

        document.querySelectorAll('.season-card').forEach(function(card) {
            card.style.cursor = 'pointer';
            var classes = card.className.split(' ');
            for (var i = 0; i < classes.length; i++) {
                if (seasonTargets[classes[i]]) {
                    card.setAttribute('data-scroll-target', seasonTargets[classes[i]]);
                    break;
                }
            }
            card.addEventListener('click', function() {
                var target = this.getAttribute('data-scroll-target');
                if (target) {
                    var el = document.querySelector(target);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // ============ GSAP SCROLL ANIMATIONS ============
    function initGSAPAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.warn('GSAP or ScrollTrigger not available for scroll animations');
            return;
        }
        gsap.registerPlugin(ScrollTrigger);

        // --- Section titles: split character reveal ---
        document.querySelectorAll('.section-title h2').forEach(function(h2) {
            var text = h2.textContent;
            var chars = text.split('');
            h2.innerHTML = chars.map(function(c) {
                return c === ' ' ? ' ' : '<span style="display:inline-block;opacity:0;transform:translateY(30px)">' + c + '</span>';
            }).join('');
            var spans = h2.querySelectorAll('span');
            if (spans.length) {
                gsap.to(spans, {
                    opacity: 1, y: 0,
                    duration: 0.5,
                    stagger: 0.02,
                    ease: 'back.out(1.5)',
                    scrollTrigger: {
                        trigger: h2,
                        start: 'top 88%',
                        toggleActions: 'play none none none'
                    }
                });
            }
        });

        document.querySelectorAll('.section-title p').forEach(function(p) {
            gsap.fromTo(p,
                { y: 25, opacity: 0, filter: 'blur(6px)' },
                {
                    y: 0, opacity: 1, filter: 'blur(0px)',
                    duration: 0.8,
                    delay: 0.3,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: p,
                        start: 'top 90%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });

        // --- About section: parallax split reveal ---
        var aboutText = document.querySelector('.about-text');
        if (aboutText) {
            gsap.fromTo(aboutText,
                { x: -80, opacity: 0, filter: 'blur(4px)' },
                {
                    x: 0, opacity: 1, filter: 'blur(0px)',
                    duration: 1.2,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: '.about-content',
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        var aboutImg = document.querySelector('.about-hover-img');
        if (aboutImg) {
            gsap.fromTo(aboutImg,
                { x: 80, opacity: 0, scale: 0.9, filter: 'blur(4px)' },
                {
                    x: 0, opacity: 1, scale: 1, filter: 'blur(0px)',
                    duration: 1.2,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: '.about-content',
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // --- About features: staggered bounce-in with rotation ---
        var aboutFeatures = document.querySelectorAll('.feature-item');
        if (aboutFeatures.length) {
            gsap.fromTo(aboutFeatures,
                { y: 50, opacity: 0, scale: 0.8, rotationX: 20 },
                {
                    y: 0, opacity: 1, scale: 1, rotationX: 0,
                    duration: 0.7,
                    stagger: 0.12,
                    ease: 'back.out(1.7)',
                    scrollTrigger: {
                        trigger: '.about-features',
                        start: 'top 88%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // --- Room cards: 3D flip-in with stagger ---
        var roomCards = document.querySelectorAll('.room-card');
        if (roomCards.length) {
            roomCards.forEach(function(card, i) {
                gsap.fromTo(card,
                    { y: 80, opacity: 0, rotationX: 15, scale: 0.9, filter: 'blur(4px)' },
                    {
                        y: 0, opacity: 1, rotationX: 0, scale: 1, filter: 'blur(0px)',
                        duration: 1,
                        delay: i * 0.2,
                        ease: 'power4.out',
                        scrollTrigger: {
                            trigger: '.rooms-grid',
                            start: 'top 85%',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            });
        }

        // --- Room images: smooth parallax within cards ---
        document.querySelectorAll('.room-img img').forEach(function(img) {
            gsap.fromTo(img,
                { yPercent: -8, scale: 1.08 },
                {
                    yPercent: 8, scale: 1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: img.closest('.room-card'),
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1.5
                    }
                }
            );
        });

        // --- Service cards: wave entrance ---
        var serviceCardsV2 = document.querySelectorAll('.service-card-v2');
        if (serviceCardsV2.length) {
            serviceCardsV2.forEach(function(card, i) {
                gsap.fromTo(card,
                    { y: 60, opacity: 0, scale: 0.85, filter: 'blur(3px)' },
                    {
                        y: 0, opacity: 1, scale: 1, filter: 'blur(0px)',
                        duration: 0.7,
                        delay: i * 0.08,
                        ease: 'back.out(1.2)',
                        scrollTrigger: {
                            trigger: '.services-grid-v2',
                            start: 'top 85%',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            });
        }

        // --- Restaurant section: cinematic split reveal ---
        var restaurantContent = document.querySelector('#restaurant .restaurant-content');
        if (restaurantContent) {
            gsap.fromTo(restaurantContent,
                { x: -70, opacity: 0, filter: 'blur(5px)' },
                {
                    x: 0, opacity: 1, filter: 'blur(0px)',
                    duration: 1.2,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: '#restaurant .restaurant-container',
                        start: 'top 78%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // --- Honey section: smooth dual reveal ---
        var honeyContent = document.querySelector('#honey .restaurant-content');
        if (honeyContent) {
            gsap.fromTo(honeyContent,
                { x: -70, opacity: 0, filter: 'blur(5px)' },
                {
                    x: 0, opacity: 1, filter: 'blur(0px)',
                    duration: 1.2,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: '#honey .restaurant-container',
                        start: 'top 78%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        var honeyRight = document.querySelector('.honey-right-col');
        if (honeyRight) {
            gsap.fromTo(honeyRight,
                { x: 70, opacity: 0, scale: 0.95, filter: 'blur(5px)' },
                {
                    x: 0, opacity: 1, scale: 1, filter: 'blur(0px)',
                    duration: 1.2,
                    delay: 0.15,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: '#honey .restaurant-container',
                        start: 'top 78%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // --- Food fan cards: dramatic fan open ---
        var foodCards = document.querySelectorAll('.food-fan-card');
        if (foodCards.length) {
            foodCards.forEach(function(card, i) {
                var angle = (i - 1.5) * 12;
                gsap.fromTo(card,
                    { y: 60, opacity: 0, rotationY: angle, scale: 0.85 },
                    {
                        y: 0, opacity: 1, rotationY: 0, scale: 1,
                        duration: 0.9,
                        delay: i * 0.1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: '.food-fan-track',
                            start: 'top 85%',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            });
        }

        // --- Reviews section: simple fade in (no transforms on track/cards — conflicts with carousel) ---
        var reviewsSection = document.querySelector('.reviews-section');
        if (reviewsSection) {
            gsap.fromTo(reviewsSection,
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: 1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: '.reviews-section',
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // --- Booking section: smooth dual entrance ---
        var bookingInfo = document.querySelector('.booking-info');
        if (bookingInfo) {
            gsap.fromTo(bookingInfo,
                { x: -60, opacity: 0, filter: 'blur(4px)' },
                {
                    x: 0, opacity: 1, filter: 'blur(0px)',
                    duration: 1,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: '.booking-container',
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        var bookingForm = document.querySelector('.booking-form');
        if (bookingForm) {
            gsap.fromTo(bookingForm,
                { y: 60, opacity: 0, scale: 0.95, filter: 'blur(4px)' },
                {
                    y: 0, opacity: 1, scale: 1, filter: 'blur(0px)',
                    duration: 1,
                    delay: 0.15,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: '.booking-container',
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // --- Booking form fields: cascade reveal ---
        var formGroups = document.querySelectorAll('.booking-form .form-group');
        if (formGroups.length) {
            gsap.fromTo(formGroups,
                { y: 20, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    duration: 0.35,
                    stagger: 0.05,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: '.booking-form',
                        start: 'top 78%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // --- Location section: map cinematic zoom ---
        var mapFrame = document.querySelector('.map-frame');
        if (mapFrame) {
            gsap.fromTo(mapFrame,
                { scale: 0.85, opacity: 0, borderRadius: '30px', filter: 'blur(6px)' },
                {
                    scale: 1, opacity: 1, borderRadius: '12px', filter: 'blur(0px)',
                    duration: 1.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: mapFrame,
                        start: 'top 82%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // --- Location info: smooth content reveal ---
        var locationInfo = document.querySelector('.location-info');
        if (locationInfo) {
            gsap.fromTo(locationInfo,
                { x: -60, opacity: 0, filter: 'blur(4px)' },
                {
                    x: 0, opacity: 1, filter: 'blur(0px)',
                    duration: 1,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: '.location-container',
                        start: 'top 78%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // --- Contact items: bounce in with icon spin ---
        var contactItems = document.querySelectorAll('.contact-item');
        if (contactItems.length) {
            gsap.fromTo(contactItems,
                { x: -40, opacity: 0 },
                {
                    x: 0, opacity: 1,
                    duration: 0.6,
                    stagger: 0.12,
                    ease: 'back.out(1.4)',
                    scrollTrigger: {
                        trigger: contactItems[0].parentElement,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        var contactIcons = document.querySelectorAll('.contact-icon');
        if (contactIcons.length) {
            gsap.fromTo(contactIcons,
                { scale: 0, rotation: -180 },
                {
                    scale: 1, rotation: 0,
                    duration: 0.6,
                    stagger: 0.12,
                    ease: 'back.out(2)',
                    scrollTrigger: {
                        trigger: contactIcons[0].closest('.contact-info'),
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // --- Season cards: wave pop with depth ---
        var seasonCards = document.querySelectorAll('.season-card');
        if (seasonCards.length) {
            seasonCards.forEach(function(card, i) {
                gsap.fromTo(card,
                    { y: 50, opacity: 0, scale: 0.8, rotationX: 15 },
                    {
                        y: 0, opacity: 1, scale: 1, rotationX: 0,
                        duration: 0.7,
                        delay: i * 0.12,
                        ease: 'back.out(1.5)',
                        scrollTrigger: {
                            trigger: '.seasons-grid',
                            start: 'top 85%',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            });
        }

        // --- Season highlight badges: delayed pop ---
        var seasonHighlights = document.querySelectorAll('.season-highlight');
        if (seasonHighlights.length) {
            gsap.fromTo(seasonHighlights,
                { scale: 0, opacity: 0 },
                {
                    scale: 1, opacity: 1,
                    duration: 0.5,
                    stagger: 0.1,
                    delay: 0.4,
                    ease: 'back.out(2.5)',
                    scrollTrigger: {
                        trigger: '.seasons-grid',
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // --- Hero section: parallax bg only (text always visible) ---
        var heroSection = document.querySelector('.hero');
        if (heroSection) {
            gsap.to(heroSection, {
                backgroundPositionY: '30%',
                ease: 'none',
                scrollTrigger: {
                    trigger: heroSection,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1
                }
            });
        }

        // --- Rooms section background parallax ---
        var roomsSection = document.querySelector('.rooms');
        if (roomsSection) {
            gsap.to(roomsSection, {
                backgroundPositionY: '20%',
                ease: 'none',
                scrollTrigger: {
                    trigger: roomsSection,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1.5
                }
            });
        }

        // --- Blockquotes: elegant underline reveal ---
        document.querySelectorAll('.anton-quote').forEach(function(quote) {
            gsap.fromTo(quote,
                { x: -30, opacity: 0, filter: 'blur(3px)' },
                {
                    x: 0, opacity: 1, filter: 'blur(0px)',
                    duration: 0.9,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: quote,
                        start: 'top 90%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });

        // --- Menu highlights grid: cascade ---
        var menuItems = document.querySelectorAll('.menu-item');
        if (menuItems.length) {
            gsap.fromTo(menuItems,
                { y: 25, opacity: 0, scale: 0.95 },
                {
                    y: 0, opacity: 1, scale: 1,
                    duration: 0.45,
                    stagger: 0.06,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: menuItems[0].closest('.menu-grid'),
                        start: 'top 88%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // --- CTA section: cinematic parallax + staggered text ---
        var ctaSection = document.querySelector('.cta');
        if (ctaSection) {
            gsap.fromTo(ctaSection,
                { backgroundPositionY: '80%' },
                {
                    backgroundPositionY: '20%',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: ctaSection,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1.2
                    }
                }
            );

            var ctaH2 = ctaSection.querySelector('h2');
            var ctaP = ctaSection.querySelector('p');
            var ctaBtn = ctaSection.querySelector('.btn');

            if (ctaH2) {
                gsap.fromTo(ctaH2,
                    { y: 50, opacity: 0, scale: 0.9, filter: 'blur(6px)' },
                    {
                        y: 0, opacity: 1, scale: 1, filter: 'blur(0px)',
                        duration: 1.2,
                        ease: 'power4.out',
                        scrollTrigger: {
                            trigger: ctaSection,
                            start: 'top 75%',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            }

            if (ctaP) {
                gsap.fromTo(ctaP,
                    { y: 30, opacity: 0, filter: 'blur(4px)' },
                    {
                        y: 0, opacity: 1, filter: 'blur(0px)',
                        duration: 1,
                        delay: 0.2,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: ctaSection,
                            start: 'top 75%',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            }

            if (ctaBtn) {
                gsap.fromTo(ctaBtn,
                    { y: 20, opacity: 0, scale: 0.8 },
                    {
                        y: 0, opacity: 1, scale: 1,
                        duration: 0.8,
                        delay: 0.4,
                        ease: 'back.out(2.5)',
                        scrollTrigger: {
                            trigger: ctaSection,
                            start: 'top 75%',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            }
        }

        // --- Footer columns: staggered rise with blur ---
        var footerCols = document.querySelectorAll('.footer-col');
        if (footerCols.length) {
            gsap.fromTo(footerCols,
                { y: 60, opacity: 0, filter: 'blur(4px)' },
                {
                    y: 0, opacity: 1, filter: 'blur(0px)',
                    duration: 0.8,
                    stagger: 0.15,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '.footer',
                        start: 'top 90%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // --- Bee video hexagon: float in with gentle spin ---
        var beeVideoOverlap = document.querySelector('.bee-video-overlap');
        if (beeVideoOverlap) {
            gsap.fromTo(beeVideoOverlap,
                { x: -120, opacity: 0, rotation: -15, scale: 0.8 },
                {
                    x: 0, opacity: 1, rotation: 0, scale: 1,
                    duration: 1.4,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: beeVideoOverlap,
                        start: 'top 92%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // --- Honey products: stagger pop ---
        var honeyProducts = document.querySelectorAll('.honey-right-col .food-fan-card, .honey-right-col .honey-product');
        if (honeyProducts.length) {
            gsap.fromTo(honeyProducts,
                { y: 40, opacity: 0, scale: 0.85 },
                {
                    y: 0, opacity: 1, scale: 1,
                    duration: 0.7,
                    stagger: 0.12,
                    ease: 'back.out(1.5)',
                    scrollTrigger: {
                        trigger: '.honey-right-col',
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // --- Scroll-linked number counter ---
        document.querySelectorAll('[data-count]').forEach(function(el) {
            var target = parseInt(el.getAttribute('data-count'));
            var obj = { val: 0 };
            gsap.to(obj, {
                val: target,
                duration: 2,
                ease: 'power1.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                onUpdate: function() {
                    el.textContent = Math.round(obj.val);
                }
            });
        });

    }

    // Init GSAP animations after a small delay
    setTimeout(initGSAPAnimations, 200);

    // ============ STEPPER CONTROLS (Adults/Children/Rooms) ============
    function updateGuestCount() {
        var adults = parseInt(document.getElementById('adults')?.value || 2);
        var children = parseInt(document.getElementById('children')?.value || 0);
        var hidden = document.getElementById('numberOfGuests');
        if (hidden) hidden.value = adults + children;
    }

    document.querySelectorAll('.stepper-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var targetId = this.getAttribute('data-target');
            var input = document.getElementById(targetId);
            if (!input) return;
            var val = parseInt(input.value) || 0;
            var min = parseInt(input.min) || 0;
            var max = parseInt(input.max) || 99;
            if (this.classList.contains('stepper-plus')) {
                if (val < max) input.value = val + 1;
            } else {
                if (val > min) input.value = val - 1;
            }
            updateGuestCount();
            // Trigger change event for price calculator
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
    });

    // ============ FOOD FAN-OUT GSAP ANIMATION ============
    setTimeout(function() {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            var foodFanCards = document.querySelectorAll('.food-fan-card');
            if (foodFanCards.length) {
                gsap.fromTo(foodFanCards,
                    { opacity: 0, y: 80, scale: 0.8 },
                    {
                        opacity: 1, y: 0, scale: function(i) {
                            return (i === 0 || i === 3) ? 0.92 : 0.97;
                        },
                        duration: 0.9,
                        stagger: 0.12,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: '.food-fan-gallery',
                            start: 'top 85%',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            }
        }
    }, 300);

    // ============ DRAGGABLE REVIEWS CAROUSEL ============
    (function() {
        var carousel = document.getElementById('reviewsCarousel');
        var track = document.getElementById('reviewsTrack');
        if (!carousel || !track) return;

        var cards = track.querySelectorAll('.review-card');
        if (!cards.length) return;

        // Clone cards for infinite loop
        var originalCards = Array.from(cards);
        originalCards.forEach(function(card) {
            var clone = card.cloneNode(true);
            track.appendChild(clone);
        });

        var isDragging = false;
        var startX = 0;
        var currentTranslate = 0;
        var prevTranslate = 0;
        var animationID = null;
        var autoPlayInterval = null;
        var cardWidth = 0;
        var gap = 24;
        var totalOriginalWidth = 0;

        function updateMeasurements() {
            if (!cards[0]) return;
            cardWidth = cards[0].offsetWidth;
            totalOriginalWidth = originalCards.length * (cardWidth + gap);
        }

        updateMeasurements();
        window.addEventListener('resize', updateMeasurements);

        function setPosition() {
            track.style.transform = 'translateX(' + currentTranslate + 'px)';
        }

        function wrapPosition() {
            if (currentTranslate < -totalOriginalWidth) {
                currentTranslate += totalOriginalWidth;
                prevTranslate = currentTranslate;
                // Disable transition instantly for seamless wrap
                track.style.transition = 'none';
                setPosition();
                // Force reflow, then restore transition
                track.offsetHeight;
                track.style.transition = '';
            } else if (currentTranslate > 0) {
                currentTranslate -= totalOriginalWidth;
                prevTranslate = currentTranslate;
                track.style.transition = 'none';
                setPosition();
                track.offsetHeight;
                track.style.transition = '';
            }
        }

        // Snap to nearest card
        function snapToNearestCard() {
            updateMeasurements();
            var step = cardWidth + gap;
            var snappedIndex = Math.round(Math.abs(currentTranslate) / step);
            currentTranslate = -(snappedIndex * step);
            prevTranslate = currentTranslate;
            wrapPosition();
            setPosition();
        }

        // Drag events - Mouse
        carousel.addEventListener('mousedown', function(e) {
            isDragging = true;
            startX = e.pageX;
            prevTranslate = currentTranslate;
            track.classList.add('is-dragging');
            stopAutoPlay();
            e.preventDefault();
        });

        carousel.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            var deltaX = e.pageX - startX;
            currentTranslate = prevTranslate + deltaX;
            setPosition();
        });

        carousel.addEventListener('mouseup', function() {
            if (!isDragging) return;
            isDragging = false;
            track.classList.remove('is-dragging');
            wrapPosition();
            snapToNearestCard();
            startAutoPlay();
        });

        carousel.addEventListener('mouseleave', function() {
            if (!isDragging) return;
            isDragging = false;
            track.classList.remove('is-dragging');
            wrapPosition();
            snapToNearestCard();
            startAutoPlay();
        });

        // Drag events - Touch
        carousel.addEventListener('touchstart', function(e) {
            isDragging = true;
            startX = e.touches[0].pageX;
            prevTranslate = currentTranslate;
            track.classList.add('is-dragging');
            stopAutoPlay();
        }, { passive: true });

        carousel.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            var deltaX = e.touches[0].pageX - startX;
            currentTranslate = prevTranslate + deltaX;
            setPosition();
        }, { passive: true });

        carousel.addEventListener('touchend', function() {
            isDragging = false;
            track.classList.remove('is-dragging');
            wrapPosition();
            snapToNearestCard();
            startAutoPlay();
        });

        // Auto-play: smooth scroll using requestAnimationFrame
        var isAutoPlaying = false;
        var isVisible = false;
        var lastTime = 0;
        var speed = 0.5; // pixels per frame at 60fps

        function autoScroll(timestamp) {
            if (!isAutoPlaying || isDragging || !isVisible) {
                lastTime = 0;
                if (isAutoPlaying) requestAnimationFrame(autoScroll);
                return;
            }
            if (!lastTime) lastTime = timestamp;
            var delta = timestamp - lastTime;
            lastTime = timestamp;
            // Move based on time delta for consistent speed
            currentTranslate -= speed * (delta / 16.67);
            wrapPosition();
            setPosition();
            if (isAutoPlaying) requestAnimationFrame(autoScroll);
        }

        function startAutoPlay() {
            if (isAutoPlaying) return;
            isAutoPlaying = true;
            lastTime = 0;
            requestAnimationFrame(autoScroll);
        }

        function stopAutoPlay() {
            isAutoPlaying = false;
            lastTime = 0;
        }

        // Only animate when section is visible
        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    isVisible = entry.isIntersecting;
                });
            }, { threshold: 0.1 });
            observer.observe(carousel);
        } else {
            isVisible = true;
        }

        // Start auto-play after a brief delay
        setTimeout(startAutoPlay, 1000);

        // Pause on hover
        carousel.addEventListener('mouseenter', function() {
            if (!isDragging) stopAutoPlay();
        });
        carousel.addEventListener('mouseleave', function() {
            if (!isDragging) startAutoPlay();
        });

        // Prevent link dragging
        track.querySelectorAll('a, img').forEach(function(el) {
            el.addEventListener('dragstart', function(e) { e.preventDefault(); });
        });
    })();

    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
