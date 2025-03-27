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

    // Clear interval when loader is hidden
    setTimeout(() => {
        clearInterval(loaderTextInterval);
    }, 3000);

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
        if (typeof generateCalendar === 'function') {
            generateCalendar();
        }
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
        
        if (scrollProgress) {
            scrollProgress.style.width = scrollPercentage + '%';
        }

        // Header scroll effect
        if (window.scrollY > 50) {
            if (header) header.classList.add('scrolled');
        } else {
            if (header) header.classList.remove('scrolled');
        }

        // Show/hide back to top button
        if (window.scrollY > 500) {
            if (backToTop) backToTop.classList.add('visible');
        } else {
            if (backToTop) backToTop.classList.remove('visible');
        }

        // Parallax effect for mountain layers
        if (mountainParallax) {
            mountainParallax.forEach(layer => {
                const speed = layer.getAttribute('data-speed');
                layer.style.transform = `translateY(${windowScroll * speed}px)`;
            });
        }

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
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            if (mobileNav) mobileNav.classList.toggle('active');
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
    }

    // Close mobile nav when link is clicked
    if (navLinks) {
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (hamburger) hamburger.classList.remove('active');
                if (mobileNav) mobileNav.classList.remove('active');
                document.body.classList.remove('no-scroll');
                
                // Reset hamburger icon
                if (hamburger) {
                    const bars = hamburger.querySelectorAll('.bar');
                    bars[0].style.transform = 'none';
                    bars[1].style.opacity = '1';
                    bars[2].style.transform = 'none';
                }
                
                // Active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

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
    if (bookRoomBtns) {
        bookRoomBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const roomType = this.getAttribute('data-room');
                if (roomTypeSelect) roomTypeSelect.value = roomType;
                
                // Scroll to booking section with animation
                const bookingSection = document.getElementById('booking');
                if (bookingSection) {
                    window.scrollTo({
                        top: bookingSection.offsetTop - 70,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Fixed book now button with animation
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', function() {
            const bookingSection = document.getElementById('booking');
            if (bookingSection) {
                window.scrollTo({
                    top: bookingSection.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    }

    // Scroll indicator
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                window.scrollTo({
                    top: aboutSection.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    }

    // Back to top button click
    if (backToTop) {
        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Weather widget toggle
    if (weatherToggle && weatherWidget) {
        weatherToggle.addEventListener('click', function() {
            weatherWidget.classList.toggle('visible');
        });
    }

    // Virtual tour button
    if (virtualTourBtn) {
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
    }

    // Generate and handle availability calendar
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    function generateCalendar() {
        if (!calendarGrid || !currentMonthDisplay) return;
        
        const monthNames = {
            en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            al: ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor']
        };
        
        // Update month display
        currentMonthDisplay.textContent = `${monthNames[currentLang][currentMonth]} ${currentYear}`;
        
        // Clear previous calendar
        calendarGrid.innerHTML = '';
        
        // Add day headers
        const dayNames = {
            en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            al: ['Dje', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht']
        };
        
        dayNames[currentLang].forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('calendar-day', 'day-header');
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });
        
        // Get first day of month and number of days
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        // Add empty cells for days before first day of month
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('calendar-day', 'empty');
            calendarGrid.appendChild(emptyDay);
        }
        
        // Add days with availability status
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            
            const dateObj = new Date(currentYear, currentMonth, day);
            dateObj.setHours(0, 0, 0, 0);
            
            // Check if date is in the past
            if (dateObj < today) {
                dayCell.classList.add('unavailable');
                dayCell.innerHTML = `<span>${day}</span><small>${currentLang === 'en' ? 'Past' : 'Kaluar'}</small>`;
            } else {
                // Random availability (for demo)
                const randomAvailability = Math.random();
                
                if (randomAvailability < 0.2) {
                    dayCell.classList.add('unavailable');
                    dayCell.innerHTML = `<span>${day}</span><small>${currentLang === 'en' ? 'Booked' : 'Zënë'}</small>`;
                } else if (randomAvailability < 0.5) {
                    dayCell.classList.add('limited');
                    dayCell.innerHTML = `<span>${day}</span><small>${currentLang === 'en' ? 'Limited' : 'Limituar'}</small>`;
                } else {
                    dayCell.classList.add('available');
                    dayCell.innerHTML = `<span>${day}</span><small>${currentLang === 'en' ? 'Available' : 'Disponueshëm'}</small>`;
                }
                
                // Add click event to available days
                if (!dayCell.classList.contains('unavailable')) {
                    dayCell.addEventListener('click', function() {
                        const checkInInput = document.getElementById('checkIn');
                        if (checkInInput) {
                            const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            checkInInput.value = formattedDate;
                            
                            // Calculate default checkout date (2 days later)
                            const checkOutInput = document.getElementById('checkOut');
                            if (checkOutInput) {
                                const checkoutDate = new Date(dateObj);
                                checkoutDate.setDate(checkoutDate.getDate() + 2);
                                const formattedCheckout = `${checkoutDate.getFullYear()}-${String(checkoutDate.getMonth() + 1).padStart(2, '0')}-${String(checkoutDate.getDate()).padStart(2, '0')}`;
                                checkOutInput.value = formattedCheckout;
                            }
                            
                            // Scroll to booking form
                            const bookingForm = document.getElementById('bookingForm');
                            if (bookingForm) {
                                bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }
                    });
                }
            }
            
            calendarGrid.appendChild(dayCell);
        }
    }
    
    // Generate initial calendar
    if (calendarGrid && currentMonthDisplay) {
        generateCalendar();
        
        // Month navigation
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', function() {
                currentMonth--;
                if (currentMonth < 0) {
                    currentMonth = 11;
                    currentYear--;
                }
                generateCalendar();
            });
        }
        
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', function() {
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
                generateCalendar();
            });
        }
    }

    // Enhanced Form validation with animations
    if (bookingForm) {
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
                
                // Convert adults and children to total number of guests
                const adults = parseInt(formData.get('adults') || 0);
                const children = parseInt(formData.get('children') || 0);
                
                // Format the data to match the Mongoose schema
                const bookingData = {
                    roomType: formData.get('roomType'),
                    checkInDate: formData.get('checkIn'),
                    checkOutDate: formData.get('checkOut'),
                    numberOfGuests: adults + children,
                    guestName: formData.get('name'),
                    email: formData.get('email'),
                    status: 'pending',
                    // Additional fields not in schema but might be useful
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
                    const checkInDate = new Date(bookingData.checkInDate).toLocaleDateString();
                    const checkOutDate = new Date(bookingData.checkOutDate).toLocaleDateString();
                    
                    // Get the original adults and children values for display
                    const adults = formData.get('adults');
                    const children = formData.get('children');
                    
                    const summaryHTML = `
                        <div class="booking-summary">
                            <p><strong>${roomTypeLabel}:</strong> ${bookingData.roomType}</p>
                            <p><strong>${checkInLabel}:</strong> ${checkInDate}</p>
                            <p><strong>${checkOutLabel}:</strong> ${checkOutDate}</p>
                            <p><strong>${guestsLabel}:</strong> ${adults} ${adultsLabel}, ${children} ${childrenLabel}</p>
                            <p><strong>${nameLabel}:</strong> ${bookingData.guestName}</p>
                        </div>
                    `;
                    
                    // Add summary to modal
                    const bookingSummary = document.getElementById('bookingSummary');
                    if (bookingSummary) {
                        bookingSummary.innerHTML = summaryHTML;
                    }
                    
                    // Show confirmation modal
                    if (modal) {
                        modal.classList.add('active');
                        document.body.classList.add('no-scroll');
                    }
                    
                    // Reset form
                    bookingForm.reset();
                })
                .catch(error => {
                    console.error('Error:', error);
                    
                    // Show error message
                    const errorMsg = document.createElement('div');
                    errorMsg.classList.add('error-message');
                    errorMsg.textContent = currentLang === 'en' ? 
                        'There was an error processing your booking. Please try again.' : 
                        'Kishte një gabim në përpunimin e rezervimit tuaj. Ju lutemi provoni përsëri.';
                    
                    bookingForm.appendChild(errorMsg);
                    
                    // Remove error message after 3 seconds
                    setTimeout(() => {
                        errorMsg.remove();
                    }, 3000);
                });
            }
        });
    }
    
    // Modal close button
    if (modalClose && modal) {
        modalClose.addEventListener('click', function() {
            modal.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    }
    
    // Confirmation button in modal
    if (modalBtn && modal) {
        modalBtn.addEventListener('click', function() {
            modal.classList.remove('active');
            document.body.classList.remove('no-scroll');
            
            // Scroll to top after booking
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Newsletter form submission
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            if (!emailInput || !emailInput.value) return;
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value)) {
                emailInput.classList.add('error');
                emailInput.parentNode.classList.add('shake');
                setTimeout(() => {
                    emailInput.parentNode.classList.remove('shake');
                }, 500);
                return;
            }
            
            // Collect form data
            const formData = new FormData(newsletterForm);
            const newsletterData = {
                email: formData.get('email')
            };
            
            // Send data to server via fetch API
            fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newsletterData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Newsletter success:', data);
                
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.classList.add('success-message');
                successMsg.textContent = currentLang === 'en' ? 
                    'Thank you for subscribing to our newsletter!' : 
                    'Faleminderit që u abonuat në buletinin tonë!';
                
                newsletterForm.innerHTML = '';
                newsletterForm.appendChild(successMsg);
            })
            .catch(error => {
                console.error('Error:', error);
                
                // Show error message
                const errorMsg = document.createElement('div');
                errorMsg.classList.add('error-message');
                errorMsg.textContent = currentLang === 'en' ? 
                    'There was an error processing your request. Please try again.' : 
                    'Kishte një gabim në përpunimin e kërkesës tuaj. Ju lutemi provoni përsëri.';
                
                newsletterForm.appendChild(errorMsg);
                
                // Remove error message after 3 seconds
                setTimeout(() => {
                    errorMsg.remove();
                }, 3000);
            });
        });
    }
    
    // Initialize gallery lightbox
    if (galleryItems) {
        galleryItems.forEach(item => {
            item.addEventListener('click', function() {
                const imageUrl = this.querySelector('img').src;
                
                // Create lightbox
                const lightbox = document.createElement('div');
                lightbox.classList.add('lightbox');
                
                const lightboxContent = document.createElement('div');
                lightboxContent.classList.add('lightbox-content');
                
                const lightboxClose = document.createElement('div');
                lightboxClose.classList.add('lightbox-close');
                lightboxClose.innerHTML = '<i class="fas fa-times"></i>';
                
                const lightboxImage = document.createElement('img');
                lightboxImage.src = imageUrl;
                
                lightboxContent.appendChild(lightboxClose);
                lightboxContent.appendChild(lightboxImage);
                lightbox.appendChild(lightboxContent);
                document.body.appendChild(lightbox);
                
                // Add active class after a short delay to trigger animation
                setTimeout(() => {
                    lightbox.classList.add('active');
                }, 10);
                
                // Close lightbox
                lightboxClose.addEventListener('click', function() {
                    lightbox.classList.remove('active');
                    setTimeout(() => {
                        document.body.removeChild(lightbox);
                    }, 300);
                });
                
                // Close on click outside
                lightbox.addEventListener('click', function(e) {
                    if (e.target === this) {
                        lightbox.classList.remove('active');
                        setTimeout(() => {
                            document.body.removeChild(lightbox);
                        }, 300);
                    }
                });
            });
        });
    }
    
    // Testimonial slider
    if (testimonialDots && testimonialsTrack) {
        testimonialDots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                // Update active dot
                testimonialDots.forEach(d => d.classList.remove('active'));
                this.classList.add('active');
                
                // Move testimonials track
                testimonialsTrack.style.transform = `translateX(-${index * 100}%)`;
            });
        });
    }
});