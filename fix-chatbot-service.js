// CHATBOT BOOKING FIX for Vila Falo
// This ensures chatbot bookings are properly saved and emails are sent

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Booking = require('../models/Booking');
const EmailService = require('../services/emailService');

class ChatbotService {
    constructor() {
        // Initialize Gemini API
        if (!process.env.GEMINI_API_KEY) {
            console.warn('⚠️ GEMINI_API_KEY not found in environment variables');
        }
        
        if (process.env.GEMINI_API_KEY) {
            console.log('Initializing Gemini AI with key:', process.env.GEMINI_API_KEY.substring(0, 8) + '...');
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        }
        
        // Initialize email service
        this.emailService = new EmailService();
        
        // Vila Falo context
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

        CONTACT:
        - Email: vilafalo@gmail.com
        - Phone: +355 68 336 9436

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
            
            // Check availability if dates are provided
            if (availabilityMatch) {
                try {
                    const availability = await this.checkRoomAvailability(
                        availabilityMatch.checkIn, 
                        availabilityMatch.checkOut, 
                        availabilityMatch.roomType
                    );
                    
                    responseData.availabilityData = availability;
                    
                    systemPrompt += `\n\nCURRENT AVAILABILITY CHECK RESULTS:\n`;
                    systemPrompt += `Check-in: ${availability.checkInDate}\n`;
                    systemPrompt += `Check-out: ${availability.checkOutDate}\n`;
                    systemPrompt += `Nights: ${availability.nights}\n`;
                    
                    if (availability.available) {
                        systemPrompt += `✅ AVAILABLE ROOMS:\n`;
                        availability.rooms.forEach(room => {
                            if (room.available) {
                                systemPrompt += `- ${room.roomName}: ${room.availableRooms} rooms available\n`;
                            }
                        });
                    } else {
                        systemPrompt += `❌ NO ROOMS AVAILABLE for these dates\n`;
                    }
                } catch (error) {
                    console.error('Error checking availability:', error);
                }
            }
            
            // Attempt to create booking if we have enough information
            if (bookingInfo && bookingInfo.hasRequiredInfo) {
                try {
                    console.log('🏨 Attempting to create booking via chatbot...');
                    const booking = await this.createBooking(bookingInfo);
                    responseData.bookingCreated = {
                        success: true,
                        bookingId: booking._id,
                        guestName: booking.guestName,
                        roomType: booking.roomType,
                        checkInDate: booking.checkInDate,
                        checkOutDate: booking.checkOutDate
                    };
                    
                    systemPrompt += `\n\n✅ BOOKING SUCCESSFULLY CREATED!\n`;
                    systemPrompt += `Booking ID: ${booking._id}\n`;
                    systemPrompt += `Guest: ${booking.guestName}\n`;
                    systemPrompt += `Room: ${booking.roomType}\n`;
                    systemPrompt += `Dates: ${booking.checkInDate} to ${booking.checkOutDate}\n`;
                    systemPrompt += `Please confirm the booking was created and provide the booking details to the customer.\n`;
                    
                } catch (bookingError) {
                    console.error('❌ Error creating booking via chatbot:', bookingError);
                    responseData.bookingCreated = {
                        success: false,
                        error: bookingError.message
                    };
                    
                    systemPrompt += `\n\n❌ BOOKING CREATION FAILED!\n`;
                    systemPrompt += `Error: ${bookingError.message}\n`;
                    systemPrompt += `Please inform the customer about the error and ask them to try again or contact us directly.\n`;
                }
            } else if (bookingInfo && bookingInfo.isAttemptingBooking) {
                systemPrompt += `\n\nCUSTOMER IS TRYING TO BOOK - MISSING INFO:\n`;
                systemPrompt += `Missing fields: ${bookingInfo.missingFields.join(', ')}\n`;
                systemPrompt += `Please ask for the missing information to complete the booking.\n`;
            }
            
            // Generate AI response if API is available
            if (this.model) {
                try {
                    const conversationContext = conversationHistory
                        .slice(-4) // Last 4 messages for context
                        .map(msg => `${msg.role}: ${msg.content}`)
                        .join('\n');

                    const prompt = `
                    ${systemPrompt}
                    
                    CONVERSATION CONTEXT:
                    ${conversationContext}
                    
                    USER MESSAGE: ${userMessage}
                    
                    Please respond in Albanian unless the user specifically asks for English. Be helpful, friendly, and professional.
                    `;

                    const result = await this.model.generateContent(prompt);
                    const aiResponse = result.response.text();
                    
                    responseData.message = aiResponse;
                    return responseData;
                    
                } catch (aiError) {
                    console.error('AI generation error:', aiError);
                    // Fall through to fallback responses
                }
            }
            
            // Fallback responses if AI is not available
            const fallbackResponses = this.getFallbackResponse(userMessage, bookingInfo, responseData);
            responseData.message = fallbackResponses;
            return responseData;
            
        } catch (error) {
            console.error('ChatbotService error:', error);
            return {
                success: false,
                message: 'Na vjen keq, kam probleme teknike. Ju lutem provoni përsëri më vonë ose na kontaktoni në vilafalo@gmail.com.',
                error: 'Service Error'
            };
        }
    }

    getFallbackResponse(userMessage, bookingInfo, responseData) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Booking confirmation response
        if (responseData.bookingCreated && responseData.bookingCreated.success) {
            return `✅ Rezervimi juaj u krijua me sukses!

📧 Detajet e rezervimit:
- Emri: ${responseData.bookingCreated.guestName}
- Dhomë: ${responseData.bookingCreated.roomType}
- Check-in: ${responseData.bookingCreated.checkInDate}
- Check-out: ${responseData.bookingCreated.checkOutDate}

Do të merrni një email konfirmimi së shpejti. Faleminderit që zgjodhët Vila Falo!

📞 Kontakt: +355 68 336 9436
📧 Email: vilafalo@gmail.com`;
        }
        
        // Booking error response
        if (responseData.bookingCreated && !responseData.bookingCreated.success) {
            return `❌ Na vjen keq, ndodhi një gabim gjatë krijimit të rezervimit.

Ju lutem provoni përsëri ose na kontaktoni direkt:
📞 Telefon: +355 68 336 9436
📧 Email: vilafalo@gmail.com

Error: ${responseData.bookingCreated.error}`;
        }
        
        // Booking in progress
        if (bookingInfo && bookingInfo.isAttemptingBooking && !bookingInfo.hasRequiredInfo) {
            const missing = bookingInfo.missingFields;
            let response = "📝 Për të kompletuar rezervimin, më nevojiten këto informacione:\n\n";
            
            if (missing.includes('guestName')) response += "• Emri juaj i plotë\n";
            if (missing.includes('email')) response += "• Adresa e email-it\n";
            if (missing.includes('roomType')) response += "• Lloji i dhomës (Standard/Deluxe/Suite)\n";
            if (missing.includes('checkInDate')) response += "• Data e check-in\n";
            if (missing.includes('checkOutDate')) response += "• Data e check-out\n";
            if (missing.includes('numberOfGuests')) response += "• Numri i mysafirëve\n";
            
            response += "\nJu lutem jepni këto detaje për të vazhduar.";
            return response;
        }
        
        // Availability response
        if (responseData.availabilityData) {
            const availability = responseData.availabilityData;
            if (availability.available) {
                let response = `✅ Dhoma të disponueshme për ${availability.checkInDate} deri ${availability.checkOutDate} (${availability.nights} netë):\n\n`;
                
                availability.rooms.forEach(room => {
                    if (room.available) {
                        response += `🏨 ${room.roomName}: ${room.availableRooms} dhoma të lira\n`;
                    }
                });
                
                response += "\nDëshironi të rezervoni? Më thoni emrin tuaj dhe email-in.";
                return response;
            } else {
                return `❌ Na vjen keq, nuk kemi dhoma të disponueshme për ${availability.checkInDate} deri ${availability.checkOutDate}.

Ju lutem provoni data të tjera ose na kontaktoni për alternativa:
📞 +355 68 336 9436
📧 vilafalo@gmail.com`;
            }
        }
        
        // General greeting/info responses
        if (lowerMessage.includes('përshëndetje') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return `Përshëndetje! Mirë se erdhi në Vila Falo! 🏔️

Jam këtu për t'ju ndihmuar me:
• Informacion për dhomat dhe çmimet
• Kontroll të disponueshmërisë
• Rezervime
• Aktivitete dhe shërbime

Si mund t'ju ndihmoj sot?`;
        }
        
        if (lowerMessage.includes('çmim') || lowerMessage.includes('price') || lowerMessage.includes('kosto')) {
            return `💰 Çmimet tona për dhoma:

🏨 Standard Mountain Room: nga €70/natë
   - 2 mysafirë, 1 krevat dopio, pamje malore

🏨 Deluxe Family Suite: nga €95/natë  
   - 4 mysafirë, 2 krevate, zonë ndenjeje

🏨 Premium Panorama Suite: nga €120/natë
   - 2 mysafirë, krevat king size, jakuzi, ballkon privat

Dëshironi të kontrolloni disponueshmërinë për data specifike?`;
        }
        
        if (lowerMessage.includes('aktivitet') || lowerMessage.includes('activities') || lowerMessage.includes('shërbime')) {
            return `🎿 Aktivitete dhe Shërbime në Vila Falo:

❄️ Dimër:
• Ski dhe snowboard
• Shëtitje me racka

🌿 Verë:
• Hiking dhe trekking
• Alpinizëm

🍽️ Gjithmonë:
• Restorant tradicional shqiptar
• Wi-Fi falas
• Mëngjes i përfshirë
• Transfer nga aeroporti

Dëshironi të rezervoni?`;
        }
        
        // Default response
        return `Faleminderit për pyetjen! Vila Falo është një resort luksoz malor në Voskopojë, Korçë.

Kemi dhoma të ndryshme nga €70-120/natë dhe ofrojmë aktivitete të shumta si ski, hiking dhe kuzhinë tradicionale.

Si mund t'ju ndihmoj? Mund të:
• Kontrolloj disponueshmërinë
• Ju jap informacion për dhomat
• Ju ndihmoj me rezervimin

📞 Kontakt: +355 68 336 9436
📧 Email: vilafalo@gmail.com`;
    }

    async createBooking(bookingInfo) {
        try {
            const bookingData = {
                guestName: bookingInfo.extractedInfo.guestName,
                email: bookingInfo.extractedInfo.email,
                phone: bookingInfo.extractedInfo.phone || '',
                roomType: bookingInfo.extractedInfo.roomType,
                checkInDate: bookingInfo.extractedInfo.checkInDate,
                checkOutDate: bookingInfo.extractedInfo.checkOutDate,
                numberOfGuests: bookingInfo.extractedInfo.numberOfGuests || 2,
                adults: bookingInfo.extractedInfo.numberOfGuests || 2,
                children: 0,
                specialRequests: bookingInfo.extractedInfo.specialRequests || '',
                status: 'pending',
                source: 'Chatbot',
                createdAt: new Date()
            };
            
            // Validate required fields
            const requiredFields = ['guestName', 'email', 'roomType', 'checkInDate', 'checkOutDate'];
            for (const field of requiredFields) {
                if (!bookingData[field]) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }
            
            // Validate dates
            const checkIn = new Date(bookingData.checkInDate);
            const checkOut = new Date(bookingData.checkOutDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (checkIn < today) {
                throw new Error('Check-in date cannot be in the past');
            }
            
            if (checkOut <= checkIn) {
                throw new Error('Check-out date must be after check-in date');
            }
            
            // Check availability
            const availability = await this.checkRoomAvailability(
                bookingData.checkInDate,
                bookingData.checkOutDate,
                bookingData.roomType
            );
            
            if (!availability || !availability.available) {
                throw new Error('No rooms available for the selected dates');
            }
            
            // Create the booking
            const booking = new Booking(bookingData);
            await booking.save();
            
            console.log('✅ Booking created via chatbot:', booking._id);
            
            // Send confirmation emails
            try {
                await this.emailService.sendBookingConfirmation(booking);
                console.log('✅ Confirmation email sent to guest');
            } catch (emailError) {
                console.error('❌ Error sending confirmation email:', emailError);
            }
            
            try {
                await this.emailService.sendAdminNotification(booking);  
                console.log('✅ Admin notification email sent');
            } catch (emailError) {
                console.error('❌ Error sending admin notification:', emailError);
            }
            
            return booking;
            
        } catch (error) {
            console.error('❌ Error creating booking via chatbot:', error);
            throw error;
        }
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
        if (lowerMessage.includes('standard')) {
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
        const namePatterns = [
            /(?:emri im (?:është|eshte)?|quhem|jam)\s+([a-zA-ZÇçÉéÁáÍíÓóÚúÇçÉéÁáÍíÓóÚúÇçÉéÁáÍíÓóÚúÇçÉéÁáÍíÓóÚúÇçÉéÁáÍíÓóÚúÇçÉéÁáÍíÓóÚúÇçÉéÁáÍíÓóÚúÇçÉéÁáÍíÓóÚúÇçÉéÁáÍíÓóÚúÇçÉéÁáÍíÓóÚúÇçÉéÁáÍíÓóÚúÇçÉéÁáÍíÓóÚúÇçÉéÁáÍíÓóÚú\s]{2,50})/i,
            /(?:my name is|i am|i'm)\s+([a-zA-Z\s]{2,50})/i,
            /^([A-ZÇ][a-zçéáíóúÇçÉéÁáÍíÓóÚú]+\s[A-ZÇ][a-zçéáíóúÇçÉéÁáÍíÓóÚú]+)$/m // FirstName LastName format
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
            extractedInfo.roomType = 'Standard Mountain Room';
        } else if (lowerContext.includes('deluxe') || lowerContext.includes('familjare')) {
            extractedInfo.roomType = 'Deluxe Family Suite';
        } else if (lowerContext.includes('suite') || lowerContext.includes('premium') || lowerContext.includes('panorama')) {
            extractedInfo.roomType = 'Premium Panorama Suite';
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
                answer: "Mund të rezervoni online në faqen tonë ose të na kontaktoni në vilafalo@gmail.com"
            },
            {
                question: "Ku ndodheni?",
                answer: "Ndodhemi në Voskopojë, Korçë, në malet e bukura të Shqipërisë juglindore."
            }
        ];
    }
}

module.exports = ChatbotService;
