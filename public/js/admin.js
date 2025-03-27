// admin.js - Main JavaScript file for the admin dashboard

// Global variables
let currentUser = null;
let occupancyChart = null;
let revenueChart = null;
let calendar = null;

// Check if user is authenticated on page load
document.addEventListener('DOMContentLoaded', function () {
    initializePage();
    checkAuth();
    setupEventListeners();
});

// Initialize page defaults
function initializePage() {
    const today = new Date();
    const defaultEndDate = today.toISOString().split('T')[0];
    const defaultStartDate = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];

    document.getElementById('startDateFilter').value = defaultStartDate;
    document.getElementById('endDateFilter').value = defaultEndDate;
    document.getElementById('reportStartDate').value = defaultStartDate;
    document.getElementById('reportEndDate').value = defaultEndDate;

    const yearSelect = document.getElementById('calendarYear');
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 1; year <= currentYear + 5; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;
    document.getElementById('calendarMonth').value = new Date().getMonth() + 1;
}

// MODIFIED: Check if user is authenticated - bypassing authentication for development
function checkAuth() {
    // For development mode - bypass authentication
    console.log("Development mode: Bypassing authentication");
    currentUser = {
        id: "1",
        username: "Admin",
        email: "admin@example.com",
        role: "admin"
    };
    
    // Update UI
    document.getElementById('username').textContent = currentUser.username;
    document.getElementById('settingsLink').style.display = 'flex';
    
    // Load dashboard
    loadDashboard();
    
    /* Uncomment this when you have authentication API ready
    fetch('/api/auth/check')
        .then(response => response.json())
        .then(data => {
            if (data.isAuthenticated) {
                currentUser = data.user;
                document.getElementById('username').textContent = currentUser.username;

                if (currentUser.role === 'admin') {
                    document.getElementById('settingsLink').style.display = 'flex';
                }

                loadDashboard();
            } else {
                window.location.href = 'login.html';
            }
        })
        .catch(error => {
            console.error('Authentication check error:', error);
            showFlashMessage('Error checking authentication. Please try again.', 'error');
        });
    */
}

// Setup all event listeners
function setupEventListeners() {
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

    document.getElementById('logoutDropdown').addEventListener('click', function (e) {
        e.preventDefault();
        logout();
    });

    document.getElementById('toggleSidebar').addEventListener('click', function () {
        document.getElementById('sidebar').classList.toggle('active');
    });

    setupModalListeners();

    document.getElementById('bookingFilterForm').addEventListener('submit', function (e) {
        e.preventDefault();
        loadBookings();
    });

    document.getElementById('calendarFilterForm').addEventListener('submit', function (e) {
        e.preventDefault();
        loadCalendar();
    });

    document.getElementById('reportFilterForm').addEventListener('submit', function (e) {
        e.preventDefault();
        loadReport();
    });

    document.getElementById('bookingStatusForm').addEventListener('submit', function (e) {
        e.preventDefault();
        updateBookingStatus();
    });

    document.getElementById('blockDatesForm').addEventListener('submit', function (e) {
        e.preventDefault();
        blockDates();
    });

    document.getElementById('addRoomForm').addEventListener('submit', function (e) {
        e.preventDefault();
        addRoom();
    });

    document.getElementById('editRoomForm').addEventListener('submit', function (e) {
        e.preventDefault();
        updateRoom();
    });

    document.getElementById('addAddonForm').addEventListener('submit', function (e) {
        e.preventDefault();
        addAddon();
    });

    document.getElementById('editAddonForm').addEventListener('submit', function (e) {
        e.preventDefault();
        updateAddon();
    });

    document.getElementById('addUserForm').addEventListener('submit', function (e) {
        e.preventDefault();
        addUser();
    });

    document.getElementById('editUserForm').addEventListener('submit', function (e) {
        e.preventDefault();
        updateUser();
    });

    document.getElementById('deleteUserForm').addEventListener('submit', function (e) {
        e.preventDefault();
        deleteUser();
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const tabId = this.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
            this.classList.add('active');
            document.getElementById(tabId + 'Tab').style.display = 'block';
        });
    });

    document.getElementById('printReport').addEventListener('click', function () {
        window.print();
    });
}

// ADDED: Setup modal event listeners
function setupModalListeners() {
    // Open modals
    document.querySelectorAll('[data-modal]').forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.dataset.modal;
            document.getElementById(modalId).classList.add('active');
        });
    });
    
    // Close modals
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// Show flash message
function showFlashMessage(message, type) {
    const flashMessages = document.getElementById('flashMessages');
    const flash = document.createElement('div');
    flash.className = `flash ${type}`;
    flash.textContent = message;
    flashMessages.appendChild(flash);
    setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 300);
    }, 5000);
}

