The provided JavaScript code for the booking system and other functionality on the website seems comprehensive and well-structured. Here are a few suggestions and considerations to ensure everything works smoothly:

1. **Event Listener for `DOMContentLoaded`**: Ensures that the DOM is fully loaded before any code runs, which is good practice.
2. **AOS Initialization**: Correctly initialized for animations on scroll.
3. **Elements Selection**: All necessary elements are selected appropriately.
4. **Loader Handling**: The loader is managed with appropriate animations and delays.
5. **Snowflakes Generation**: The function to create and animate snowflakes is implemented and initialized correctly.
6. **Language Toggle**: Translations are handled dynamically based on the selected language.
7. **Scroll and Navigation Handling**: Scroll progress, back-to-top button, header effects, and mobile navigation are managed well.
8. **Form Validation**: Basic form validation with animations is implemented.
9. **Availability Calendar**: The calendar is dynamically generated with random availability, and past dates are marked unavailable.

### Suggestions for Improvement:
1. **Error Handling**: Ensure proper error handling for fetch requests to show user-friendly messages if something goes wrong.
2. **Code Duplication**: There is a repeated section in the code for `document.addEventListener('DOMContentLoaded', function() {`. Ensure there is no duplication to avoid unnecessary execution.
3. **Modularization**: Consider modularizing your code by extracting repetitive logic into separate functions for better readability and maintenance.
4. **Date Handling**: Ensure that date handling logic is consistent and thoroughly tested, especially around edge cases like time zones and date transitions.

