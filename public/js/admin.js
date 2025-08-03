// admin.js - Main JavaScript file for the admin dashboard

// Global variables
let currentUser = null;
let occupancyChart = null;
let revenueChart = null;
let calendar = null; // Holds the FullCalendar instance

// Check if user is authenticated on page load
document.addEventListener('DOMContentLoaded', function () {
    initializePage();
    checkAuth();
    setupEventListeners();
});

// Initialize page defaults
function initializePage() {
    const today = new Date();
    // Correctly set defaultStartDate to 30 days ago without modifying 'today' for defaultEndDate
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const defaultStartDate = thirtyDaysAgo.toISOString().split('T')[0];
    const defaultEndDate = today.toISOString().split('T')[0];


    const startDateFilterEl = document.getElementById('startDateFilter');
    const endDateFilterEl = document.getElementById('endDateFilter');
    const reportStartDateEl = document.getElementById('reportStartDate');
    const reportEndDateEl = document.getElementById('reportEndDate');

    if (startDateFilterEl) startDateFilterEl.value = defaultStartDate;
    if (endDateFilterEl) endDateFilterEl.value = defaultEndDate;
    if (reportStartDateEl) reportStartDateEl.value = defaultStartDate;
    if (reportEndDateEl) reportEndDateEl.value = defaultEndDate;

    const yearSelect = document.getElementById('calendarYear');
    const calendarMonthSelect = document.getElementById('calendarMonth');
    
    if (yearSelect && calendarMonthSelect) {
        const currentYear = new Date().getFullYear();
        for (let year = currentYear - 2; year <= currentYear + 5; year++) { // Adjusted range slightly
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
        yearSelect.value = currentYear;
        calendarMonthSelect.value = new Date().getMonth() + 1;
    }
}

function checkAuth() {
    console.log('Checking authentication...');
    
    fetch('/admin/check', {
        method: 'GET',
        credentials: 'include', // Important for sending cookies
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) { // Check for non-2xx responses
            // If it's a 401, it might be handled by makeAuthenticatedRequest, but good to check here too
            if (response.status === 401) throw new Error('Unauthorized'); 
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Auth check response:', data);
        
        if (data.isAuthenticated) {
            currentUser = data.user;
            const usernameEl = document.getElementById('username');
            if (usernameEl) {
                usernameEl.textContent = currentUser.username;
            }

            if (currentUser.role === 'admin') {
                const settingsLink = document.getElementById('settingsLink');
                if (settingsLink) {
                    settingsLink.style.display = 'flex'; // or 'block' depending on CSS
                }
            }
            // Load the default page (dashboard) after successful auth
            showPage('dashboard'); // Or loadDashboard(); if showPage handles it
        } else {
            console.log('Not authenticated, redirecting to login');
            window.location.href = '/admin/login';
        }
    })
    .catch(error => {
        console.error('Authentication check error:', error);
        window.location.href = '/admin/login'; // Redirect on any error during auth check
    });
}

// Setup all event listeners
function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-menu-item').forEach(item => {
        item.addEventListener('click', function (e) {
            if (this.id === 'logoutLink') {
                e.preventDefault();
                logout();
                return;
            }
            const page = this.dataset.page;
            if (page) {
                e.preventDefault();
                showPage(page);
            }
        });
    });

    // Logout dropdown
    const logoutDropdown = document.getElementById('logoutDropdown');
    if (logoutDropdown) {
        logoutDropdown.addEventListener('click', function (e) {
            e.preventDefault();
            logout();
        });
    }
    
    // User profile click to toggle dropdown
    const userProfile = document.getElementById('userProfile');
    if (userProfile) {
        userProfile.addEventListener('click', function() {
            const dropdown = document.getElementById('userDropdown');
            if(dropdown) dropdown.classList.toggle('active');
        });
    }

    // Sidebar toggle
    const toggleSidebar = document.getElementById('toggleSidebar');
    if (toggleSidebar) {
        toggleSidebar.addEventListener('click', function () {
            document.getElementById('sidebar').classList.toggle('active');
        });
    }

    setupModalListeners();

    // Forms
    const bookingFilterForm = document.getElementById('bookingFilterForm');
    if (bookingFilterForm) {
        bookingFilterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            loadBookings(); // This will fetch and populate the bookings table
        });
    }

    const calendarFilterForm = document.getElementById('calendarFilterForm');
    if (calendarFilterForm) {
        calendarFilterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            // The loadCalendar function itself will now fetch events when called.
            // If you want the filter to apply to the calendar, loadCalendar would need to accept parameters.
            // For now, just re-rendering with all events.
            if (calendar) {
                calendar.refetchEvents(); // If using events as a function or JSON feed
            } else {
                loadCalendar(); // Initialize if not already
            }
        });
    }

    const reportFilterForm = document.getElementById('reportFilterForm');
    if (reportFilterForm) {
        reportFilterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            loadReport();
        });
    }

    const bookingStatusForm = document.getElementById('bookingStatusForm');
    if (bookingStatusForm) {
        bookingStatusForm.addEventListener('submit', function (e) {
            e.preventDefault();
            updateBookingStatus();
        });
    }
    
    const blockDatesForm = document.getElementById('blockDatesForm');
    if(blockDatesForm) {
        blockDatesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            blockDates();
        });
    }


    // Additional forms (placeholders for future functionality)
    const formsToInitialize = [
        'addRoomForm', 'editRoomForm', 'addAddonForm', 'editAddonForm',
        'addUserForm', 'editUserForm', 'deleteUserForm'
    ];

    formsToInitialize.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                // Replace with actual form submission logic later
                showFlashMessage(`${formId} submission functionality coming soon.`, 'info');
                // Example: if (formId === 'addRoomForm') handleAddRoom();
            });
        }
    });

    // Tab functionality
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const tabId = this.dataset.tab;
            // Deactivate all buttons and panes in this tab group
            const tabGroup = this.closest('.tabs');
            if (tabGroup) {
                tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                tabGroup.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
            } else { // Fallback if not in a .tabs container (less ideal)
                 document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                 document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
            }
            
            this.classList.add('active');
            const tabContent = document.getElementById(tabId + 'Tab');
            if (tabContent) {
                tabContent.style.display = 'block';
            }
        });
    });

    // Print report
    const printReport = document.getElementById('printReport');
    if (printReport) {
        printReport.addEventListener('click', function () {
            window.print();
        });
    }
}