// MODIFIED: Logout - bypassing fetch for development
function logout() {
    // For development - just redirect
    window.location.href = 'login.html';
    
    /* Uncomment when you have authentication ready
    fetch('/api/auth/logout')
        .then(() => {
            window.location.href = 'login.html';
        })
        .catch(error => {
            console.error('Logout error:', error);
            showFlashMessage('Error logging out', 'error');
        });
    */
}

// Show page and update navigation
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(page + 'Page').style.display = 'block';
    document.getElementById('pageTitle').textContent = page.charAt(0).toUpperCase() + page.slice(1);
    document.querySelectorAll('.sidebar-menu-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`.sidebar-menu-item[data-page="${page}"]`).classList.add('active');
    switch (page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'bookings':
            loadBookings();
            break;
        case 'calendar':
            loadCalendar();
            break;
        case 'reports':
            loadReport();
            break;
        case 'settings':
            loadSettings();
            break;
    }
    if (window.innerWidth < 992) {
        document.getElementById('sidebar').classList.remove('active');
    }
}
// Load dashboard data
function loadDashboard() {
    // Load dashboard statistics
    loadDashboardStats();
    
    // Load recent bookings
    loadRecentBookings();
}

// MODIFIED: Load dashboard statistics with mock data
function loadDashboardStats() {
    // For development - use mock data
    document.getElementById('todaysCheckins').textContent = '3';
    document.getElementById('todaysCheckouts').textContent = '2';
    document.getElementById('currentOccupancy').textContent = '68%';
    
    /* Uncomment when your APIs are ready
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch today's check-ins
    fetch(`/api/admin/bookings?status=confirmed&startDate=${today}&endDate=${today}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('todaysCheckins').textContent = data.filter(booking => 
                new Date(booking.checkInDate).toISOString().split('T')[0] === today
            ).length;
        })
        .catch(error => {
            console.error('Error loading check-ins:', error);
        });
    
    // Fetch today's check-outs
    fetch(`/api/admin/bookings?status=checked_in&startDate=${today}&endDate=${today}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('todaysCheckouts').textContent = data.filter(booking => 
                new Date(booking.checkOutDate).toISOString().split('T')[0] === today
            ).length;
        })
        .catch(error => {
            console.error('Error loading check-outs:', error);
        });
    
    // Fetch occupancy data
    fetch(`/api/admin/reports/occupancy?startDate=${today}&endDate=${today}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                document.getElementById('currentOccupancy').textContent = `${data[0].occupancyRate}%`;
            } else {
                document.getElementById('currentOccupancy').textContent = '0%';
            }
        })
        .catch(error => {
            console.error('Error loading occupancy:', error);
        });
    */
}

