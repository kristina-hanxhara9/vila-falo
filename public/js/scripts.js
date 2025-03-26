// Initialize AOS
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
                
                // Show confirmation modal with animation
                modal.classList.add('active');
                
                // Reset form
                bookingForm.reset();
            })
            .catch(error => {
                console.error('Error during booking:', error);
                alert('There was a problem with your booking. Please try again.');
            });
        }
    });

    // Newsletter form submission
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            
            // Simple validation
            if (!email) {
                return;
            }
            
            // Send newsletter subscription to server
            fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Newsletter subscription success:', data);
                this.reset();
                
                // Show a small success message
                const successMsg = document.createElement('div');
                successMsg.textContent = currentLang === 'en' ? 'Thank you for subscribing!' : 'Faleminderit për abonimin!';
                successMsg.style.color = 'var(--secondary)';
                successMsg.style.marginTop = '0.5rem';
                successMsg.style.fontWeight = '500';
                this.appendChild(successMsg);
                
                setTimeout(() => {
                    this.removeChild(successMsg);
                }, 3000);
            })
            .catch(error => {
                console.error('Error during newsletter subscription:', error);
            });
        });
    }

    // Modal close with animation
    if (modalClose && modalBtn) {
        [modalClose, modalBtn].forEach(el => {
            el.addEventListener('click', function() {
                modal.classList.remove('active');
            });
        });
    }

    // Testimonial slider with improved interaction
    let currentTestimonial = 0;
    const testimonialCount = 3;

    function showTestimonial(index) {
        if (testimonialsTrack) {
            testimonialsTrack.style.transform = `translateX(-${index * 100}%)`;
            
            // Update dots with animation
            testimonialDots.forEach((dot, i) => {
                if (i === index) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
    }

    // Click on dots with ripple effect
    testimonialDots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            // Add ripple effect
            this.classList.add('ripple');
            setTimeout(() => {
                this.classList.remove('ripple');
            }, 300);
            
            currentTestimonial = index;
            showTestimonial(currentTestimonial);
        });
    });

    // Auto slide testimonials
    if (testimonialsTrack) {
        setInterval(function() {
            currentTestimonial = (currentTestimonial + 1) % testimonialCount;
            showTestimonial(currentTestimonial);
        }, 5000);
    }

    // Gallery image click for lightbox effect
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const imgSrc = this.querySelector('img').src;
            const imgAlt = this.querySelector('img').alt;
            
            // Create lightbox
            const lightbox = document.createElement('div');
            lightbox.classList.add('modal');
            lightbox.classList.add('active');
            
            const lightboxContent = document.createElement('div');
            lightboxContent.classList.add('modal-content');
            lightboxContent.style.padding = '0';
            lightboxContent.style.overflow = 'hidden';
            lightboxContent.style.backgroundColor = 'transparent';
            
            const lightboxImg = document.createElement('img');
            lightboxImg.src = imgSrc;
            lightboxImg.style.width = '100%';
            lightboxImg.style.height = 'auto';
            lightboxImg.style.borderRadius = '10px';
            
            const lightboxTitle = document.createElement('div');
            lightboxTitle.textContent = imgAlt;
            lightboxTitle.style.position = 'absolute';
            lightboxTitle.style.bottom = '0';
            lightboxTitle.style.left = '0';
            lightboxTitle.style.width = '100%';
            lightboxTitle.style.background = 'rgba(0,0,0,0.7)';
            lightboxTitle.style.color = 'white';
            lightboxTitle.style.padding = '1rem';
            lightboxTitle.style.textAlign = 'center';
            
            const lightboxClose = document.createElement('div');
            lightboxClose.classList.add('modal-close');
            lightboxClose.innerHTML = '<i class="fas fa-times"></i>';
            
            lightboxContent.appendChild(lightboxImg);
            lightboxContent.appendChild(lightboxTitle);
            lightboxContent.appendChild(lightboxClose);
            lightbox.appendChild(lightboxContent);
            document.body.appendChild(lightbox);
            
            // Close lightbox
            lightboxClose.addEventListener('click', function() {
                lightbox.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(lightbox);
                }, 300);
            });
        });
    });

    // Food gallery lightbox
    const foodGalleryItems = document.querySelectorAll('.food-gallery-item');
    foodGalleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const imgSrc = this.querySelector('img').src;
            const foodItemName = this.querySelector('img').alt;
            
            // Create lightbox
            const lightbox = document.createElement('div');
            lightbox.classList.add('modal');
            lightbox.classList.add('active');
            
            const lightboxContent = document.createElement('div');
            lightboxContent.classList.add('modal-content');
            lightboxContent.style.padding = '0';
            lightboxContent.style.overflow = 'hidden';
            lightboxContent.style.backgroundColor = 'transparent';
            
            const lightboxImg = document.createElement('img');
            lightboxImg.src = imgSrc;
            lightboxImg.style.width = '100%';
            lightboxImg.style.height = 'auto';
            lightboxImg.style.borderRadius = '10px';
            
            const lightboxTitle = document.createElement('div');
            lightboxTitle.textContent = foodItemName;
            lightboxTitle.style.position = 'absolute';
            lightboxTitle.style.bottom = '0';
            lightboxTitle.style.left = '0';
            lightboxTitle.style.width = '100%';
            lightboxTitle.style.background = 'rgba(0,0,0,0.7)';
            lightboxTitle.style.color = 'white';
            lightboxTitle.style.padding = '1rem';
            lightboxTitle.style.textAlign = 'center';
            
            const lightboxClose = document.createElement('div');
            lightboxClose.classList.add('modal-close');
            lightboxClose.innerHTML = '<i class="fas fa-times"></i>';
            
            lightboxContent.appendChild(lightboxImg);
            lightboxContent.appendChild(lightboxTitle);
            lightboxContent.appendChild(lightboxClose);
            lightbox.appendChild(lightboxContent);
            document.body.appendChild(lightbox);
            
            // Close lightbox
            lightboxClose.addEventListener('click', function() {
                lightbox.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(lightbox);
                }, 300);
            });
        });
    });

    // Set minimum dates for check-in and check-out
    const today = new Date().toISOString().split('T')[0];
    const checkInInput = document.getElementById('checkIn');
    const checkOutInput = document.getElementById('checkOut');
    
    if (checkInInput) {
        checkInInput.setAttribute('min', today);
        
        checkInInput.addEventListener('change', function() {
            const checkInDate = new Date(this.value);
            checkInDate.setDate(checkInDate.getDate() + 1);
            const minCheckOutDate = checkInDate.toISOString().split('T')[0];
            
            if (checkOutInput) {
                checkOutInput.setAttribute('min', minCheckOutDate);
                
                // If check-out date is before new check-in date, update it
                if (checkOutInput.value && new Date(checkOutInput.value) <= new Date(this.value)) {
                    checkOutInput.value = minCheckOutDate;
                }
            }
        });
    }

    // Direction points hover effect
    const directionPoints = document.querySelectorAll('.direction-point');
    directionPoints.forEach(point => {
        point.addEventListener('mouseenter', function() {
            this.style.zIndex = '20';
        });
        
        point.addEventListener('mouseleave', function() {
            this.style.zIndex = '10';
        });
    });

    // Custom checkbox style for addons
    const addonOptions = document.querySelectorAll('.addon-option input');
    addonOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.checked) {
                this.parentNode.classList.add('checked');
            } else {
                this.parentNode.classList.remove('checked');
            }
        });
    });

    // Detect active section on scroll
    function highlightNavOnScroll() {
        const sections = document.querySelectorAll('section');
        let scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', highlightNavOnScroll);
    
    // Availability Calendar
    let currentDate = new Date();
    
    function generateCalendar() {
        // Get current month and year
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Display current month name
        const monthName = currentDate.toLocaleString(currentLang === 'en' ? 'en-US' : 'sq-AL', { month: 'long' });
        currentMonthDisplay.textContent = `${monthName} ${year}`;
        
        // Clear previous calendar
        calendarGrid.innerHTML = '';
        
        // Add weekday headers
        const weekdays = currentLang === 'en' 
            ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            : ['Dje', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht'];
            
        weekdays.forEach(day => {
            const weekdayEl = document.createElement('div');
            weekdayEl.className = 'calendar-weekday';
            weekdayEl.textContent = day;
            calendarGrid.appendChild(weekdayEl);
        });
        
        // Get first day of month and total days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Add empty placeholders for days before start of month
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day';
            calendarGrid.appendChild(emptyDay);
        }
        
        // Add days of month
        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = i;
            
            // Generate some random availability (in real app, this would come from the server)
            const isAvailable = Math.random() > 0.3; // 70% chance of being available
            dayEl.classList.add(isAvailable ? 'available' : 'unavailable');
            
            // Check if day is in the past
            const currentDayDate = new Date(year, month, i);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (currentDayDate < today) {
                dayEl.classList.remove('available');
                dayEl.classList.add('unavailable');
            }
            
            // Add click event for available days
            if (dayEl.classList.contains('available')) {
                dayEl.addEventListener('click', function() {
                    // Remove selected class from all days
                    document.querySelectorAll('.calendar-day').forEach(day => {
                        day.classList.remove('selected');
                    });
                    
                    // Add selected class to this day
                    this.classList.add('selected');
                    
                    // Set the check-in date in the form
                    const selectedDate = new Date(year, month, i);
                    const dateString = selectedDate.toISOString().split('T')[0];
                    
                    if (checkInInput) {
                        checkInInput.value = dateString;
                        
                        // Trigger change event to update check-out min date
                        const event = new Event('change');
                        checkInInput.dispatchEvent(event);
                    }
                });
            }
            
            calendarGrid.appendChild(dayEl);
        }
    }
    
    // Month navigation
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() - 1);
            generateCalendar();
        });
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() + 1);
            generateCalendar();
        });
    }
    
    // Initialize calendar
    if (calendarGrid) {
        generateCalendar();
    }


    
    
    // Initialize first language
    translatePage('en');
});