// Setup modal event listeners
function setupModalListeners() {
    // Open modals
    document.querySelectorAll('[data-modal]').forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.dataset.modal;
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
            }
        });
    });
    
    // Close modals via close button
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Close modal on backdrop click (clicking the overlay itself)
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) { // Only if the overlay itself was clicked, not a child
                this.classList.remove('active');
            }
        });
    });
}


// Show flash message
function showFlashMessage(message, type = 'info', duration = 5000) {
    const flashMessagesContainer = document.getElementById('flashMessages');
    if (!flashMessagesContainer) {
        console.warn('Flash messages container #flashMessages not found.');
        // Fallback to alert if container is missing
        alert(`${type.toUpperCase()}: ${message}`);
        return;
    }
    
    const flashDiv = document.createElement('div');
    flashDiv.className = `flash ${type}`; // e.g., flash success, flash error
    flashDiv.textContent = message;
    
    flashMessagesContainer.appendChild(flashDiv);
    
    // Auto-remove flash message after duration
    setTimeout(() => {
        flashDiv.style.opacity = '0'; // Start fade out
        setTimeout(() => {
            flashDiv.remove();
        }, 300); // Remove after fade out animation
    }, duration);
}


// Logout function
function logout() {
    console.log('Logging out...');
    
    fetch('/admin/logout', { // Assuming your logout route is /admin/logout
        method: 'GET', // Or POST, depending on your route definition
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Logout response:', data);
        if (data.success) {
            currentUser = null; // Clear current user
            window.location.href = '/admin/login'; // Redirect to login page
        } else {
            showFlashMessage(data.message || 'Error logging out.', 'error');
        }
    })
    .catch(error => {
        console.error('Logout error:', error);
        showFlashMessage('Network error during logout. Please try again.', 'error');
        // Optionally force redirect even on error
        // window.location.href = '/admin/login';
    });
}