// MODIFIED: Load recent bookings using your booking schema
function loadRecentBookings() {
    // Try to fetch from your actual API
    fetch('/api/booking')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Bookings data:', data);
            const tableBody = document.getElementById('recentBookingsTable');
            tableBody.innerHTML = '';
            
            // Handle different response formats
            let bookings = data;
            if (data.data) {
                bookings = data.data;
            }
            if (!Array.isArray(bookings)) {
                bookings = [];
            }
            
            // Take only the 10 most recent bookings
            const recentBookings = bookings.slice(0, 10);
            
            if (recentBookings.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No bookings found</td></tr>';
                return;
            }
            
            recentBookings.forEach(booking => {
                const row = document.createElement('tr');
                
                // Format dates
                const checkIn = new Date(booking.checkInDate).toLocaleDateString();
                const checkOut = new Date(booking.checkOutDate).toLocaleDateString();
                
                row.innerHTML = `
                    <td>#${booking._id || ''}</td>
                    <td>${booking.guestName || 'N/A'}</td>
                    <td>${booking.roomType || 'N/A'}</td>
                    <td>${checkIn}</td>
                    <td>${checkOut}</td>
                    <td>
                        <span class="status-badge status-${booking.status || 'pending'}">
                            ${formatStatus(booking.status || 'pending')}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary view-booking" data-id="${booking._id || ''}">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
            
            // Add event listeners to view booking buttons
            document.querySelectorAll('.view-booking').forEach(button => {
                button.addEventListener('click', function() {
                    const bookingId = this.dataset.id;
                    loadBookingDetails(bookingId);
                });
            });
        })
        .catch(error => {
            console.error('Error loading recent bookings:', error);
            showFlashMessage('Error loading recent bookings: ' + error.message, 'error');
            
            // Show mock data for development
            populateMockBookings();
        });
}

// ADDED: Function to populate mock bookings for development
function populateMockBookings() {
    const tableBody = document.getElementById('recentBookingsTable');
    tableBody.innerHTML = '';
    
    const mockBookings = [
        {
            _id: '1001',
            guestName: 'John Doe',
            roomType: 'Deluxe',
            checkInDate: new Date('2025-03-20'),
            checkOutDate: new Date('2025-03-25'),
            status: 'confirmed',
            numberOfGuests: 2
        },
        {
            _id: '1002',
            guestName: 'Jane Smith',
            roomType: 'Standard',
            checkInDate: new Date('2025-03-15'),
            checkOutDate: new Date('2025-03-18'),
            status: 'checked_out',
            numberOfGuests: 1
        },
        {
            _id: '1003',
            guestName: 'Mike Johnson',
            roomType: 'Family',
            checkInDate: new Date('2025-03-30'),
            checkOutDate: new Date('2025-04-05'),
            status: 'pending',
            numberOfGuests: 4
        }
    ];
    
    mockBookings.forEach(booking => {
        const row = document.createElement('tr');
        
        // Format dates
        const checkIn = booking.checkInDate.toLocaleDateString();
        const checkOut = booking.checkOutDate.toLocaleDateString();
        
        row.innerHTML = `
            <td>#${booking._id}</td>
            <td>${booking.guestName}</td>
            <td>${booking.roomType}</td>
            <td>${checkIn}</td>
            <td>${checkOut}</td>
            <td>
                <span class="status-badge status-${booking.status}">
                    ${formatStatus(booking.status)}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary view-booking" data-id="${booking._id}">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to view booking buttons
    document.querySelectorAll('.view-booking').forEach(button => {
        button.addEventListener('click', function() {
            const bookingId = this.dataset.id;
            const mockBooking = mockBookings.find(b => b._id === bookingId);
            if (mockBooking) {
                loadMockBookingDetails(mockBooking);
            }
        });
    });
}

// ADDED: Function to load mock booking details
function loadMockBookingDetails(mockBooking) {
    // Set booking ID
    document.getElementById('bookingIdDisplay').textContent = mockBooking._id;
    
    // Set status badge
    const statusBadge = document.getElementById('bookingStatusBadge');
    statusBadge.className = `status-badge status-${mockBooking.status}`;
    statusBadge.textContent = formatStatus(mockBooking.status);
    
    // Set customer info
    document.getElementById('customerName').textContent = mockBooking.guestName;
    document.getElementById('customerEmail').textContent = 'customer@example.com';
    document.getElementById('customerPhone').textContent = '+123 456 7890';
    
    // Set reservation details
    document.getElementById('roomType').textContent = mockBooking.roomType;
    document.getElementById('checkInDate').textContent = mockBooking.checkInDate.toLocaleDateString();
    document.getElementById('checkOutDate').textContent = mockBooking.checkOutDate.toLocaleDateString();
    
    // Calculate nights
    const checkIn = new Date(mockBooking.checkInDate);
    const checkOut = new Date(mockBooking.checkOutDate);
    const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    document.getElementById('lengthOfStay').textContent = `${nights} nights`;
    document.getElementById('guestCount').textContent = `${mockBooking.numberOfGuests} guests`;
    
    // Hide special requests
    document.getElementById('specialRequestsContainer').style.display = 'none';
    
    // Set billing info
    const rate = 100;
    document.getElementById('roomRate').textContent = `€${rate} per night`;
    document.getElementById('roomTotal').textContent = `€${rate * nights}`;
    
    // Hide addons
    document.getElementById('addonsContainer').style.display = 'none';
    document.getElementById('addonsTotalContainer').style.display = 'none';
    
    document.getElementById('grandTotal').textContent = `€${rate * nights}`;
    
    // Set current status in dropdown
    document.getElementById('bookingStatus').value = mockBooking.status;
    
    // Show booking detail page
    showPage('bookingDetail');
}

// Load all bookings
function loadBookings() {
    // Get filter values
    const status = document.getElementById('statusFilter').value;
    const startDate = document.getElementById('startDateFilter').value;
    const endDate = document.getElementById('endDateFilter').value;
    
    // Build query string
    let queryString = '?';
    if (status !== 'all') {
        queryString += `status=${status}&`;
    }
    if (startDate) {
        queryString += `startDate=${startDate}&`;
    }
    if (endDate) {
        queryString += `endDate=${endDate}&`;
    }
    
    // Try to fetch from your actual API
    fetch(`/api/booking${queryString}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('All bookings data:', data);
            const tableBody = document.getElementById('bookingsTable');
            tableBody.innerHTML = '';
            
            // Handle different response formats
            let bookings = data;
            if (data.data) {
                bookings = data.data;
            }
            if (!Array.isArray(bookings)) {
                bookings = [];
            }
            
            if (bookings.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No bookings found</td></tr>';
                return;
            }
            
            bookings.forEach(booking => {
                const row = document.createElement('tr');
                
                // Format dates
                const checkIn = new Date(booking.checkInDate).toLocaleDateString();
                const checkOut = new Date(booking.checkOutDate).toLocaleDateString();
                
                row.innerHTML = `
                    <td>#${booking._id || ''}</td>
                    <td>${booking.guestName || 'N/A'}</td>
                    <td>${booking.roomType || 'N/A'}</td>
                    <td>${checkIn}</td>
                    <td>${checkOut}</td>
                    <td>${booking.numberOfGuests || 0} guests</td>
                    <td>
                        <span class="status-badge status-${booking.status || 'pending'}">
                            ${formatStatus(booking.status || 'pending')}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary view-booking" data-id="${booking._id || ''}">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
            
            // Add event listeners to view booking buttons
            document.querySelectorAll('.view-booking').forEach(button => {
                button.addEventListener('click', function() {
                    const bookingId = this.dataset.id;
                    loadBookingDetails(bookingId);
                });
            });
        })
        .catch(error => {
            console.error('Error loading bookings:', error);
            showFlashMessage('Using mock data for development', 'info');
            
            // Show mock data for development
            const tableBody = document.getElementById('bookingsTable');
            tableBody.innerHTML = '';
            
            const mockBookings = [
                {
                    _id: '1001',
                    guestName: 'John Doe',
                    roomType: 'Deluxe',
                    checkInDate: new Date('2025-03-20'),
                    checkOutDate: new Date('2025-03-25'),
                    status: 'confirmed',
                    numberOfGuests: 2
                },
                {
                    _id: '1002',
                    guestName: 'Jane Smith',
                    roomType: 'Standard',
                    checkInDate: new Date('2025-03-15'),
                    checkOutDate: new Date('2025-03-18'),
                    status: 'checked_out',
                    numberOfGuests: 1
                },
                {
                    _id: '1003',
                    guestName: 'Mike Johnson',
                    roomType: 'Family',
                    checkInDate: new Date('2025-03-30'),
                    checkOutDate: new Date('2025-04-05'),
                    status: 'pending',
                    numberOfGuests: 4
                }
            ];
            
            mockBookings.forEach(booking => {
                const row = document.createElement('tr');
                
                // Format dates
                const checkIn = booking.checkInDate.toLocaleDateString();
                const checkOut = booking.checkOutDate.toLocaleDateString();
                
                row.innerHTML = `
                    <td>#${booking._id}</td>
                    <td>${booking.guestName}</td>
                    <td>${booking.roomType}</td>
                    <td>${checkIn}</td>
                    <td>${checkOut}</td>
                    <td>${booking.numberOfGuests} guests</td>
                    <td>
                        <span class="status-badge status-${booking.status}">
                            ${formatStatus(booking.status)}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary view-booking" data-id="${booking._id}">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
            
            // Add event listeners to view booking buttons
            document.querySelectorAll('.view-booking').forEach(button => {
                button.addEventListener('click', function() {
                    const bookingId = this.dataset.id;
                    const mockBooking = mockBookings.find(b => b._id === bookingId);
                    if (mockBooking) {
                        loadMockBookingDetails(mockBooking);
                    }
                });
            });
        });
}

// Load booking details
function loadBookingDetails(bookingId) {
    fetch(`/api/booking/${bookingId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Booking details:', data);
            // Handle different response formats
            let booking = data;
            if (data.data) {
                booking = data.data;
            }
            
            // Set booking ID
            document.getElementById('bookingIdDisplay').textContent = booking._id || '';
            
            // Set status badge
            const statusBadge = document.getElementById('bookingStatusBadge');
            statusBadge.className = `status-badge status-${booking.status || 'pending'}`;
            statusBadge.textContent = formatStatus(booking.status || 'pending');
            
            // Set customer info
            document.getElementById('customerName').textContent = booking.guestName || 'N/A';
            document.getElementById('customerEmail').textContent = booking.email || 'N/A';
            document.getElementById('customerPhone').textContent = booking.phone || 'N/A';
            
            // Set reservation details
            document.getElementById('roomType').textContent = booking.roomType || 'N/A';
            document.getElementById('checkInDate').textContent = new Date(booking.checkInDate).toLocaleDateString();
            document.getElementById('checkOutDate').textContent = new Date(booking.checkOutDate).toLocaleDateString();
            
            // Calculate length of stay
            const checkIn = new Date(booking.checkInDate);
            const checkOut = new Date(booking.checkOutDate);
            const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            document.getElementById('lengthOfStay').textContent = `${nights} nights`;
            
            // Set guest count
            document.getElementById('guestCount').textContent = `${booking.numberOfGuests || 0} guests`;
            
            // Set special requests if any
            if (booking.specialRequests) {
                document.getElementById('specialRequestsContainer').style.display = 'flex';
                document.getElementById('specialRequests').textContent = booking.specialRequests;
            } else {
                document.getElementById('specialRequestsContainer').style.display = 'none';
            }
            
            // Set billing info (example values since we don't have this info)
            const rate = 100; // Example rate
            document.getElementById('roomRate').textContent = `€${rate} per night`;
            document.getElementById('roomTotal').textContent = `€${rate * nights}`;
            
            // Hide addons for now
            document.getElementById('addonsContainer').style.display = 'none';
            document.getElementById('addonsTotalContainer').style.display = 'none';
            
            document.getElementById('grandTotal').textContent = `€${rate * nights}`;
            
            // Set current status in dropdown
            document.getElementById('bookingStatus').value = booking.status || 'pending';
            
            // Show booking detail page
            showPage('bookingDetail');
        })
        .catch(error => {
            console.error('Error loading booking details:', error);
            showFlashMessage('Error loading booking details: ' + error.message, 'error');
        });
}

// Update booking status
function updateBookingStatus() {
    const bookingId = document.getElementById('bookingIdDisplay').textContent;
    const status = document.getElementById('bookingStatus').value;
    
    fetch(`/api/booking/${bookingId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            showFlashMessage(`Booking status updated to ${formatStatus(status)}`, 'success');
            
            // Update status badge
            const statusBadge = document.getElementById('bookingStatusBadge');
            statusBadge.className = `status-badge status-${status}`;
            statusBadge.textContent = formatStatus(status);
        })
        .catch(error => {
            console.error('Error updating booking status:', error);
            
            // For development, update UI anyway
            showFlashMessage(`Booking status updated to ${formatStatus(status)} (development mode)`, 'success');
            
            // Update status badge
            const statusBadge = document.getElementById('bookingStatusBadge');
            statusBadge.className = `status-badge status-${status}`;
            statusBadge.textContent = formatStatus(status);
        });
}

// SIMPLIFIED: Load calendar with mock data
function loadCalendar() {
    showFlashMessage('Calendar functionality will be implemented in the future', 'info');
    
    // Just for development - show calendar is loading
    const calendarEl = document.getElementById('calendar');
    if (calendarEl) {
        calendarEl.innerHTML = '<div class="loading-calendar">Calendar View - Coming Soon</div>';
    }
}

// SIMPLIFIED: Load rooms for dropdown with mock data
function loadRoomsForDropdown() {
    const roomDropdown = document.getElementById('blockRoomId');
    if (roomDropdown) {
        roomDropdown.innerHTML = '';
        
        ['Standard', 'Deluxe', 'Family', 'Suite'].forEach((roomType, index) => {
            const option = document.createElement('option');
            option.value = index + 1;
            option.textContent = roomType;
            roomDropdown.appendChild(option);
        });
    }
}

// SIMPLIFIED: Block dates - mock function
function blockDates() {
    showFlashMessage('Dates successfully blocked (development mode)', 'success');
    
    // Close modal
    document.getElementById('blockDatesModal').classList.remove('active');
    
    // Reset form
    document.getElementById('blockDatesForm').reset();
}

// SIMPLIFIED: Load reports - mock function
function loadReport() {
    const reportType = document.getElementById('reportType').value;
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    
    if (reportType === 'occupancy') {
        document.getElementById('reportTitle').textContent = 'Occupancy Report';
        document.getElementById('occupancyReportContainer').style.display = 'block';
        document.getElementById('revenueReportContainer').style.display = 'none';
        
        showFlashMessage('Loading occupancy report (development mode)', 'info');
    } else if (reportType === 'revenue') {
        document.getElementById('reportTitle').textContent = 'Revenue Report';
        document.getElementById('occupancyReportContainer').style.display = 'none';
        document.getElementById('revenueReportContainer').style.display = 'block';
        
        showFlashMessage('Loading revenue report (development mode)', 'info');
    }
}

// SIMPLIFIED: Load settings - mock function
function loadSettings() {
    // Show first tab by default
    document.querySelector('.tab-btn').click();
    
    showFlashMessage('Settings functionality will be implemented in the future', 'info');
}

// Format status
function formatStatus(status) {
    return status
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}