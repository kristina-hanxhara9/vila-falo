// Admin Panel Auto-Refresh Script
// Add this to your admin-panel.html before closing </body> tag

<script>
// Auto-refresh bookings every 30 seconds
let autoRefreshInterval;

function startAutoRefresh() {
    autoRefreshInterval = setInterval(() => {
        console.log('🔄 Auto-refreshing bookings...');
        loadBookings();
    }, 30000); // 30 seconds
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
}

// Start auto-refresh when page loads
window.addEventListener('load', () => {
    startAutoRefresh();
    console.log('✅ Auto-refresh enabled (30 seconds)');
});

// Stop auto-refresh when page is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopAutoRefresh();
        console.log('⏸️ Auto-refresh paused');
    } else {
        startAutoRefresh();
        console.log('▶️ Auto-refresh resumed');
    }
});

// Enhanced booking display with payment info
function displayBooking(booking) {
    const bookingCard = document.createElement('div');
    bookingCard.className = 'booking-card';
    bookingCard.dataset.bookingId = booking._id;
    
    // Payment status badge
    const paymentBadge = getPaymentBadge(booking.paymentStatus, booking.depositPaid);
    
    // Status badge
    const statusBadge = getStatusBadge(booking.status);
    
    // Calculate amounts
    const totalAmount = booking.totalPrice || 0;
    const depositAmount = booking.depositAmount || 0;
    const remainingAmount = totalAmount - depositAmount;
    
    bookingCard.innerHTML = `
        <div class="booking-header">
            <div>
                <h3>${booking.guestName}</h3>
                <p class="booking-id">#${booking._id.slice(-8).toUpperCase()}</p>
            </div>
            <div class="booking-badges">
                ${statusBadge}
                ${paymentBadge}
            </div>
        </div>
        
        <div class="booking-details">
            <div class="detail-row">
                <span class="detail-label">📧 Email:</span>
                <span class="detail-value">${booking.email}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">📞 Phone:</span>
                <span class="detail-value">${booking.phone || 'Not provided'}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">🏨 Room:</span>
                <span class="detail-value">${booking.roomType}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">📅 Check-in:</span>
                <span class="detail-value">${new Date(booking.checkInDate).toLocaleDateString()}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">📅 Check-out:</span>
                <span class="detail-value">${new Date(booking.checkOutDate).toLocaleDateString()}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">👥 Guests:</span>
                <span class="detail-value">${booking.numberOfGuests}</span>
            </div>
            
            ${booking.specialRequests ? `
            <div class="detail-row">
                <span class="detail-label">✨ Special Requests:</span>
                <span class="detail-value">${booking.specialRequests}</span>
            </div>
            ` : ''}
            
            <div class="payment-section">
                <h4 class="payment-header">💰 Payment Information</h4>
                <div class="detail-row">
                    <span class="detail-label">Total Amount:</span>
                    <span class="detail-value"><strong>${totalAmount.toLocaleString()} Lek</strong></span>
                </div>
                <div class="detail-row ${depositAmount > 0 ? 'success-text' : ''}">
                    <span class="detail-label">✅ Deposit Paid:</span>
                    <span class="detail-value"><strong>${depositAmount.toLocaleString()} Lek</strong></span>
                </div>
                <div class="detail-row ${remainingAmount > 0 ? 'warning-text' : ''}">
                    <span class="detail-label">⏳ Remaining:</span>
                    <span class="detail-value"><strong>${remainingAmount.toLocaleString()} Lek</strong></span>
                </div>
                ${booking.paymentIntentId ? `
                <div class="detail-row">
                    <span class="detail-label">Payment ID:</span>
                    <span class="detail-value" style="font-size: 0.8em;">${booking.paymentIntentId}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="detail-row">
                <span class="detail-label">📍 Source:</span>
                <span class="detail-value">${getSourceIcon(booking.source)} ${booking.source}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">🕒 Created:</span>
                <span class="detail-value">${new Date(booking.createdAt).toLocaleString()}</span>
            </div>
        </div>
        
        <div class="booking-actions">
            <select class="status-select" onchange="updateBookingStatus('${booking._id}', this.value)">
                <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>⏳ Pending</option>
                <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>✅ Confirmed</option>
                <option value="completed" ${booking.status === 'completed' ? 'selected' : ''}>🎉 Completed</option>
                <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>❌ Cancelled</option>
            </select>
            <button class="btn-delete" onclick="deleteBooking('${booking._id}')">🗑️ Delete</button>
        </div>
    `;
    
    return bookingCard;
}

function getPaymentBadge(paymentStatus, depositPaid) {
    if (depositPaid) {
        return '<span class="badge badge-success">💳 Deposit Paid</span>';
    }
    
    switch(paymentStatus) {
        case 'paid_full':
            return '<span class="badge badge-success">💰 Paid Full</span>';
        case 'paid_deposit':
            return '<span class="badge badge-success">💳 Deposit Paid</span>';
        case 'refunded':
            return '<span class="badge badge-warning">💸 Refunded</span>';
        case 'failed':
            return '<span class="badge badge-error">❌ Payment Failed</span>';
        default:
            return '<span class="badge badge-pending">⏳ Payment Pending</span>';
    }
}

function getStatusBadge(status) {
    const badges = {
        pending: '<span class="badge badge-pending">⏳ Pending</span>',
        confirmed: '<span class="badge badge-success">✅ Confirmed</span>',
        completed: '<span class="badge badge-success">🎉 Completed</span>',
        cancelled: '<span class="badge badge-error">❌ Cancelled</span>'
    };
    return badges[status] || badges.pending;
}

function getSourceIcon(source) {
    const icons = {
        'Website': '🌐',
        'Chatbot': '🤖',
        'Phone': '📞',
        'Admin': '👤',
        'Other': '📋'
    };
    return icons[source] || '📋';
}

// New booking notification
let lastBookingCount = 0;
let notificationSound = null;

function checkForNewBookings(bookings) {
    if (lastBookingCount > 0 && bookings.length > lastBookingCount) {
        const newBookingsCount = bookings.length - lastBookingCount;
        showNotification(`🎉 ${newBookingsCount} New Booking${newBookingsCount > 1 ? 's' : ''}!`);
        playNotificationSound();
    }
    lastBookingCount = bookings.length;
}

function showNotification(message) {
    // Check if browser supports notifications
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Vila Falo Admin', {
            body: message,
            icon: '/favicon.svg',
            badge: '/favicon.svg'
        });
    }
    
    // Show in-page notification
    const notification = document.createElement('div');
    notification.className = 'notification notification-success';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function playNotificationSound() {
    if (!notificationSound) {
        notificationSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBiF/0fPTgjMGHm7A7+OZSA4PVK3n77BdGA==');
    }
    notificationSound.play().catch(e => console.log('Sound play failed:', e));
}

// Request notification permission on page load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Add CSS for notifications and enhanced styling
const style = document.createElement('style');
style.textContent = `
    .booking-badges {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .badge {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.85em;
        font-weight: 600;
    }

    .badge-success {
        background: #d8f3dc;
        color: #2d6a4f;
    }

    .badge-pending {
        background: #fff3b0;
        color: #856404;
    }

    .badge-error {
        background: #ffccd5;
        color: #c41e3a;
    }

    .badge-warning {
        background: #ffd6a5;
        color: #b55400;
    }

    .payment-section {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 2px solid #e0e0e0;
    }

    .payment-header {
        margin-bottom: 10px;
        color: #4361ee;
    }

    .success-text {
        color: #2d6a4f;
        font-weight: 600;
    }

    .warning-text {
        color: #b55400;
        font-weight: 600;
    }

    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    }

    .notification-success {
        background: #d8f3dc;
        color: #2d6a4f;
        border: 2px solid #2d6a4f;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .auto-refresh-indicator {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(67, 97, 238, 0.9);
        color: white;
        padding: 8px 15px;
        border-radius: 20px;
        font-size: 0.85em;
        z-index: 999;
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.7;
        }
    }
`;
document.head.appendChild(style);

// Add refresh indicator
const indicator = document.createElement('div');
indicator.className = 'auto-refresh-indicator';
indicator.textContent = '🔄 Auto-refresh: ON';
document.body.appendChild(indicator);

console.log('✅ Enhanced admin panel loaded with real-time updates');
</script>