// Show page and update navigation
function showPage(pageId) {
    console.log(`Showing page: ${pageId}`);
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    
    // Show selected page
    const targetPage = document.getElementById(pageId + 'Page');
    if (targetPage) {
        targetPage.style.display = 'block';
    } else {
        console.error(`Page element with ID "${pageId}Page" not found.`);
        showFlashMessage(`Content for page "${pageId}" not found.`, 'error');
        // Optionally show a default page or error message in the content area
        const contentArea = document.querySelector('.content'); // Or a more specific content area
        if(contentArea) contentArea.innerHTML = `<h2>Error: Page not found</h2><p>The page "${pageId}" could not be loaded.</p>`;
        return; // Stop further processing for this page
    }
    
    // Update page title in the header
    const pageTitleEl = document.getElementById('pageTitle');
    if (pageTitleEl) {
        pageTitleEl.textContent = pageId.charAt(0).toUpperCase() + pageId.slice(1);
    }
    
    // Update active menu item in the sidebar
    document.querySelectorAll('.sidebar-menu-item').forEach(item => item.classList.remove('active'));
    const activeMenuItem = document.querySelector(`.sidebar-menu-item[data-page="${pageId}"]`);
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
    }
    
    // Load page-specific data or initialize components
    switch (pageId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'bookings':
            loadBookings(); // This will load the table
            break;
        case 'calendar':
            loadCalendar(); // This will initialize/load the calendar
            break;
        case 'reports':
            loadReport();
            break;
        case 'settings':
            loadSettings();
            break;
        // Add cases for other pages if they have specific load functions
        default:
            console.log(`No specific load function for page: ${pageId}`);
    }
    
    // Hide sidebar on mobile after navigation if it's open
    if (window.innerWidth < 992) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    }
}

// Load dashboard data
function loadDashboard() {
    console.log('Loading dashboard data...');
    loadDashboardStats(); // Load stats (currently mock)
    loadRecentBookings(); // Load recent bookings table
}

// Load dashboard statistics
function loadDashboardStats() {
    // TODO: Replace with actual API call to fetch dashboard stats
    const todaysCheckinsEl = document.getElementById('todaysCheckins');
    const todaysCheckoutsEl = document.getElementById('todaysCheckouts');
    const currentOccupancyEl = document.getElementById('currentOccupancy');
    
    if (todaysCheckinsEl) todaysCheckinsEl.textContent = '3'; // Mock data
    if (todaysCheckoutsEl) todaysCheckoutsEl.textContent = '2'; // Mock data
    if (currentOccupancyEl) currentOccupancyEl.textContent = '68%'; // Mock data
}

// Generic function to handle authenticated API calls
function makeAuthenticatedRequest(url, options = {}) {
    // Default options
    const defaultOptions = {
        method: 'GET', // Default to GET if not specified
        credentials: 'include', // Crucial for sending cookies
        headers: {
            'Content-Type': 'application/json',
            // Add other common headers if needed, like CSRF token
            ...options.headers // Allow overriding/extending headers
        }
    };

    // Merge provided options with defaults
    // For body, only stringify if it's an object and Content-Type is application/json
    const requestOptions = { ...defaultOptions, ...options };
    if (typeof requestOptions.body === 'object' && requestOptions.headers['Content-Type'] === 'application/json') {
        requestOptions.body = JSON.stringify(requestOptions.body);
    }
    
    return fetch(url, requestOptions)
        .then(response => {
            if (response.status === 401) {
                // Unauthorized: token might be invalid or expired
                console.warn('Request unauthorized. Token may be invalid/expired. Redirecting to login.');
                window.location.href = '/admin/login'; // Redirect to login
                throw new Error('Authentication required'); // Stop further processing
            }
            if (!response.ok) {
                // For other errors (4xx, 5xx but not 401)
                // Try to parse error message from backend if it's JSON
                return response.json().catch(() => {
                    // If response is not JSON or parsing fails, throw generic error
                    throw new Error(`HTTP error! status: ${response.status} on ${url}`);
                }).then(errorData => {
                    // If backend sent a JSON error message
                    throw new Error(errorData.message || `HTTP error! status: ${response.status} on ${url}`);
                });
            }
            return response.json(); // Assuming successful responses are JSON
        });
}

