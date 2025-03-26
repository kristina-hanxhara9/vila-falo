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

// Check if user is authenticated
function checkAuth() {
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

// Logout
function logout() {
    fetch('/api/auth/logout')
        .then(() => {
            window.location.href = 'login.html';
        })
        .catch(error => {
            console.error('Logout error:', error);
            showFlashMessage('Error logging out', 'error');
        });
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



// Load dashboard statistics
function loadDashboardStats() {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch today's check-ins
    fetch(`/api/admin/bookings?status=confirmed&startDate=${today}&endDate=${today}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('todaysCheckins').textContent = data.filter(booking => 
                new Date(booking.checkIn).toISOString().split('T')[0] === today
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
                new Date(booking.checkOut).toISOString().split('T')[0] === today
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
}

// Load recent bookings
function loadRecentBookings() {
    fetch('/api/admin/bookings')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('recentBookingsTable');
            tableBody.innerHTML = '';
            
            // Take only the 10 most recent bookings
            const recentBookings = data.slice(0, 10);
            
            if (recentBookings.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No bookings found</td></tr>';
                return;
            }
            
            recentBookings.forEach(booking => {
                const row = document.createElement('tr');
                
                // Format dates
                const checkIn = new Date(booking.checkIn).toLocaleDateString();
                const checkOut = new Date(booking.checkOut).toLocaleDateString();
                
                row.innerHTML = `
                    <td>#${booking.id}</td>
                    <td>${booking.customerName}</td>
                    <td>${booking.roomType}</td>
                    <td>${checkIn}</td>
                    <td>${checkOut}</td>
                    <td>
                        <span class="status-badge status-${booking.status}">
                            ${formatStatus(booking.status)}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary view-booking" data-id="${booking.id}">
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
            showFlashMessage('Error loading recent bookings', 'error');
        });
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
    
    fetch(`/api/admin/bookings${queryString}`)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('bookingsTable');
            tableBody.innerHTML = '';
            
            if (data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No bookings found</td></tr>';
                return;
            }
            
            data.forEach(booking => {
                const row = document.createElement('tr');
                
                // Format dates
                const checkIn = new Date(booking.checkIn).toLocaleDateString();
                const checkOut = new Date(booking.checkOut).toLocaleDateString();
                
                row.innerHTML = `
                    <td>#${booking.id}</td>
                    <td>${booking.customerName}</td>
                    <td>${booking.roomType}</td>
                    <td>${checkIn}</td>
                    <td>${checkOut}</td>
                    <td>${booking.adults} adults, ${booking.children} children</td>
                    <td>
                        <span class="status-badge status-${booking.status}">
                            ${formatStatus(booking.status)}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary view-booking" data-id="${booking.id}">
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
            showFlashMessage('Error loading bookings', 'error');
        });
}

// Load booking details
function loadBookingDetails(bookingId) {
    fetch(`/api/admin/bookings/${bookingId}`)
        .then(response => response.json())
        .then(booking => {
            // Set booking ID
            document.getElementById('bookingIdDisplay').textContent = booking.id;
            
            // Set status badge
            const statusBadge = document.getElementById('bookingStatusBadge');
            statusBadge.className = `status-badge status-${booking.status}`;
            statusBadge.textContent = formatStatus(booking.status);
            
            // Set customer info
            document.getElementById('customerName').textContent = booking.customerName;
            document.getElementById('customerEmail').textContent = booking.customerEmail;
            document.getElementById('customerPhone').textContent = booking.customerPhone;
            
            // Set reservation details
            document.getElementById('roomType').textContent = booking.roomType;
            document.getElementById('checkInDate').textContent = new Date(booking.checkIn).toLocaleDateString();
            document.getElementById('checkOutDate').textContent = new Date(booking.checkOut).toLocaleDateString();
            document.getElementById('lengthOfStay').textContent = `${booking.nights} nights`;
            document.getElementById('guestCount').textContent = `${booking.adults} adults, ${booking.children} children`;
            
            // Set special requests if any
            if (booking.specialRequests && booking.specialRequests.trim() !== '') {
                document.getElementById('specialRequestsContainer').style.display = 'flex';
                document.getElementById('specialRequests').textContent = booking.specialRequests;
            } else {
                document.getElementById('specialRequestsContainer').style.display = 'none';
            }
            
            // Set billing info
            document.getElementById('roomRate').textContent = `€${booking.pricePerNight} per night`;
            document.getElementById('roomTotal').textContent = `€${booking.roomTotal}`;
            
            // Set addons if any
            if (booking.addons && booking.addons.length > 0) {
                document.getElementById('addonsContainer').style.display = 'flex';
                document.getElementById('addonsTotalContainer').style.display = 'flex';
                
                const addonsList = document.getElementById('addonsList');
                addonsList.innerHTML = '';
                
                booking.addons.forEach(addon => {
                    const addonItem = document.createElement('div');
                    addonItem.className = 'addon-item';
                    addonItem.innerHTML = `
                        <span>${addon.name}</span>
                        <span>€${addon.price} x ${addon.quantity}</span>
                    `;
                    addonsList.appendChild(addonItem);
                });
                
                document.getElementById('addonsTotal').textContent = `€${booking.addonTotal}`;
            } else {
                document.getElementById('addonsContainer').style.display = 'none';
                document.getElementById('addonsTotalContainer').style.display = 'none';
            }
            
            document.getElementById('grandTotal').textContent = `€${booking.grandTotal}`;
            
            // Set current status in dropdown
            document.getElementById('bookingStatus').value = booking.status;
            
            // Show booking detail page
            showPage('bookingDetail');
        })
        .catch(error => {
            console.error('Error loading booking details:', error);
            showFlashMessage('Error loading booking details', 'error');
        });
}

// Update booking status
function updateBookingStatus() {
    const bookingId = document.getElementById('bookingIdDisplay').textContent;
    const status = document.getElementById('bookingStatus').value;
    
    fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showFlashMessage(`Booking status updated to ${formatStatus(status)}`, 'success');
                
                // Update status badge
                const statusBadge = document.getElementById('bookingStatusBadge');
                statusBadge.className = `status-badge status-${status}`;
                statusBadge.textContent = formatStatus(status);
            } else {
                showFlashMessage('Error updating booking status', 'error');
            }
        })
        .catch(error => {
            console.error('Error updating booking status:', error);
            showFlashMessage('Error updating booking status', 'error');
        });
}

// Load calendar
function loadCalendar() {
    const month = document.getElementById('calendarMonth').value;
    const year = document.getElementById('calendarYear').value;
    
    // Load rooms for dropdown
    loadRoomsForDropdown();
    
    // Initialize calendar if not already initialized
    if (!calendar) {
        const calendarEl = document.getElementById('calendar');
        
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
            },
            height: 'auto',
            eventClick: function(info) {
                if (info.event.extendedProps.bookingId) {
                    loadBookingDetails(info.event.extendedProps.bookingId);
                }
            }
        });
        
        calendar.render();
    }
    
    // Load calendar data
    fetch(`/api/admin/calendar-data?month=${month}&year=${year}`)
        .then(response => response.json())
        .then(data => {
            // Remove all events
            calendar.removeAllEvents();
            
            // Set calendar date
            calendar.gotoDate(`${year}-${month}-01`);
            
            // Define status colors
            const statusColors = {
                'pending': '#f39c12',
                'confirmed': '#3498db',
                'checked_in': '#2ecc71',
                'checked_out': '#27ae60',
                'cancelled': '#e74c3c',
                'unavailable': '#95a5a6'
            };
            
            // Add events for each room
            Object.keys(data).forEach(roomId => {
                const roomData = data[roomId];
                
                // Add bookings
                roomData.bookings.forEach(booking => {
                    calendar.addEvent({
                        title: `${roomData.roomType}: ${booking.title}`,
                        start: booking.start,
                        end: booking.end,
                        color: statusColors[booking.status],
                        extendedProps: {
                            bookingId: booking.id,
                            status: booking.status
                        }
                    });
                });
                
                // Add unavailable dates
                roomData.unavailable.forEach(unavailable => {
                    calendar.addEvent({
                        title: `${roomData.roomType}: Unavailable`,
                        start: unavailable.date,
                        allDay: true,
                        color: statusColors['unavailable'],
                        extendedProps: {
                            reason: unavailable.reason
                        }
                    });
                });
            });
        })
        .catch(error => {
            console.error('Error loading calendar data:', error);
            showFlashMessage('Error loading calendar data', 'error');
        });
}

// Load rooms for dropdown
function loadRoomsForDropdown() {
    fetch('/api/admin/rooms')
        .then(response => response.json())
        .then(rooms => {
            const roomDropdown = document.getElementById('blockRoomId');
            roomDropdown.innerHTML = '';
            
            rooms.forEach(room => {
                const option = document.createElement('option');
                option.value = room._id;
                option.textContent = room.roomType;
                roomDropdown.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading rooms:', error);
        });
}

// Block dates
function blockDates() {
    const formData = new FormData(document.getElementById('blockDatesForm'));
    const data = {
        roomId: formData.get('roomId'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        reason: formData.get('reason')
    };
    
    fetch('/api/admin/unavailable-dates', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                showFlashMessage('Dates successfully blocked', 'success');
                
                // Close modal
                document.getElementById('blockDatesModal').classList.remove('active');
                
                // Reset form
                document.getElementById('blockDatesForm').reset();
                
                // Reload calendar
                loadCalendar();
            } else {
                showFlashMessage(result.error || 'Error blocking dates', 'error');
            }
        })
        .catch(error => {
            console.error('Error blocking dates:', error);
            showFlashMessage('Error blocking dates', 'error');
        });
}

// Load reports
function loadReport() {
    const reportType = document.getElementById('reportType').value;
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    
    if (reportType === 'occupancy') {
        document.getElementById('reportTitle').textContent = 'Occupancy Report';
        document.getElementById('occupancyReportContainer').style.display = 'block';
        document.getElementById('revenueReportContainer').style.display = 'none';
        
        loadOccupancyReport(startDate, endDate);
    } else if (reportType === 'revenue') {
        document.getElementById('reportTitle').textContent = 'Revenue Report';
        document.getElementById('occupancyReportContainer').style.display = 'none';
        document.getElementById('revenueReportContainer').style.display = 'block';
        
        loadRevenueReport(startDate, endDate);
    }
}

// Load occupancy report
function loadOccupancyReport(startDate, endDate) {
    fetch(`/api/admin/reports/occupancy?startDate=${startDate}&endDate=${endDate}`)
        .then(response => response.json())
        .then(data => {
            // Populate table
            const tableBody = document.getElementById('occupancyTable');
            tableBody.innerHTML = '';
            
            if (data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="2" class="text-center">No data available</td></tr>';
                return;
            }
            
            // Prepare chart data
            const dates = [];
            const occupancyRates = [];
            
            data.forEach(day => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${day.date}</td>
                    <td>${day.occupancyRate}%</td>
                `;
                tableBody.appendChild(row);
                
                // Add to chart data
                dates.push(day.date);
                occupancyRates.push(day.occupancyRate);
            });
            
            // Create chart
            const ctx = document.getElementById('occupancyChart').getContext('2d');
            
            if (occupancyChart) {
                occupancyChart.destroy();
            }
            
            occupancyChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'Occupancy Rate (%)',
                        data: occupancyRates,
                        backgroundColor: 'rgba(52, 152, 219, 0.2)',
                        borderColor: 'rgba(52, 152, 219, 1)',
                        borderWidth: 2,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error loading occupancy report:', error);
            showFlashMessage('Error loading occupancy report', 'error');
        });
}