### Improved Code with Minor Fixes:
```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });

    // Elements
    const header = document.querySelector('.header');
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const bookRoomBtns = document.querySelectorAll('.book-room-btn');
    const bookNowBtn = document.querySelector('.book-now-btn');
    const scrollProgress = document.querySelector('.scroll-progress');
    const bookingForm = document.getElementById('bookingForm');
    const roomTypeSelect = document.getElementById('roomType');
    const modal = document.getElementById('bookingModal');
    const modalClose = document.querySelector('.modal-close');
    const modalBtn = document.querySelector('.confirmation-message .btn');
    const loader = document.querySelector('.loader');
    const testimonialDots = document.querySelectorAll('.testimonial-dots .dot');
    const testimonialsTrack = document.querySelector('.testimonials-track');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const mountainParallax = document.querySelectorAll('.mountain-parallax');
    const languageOptions = document.querySelectorAll('.language-option');
    const heroTitle = document.querySelector('.hero-title');
    const snowContainer = document.getElementById('snowContainer');
    const loaderText = document.getElementById('loader-text');
    const backToTop = document.querySelector('.back-to-top');
    const weatherWidget = document.querySelector('.weather-widget');
    const weatherToggle = document.querySelector('.weather-toggle');
    const virtualTourBtn = document.querySelector('.virtual-tour-btn');
    const newsletterForm = document.getElementById('newsletterForm');
    const calendarGrid = document.getElementById('calendarGrid');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const currentMonthDisplay = document.getElementById('currentMonth');

    // Show/hide loader with mountain animation
    window.addEventListener('load', function() {
        setTimeout(function() {
            loader.classList.add('hidden');
            // Add animation class to hero title after loader is hidden
            setTimeout(() => {
                heroTitle.classList.add('active');
            }, 500);
        }, 3000);
    });

    // Loader text animation
    let currentLang = 'en';
    const loaderTexts = {
        en: ["Loading...", "Welcome to Vila Falo", "Your Mountain Adventure Awaits"],
        al: ["Duke ngarkuar...", "Mirë se vini në Vila Falo", "Aventura Juaj Malore Ju Pret"]
    };
    
    let textIndex = 0;
    const loaderTextInterval = setInterval(() => {
        loaderText.style.opacity = 0;
        setTimeout(() => {
            textIndex = (textIndex + 1) % loaderTexts[currentLang].length;
            loaderText.textContent = loaderTexts[currentLang][textIndex];
            loaderText.style.opacity = 1;
        }, 500);
    }, 2000);

    // Generate snowflakes
    function createSnowflakes() {
        snowContainer.innerHTML = '';
        const numberOfSnowflakes = 50;
        
        for (let i = 0; i < numberOfSnowflakes; i++) {
            const snowflake = document.createElement('div');
            snowflake.classList.add('snowflake');
            
            // Random properties
            const size = Math.random() * 5 + 3;
            const left = Math.random() * 100;
            const animationDuration = Math.random() * 10 + 10;
            const delay = Math.random() * 10;
            const opacity = Math.random() * 0.6 + 0.3;
            
            // Apply styles
            snowflake.style.width = `${size}px`;
            snowflake.style.height = `${size}px`;
            snowflake.style.left = `${left}%`;
            snowflake.style.animationDuration = `${animationDuration}s`;
            snowflake.style.animationDelay = `${delay}s`;
            snowflake.style.opacity = opacity;
            
            snowContainer.appendChild(snowflake);
        }
    }
    
    createSnowflakes();

    // Language toggle
    function translatePage(lang) {
        currentLang = lang;
        
        languageOptions.forEach(option => {
            if (option.getAttribute('data-lang') === lang) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
        
        // Translate all elements with data-en and data-al attributes
        const translatableElements = document.querySelectorAll('[data-en][data-al]');
        translatableElements.forEach(el => {
            el.textContent = el.getAttribute(`data-${lang}`);
        });
        
        // Translate placeholder attributes
        const inputElements = document.querySelectorAll('input[placeholder], textarea[placeholder]');
        inputElements.forEach(input => {
            if (lang === 'en') {
                if (input.hasAttribute('data-original-placeholder')) {
                    input.placeholder = input.getAttribute('data-original-placeholder');
                }
            } else if (lang === 'al') {
                if (!input.hasAttribute('data-original-placeholder')) {
                    input.setAttribute('data-original-placeholder', input.placeholder);
                }
                if (input.placeholder.includes('Your')) {
                    input.placeholder = input.placeholder.replace('Your', 'Juaji');
                }
                if (input.placeholder.includes('Any special requests?')) {
                    input.placeholder = 'Ndonjë kërkesë e veçantë?';
                }
            }
        });
        
        // Update availability calendar
        generateCalendar();
    }
    
    languageOptions.forEach(option => {
        option.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            translatePage(lang);
        });
    });

    // Scroll progress bar
    window.addEventListener('scroll', function() {
        const windowScroll = document.documentElement.scrollTop;
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = (windowScroll / windowHeight) * 100;
        scrollProgress.style.width = scrollPercentage + '%';

        // Header scroll effect
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Show/hide back to top button
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        // Parallax effect for mountain layers
        mountainParallax.forEach(layer => {
            const speed = layer.getAttribute('data-speed');
            layer.style.transform = `translateY(${windowScroll * speed}px)`;
        });

        // Check for elements to animate on scroll
        const fadeElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .zoom-in');
        fadeElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            const elementVisible = 150;
            if (elementTop < window.innerHeight - elementVisible) {
                el.classList.add('active');
            }
        });
    });

    // Mobile navigation toggle with animation
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('active');
        document.body.classList.toggle('no-scroll');

        // Animate hamburger
        const bars = hamburger.querySelectorAll('.bar');
        if (hamburger.classList.contains('active')) {
            bars[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
            bars[1].style.opacity = '0';
            bars[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
        } else {
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
        }
    });

    // Close mobile nav when link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.classList.remove('no-scroll');
            
            // Reset hamburger icon
            const bars = hamburger.querySelectorAll('.bar');
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
            
            // Active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Smooth scroll with offset for header
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Book room buttons
    bookRoomBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const roomType = this.getAttribute('data-room');
            roomTypeSelect.value = roomType;
            
            // Scroll to booking section with animation
            window.scrollTo({
                top: document.getElementById('booking').offsetTop - 70,
                behavior: 'smooth'
            });
        });
    });

    // Fixed book now button with animation
    bookNowBtn.addEventListener('click', function() {
        window.scrollTo({
            top: document.getElementById('booking').offsetTop - 70,
            behavior: 'smooth'
        });
    });

    // Scroll indicator
    scrollIndicator.addEventListener('click', function() {
        window.scrollTo({
            top: document.getElementById('about').offsetTop - 70,
            behavior: 'smooth'
        });
    });

    // Back to top button click
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Weather widget toggle
    weatherToggle.addEventListener('click', function() {
        weatherWidget.classList.toggle('visible');
    });

    // Virtual tour button
    virtualTourBtn.addEventListener('click', function() {
        // Create virtual tour modal
        const virtualTourModal = document.createElement('div');
        virtualTourModal.classList.add('modal');
        virtualTourModal.classList.add('active');
        
        const virtualTourContent = document.createElement('div');
        virtualTourContent.classList.add('modal-content');
        virtualTourContent.style.width = '90%';
        virtualTourContent.style.maxWidth = '1000px';
        
        const virtualTourClose = document.createElement('div');
        virtualTourClose.classList.add('modal-close');
        virtualTourClose.innerHTML = '<i class="fas fa-times"></i>';
        
        const virtualTourTitle = document.createElement('h3');
        virtualTourTitle.textContent = currentLang === 'en' ? 'Vila Falo Virtual Tour' : 'Tur Virtual i Vila Falo';
        virtualTourTitle.style.textAlign = 'center';
        virtualTourTitle.style.margin = '1.5rem 0';
        
        const virtualTourFrame = document.createElement('div');
        virtualTourFrame.style.position = 'relative';
        virtualTourFrame.style.width = '100%';
        virtualTourFrame.style.height = '500px';
        virtualTourFrame.style.borderRadius = '10px';
        virtualTourFrame.style.overflow = 'hidden';
        virtualTourFrame.style.background = 'url(\'images/virtual-tour.jpg\') center/cover no-repeat';
        
        const tourMessage = document.createElement('div');
        tourMessage.textContent = currentLang === 'en' ? 'Virtual Tour Experience - Coming Soon!' : 'Përvoja e Turit Virtual - Së Shpejti!';
        tourMessage.style.position = 'absolute';
        tourMessage.style.top = '50%';
        tourMessage.style.left = '50%';
        tourMessage.style.transform = 'translate(-50%, -50%)';
        tourMessage.style.background = 'rgba(0,0,0,0.7)';
        tourMessage.style.color = 'white';
        tourMessage.style.padding = '1rem 2rem';
        tourMessage.style.borderRadius = '5px';
        tourMessage.style.fontWeight = '600';
        
        virtualTourFrame.appendChild(tourMessage);
        virtualTourContent.appendChild(virtualTourClose);
        virtualTourContent.appendChild(virtualTourTitle);
        virtualTourContent.appendChild(virtualTourFrame);
        virtualTourModal.appendChild(virtualTourContent);
        document.body.appendChild(virtualTourModal);
        
        // Close virtual tour modal
        virtualTourClose.addEventListener('click', function() {
            virtualTourModal.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(virtualTourModal);
            }, 300);
        });
    });

    // Enhanced Form validation with animations
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        const formElements = bookingForm.elements;
        
        // Basic validation with animations
        for (let i = 0; i < formElements.length; i++) {
            const element = formElements[i];
            
            if (element.hasAttribute('required') && !element.value) {
                element.classList.add('error');
                element.parentNode.classList.add('shake');
                setTimeout(() => {
                    element.parentNode.classList.remove('shake');
                }, 500);
                isValid = false;
            } else {
                element.classList.remove('error');
            }
            
            // Email validation
            if (element.type === 'email' && element.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(element.value)) {
                    element.classList.add('error');
                    isValid = false;
                }
            }
        }
        
        // Check date validity
        const checkIn = new Date(document.getElementById('checkIn').value);
        const checkOut = new Date(document.getElementById('checkOut').value);
        
        if (checkIn >= checkOut) {
            document.getElementById('checkOut').classList.add('error');
            isValid = false;
        }
        
        if (isValid) {
            // Collect form data
            const formData = new FormData(bookingForm);
            const bookingData = {
                roomType: formData.get('roomType'),
                checkIn: formData.get('checkIn'),
                checkOut: formData.get('checkOut'),
                adults: formData.get('adults'),
                children: formData.get('children'),
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                special: formData.get('special'),
                addons: formData.getAll('addons')
            };
            
            // Send data to server via fetch API
            fetch('/api/booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Booking success:', data);
                
                // Create booking summary based on current language
                const roomTypeLabel = currentLang === 'en' ? 'Room' : 'Dhoma';
                const checkInLabel = currentLang === 'en' ? 'Check-in' : 'Check-in';
                const checkOutLabel = currentLang === 'en' ? 'Check-out' : 'Check-out';
                const guestsLabel = currentLang === 'en' ? 'Guests' : 'Vizitorë';
                const adultsLabel = currentLang === 'en' ? 'Adults' : 'Të Rritur';
                const childrenLabel = currentLang === 'en' ? 'Children' : 'Fëmijë';
                const nameLabel = currentLang === 'en' ? 'Name' : 'Emri';
                
                // Format dates
                const checkInDate = new Date(bookingData.checkIn).toLocaleDateString();
                const checkOutDate = new Date(bookingData.checkOut).toLocaleDateString();
                
                const summaryHTML = `
                    <div class="booking-summary">
                        <p><strong>${roomTypeLabel}:</strong> ${bookingData.roomType}</p>
                        <p><strong>${checkInLabel}:</strong> ${checkInDate}</p>
                        <p><strong>${checkOutLabel}:</strong> ${checkOutDate}</p>
                        <p><strong>${guestsLabel}:</strong> ${bookingData.adults} ${adultsLabel}, ${bookingData.children} ${childrenLabel}</p>
                        <p><strong>${nameLabel}:</strong> ${bookingData.name}</p>
                    </div>
                `;
                
                document.getElementById('bookingSummary').innerHTML = summaryHTML;
                
                // Show confirmation