// Load recent bookings for dashboard
function loadRecentBookings() {
    console.log('Loading recent bookings for dashboard...');
    
    makeAuthenticatedRequest('/api/booking?limit=5&sortBy=createdAt:desc') // Example: get latest 5
        .then(data => {
            // The 'data' should already be the parsed JSON from makeAuthenticatedRequest
            console.log('Recent bookings data:', data);
            populateBookingsTable(data.bookings || data, 'recentBookingsTable'); // Adjust based on your API response structure
        })
        .catch(error => {
            console.error('Error loading recent bookings:', error);
            if (error.message !== 'Authentication required') { // Don't show flash if redirecting
                showFlashMessage(`Error loading recent bookings: ${error.message}. Using mock data.`, 'warning');
                populateMockBookings('recentBookingsTable'); // Pass tableId to mock function
            }
        });
}

// Load all bookings for the bookings page
function loadBookings() {
    console.log('Loading all bookings for bookings page...');
    
    // Get filter values
    const statusFilterEl = document.getElementById('statusFilter');
    const startDateFilterEl = document.getElementById('startDateFilter');
    const endDateFilterEl = document.getElementById('endDateFilter');
    
    const status = statusFilterEl ? statusFilterEl.value : 'all';
    const startDate = startDateFilterEl ? startDateFilterEl.value : '';
    const endDate = endDateFilterEl ? endDateFilterEl.value : '';
    
    // Build query string
    let queryParams = new URLSearchParams();
    if (status && status !== 'all') {
        queryParams.append('status', status);
    }
    if (startDate) {
        queryParams.append('startDate', startDate);
    }
    if (endDate) {
        queryParams.append('endDate', endDate);
    }
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    makeAuthenticatedRequest(`/api/booking${queryString}`)
        .then(data => {
            console.log('All bookings data:', data);
             // Assuming your API returns { bookings: [...] } or just [...]
            populateBookingsTable(data.bookings || data, 'bookingsTable');
        })
        .catch(error => {
            console.error('Error loading bookings:', error);
            if (error.message !== 'Authentication required') {
                showFlashMessage(`Error loading bookings: ${error.message}`, 'error');
                const bookingsTableBody = document.getElementById('bookingsTable');
                if(bookingsTableBody) bookingsTableBody.innerHTML = `<tr><td colspan="8" class="text-center">Error loading bookings.</td></tr>`;
            }
        });
}