// Load revenue report
function loadRevenueReport(startDate, endDate) {
    fetch(`/api/admin/reports/revenue?startDate=${startDate}&endDate=${endDate}`)
        .then(response => response.json())
        .then(data => {
            // Populate table
            const tableBody = document.getElementById('revenueTable');
            tableBody.innerHTML = '';
            
            if (data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No data available</td></tr>';
                return;
            }
            
            // Prepare chart data
            const dates = [];
            const roomRevenues = [];
            const addonRevenues = [];
            
            data.forEach(day => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${day.date}</td>
                    <td>€${day.roomRevenue.toFixed(2)}</td>
                    <td>€${day.addonRevenue.toFixed(2)}</td>
                    <td>€${day.totalRevenue.toFixed(2)}</td>
                `;
                tableBody.appendChild(row);
                
                // Add to chart data
                dates.push(day.date);
                roomRevenues.push(day.roomRevenue);
                addonRevenues.push(day.addonRevenue);
            });
            
            // Create chart
            const ctx = document.getElementById('revenueChart').getContext('2d');
            
            if (revenueChart) {
                revenueChart.destroy();
            }
            
            revenueChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'Room Revenue',
                        data: roomRevenues,
                        backgroundColor: 'rgba(52, 152, 219, 0.8)'
                    }, {
                        label: 'Add-on Revenue',
                        data: addonRevenues,
                        backgroundColor: 'rgba(46, 204, 113, 0.8)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            stacked: true
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error loading revenue report:', error);
            showFlashMessage('Error loading revenue report', 'error');
        });
}

// Load settings
function loadSettings() {
    // Show first tab by default
    document.querySelector('.tab-btn').click();
    
    // Load rooms
    loadRooms();
    
    // Load addons
    loadAddons();
    
    // Load users
    loadUsers();
}

// Load rooms
function loadRooms() {
    fetch('/api/admin/rooms')
        .then(response => response.json())
        .then(rooms => {
            const tableBody = document.getElementById('roomsTable');
            tableBody.innerHTML = '';
            
            if (rooms.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No rooms found</td></tr>';
                return;
            }
            
            rooms.forEach(room => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>#${room._id}</td>
                    <td>${room.roomType}</td>
                    <td>${room.capacityAdults} adults, ${room.capacityChildren} children</td>
                    <td>€${room.pricePerNight}</td>
                    <td>
                        <span class="status-badge ${room.active ? 'status-confirmed' : 'status-cancelled'}">
                            ${room.active ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-room" data-id="${room._id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
            
            // Add event listeners to edit buttons
            document.querySelectorAll('.edit-room').forEach(button => {
                button.addEventListener('click', function() {
                    const roomId = this.dataset.id;
                    const room = rooms.find(r => r._id === roomId);
                    
                    if (room) {
                        // Populate edit form
                        document.getElementById('editRoomId').value = room._id;
                        document.getElementById('editRoomType').value = room.roomType;
                        document.getElementById('editRoomDescription').value = room.description || '';
                        document.getElementById('editCapacityAdults').value = room.capacityAdults;
                        document.getElementById('editCapacityChildren').value = room.capacityChildren;
                        document.getElementById('editPricePerNight').value = room.pricePerNight;
                        document.getElementById('editFeatures').value = room.features || '';
                        document.getElementById('editRoomActive').checked = room.active;
                        
                        // Show modal
                        document.getElementById('editRoomModal').classList.add('active');
                    }
                });
            });
        })
        .catch(error => {
            console.error('Error loading rooms:', error);
            showFlashMessage('Error loading rooms', 'error');
        });
}

// Add room
function addRoom() {
    const formData = new FormData(document.getElementById('addRoomForm'));
    const data = {
        roomType: formData.get('roomType'),
        description: formData.get('description'),
        capacityAdults: parseInt(formData.get('capacityAdults')),
        capacityChildren: parseInt(formData.get('capacityChildren')),
        pricePerNight: parseFloat(formData.get('pricePerNight')),
        features: formData.get('features')
    };
    
    fetch('/api/admin/rooms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            showFlashMessage('Room added successfully', 'success');
            
            // Close modal
            document.getElementById('addRoomModal').classList.remove('active');
            
            // Reset form
            document.getElementById('addRoomForm').reset();
            
            // Reload rooms
            loadRooms();
        })
        .catch(error => {
            console.error('Error adding room:', error);
            showFlashMessage('Error adding room', 'error');
        });
}

// Update room
function updateRoom() {
    const formData = new FormData(document.getElementById('editRoomForm'));
    const roomId = formData.get('roomId');
    const data = {
        roomType: formData.get('roomType'),
        description: formData.get('description'),
        capacityAdults: parseInt(formData.get('capacityAdults')),
        capacityChildren: parseInt(formData.get('capacityChildren')),
        pricePerNight: parseFloat(formData.get('pricePerNight')),
        features: formData.get('features'),
        active: formData.get('active') === 'on'
    };
    
    fetch(`/api/admin/rooms/${roomId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            showFlashMessage('Room updated successfully', 'success');
            
            // Close modal
            document.getElementById('editRoomModal').classList.remove('active');
            
            // Reload rooms
            loadRooms();
        })
        .catch(error => {
            console.error('Error updating room:', error);
            showFlashMessage('Error updating room', 'error');
        });
}

// Load addons
function loadAddons() {
    fetch('/api/admin/addons')
        .then(response => response.json())
        .then(addons => {
            const tableBody = document.getElementById('addonsTable');
            tableBody.innerHTML = '';
            
            if (addons.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No add-ons found</td></tr>';
                return;
            }
            
            addons.forEach(addon => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>#${addon._id}</td>
                    <td>${addon.name}</td>
                    <td>${addon.category.charAt(0).toUpperCase() + addon.category.slice(1)}</td>
                    <td>€${addon.price}</td>
                    <td>
                        <span class="status-badge ${addon.active ? 'status-confirmed' : 'status-cancelled'}">
                            ${addon.active ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-addon" data-id="${addon._id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
            
            // Add event listeners to edit buttons
            document.querySelectorAll('.edit-addon').forEach(button => {
                button.addEventListener('click', function() {
                    const addonId = this.dataset.id;
                    const addon = addons.find(a => a._id === addonId);
                    
                    if (addon) {
                        // Populate edit form
                        document.getElementById('editAddonId').value = addon._id;
                        document.getElementById('editAddonName').value = addon.name;
                        document.getElementById('editAddonDescription').value = addon.description || '';
                        document.getElementById('editAddonPrice').value = addon.price;
                        document.getElementById('editAddonCategory').value = addon.category;
                        document.getElementById('editAddonActive').checked = addon.active;
                        
                        // Show modal
                        document.getElementById('editAddonModal').classList.add('active');
                    }
                });
            });
        })
        .catch(error => {
            console.error('Error loading addons:', error);
            showFlashMessage('Error loading add-ons', 'error');
        });
}

// Add addon
function addAddon() {
    const formData = new FormData(document.getElementById('addAddonForm'));
    const data = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        category: formData.get('category')
    };
    
    fetch('/api/admin/addons', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            showFlashMessage('Add-on added successfully', 'success');
            
            // Close modal
            document.getElementById('addAddonModal').classList.remove('active');
            
            // Reset form
            document.getElementById('addAddonForm').reset();
            
            // Reload addons
            loadAddons();
        })
        .catch(error => {
            console.error('Error adding addon:', error);
            showFlashMessage('Error adding add-on', 'error');
        });
}

// Update addon
function updateAddon() {
    const formData = new FormData(document.getElementById('editAddonForm'));
    const addonId = formData.get('addonId');
    const data = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        category: formData.get('category'),
        active: formData.get('active') === 'on'
    };
    
    fetch(`/api/admin/addons/${addonId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            showFlashMessage('Add-on updated successfully', 'success');
            
            // Close modal
            document.getElementById('editAddonModal').classList.remove('active');
            
            // Reload addons
            loadAddons();
        })
        .catch(error => {
            console.error('Error updating addon:', error);
            showFlashMessage('Error updating add-on', 'error');
        });
}

// Load users
function loadUsers() {
    fetch('/api/admin/users')
        .then(response => response.json())
        .then(users => {
            const tableBody = document.getElementById('usersTable');
            tableBody.innerHTML = '';
            
            if (users.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No users found</td></tr>';
                return;
            }
            
            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>#${user._id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-user" data-id="${user._id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        ${user._id !== currentUser.id ? `
                            <button class="btn btn-sm btn-danger delete-user" data-id="${user._id}" data-name="${user.username}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        ` : ''}
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
            
            // Add event listeners to edit buttons
            document.querySelectorAll('.edit-user').forEach(button => {
                button.addEventListener('click', function() {
                    const userId = this.dataset.id;
                    const user = users.find(u => u._id === userId);
                    
                    if (user) {
                        // Populate edit form
                        document.getElementById('editUserId').value = user._id;
                        document.getElementById('editUsername').value = user.username;
                        document.getElementById('editEmail').value = user.email;
                        document.getElementById('editPassword').value = '';
                        document.getElementById('editRole').value = user.role;
                        
                        // Show modal
                        document.getElementById('editUserModal').classList.add('active');
                    }
                });
            });
            
            // Add event listeners to delete buttons
            document.querySelectorAll('.delete-user').forEach(button => {
                button.addEventListener('click', function() {
                    const userId = this.dataset.id;
                    const userName = this.dataset.name;
                    
                    // Populate delete form
                    document.getElementById('deleteUserId').value = userId;
                    document.getElementById('deleteUserName').textContent = userName;
                    
                    // Show modal
                    document.getElementById('deleteUserModal').classList.add('active');
                });
            });
        })
        .catch(error => {
            console.error('Error loading users:', error);
            showFlashMessage('Error loading users', 'error');
        });
}

// Add user
function addUser() {
    const formData = new FormData(document.getElementById('addUserForm'));
    const data = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role')
    };
    
    fetch('/api/admin/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            showFlashMessage('User added successfully', 'success');
            
            // Close modal
            document.getElementById('addUserModal').classList.remove('active');
            
            // Reset form
            document.getElementById('addUserForm').reset();
            
            // Reload users
            loadUsers();
        })
        .catch(error => {
            console.error('Error adding user:', error);
            showFlashMessage('Error adding user', 'error');
        });
}

