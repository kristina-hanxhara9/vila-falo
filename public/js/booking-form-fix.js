// FIXED Booking Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    
    if (bookingForm) {
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
        
        console.log('✅ Booking form handler installed');
    } else {
        console.log('⚠️ Booking form not found');
    }
});