// Populate bookings table (reusable function)
function populateBookingsTable(bookingsData, tableId) {
    const tableBody = document.getElementById(tableId);
    if (!tableBody) {
        console.error(`Table body with id "${tableId}" not found.`);
        return;
    }
    
    tableBody.innerHTML = ''; // Clear existing rows
    
    // Ensure bookingsData is an array
    const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData.data || bookingsData.bookings || []);

    if (bookings.length === 0) {
        const colspan = (tableId === 'recentBookingsTable') ? 7 : 8;
        tableBody.innerHTML = `<tr><td colspan="${colspan}" class="text-center">No bookings found.</td></tr>`;
        return;
    }
    
    bookings.forEach(booking => {
        const row = tableBody.insertRow(); // More efficient way to add rows
        
        // Format dates - ensure they are valid date objects or strings first
        const checkInDate = booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : 'N/A';
        const checkOutDate = booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : 'N/A';
        
        let cells = [
            `#${booking._id ? booking._id.slice(-6) : 'N/A'}`, // Show last 6 chars of ID or N/A
            booking.guestName || 'N/A',
            booking.roomType || 'N/A', // Assuming roomType is a direct property
            checkInDate,
            checkOutDate,
        ];

        if (tableId !== 'recentBookingsTable') { // Add guests column for the main bookings table
            cells.push(booking.numberOfGuests !== undefined ? `${booking.numberOfGuests} guests` : 'N/A');
        }
        
        cells.push(`<span class="status-badge status-${(booking.status || 'pending').toLowerCase().replace('_', '-')}">${formatStatus(booking.status || 'pending')}</span>`);
        cells.push(`<button class="btn btn-sm btn-primary view-booking" data-id="${booking._id || ''}"><i class="fas fa-eye"></i> View</button>`);

        cells.forEach(cellHTML => {
            const cell = row.insertCell();
            cell.innerHTML = cellHTML;
        });
    });
    
    // Add event listeners to "View" buttons AFTER table is populated
    tableBody.querySelectorAll('.view-booking').forEach(button => {
        button.addEventListener('click', function() {
            const bookingId = this.dataset.id;
            if (bookingId) {
                loadBookingDetails(bookingId);
            } else {
                showFlashMessage('Booking ID missing.', 'error');
            }
        });
    });
}


// Populate mock bookings for development
function populateMockBookings(tableId) { // Added tableId parameter
    const mockBookings = [
        { _id: 'mock1001', guestName: 'John Doe (Mock)', roomType: 'Deluxe', checkInDate: new Date(), checkOutDate: new Date(Date.now() + 3 * 24*60*60*1000), status: 'confirmed', numberOfGuests: 2 },
        { _id: 'mock1002', guestName: 'Jane Smith (Mock)', roomType: 'Standard', checkInDate: new Date(), checkOutDate: new Date(Date.now() + 5 * 24*60*60*1000), status: 'pending', numberOfGuests: 1 },
    ];
    populateBookingsTable(mockBookings, tableId);
}


// Load booking details
function loadBookingDetails(bookingId) {
    console.log('Loading booking details for ID:', bookingId);
    if (!bookingId) {
        showFlashMessage('Invalid Booking ID.', 'error');
        return;
    }

    makeAuthenticatedRequest(`/api/booking/${bookingId}`)
        .then(booking => { // Assuming API returns the booking object directly or as data.booking
            console.log('Booking details fetched:', booking);
            displayBookingDetails(booking.data || booking); // Adjust if your API wraps it in 'data'
        })
        .catch(error => {
            console.error('Error loading booking details:', error);
            if (error.message !== 'Authentication required') {
                showFlashMessage(`Error loading booking details: ${error.message}`, 'error');
            }
        });
}


