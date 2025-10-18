// FIXED Booking Form Handler with Price Calculator
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    
    // Room prices (includes breakfast)
    const roomPrices = {
        'Standard Mountain Room': 5000,
        'Deluxe Family Suite': 6000,
        'Premium Panorama Suite': 7000
    };
    
    // Price calculation function
    function calculatePrice() {
        const roomType = document.getElementById('roomType').value;
        const checkIn = document.getElementById('checkIn').value;
        const checkOut = document.getElementById('checkOut').value;
        
        if (!roomType || !checkIn || !checkOut) {
            document.getElementById('priceSummary').style.display = 'none';
            return;
        }
        
        // Calculate number of nights
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        
        if (nights < 1) {
            document.getElementById('priceSummary').style.display = 'none';
            return;
        }
        
        // Get price per night
        const pricePerNight = roomPrices[roomType];
        const totalPrice = pricePerNight * nights;
        
        // Update summary display
        document.getElementById('summaryRoomType').textContent = roomType;
        document.getElementById('summaryNights').textContent = nights;
        document.getElementById('summaryPricePerNight').textContent = pricePerNight.toLocaleString() + ' Lek';
        document.getElementById('summaryTotalPrice').textContent = totalPrice.toLocaleString() + ' Lek';
        
        // Show summary
        document.getElementById('priceSummary').style.display = 'block';
    }
    
    // Add event listeners for price calculation
    if (bookingForm) {
        document.getElementById('roomType').addEventListener('change', calculatePrice);
        document.getElementById('checkIn').addEventListener('change', calculatePrice);
        document.getElementById('checkOut').addEventListener('change', calculatePrice);
        
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            console.log('🏨 Booking form submitted');
            
            // Get form values
            const formData = new FormData(bookingForm);
            const adults = parseInt(formData.get('adults')) || 1;
            const children = parseInt(formData.get('children')) || 0;
            
            // FIXED: Map form fields to API format
            const bookingData = {
                guestName: formData.get('name'),  // name → guestName
                email: formData.get('email'),
                phone: formData.get('phone'),
                checkInDate: formData.get('checkIn'),  // checkIn → checkInDate
                checkOutDate: formData.get('checkOut'),  // checkOut → checkOutDate
                roomType: formData.get('roomType'),
                numberOfGuests: adults + children,  // adults + children → numberOfGuests
                specialRequests: formData.get('special') || '',
                source: 'Website'
            };
            
            console.log('📤 Sending booking data:', bookingData);
            
            // Show loading state
            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Duke dërguar...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/api/booking', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bookingData)
                });
                
                const result = await response.json();
                console.log('📨 Booking response:', result);
                
                if (response.ok && result.success) {
                    // Success!
                    alert('✅ Rezervimi u krijua me sukses!\\n\\nID: ' + result.reference + '\\nEmail: ' + bookingData.email + '\\n\\nJu faleminderit!');
                    bookingForm.reset();
                    document.getElementById('priceSummary').style.display = 'none';
                    
                    // Show confirmation modal if available
                    const modal = document.getElementById('bookingModal');
                    if (modal && window.showBookingModal) {
                        window.showBookingModal();
                    }
                } else {
                    // Error
                    alert('❌ Gabim: ' + (result.message || 'Ka ndodhur një gabim. Ju lutemi provoni përsëri.'));
                    console.error('Booking error:', result);
                }
                
            } catch (error) {
                console.error('❌ Network error:', error);
                alert('❌ Gabim në lidhje. Ju lutemi kontrolloni internetin dhe provoni përsëri.');
            } finally {
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
        
        console.log('✅ Booking form handler with price calculator installed');
    } else {
        console.log('⚠️ Booking form not found');
    }
});
