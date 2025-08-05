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

IMPORTANT: When you detect that a customer wants to make a booking, ask for their information step by step:
1. First ask for their name
2. Then ask for their email
3. Ask what type of room they prefer
4. Ask for check-in and check-out dates
5. Ask how many guests
6. Ask if they have any special requests

Be conversational and natural in your responses.
        `;
    }

    async generateResponse(userMessage, conversationHistory = []) {
        try {
            console.log('🤖 Generating response for message:', userMessage);
            
            // Enhanced booking detection
            const bookingDetection = this.detectBookingIntent(userMessage, conversationHistory);
            console.log('📋 Booking detection result:', bookingDetection);
            
            // Extract any booking information from conversation
            const extractedBookingInfo = this.extractAllBookingInfo(userMessage, conversationHistory);
            console.log('📝 Extracted booking info:', extractedBookingInfo);
            
            let systemPrompt = this.context;
            let responseData = {
                success: true,
                bookingDetected: bookingDetection.isBookingAttempt,
                extractedInfo: extractedBookingInfo,
                bookingCreated: null,
                nextStep: null
            };
            
            // If user is trying to book and we have complete information, create booking
            if (bookingDetection.isBookingAttempt && extractedBookingInfo.isComplete) {
                console.log('✅ Complete booking information detected - creating booking...');
                
                try {
                    const booking = await this.createBookingFromInfo(extractedBookingInfo);
                    responseData.bookingCreated = booking;
                    
                    systemPrompt += `\n\nBOOKING CREATED SUCCESSFULLY!\n`;
                    systemPrompt += `Booking ID: #${booking._id.toString().slice(-8).toUpperCase()}\n`;
                    systemPrompt += `Guest: ${booking.guestName}\n`;
                    systemPrompt += `Email: ${booking.email}\n`;
                    systemPrompt += `Room: ${booking.roomType}\n`;
                    systemPrompt += `Check-in: ${booking.checkInDate}\n`;
                    systemPrompt += `Check-out: ${booking.checkOutDate}\n`;
                    systemPrompt += `Guests: ${booking.numberOfGuests}\n`;
                    systemPrompt += `Status: Confirmed\n\n`;
                    systemPrompt += `Please inform the customer that their booking has been successfully created and they will receive a confirmation email shortly. Give them the booking reference number and thank them for choosing Vila Falo.`;
                    
                } catch (error) {
                    console.error('❌ Error creating booking:', error);
                    systemPrompt += `\n\nBOOKING ERROR: There was an error creating the booking. Please apologize and ask the customer to contact us directly at info@vilafalo.com or +355 68 336 9436.`;
                }
                
            } else if (bookingDetection.isBookingAttempt && !extractedBookingInfo.isComplete) {
                // User wants to book but we need more information
                console.log('⏳ Booking intent detected but missing information:', extractedBookingInfo.missing);
                
                systemPrompt += `\n\nBOOKING IN PROGRESS:\n`;
                systemPrompt += `Customer wants to make a booking.\n`;
                systemPrompt += `Information collected so far:\n`;
                
                if (extractedBookingInfo.name) systemPrompt += `- Name: ${extractedBookingInfo.name}\n`;
                if (extractedBookingInfo.email) systemPrompt += `- Email: ${extractedBookingInfo.email}\n`;
                if (extractedBookingInfo.roomType) systemPrompt += `- Room: ${extractedBookingInfo.roomType}\n`;
                if (extractedBookingInfo.checkIn) systemPrompt += `- Check-in: ${extractedBookingInfo.checkIn}\n`;
                if (extractedBookingInfo.checkOut) systemPrompt += `- Check-out: ${extractedBookingInfo.checkOut}\n`;
                if (extractedBookingInfo.guests) systemPrompt += `- Guests: ${extractedBookingInfo.guests}\n`;
                
                systemPrompt += `\nStill need: ${extractedBookingInfo.missing.join(', ')}\n\n`;
                systemPrompt += `Please ask for the next missing piece of information in a friendly, natural way. Guide them through the booking process step by step.`;
                
                responseData.nextStep = extractedBookingInfo.missing[0];
            }

            // Build conversation context
            let conversationContext = systemPrompt + '\n\nCONVERSATION HISTORY:\n';
            
            // Add recent conversation history (last 6 messages)
            const recentHistory = conversationHistory.slice(-6);
            recentHistory.forEach((msg, index) => {
                conversationContext += `${msg.role === 'user' ? 'Customer' : 'Vila Falo'}: ${msg.content}\n`;
            });
            
            conversationContext += `Customer: ${userMessage}\nVila Falo: `;

            console.log('🧠 Sending to Gemini AI...');
            const result = await this.model.generateContent(conversationContext);
            const response = await result.response;
            
            responseData.message = response.text();
            console.log('✅ Response generated successfully');
            
            return responseData;

        } catch (error) {
            console.error('❌ Error generating response:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                status: error.status,
                statusText: error.statusText
            });
            
            // Handle specific API errors
            let errorMessage = 'Na vjen keq, kam probleme teknike. Ju lutem provoni përsëri më vonë.';
            
            if (error.status === 403) {
                errorMessage = 'Problem me API key. Ju lutem kontaktoni administratorin.';
                console.error('❌ API Key issue - please check your GEMINI_API_KEY in .env file');
            } else if (error.status === 429) {
                errorMessage = 'Shumë kërkesa. Ju lutem prisni pak dhe provoni përsëri.';
            } else if (error.message && error.message.includes('API key')) {
                errorMessage = 'Problem me API key. Ju lutem kontaktoni administratorin.';
            }
            
            return {
                success: false,
                message: errorMessage,
                error: 'API Error',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            };
        }
    }

    detectBookingIntent(message, conversationHistory = []) {
        const fullContext = conversationHistory.slice(-4).map(m => m.content).join(' ') + ' ' + message;
        const lowerContext = fullContext.toLowerCase();
        
        // Booking intent keywords in Albanian and English
        const bookingKeywords = [
            // Albanian
            'rezervim', 'rezervoj', 'rezervo', 'dua të rezervoj', 'më intereson', 'booking', 
            'reserve', 'dua', 'want', 'interesuar', 'interesuar jam',
            'mund të rezervoj', 'si mund të', 'çmim', 'kosto', 'kushton',
            'dhoma', 'suite', 'standard', 'deluxe', 'disponueshm',
            
            // English  
            'book', 'booking', 'reserve', 'reservation', 'want to book', 'interested in',
            'available', 'room', 'stay', 'check in', 'check out', 'price', 'cost'
        ];
        
        const hasBookingKeyword = bookingKeywords.some(keyword => lowerContext.includes(keyword));
        
        // Also check for question patterns about availability or prices
        const questionPatterns = [
            /sa kushton/i, // how much does it cost
            /çfarë çmimi/i, // what's the price
            /disponueshm/i, // available
            /mund të rezervoj/i, // can I book
            /how much/i,
            /what.*price/i,
            /available.*room/i,
            /can.*book/i
        ];
        
        const hasBookingQuestion = questionPatterns.some(pattern => pattern.test(fullContext));
        
        return {
            isBookingAttempt: hasBookingKeyword || hasBookingQuestion,
            confidence: hasBookingKeyword ? 'high' : (hasBookingQuestion ? 'medium' : 'low')
        };
    }

    extractAllBookingInfo(message, conversationHistory = []) {
        // Combine all recent messages for context
        const allMessages = conversationHistory.slice(-8).map(m => m.content).join(' ') + ' ' + message;
        const lowerContext = allMessages.toLowerCase();
        
        const info = {
            name: null,
            email: null,
            roomType: null,
            checkIn: null,
            checkOut: null,
            guests: null,
            phone: null,
            specialRequests: null
        };
        
        // Extract name (multiple patterns)
        const namePatterns = [
            /(?:emri im (?:është|eshte)?|quhem|jam)\s+([A-ZËÇÄÖÜ][a-zëçäöü]+(?:\s+[A-ZËÇÄÖÜ][a-zëçäöü]+)*)/i,
            /(?:my name is|i am|i'm)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
            /(?:^|\s)([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s|$|[.,!?])/m,
            /unë jam\s+([A-ZËÇÄÖÜ][a-zëçäöü]+(?:\s+[A-ZËÇÄÖÜ][a-zëçäöü]+)*)/i
        ];
        
        for (const pattern of namePatterns) {
            const match = allMessages.match(pattern);
            if (match && match[1] && match[1].length > 2) {
                const name = match[1].trim();
                // Avoid common words that aren't names
                if (!['Vila Falo', 'Standard', 'Deluxe', 'Premium', 'Suite'].includes(name)) {
                    info.name = name;
                    break;
                }
            }
        }
        
        // Extract email
        const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
        const emailMatch = allMessages.match(emailPattern);
        if (emailMatch) {
            info.email = emailMatch[1].toLowerCase();
        }
        
        // Extract room type
        if (lowerContext.includes('standard')) {
            info.roomType = 'Standard';
        } else if (lowerContext.includes('deluxe') || lowerContext.includes('familjare')) {
            info.roomType = 'Deluxe';
        } else if (lowerContext.includes('suite') || lowerContext.includes('premium') || lowerContext.includes('panorama')) {
            info.roomType = 'Suite';
        }
        
        // Extract dates (multiple formats)
        const datePatterns = [
            /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
            /(\d{1,2})\s+(janar|shkurt|mars|prill|maj|qershor|korrik|gusht|shtator|tetor|nëntor|dhjetor)/gi,
            /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)/gi
        ];
        
        const extractedDates = [];
        datePatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(allMessages)) !== null) {
                if (match[3]) { // DD/MM/YYYY format
                    const day = parseInt(match[1]);
                    const month = parseInt(match[2]) - 1;
                    const year = parseInt(match[3]);
                    if (day <= 31 && month <= 11 && year >= 2024) {
                        extractedDates.push(new Date(year, month, day));
                    }
                }
            }
        });

        // Sort dates and assign check-in/check-out
        if (extractedDates.length >= 2) {
            extractedDates.sort((a, b) => a - b);
            info.checkIn = extractedDates[0].toISOString().split('T')[0];
            info.checkOut = extractedDates[1].toISOString().split('T')[0];
        } else if (extractedDates.length === 1) {
            info.checkIn = extractedDates[0].toISOString().split('T')[0];
            // Default to 2 nights if only one date provided
            const checkOut = new Date(extractedDates[0]);
            checkOut.setDate(checkOut.getDate() + 2);
            info.checkOut = checkOut.toISOString().split('T')[0];
        }
        
        // Extract number of guests
        const guestPatterns = [
            /(\d+)\s*(?:person|persona|mysafir|guest|people|vetë)/i,
            /për\s*(\d+)/i,
            /for\s*(\d+)/i,
            /(\d+)\s*(?:adult|të rritur)/i
        ];
        
        for (const pattern of guestPatterns) {
            const match = allMessages.match(pattern);
            if (match && match[1]) {
                const guests = parseInt(match[1]);
                if (guests >= 1 && guests <= 10) {
                    info.guests = guests;
                    break;
                }
            }
        }
        
        // Extract phone number
        const phonePatterns = [
            /(\+355[\s-]?\d{8,9})/,
            /(\+\d{10,15})/,
            /(06\d{8})/,
            /(?:telefon|phone|nr)[\s:]*([+\d\s-]{8,15})/i
        ];
        
        for (const pattern of phonePatterns) {
            const match = allMessages.match(pattern);
            if (match && match[1]) {
                info.phone = match[1].replace(/\s/g, '');
                break;
            }
        }
        
        // Determine what's missing
        const required = ['name', 'email', 'roomType', 'checkIn', 'checkOut', 'guests'];
        const missing = required.filter(field => !info[field]);
        
        return {
            ...info,
            isComplete: missing.length === 0,
            missing: missing,
            hasPartialInfo: required.some(field => info[field])
        };
    }

    async createBookingFromInfo(bookingInfo) {
        try {
            console.log('🏨 Creating booking with extracted info:', bookingInfo);
            
            const bookingData = {
                guestName: bookingInfo.name,
                email: bookingInfo.email,
                phone: bookingInfo.phone || '',
                roomType: bookingInfo.roomType,
                checkInDate: bookingInfo.checkIn,
                checkOutDate: bookingInfo.checkOut,
                numberOfGuests: bookingInfo.guests,
                specialRequests: bookingInfo.specialRequests || '',
                status: 'confirmed',
                source: 'Chatbot'
            };
            
            console.log('📋 Final booking data:', bookingData);
            
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
            
            // Create and save booking
            console.log('💾 Saving booking to database...');
            const booking = new Booking(bookingData);
            await booking.save();
            
            console.log('✅ Booking saved successfully:', booking._id);
            
            // Send emails
            try {
                console.log('📧 Sending confirmation emails...');
                const confirmationSent = await emailService.sendBookingConfirmation(booking);
                const adminNotificationSent = await emailService.sendAdminNotification(booking);
                
                console.log('📧 Email results:', {
                    confirmation: confirmationSent,
                    admin: adminNotificationSent
                });
            } catch (emailError) {
                console.error('❌ Email sending error (non-blocking):', emailError.message);
            }
            
            return booking;
            
        } catch (error) {
            console.error('❌ Error creating booking:', error);
            throw error;
        }
    }

    // Room availability check
    async checkRoomAvailability(checkInDate, checkOutDate, roomType = null) {
        try {
            const checkIn = new Date(checkInDate);
            const checkOut = new Date(checkOutDate);
            
            if (checkIn >= checkOut) {
                return { available: false, message: 'Check-out date must be after check-in date.' };
            }

            if (checkIn < new Date()) {
                return { available: false, message: 'Check-in date cannot be in the past.' };
            }

            const roomTypes = {
                'Standard': { name: 'Standard Mountain Room', total: 5 },
                'Deluxe': { name: 'Deluxe Family Suite', total: 4 },
                'Suite': { name: 'Premium Panorama Suite', total: 3 }
            };

            let availabilityInfo = [];
            const typesToCheck = roomType ? [roomType] : Object.keys(roomTypes);

            for (const type of typesToCheck) {
                const roomConfig = roomTypes[type];
                if (!roomConfig) continue;

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
                error: 'Error checking room availability.'
            };
        }
    }

    // Get popular questions
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
                answer: "Mund të rezervoni direkt përmes chatbot-it ose të na kontaktoni në info@vilafalo.com"
            },
            {
                question: "Ku ndodheni?",
                answer: "Ndodhemi në Voskopojë, Korçë, në malet e bukura të Shqipërisë juglindore."
            }
        ];
    }
}

module.exports = ChatbotService;