// Display booking details on the booking detail page
function displayBookingDetails(booking) {
    if (!booking) {
        showFlashMessage('No booking data to display.', 'error');
        return;
    }

    // Helper function to set text content safely
    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value || 'N/A'; // Default to N/A if value is falsy
    };

    setText('bookingIdDisplay', booking._id ? booking._id.slice(-6) : ''); // Display last 6 chars
    setText('customerName', booking.guestName);
    setText('customerEmail', booking.email);
    setText('customerPhone', booking.phone);
    setText('roomType', booking.roomType); // Assuming roomType is a direct property
    setText('checkInDate', booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : '');
    setText('checkOutDate', booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : '');
    setText('guestCount', `${booking.numberOfGuests || 0} guests`);

    const statusBadgeEl = document.getElementById('bookingStatusBadge');
    if (statusBadgeEl) {
        const status = booking.status || 'pending';
        statusBadgeEl.className = `status-badge status-${status.toLowerCase().replace('_', '-')}`;
        statusBadgeEl.textContent = formatStatus(status);
    }

    if (booking.checkInDate && booking.checkOutDate) {
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        const nights = Math.max(0, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
        setText('lengthOfStay', `${nights} night${nights !== 1 ? 's' : ''}`);
        
        // Mock billing - replace with actual calculation if available
        const MOCK_RATE_PER_NIGHT = booking.pricePerNight || 100; // Use booking price or default
        setText('roomRate', `€${MOCK_RATE_PER_NIGHT.toFixed(2)} per night`);
        setText('roomTotal', `€${(MOCK_RATE_PER_NIGHT * nights).toFixed(2)}`);
        // For now, grand total is same as room total. Add addon logic later.
        setText('grandTotal', `€${(MOCK_RATE_PER_NIGHT * nights).toFixed(2)}`);

    } else {
        setText('lengthOfStay', 'N/A');
        setText('roomRate', 'N/A');
        setText('roomTotal', 'N/A');
        setText('grandTotal', 'N/A');
    }


    const specialRequestsContainerEl = document.getElementById('specialRequestsContainer');
    const specialRequestsEl = document.getElementById('specialRequests');
    if (specialRequestsContainerEl && specialRequestsEl) {
        if (booking.specialRequests) {
            specialRequestsContainerEl.style.display = 'flex'; // Or 'block'
            specialRequestsEl.textContent = booking.specialRequests;
        } else {
            specialRequestsContainerEl.style.display = 'none';
        }
    }
    
    // Hide addons section for now as it's not implemented
    const addonsContainerEl = document.getElementById('addonsContainer');
    const addonsTotalContainerEl = document.getElementById('addonsTotalContainer');
    if (addonsContainerEl) addonsContainerEl.style.display = 'none';
    if (addonsTotalContainerEl) addonsTotalContainerEl.style.display = 'none';


    const bookingStatusSelectEl = document.getElementById('bookingStatus');
    if (bookingStatusSelectEl) {
        bookingStatusSelectEl.value = booking.status || 'pending';
    }
    
    // Add booking ID to the form for submission, if not already there via display
    const bookingStatusFormEl = document.getElementById('bookingStatusForm');
    if (bookingStatusFormEl && booking._id) {
        let hiddenInput = bookingStatusFormEl.querySelector('input[name="bookingId"]');
        if (!hiddenInput) {
            hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = 'bookingId';
            bookingStatusFormEl.appendChild(hiddenInput);
        }
        hiddenInput.value = booking._id;
    }


    showPage('bookingDetail'); // Navigate to the booking detail page
}


// Update booking status
function updateBookingStatus() {
    const bookingStatusFormEl = document.getElementById('bookingStatusForm');
    const bookingId = bookingStatusFormEl.querySelector('input[name="bookingId"]')?.value || document.getElementById('bookingIdDisplay')?.textContent;
    const statusSelectEl = document.getElementById('bookingStatus');
    
    if (!bookingId || !statusSelectEl) {
        showFlashMessage('Could not find booking ID or status to update.', 'error');
        return;
    }
    const newStatus = statusSelectEl.value;

    console.log(`Updating booking ${bookingId} to status: ${newStatus}`);

    makeAuthenticatedRequest(`/api/booking/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }) // Backend expects { status: "new_status" }
    })
    .then(data => { // makeAuthenticatedRequest now returns parsed JSON directly
        showFlashMessage(`Booking #${bookingId.slice(-6)} status updated to ${formatStatus(newStatus)}.`, 'success');
        // Update the status badge on the page
        const statusBadgeEl = document.getElementById('bookingStatusBadge');
        if (statusBadgeEl) {
            statusBadgeEl.className = `status-badge status-${newStatus.toLowerCase().replace('_', '-')}`;
            statusBadgeEl.textContent = formatStatus(newStatus);
        }
        // Optionally, refresh all bookings or the specific booking if data needs to be re-rendered elsewhere
        // loadBookings(); // If you want to refresh the main bookings table
    })
    .catch(error => {
        console.error('Error updating booking status:', error);
        if (error.message !== 'Authentication required') {
            showFlashMessage(`Error updating booking status: ${error.message}`, 'error');
        }
    });
}