// Update user
function updateUser() {
    const formData = new FormData(document.getElementById('editUserForm'));
    const userId = formData.get('userId');
    const data = {
        username: formData.get('username'),
        email: formData.get('email'),
        role: formData.get('role')
    };
    
    // Only include password if provided
    const password = formData.get('password');
    if (password) {
        data.password = password;
    }
    
    fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            showFlashMessage('User updated successfully', 'success');
            
            // Close modal
            document.getElementById('editUserModal').classList.remove('active');
            
            // Reload users
            loadUsers();
            
            // Update current user info if updating own account
            if (userId === currentUser.id) {
                document.getElementById('username').textContent = data.username;
                currentUser.username = data.username;
            }
        })
        .catch(error => {
            console.error('Error updating user:', error);
            showFlashMessage('Error updating user', 'error');
        });
}

// Delete user
function deleteUser() {
    const userId = document.getElementById('deleteUserId').value;
    
    fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                showFlashMessage('User deleted successfully', 'success');
                
                // Close modal
                document.getElementById('deleteUserModal').classList.remove('active');
                
                // Reload users
                loadUsers();
            } else {
                showFlashMessage(result.error || 'Error deleting user', 'error');
            }
        })
        .catch(error => {
            console.error('Error deleting user:', error);
            showFlashMessage('Error deleting user', 'error');
        });
}

// Logout
function logout() {
    fetch('/api/auth/logout')
        .then(response => response.json())
        .then(data => {
            window.location.href = 'login.html';
        })
        .catch(error => {
            console.error('Logout error:', error);
            showFlashMessage('Error logging out', 'error');
        });
}

// Show flash message
function showFlashMessage(message, type) {
    const flashMessages = document.getElementById('flashMessages');
    const flash = document.createElement('div');
    flash.className = `flash ${type}`;
    flash.textContent = message;
    
    flashMessages.appendChild(flash);
    
    // Auto-remove message after 5 seconds
    setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => {
            flash.remove();
        }, 300);
    }, 5000);
}

// Format status
function formatStatus(status) {
    return status
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}