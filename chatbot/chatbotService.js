const { GoogleGenerativeAI } = require('@google/generative-ai');
const Booking = require('../models/Booking');
const emailService = require('../services/emailService');

class ChatbotService {
    constructor() {
        // Initialize Gemini API - you'll need to set your API key in .env
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not found in environment variables. Please add your API key to .env file');
        }
        
        // Validate API key format (should start with AIza)
        if (!process.env.GEMINI_API_KEY.startsWith('AIza')) {
            console.warn('Warning: GEMINI_API_KEY should start with "AIza". Please verify your API key.');
        }
        
        console.log('Initializing Gemini AI with key:', process.env.GEMINI_API_KEY.substring(0, 8) + '...');
        
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Updated to use the latest Gemini 2.0 Flash model
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        
        // Vila Falo context in Albanian and English
        this.context = `
        You are a helpful assistant for Vila Falo, a luxury mountain resort in Voskopoje, Albania.
        You should respond in Albanian by default, but can also respond in English if asked.

        RESORT INFORMATION:
        - Name: Vila Falo
        - Location: Voskopoje, Korçë, Albania (high in the mountains)
        - Mountain resort with beautiful views
        - Activities: Skiing, hiking, relaxation, traditional Albanian cuisine
        - Open year-round

        ROOM TYPES & PRICING:
        1. Standard Mountain Room (Dhomë Standard Malore)
           - 2 guests maximum
           - 1 Double bed
           - Mountain view, Free WiFi
           - Price: From €70/night

        2. Deluxe Family Suite (Suitë Familjare Deluxe)  
           - 4 guests maximum
           - 2 beds, seating area, private bathroom
           - Price: From €95/night

        3. Premium Panorama Suite (Suitë Premium Panoramike)
           - 2 guests maximum  
           - King size bed, Jacuzzi, Private balcony
           - Price: From €120/night

        RESTAURANT:
        - Traditional Albanian cuisine
        - Specialties: Tavë Kosi, Fërgesë, Byrek, Qofte të Fërguara, Lakror
        - Mountain view dining

        SERVICES:
        - Restaurant & Bar
        - Winter Activities (skiing, snowboarding)
        - Hiking & Trekking
        - Wellness Services (massage, aromatherapy)
        - Airport Transfers
        - Free Wi-Fi

        SEASONAL INFO:
        - Winter (Dec-Feb): -5°C to 5°C, perfect for skiing
        - Spring (Mar-May): 5°C to 15°C, wildflower blooms
        - Summer (Jun-Aug): 15°C to 25°C, ideal hiking weather
        - Autumn (Sep-Nov): 5°C to 15°C, beautiful foliage

        CONTACT:
        - Address: Vila Falo, Voskopoje Village, Korçë, Albania
        - Email: info@vilafalo.com
        - Phone: +355 XX XXX XXXX

        BOOKING CAPABILITY:
        You can help customers make bookings directly through the chat. When a customer expresses interest in booking,
        try to collect the following information:
        - Guest name
        - Email address
        - Phone number (optional)
        - Room type preference
        - Check-in date
        - Check-out date
        - Number of guests
        - Special requests (optional)
        
        Once you have the required information (name, email, room type, dates, number of guests), 
        you can create the booking for them.

        Always be friendly, helpful, and promote Vila Falo. Guide customers through the booking process naturally.
        `;
    }

    async checkRoomAvailability(checkInDate, checkOutDate, roomType = null) {
        try {
            const checkIn = new Date(checkInDate);
            const checkOut = new Date(checkOutDate);
            
            // Validate dates
            if (checkIn >= checkOut) {
                return {
                    available: false,
                    message: 'Data e check-in duhet të jetë para datës së check-out.'
                };
            }

            if (checkIn < new Date()) {
                return {
                    available: false,
                    message: 'Data e check-in nuk mund të jetë në të kaluarën.'
                };
            }

            // Room capacity mapping
            const roomTypes = {
                'Standard': { name: 'Standard Mountain Room', total: 5 },
                'Deluxe': { name: 'Deluxe Family Suite', total: 4 },
                'Suite': { name: 'Premium Panorama Suite', total: 3 }
            };

            let availabilityInfo = [];

            // Check availability for all room types or specific type
            const typesToCheck = roomType ? [roomType] : Object.keys(roomTypes);

            for (const type of typesToCheck) {
                const roomConfig = roomTypes[type];
                if (!roomConfig) continue;

                // Find conflicting bookings
                const conflictingBookings = await Booking.find({
                    roomType: { $regex: new RegExp(type, 'i') },
                    status: { $ne: 'cancelled' },
                    $or: [
                        {
                            checkInDate: { $lt: checkOut },
                            checkOutDate: { $gt: checkIn }
                        }
                    ]
                });

                const availableRooms = roomConfig.total - conflictingBookings.length;
                
                availabilityInfo.push({
                    roomType: type,
                    roomName: roomConfig.name,
                    totalRooms: roomConfig.total,
                    bookedRooms: conflictingBookings.length,
                    availableRooms: Math.max(0, availableRooms),
                    available: availableRooms > 0
                });
            }

            return {
                available: availabilityInfo.some(room => room.available),
                checkInDate: checkInDate,
                checkOutDate: checkOutDate,
                nights: Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)),
                rooms: availabilityInfo
            };

        } catch (error) {
            console.error('Error checking availability:', error);
            return {
                available: false,
                error: 'Ka ndodhur një gabim gjatë kontrollit të disponueshmërisë.'
            };
        }
    }

    async generateResponse(userMessage, conversationHistory = []) {
        try {
            // Check if message is about booking availability
            const availabilityMatch = this.extractBookingDates(userMessage);
            
            // Check if user is trying to make a booking
            const bookingInfo = this.extractBookingInfo(userMessage, conversationHistory);
            
            let systemPrompt = this.context;
            let responseData = {
                success: true,
                hasAvailabilityCheck: !!availabilityMatch,
                availabilityData: null,
                bookingInfo: bookingInfo,
                bookingCreated: null
            };
            
            if (availabilityMatch) {
                const availability = await this.checkRoomAvailability(
                    availabilityMatch.checkIn, 
                    availabilityMatch.checkOut, 
                    availabilityMatch.roomType
                );
                
                responseData.availabilityData = availability;
                
                systemPrompt += `\n\nCURRENT AVAILABILITY CHECK RESULTS:\n`;
                systemPrompt += `Check-in: ${availability.checkInDate}\n`;
                systemPrompt += `Check-out: ${availability.checkOutDate}\n`;
                systemPrompt += `Nights: ${availability.nights}\n\n`;
                
                if (availability.rooms) {
                    systemPrompt += `ROOM AVAILABILITY:\n`;
                    availability.rooms.forEach(room => {
                        systemPrompt += `- ${room.roomName}: ${room.availableRooms}/${room.totalRooms} available\n`;
                    });
                }
                
                systemPrompt += `\nBased on this real availability data, provide a helpful response about room availability.`;
            }
            
            // Check if we have enough information to create a booking
            if (bookingInfo.hasRequiredInfo) {
                try {
                    const booking = await this.createBooking(bookingInfo);
                    responseData.bookingCreated = booking;
                    
                    systemPrompt += `\n\nBOOKING CREATED SUCCESSFULLY:\n`;
                    systemPrompt += `Booking ID: #${booking._id.toString().slice(-8).toUpperCase()}\n`;
                    systemPrompt += `Guest: ${booking.guestName}\n`;
                    systemPrompt += `Room: ${booking.roomType}\n`;
                    systemPrompt += `Dates: ${booking.checkInDate} to ${booking.checkOutDate}\n`;
                    systemPrompt += `Status: ${booking.status}\n`;
                    systemPrompt += `\nInform the customer that their booking has been successfully created and they will receive a confirmation email. Provide the booking reference number.`;
                } catch (bookingError) {
                    console.error('Error creating booking via chatbot:', bookingError);
                    systemPrompt += `\n\nBOOKING ERROR:\n`;
                    systemPrompt += `There was an error creating the booking. Please apologize and ask the customer to try again or contact us directly.`;
                }
            } else if (bookingInfo.isAttemptingBooking) {
                systemPrompt += `\n\nBOOKING IN PROGRESS:\n`;
                systemPrompt += `Customer is trying to make a booking but missing some information:\n`;
                systemPrompt += `Missing: ${bookingInfo.missingFields.join(', ')}\n`;
                systemPrompt += `Current info: ${JSON.stringify(bookingInfo.extractedInfo)}\n`;
                systemPrompt += `\nPlease help collect the missing information in a natural, friendly way.`;
            }

            // Build conversation context
            let conversationContext = systemPrompt + '\n\nCONVERSATION:\n';
            
            // Add conversation history
            conversationHistory.forEach(msg => {
                conversationContext += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
            });
            
            conversationContext += `User: ${userMessage}\nAssistant:`;

            const result = await this.model.generateContent(conversationContext);
            const response = await result.response;
            
            responseData.message = response.text();
            return responseData;

        } catch (error) {
            console.error('Error generating response:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                status: error.status,
                statusText: error.statusText
            });
            
            // More specific error messages
            let errorMessage = 'Na vjen keq, kam probleme teknike. Ju lutem provoni përsëri më vonë.';
            
            if (error.status === 403) {
                errorMessage = 'Problem me API key. Ju lutem kontaktoni administratorin.';
                console.error('API Key issue - please check your GEMINI_API_KEY in .env file');
            } else if (error.status === 429) {
                errorMessage = 'Shumë kërkesa. Ju lutem prisni pak dhe provoni përsëri.';
            } else if (error.message && error.message.includes('API key')) {
                errorMessage = 'Problem me API key. Ju lutem kontaktoni administratorin.';
            }
            
            // Fallback responses in Albanian
            const fallbackResponses = [
                errorMessage,
                'Faleminderit për pyetjen tuaj. Për informacion të detajuar, ju lutem na kontaktoni në info@vilafalo.com ose +355 XX XXX XXXX.',
                'Vila Falo është një resort luksoz malor në Voskopojë. Si mund t\'ju ndihmoj sot?'
            ];
            
            return {
                success: false,
                message: fallbackResponses[0],
                error: 'API Error',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            };
        }
    }

    extractBookingDates(message) {
        // Simple date extraction patterns
        const datePatterns = [
            // DD/MM/YYYY or DD-MM-YYYY
            /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
            // Month names in Albanian/English
            /(\d{1,2})\s+(janar|shkurt|mars|prill|maj|qershor|korrik|gusht|shtator|tetor|nëntor|dhjetor|january|february|march|april|may|june|july|august|september|october|november|december)/gi
        ];

        const dates = [];
        const lowerMessage = message.toLowerCase();

        // Extract dates using patterns
        datePatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(message)) !== null) {
                // Convert to standard date format
                if (match[3]) { // DD/MM/YYYY format
                    const day = parseInt(match[1]);
                    const month = parseInt(match[2]) - 1; // JS months are 0-indexed
                    const year = parseInt(match[3]);
                    dates.push(new Date(year, month, day));
                }
            }
        });

        // Look for "today", "tomorrow", "next week" etc in Albanian
        const today = new Date();
        if (lowerMessage.includes('sot') || lowerMessage.includes('today')) {
            dates.push(new Date(today));
        }
        if (lowerMessage.includes('nesër') || lowerMessage.includes('tomorrow')) {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            dates.push(tomorrow);
        }

        // Extract room type
        let roomType = null;
        if (lowerMessage.includes('standard') || lowerMessage.includes('standard')) {
            roomType = 'Standard';
        } else if (lowerMessage.includes('deluxe') || lowerMessage.includes('familjare')) {
            roomType = 'Deluxe';
        } else if (lowerMessage.includes('suite') || lowerMessage.includes('premium') || lowerMessage.includes('panorama')) {
            roomType = 'Suite';
        }

        // If we have at least 2 dates, assume first is check-in, second is check-out
        if (dates.length >= 2) {
            return {
                checkIn: dates[0].toISOString().split('T')[0],
                checkOut: dates[1].toISOString().split('T')[0],
                roomType: roomType
            };
        }

        // If only one date and it's about availability, assume 1 night stay
        if (dates.length === 1 && (lowerMessage.includes('disponueshm') || lowerMessage.includes('available') || lowerMessage.includes('rezervim'))) {
            const checkOut = new Date(dates[0]);
            checkOut.setDate(checkOut.getDate() + 1);
            return {
                checkIn: dates[0].toISOString().split('T')[0],
                checkOut: checkOut.toISOString().split('T')[0],
                roomType: roomType
            };
        }

        return null;
    }

    extractBookingInfo(userMessage, conversationHistory = []) {
        // Combine current message with recent conversation for context
        const recentMessages = conversationHistory.slice(-6); // Last 6 messages
        const fullContext = recentMessages.map(m => m.content).join(' ') + ' ' + userMessage;
        const lowerContext = fullContext.toLowerCase();
        
        const extractedInfo = {};
        let isAttemptingBooking = false;
        
        // Check if user is trying to book
        const bookingKeywords = [
            'rezervim', 'book', 'reserve', 'dua', 'want', 'interesuar', 'interested',
            'rezervoj', 'rezervo', 'rezervimi', 'booking', 'reserve', 'me rezervo'
        ];
        
        isAttemptingBooking = bookingKeywords.some(keyword => lowerContext.includes(keyword));
        
        // Extract name patterns
        // Look for "my name is", "emri im", "quhem", etc.
        const namePatterns = [
            /(?:emri im (?:është|eshte)?|quhem|jam)\s+([a-zA-Z\s]{2,30})/i,
            /(?:my name is|i am|i'm)\s+([a-zA-Z\s]{2,30})/i,
            /^([A-Z][a-z]+\s[A-Z][a-z]+)$/m // FirstName LastName format
        ];
        
        for (const pattern of namePatterns) {
            const match = fullContext.match(pattern);
            if (match && match[1]) {
                extractedInfo.guestName = match[1].trim();
                break;
            }
        }
        
        // Extract email patterns
        const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
        const emailMatch = fullContext.match(emailPattern);
        if (emailMatch) {
            extractedInfo.email = emailMatch[1].toLowerCase();
        }
        
        // Extract phone patterns
        const phonePatterns = [
            /(\+355[\s-]?\d{8,9})/,
            /(06\d{8})/,
            /(\+\d{10,15})/,
            /(?:phone|telefon|nr|number)[\s:]*([\d\s+-]{8,15})/i
        ];
        
        for (const pattern of phonePatterns) {
            const match = fullContext.match(pattern);
            if (match && match[1]) {
                extractedInfo.phone = match[1].replace(/\s/g, '');
                break;
            }
        }
        
        // Extract room type
        if (lowerContext.includes('standard')) {
            extractedInfo.roomType = 'Standard';
        } else if (lowerContext.includes('deluxe') || lowerContext.includes('familjare')) {
            extractedInfo.roomType = 'Deluxe';
        } else if (lowerContext.includes('suite') || lowerContext.includes('premium') || lowerContext.includes('panorama')) {
            extractedInfo.roomType = 'Suite';
        }
        
        // Extract dates (reuse existing method)
        const dateMatch = this.extractBookingDates(fullContext);
        if (dateMatch) {
            extractedInfo.checkInDate = dateMatch.checkIn;
            extractedInfo.checkOutDate = dateMatch.checkOut;
        }
        
        // Extract number of guests
        const guestPatterns = [
            /(?:(\d+)\s*(?:person|persona|mysafir|guest|people))/i,
            /(?:për\s*(\d+))/i,
            /(?:for\s*(\d+))/i
        ];
        
        for (const pattern of guestPatterns) {
            const match = fullContext.match(pattern);
            if (match && match[1]) {
                const guests = parseInt(match[1]);
                if (guests >= 1 && guests <= 10) {
                    extractedInfo.numberOfGuests = guests;
                    break;
                }
            }
        }
        
        // Extract special requests
        const requestPatterns = [
            /(?:special request|kërkesa|special|kërkoj)\s*:?\s*(.{5,100})/i,
            /(?:need|nevojë)\s+(.{5,100})/i
        ];
        
        for (const pattern of requestPatterns) {
            const match = fullContext.match(pattern);
            if (match && match[1]) {
                extractedInfo.specialRequests = match[1].trim();
                break;
            }
        }
        
        // Determine required fields
        const requiredFields = ['guestName', 'email', 'roomType', 'checkInDate', 'checkOutDate', 'numberOfGuests'];
        const missingFields = requiredFields.filter(field => !extractedInfo[field]);
        const hasRequiredInfo = missingFields.length === 0;
        
        return {
            isAttemptingBooking,
            hasRequiredInfo,
            extractedInfo,
            missingFields,
            requiredFields
        };
    }
    
    async createBooking(bookingInfo) {
        try {
            console.log('🏨 Creating booking via chatbot with info:', bookingInfo.extractedInfo);
            
            const bookingData = {
                ...bookingInfo.extractedInfo,
                status: 'pending',
                source: 'Chatbot'
            };
            
            console.log('📋 Final booking data:', bookingData);
            
            // Validate dates
            const checkIn = new Date(bookingData.checkInDate);
            const checkOut = new Date(bookingData.checkOutDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            console.log('📅 Date validation:', {
                checkIn: checkIn.toISOString(),
                checkOut: checkOut.toISOString(),
                today: today.toISOString()
            });
            
            if (checkIn < today) {
                throw new Error('Check-in date cannot be in the past');
            }
            
            if (checkOut <= checkIn) {
                throw new Error('Check-out date must be after check-in date');
            }
            
            // Check availability
            console.log('🔍 Checking room availability...');
            const availability = await this.checkRoomAvailability(
                bookingData.checkInDate,
                bookingData.checkOutDate,
                bookingData.roomType
            );
            
            console.log('📊 Availability result:', availability);
            
            if (!availability.available) {
                throw new Error('No rooms available for the selected dates');
            }
            
            // Create the booking
            console.log('💾 Saving booking to database...');
            const booking = new Booking(bookingData);
            await booking.save();
            
            console.log('✅ Booking created successfully via chatbot:', {
                id: booking._id,
                guest: booking.guestName,
                email: booking.email,
                room: booking.roomType,
                checkIn: booking.checkInDate,
                checkOut: booking.checkOutDate
            });
            
            // Send confirmation emails with enhanced error handling
            console.log('📧 Attempting to send booking confirmation email...');
            try {
                const confirmationSent = await emailService.sendBookingConfirmation(booking);
                if (confirmationSent) {
                    console.log('✅ Confirmation email sent successfully to:', booking.email);
                } else {
                    console.log('⚠️ Confirmation email not sent (email service not configured)');
                }
            } catch (emailError) {
                console.error('❌ Error sending confirmation email:', emailError.message);
                // Continue - don't fail booking if email fails
            }
            
            console.log('📧 Attempting to send admin notification email...');
            try {
                const adminNotificationSent = await emailService.sendAdminNotification(booking);
                if (adminNotificationSent) {
                    console.log('✅ Admin notification sent successfully to:', process.env.ADMIN_EMAIL);
                } else {
                    console.log('⚠️ Admin notification not sent (email service not configured)');
                }
            } catch (emailError) {
                console.error('❌ Error sending admin notification:', emailError.message);
                // Continue - don't fail booking if email fails
            }
            
            return booking;
            
        } catch (error) {
            console.error('❌ Error creating booking via chatbot:', error.message);
            console.error('Full error:', error);
            throw error;
        }
    }

    // Get popular questions and their answers
    getPopularQuestions() {
        return [
            {
                question: "Sa kushton një dhomë për natë?",
                answer: "Dhoma Standard nga €70/natë, Deluxe nga €95/natë, Premium Suite nga €120/natë."
            },
            {
                question: "Çfarë aktivitetesh keni?",
                answer: "Kemi ski, hiking, spa, restorant tradicional shqiptar, dhe pamje të mrekullueshme malore."
            },
            {
                question: "Si mund të rezervoj?",
                answer: "Mund të rezervoni online në faqen tonë ose të na kontaktoni në info@vilafalo.com"
            },
            {
                question: "Ku ndodheni?",
                answer: "Ndodhemi në Voskopojë, Korçë, në malet e bukura të Shqipërisë juglindore."
            }
        ];
    }
}

module.exports = ChatbotService;