// --- CALENDAR FUNCTIONALITY ---
function loadCalendar() {
    const calendarEl = document.getElementById('calendar');
    const calendarYearSelect = document.getElementById('calendarYear');
    const calendarMonthSelect = document.getElementById('calendarMonth');

    if (!calendarEl || typeof FullCalendar === 'undefined') {
        if (!calendarEl) console.error('Calendar element #calendar not found!');
        if (typeof FullCalendar === 'undefined') console.error('FullCalendar library not loaded!');
        
        showFlashMessage('Error: Calendar cannot be loaded. Required components missing.', 'error');
        if(calendarEl) calendarEl.innerHTML = '<div class="text-center p-3">Error loading calendar.</div>';
        return;
    }

    // Clear any previous "coming soon" message or old calendar instance
    calendarEl.innerHTML = '';

    // Destroy previous instance if it exists
    if (calendar) {
        calendar.destroy();
    }
    
    // Determine initial date for the calendar
    let initialCalendarDate = new Date(); // Default to today
    if(calendarYearSelect && calendarMonthSelect && calendarYearSelect.value && calendarMonthSelect.value) {
        // Month is 0-indexed for Date, but select is 1-indexed
        initialCalendarDate = new Date(parseInt(calendarYearSelect.value), parseInt(calendarMonthSelect.value) - 1, 1);
    }


    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        initialDate: initialCalendarDate.toISOString().split('T')[0], // Set initial date
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek' // Added list view
        },
        editable: true, // Allows drag & drop, resizing (if backend supports updates)
        selectable: true, // Allows date clicking/selecting
        events: function(fetchInfo, successCallback, failureCallback) {
            // fetchInfo contains start and end dates of the view
            // You can use these to filter events on the backend if needed
            // For now, we fetch all bookings.
            makeAuthenticatedRequest('/api/booking') // Your existing endpoint
                .then(data => {
                    const bookings = data.bookings || data.data || data || []; // Handle various API response structures
                    const calendarEvents = bookings.map(booking => {
                        // Ensure dates are valid
                        if (!booking.checkInDate || !booking.checkOutDate) {
                            console.warn('Booking missing dates:', booking);
                            return null; // Skip this booking
                        }
                        
                        // FullCalendar often needs checkout date to be exclusive.
                        // If your checkout date is inclusive (e.g., guest leaves ON checkout_date),
                        // you might need to add 1 day to checkout for 'end' property if using allDay events.
                        // For simplicity, assuming checkOutDate is the day *after* the last night of stay.
                        let endDate = new Date(booking.checkOutDate);
                        // If events are not allDay, use precise times. If allDay, FullCalendar handles end date correctly.
                        
                        return {
                            id: booking._id,
                            title: `${booking.guestName || 'Booking'} (${booking.roomType || 'N/A'})`,
                            start: booking.checkInDate, // Expects ISO string or Date object
                            end: booking.checkOutDate,   // Expects ISO string or Date object
                            // Color based on status (optional)
                            backgroundColor: getEventColor(booking.status),
                            borderColor: getEventColor(booking.status),
                            extendedProps: { // Store original booking data
                                bookingData: booking
                            }
                        };
                    }).filter(event => event !== null); // Remove any nulls from skipped bookings
                    
                    successCallback(calendarEvents);
                })
                .catch(error => {
                    console.error('Error fetching bookings for calendar:', error);
                    showFlashMessage(`Error loading calendar events: ${error.message}`, 'error');
                    failureCallback(error);
                });
        },
        eventClick: function(info) {
            // When an event on the calendar is clicked
            console.log('Event clicked:', info.event);
            const bookingData = info.event.extendedProps.bookingData;
            if (bookingData) {
                displayBookingDetails(bookingData); // Reuse your existing function
            } else {
                showFlashMessage(`Details for event "${info.event.title}" not available.`, 'warning');
            }
        },
        dateClick: function(info) {
            // When a date on the calendar is clicked (not an event)
            console.log('Date clicked:', info.dateStr);
            // Optionally, open a modal to create a new booking for this date
            // For now, just log it or show a message
            showFlashMessage(`You clicked on ${info.dateStr}. Add new booking feature coming soon.`, 'info');
        },
        // More FullCalendar options can be added here
        // E.g., eventDrop, eventResize for handling backend updates on drag/drop
    });

    calendar.render();
    showFlashMessage('Calendar loaded with bookings.', 'success');
}

