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
    initVirtualTourModal();
    
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
            document.documentElement.lang = lang === 'al' ? 'sq' : 'en';
            
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
        console.log('Testimonial slider initialized');
        // Testimonial slider logic here
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
            'al': ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor']
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
            const dayHeaders = currentLang === 'al' ? ['D', 'H', 'M', 'M', 'E', 'P', 'S'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
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
                    // Mark most future days as available (random for demo)
                    if (Math.random() > 0.3) {
                        dayEl.classList.add('available');
                        dayEl.addEventListener('click', function() {
                            // Remove previous selection
                            calendarGrid.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
                            // Add selection to clicked day
                            this.classList.add('selected');
                            
                            // Update form check-in date if available
                            const checkInInput = document.getElementById('checkIn');
                            if (checkInInput) {
                                const selectedDate = new Date(year, month, day);
                                checkInInput.value = selectedDate.toISOString().split('T')[0];
                            }
                        });
                    } else {
                        dayEl.classList.add('booked');
                    }
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

        function createSnowflake() {
            const snowflake = document.createElement('div');
            snowflake.classList.add('snowflake');
            snowflake.innerHTML = '❄';
            
            // Random properties
            const size = Math.random() * 15 + 10;
            const startPositionX = Math.random() * window.innerWidth;
            const animationDuration = Math.random() * 10 + 5;
            const opacity = Math.random() * 0.8 + 0.2;
            
            snowflake.style.position = 'absolute';
            snowflake.style.left = startPositionX + 'px';
            snowflake.style.top = '-20px';
            snowflake.style.fontSize = size + 'px';
            snowflake.style.color = 'white';
            snowflake.style.opacity = opacity;
            snowflake.style.pointerEvents = 'none';
            snowflake.style.animation = `snowfall ${animationDuration}s linear forwards`;
            
            snowContainer.appendChild(snowflake);
            
            // Remove snowflake after animation
            setTimeout(() => {
                if (snowflake.parentNode) {
                    snowflake.parentNode.removeChild(snowflake);
                }
            }, animationDuration * 1000);
        }

        // Create snowflakes periodically
        setInterval(createSnowflake, 300);
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
                        checkInDate: formData.get('checkIn'),
                        checkOutDate: formData.get('checkOut'),
                        guestName: formData.get('name'),
                        email: formData.get('email'),
                        phone: formData.get('phone'),
                        numberOfGuests: adults + children,
                        adults: adults,
                        children: children,
                        specialRequests: formData.get('special') || '',
                        addons: formData.getAll('addons') || []
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

    function showBookingConfirmation(bookingData) {
        const modal = document.getElementById('bookingModal');
        const bookingSummary = document.getElementById('bookingSummary');
        
        if (modal) {
            // Display booking summary if we have booking data
            if (bookingData && bookingSummary) {
                const checkinDate = new Date(bookingData.checkInDate).toLocaleDateString(currentLang === 'al' ? 'sq-AL' : 'en-US');
                const checkoutDate = new Date(bookingData.checkOutDate).toLocaleDateString(currentLang === 'al' ? 'sq-AL' : 'en-US');
                
                const summaryHTML = `
                    <div class="booking-summary">
                        <h4>${currentLang === 'al' ? 'Përmbajthja e Rezervimit' : 'Booking Summary'}</h4>
                        <div class="summary-details">
                            <p><strong>${currentLang === 'al' ? 'Dhoma:' : 'Room:'}</strong> ${bookingData.roomType}</p>
                            <p><strong>${currentLang === 'al' ? 'Check-in:' : 'Check-in:'}</strong> ${checkinDate}</p>
                            <p><strong>${currentLang === 'al' ? 'Check-out:' : 'Check-out:'}</strong> ${checkoutDate}</p>
                            <p><strong>${currentLang === 'al' ? 'Vizitorët:' : 'Guests:'}</strong> ${bookingData.numberOfGuests} (${bookingData.adults} ${currentLang === 'al' ? 'të rritur' : 'adults'}${bookingData.children > 0 ? `, ${bookingData.children} ${currentLang === 'al' ? 'fëmijë' : 'children'}` : ''})</p>
                            <p><strong>${currentLang === 'al' ? 'Email:' : 'Email:'}</strong> ${bookingData.email}</p>
                            ${bookingData.phone ? `<p><strong>${currentLang === 'al' ? 'Telefon:' : 'Phone:'}</strong> ${bookingData.phone}</p>` : ''}
                            ${bookingData.specialRequests ? `<p><strong>${currentLang === 'al' ? 'Kërkesa të veçanta:' : 'Special Requests:'}</strong> ${bookingData.specialRequests}</p>` : ''}
                            ${bookingData.addons && bookingData.addons.length > 0 ? `<p><strong>${currentLang === 'al' ? 'Shtesat:' : 'Add-ons:'}</strong> ${bookingData.addons.join(', ')}</p>` : ''}
                        </div>
                        <div class="booking-id">
                            <p><strong>${currentLang === 'al' ? 'ID e Rezervimit:' : 'Booking ID:'}</strong> ${bookingData._id || 'N/A'}</p>
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
        const dots = document.querySelectorAll('.dot');
        const track = document.querySelector('.testimonials-track');

        if (!slides.length || !track) return;

        function showSlide(index) {
            const translateX = -index * 100;
            track.style.transform = `translateX(${translateX}%)`;
            
            // Update dots
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }

        // Auto-play slider
        setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }, 5000);

        // Manual dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
            });
        });
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
        
        // You can replace this with your actual video URL
        // For YouTube: https://www.youtube.com/embed/YOUR_VIDEO_ID
        // For Vimeo: https://player.vimeo.com/video/YOUR_VIDEO_ID
        // For direct video file: just use a video element instead
        videoIframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0';
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

    // Virtual Tour Video Modal Functionality
    function initVirtualTourModal() {
        const virtualTourBtn = document.querySelector('.virtual-tour-btn');
        const videoModal = document.getElementById('videoModal');
        const videoModalClose = document.getElementById('videoModalClose');
        const videoModalOverlay = document.querySelector('.video-modal-overlay');
        const videoIframe = document.getElementById('virtualTourVideo');
        
        // Your actual video URL - replace this with your real virtual tour video
        // Example: 'https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1&rel=0&modestbranding=1'
        const videoURL = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1';
        
        // Open modal function
        function openVideoModal() {
            if (videoModal && videoIframe) {
                videoModal.style.display = 'flex';
                setTimeout(() => {
                    videoModal.classList.add('show');
                    videoIframe.src = videoURL;
                }, 10);
                document.body.style.overflow = 'hidden';
            }
        }
        
        // Close modal function
        window.closeVideoModal = function() {
            if (videoModal && videoIframe) {
                videoModal.classList.remove('show');
                setTimeout(() => {
                    videoModal.style.display = 'none';
                    videoIframe.src = '';
                    document.body.style.overflow = 'auto';
                }, 300);
            }
        }
        
        // Event listeners
        if (virtualTourBtn) {
            virtualTourBtn.addEventListener('click', function(e) {
                e.preventDefault();
                openVideoModal();
            });
        }
        
        if (videoModalClose) {
            videoModalClose.addEventListener('click', closeVideoModal);
        }
        
        if (videoModalOverlay) {
            videoModalOverlay.addEventListener('click', closeVideoModal);
        }
        
        // Close with ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && videoModal && videoModal.classList.contains('show')) {
                closeVideoModal();
            }
        });
    }