// Helper function to determine event color based on booking status
function getEventColor(status) {
    status = (status || 'pending').toLowerCase();
    switch (status) {
        case 'confirmed':
            return '#3498db'; // Blue (info color from your CSS)
        case 'pending':
            return '#f39c12'; // Orange (warning color)
        case 'checked_in':
            return '#2ecc71'; // Green (success color)
        case 'checked_out':
            return '#27ae60'; // Darker Green
        case 'cancelled':
            return '#e74c3c'; // Red (danger color)
        default:
            return '#7f8c8d'; // Grey
    }
}


// --- OTHER PLACEHOLDER FUNCTIONS ---
function loadReport() {
    const reportTypeEl = document.getElementById('reportType');
    const reportType = reportTypeEl ? reportTypeEl.value : 'occupancy';
    
    const reportTitleEl = document.getElementById('reportTitle');
    const occupancyReportContainerEl = document.getElementById('occupancyReportContainer');
    const revenueReportContainerEl = document.getElementById('revenueReportContainer');
    
    if (reportType === 'occupancy') {
        if (reportTitleEl) reportTitleEl.textContent = 'Occupancy Report';
        if (occupancyReportContainerEl) occupancyReportContainerEl.style.display = 'block';
        if (revenueReportContainerEl) revenueReportContainerEl.style.display = 'none';
        showFlashMessage('Displaying mock occupancy report.', 'info');
        // TODO: Fetch and render actual occupancy report data & chart
    } else if (reportType === 'revenue') {
        if (reportTitleEl) reportTitleEl.textContent = 'Revenue Report';
        if (occupancyReportContainerEl) occupancyReportContainerEl.style.display = 'none';
        if (revenueReportContainerEl) revenueReportContainerEl.style.display = 'block';
        showFlashMessage('Displaying mock revenue report.', 'info');
        // TODO: Fetch and render actual revenue report data & chart
    }
}

function loadSettings() {
    // Activate the first tab by default if settings page is loaded
    const firstTabButton = document.querySelector('#settingsPage .tab-btn');
    if (firstTabButton && !firstTabButton.classList.contains('active')) {
        firstTabButton.click(); // Simulate click to activate first tab
    }
    showFlashMessage('Settings page loaded. Functionality coming soon.', 'info');
    // TODO: Implement loading and saving settings for rooms, addons, users
}

function blockDates() {
    const blockDatesFormEl = document.getElementById('blockDatesForm');
    const modalEl = document.getElementById('blockDatesModal');

    // TODO: Implement actual API call to block dates
    // For now, just show a success message and close modal
    // const formData = new FormData(blockDatesFormEl);
    // const data = Object.fromEntries(formData.entries());
    // console.log('Blocking dates with data:', data);

    showFlashMessage('Dates successfully marked as blocked (mock).', 'success');
    if (modalEl) modalEl.classList.remove('active'); // Close modal
    if (blockDatesFormEl) blockDatesFormEl.reset(); // Reset form
    if(calendar) calendar.refetchEvents(); // Refresh calendar events if it might affect availability
}


// Utility function to format status strings (e.g., 'checked_in' to 'Checked In')
function formatStatus(statusString) {
    if (!statusString || typeof statusString !== 'string') {
        return 'N/A';
    }
    return statusString
        .toLowerCase() // Ensure consistent casing before processing
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}