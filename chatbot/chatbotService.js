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
try to collect the following information IN THIS ORDER:
1. Guest name
2. Email address
3. Phone number (REQUIRED)
4. Room type preference
5. Check-in date
6. Check-out date
7. Number of guests
8. Special requests (optional)

Always ask for the phone number - it's required for all bookings.

Once you have the required information (name, email, phone, room type, dates, number of guests), 
you can create the booking for them.

Always be friendly, helpful, and promote Vila Falo. Guide customers through the booking process naturally.

IMPORTANT: When you detect that a customer wants to make a booking, ask for their information step by step:
1. First ask for their name
2. Then ask for their email
3. Then ask for their phone number (REQUIRED)
4. Ask what type of room they prefer
5. Ask for check-in and check-out dates
6. Ask how many guests
7. Ask if they have any special requests

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
            
            // Check if we have enough information to create a booking
            if (bookingDetection.isBookingAttempt && extractedBookingInfo.isComplete) {
                console.log('✅ Complete booking information detected - creating booking...');
                
                try {
                    const booking = await this.createBookingFromInfo(extractedBookingInfo);
                    responseData.bookingCreated = booking;
                    
                    systemPrompt += `\n\nBOOKING CREATED SUCCESSFULLY!\n`;
                    systemPrompt += `Booking ID: #${booking._id.toString().slice(-8).toUpperCase()}\n`;
                    systemPrompt += `Guest: ${booking.guestName}\n`;
                    systemPrompt += `Email: ${booking.email}\n`;
                    systemPrompt += `Phone: ${booking.phone}\n`;
                    systemPrompt += `Room: ${booking.roomType}\n`;
                    systemPrompt += `Check-in: ${booking.checkInDate}\n`;
                    systemPrompt += `Check-out: ${booking.checkOutDate}\n`;
                    systemPrompt += `Guests: ${booking.numberOfGuests}\n`;
                    systemPrompt += `Status: Confirmed\n\n`;
                    systemPrompt += `Please inform the customer that their booking has been successfully created and they will receive a confirmation email shortly. Give them the booking reference number and thank them for choosing Vila Falo.`;
                    
                    // If Gemini API fails, provide a fallback response
                    const fallbackResponse = `🎉 Rezervimi juaj u krijua me sukses!\n\n` +
                        `📋 Detajet e rezervimit:\n` +
                        `• Emri: ${booking.guestName}\n` +
                        `• Email: ${booking.email}\n` +
                        `• Telefon: ${booking.phone}\n` +
                        `• Dhoma: ${booking.roomType}\n` +
                        `• Check-in: ${booking.checkInDate}\n` +
                        `• Check-out: ${booking.checkOutDate}\n` +
                        `• Mysafirë: ${booking.numberOfGuests}\n` +
                        `• Numri i riferimit: #${booking._id.toString().slice(-8).toUpperCase()}\n\n` +
                        `✅ Do të merrni një email konfirmimi së shpejti.\n` +
                        `📞 Për çdo pyetje: +355 68 336 9436\n\n` +
                        `Faleminderit që zgjodhët Vila Falo! 🏔️`;
                    
                    responseData.fallbackMessage = fallbackResponse;
                    
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
                if (extractedBookingInfo.phone) systemPrompt += `- Phone: ${extractedBookingInfo.phone}\n`;
                if (extractedBookingInfo.roomType) systemPrompt += `- Room: ${extractedBookingInfo.roomType}\n`;
                if (extractedBookingInfo.checkIn) systemPrompt += `- Check-in: ${extractedBookingInfo.checkIn}\n`;
                if (extractedBookingInfo.checkOut) systemPrompt += `- Check-out: ${extractedBookingInfo.checkOut}\n`;
                if (extractedBookingInfo.guests) systemPrompt += `- Guests: ${extractedBookingInfo.guests}\n`;
                
                systemPrompt += `\nStill need: ${extractedBookingInfo.missing.join(', ')}\n\n`;
                systemPrompt += `Please ask for the next missing piece of information in a friendly, natural way. Follow this order: name → email → phone (REQUIRED) → room type → dates → guests. The phone number is REQUIRED for all bookings.`;
                
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
            
            // If we created a booking but Gemini API failed, use fallback response
            if (typeof responseData !== 'undefined' && responseData.bookingCreated && responseData.fallbackMessage) {
                console.log('✅ Using fallback response for successful booking');
                return {
                    success: true,
                    message: responseData.fallbackMessage,
                    bookingDetected: true,
                    extractedInfo: extractedBookingInfo,
                    bookingCreated: responseData.bookingCreated,
                    apiError: 'Gemini API failed but booking was created successfully'
                };
            }
            
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
        
        // Booking intent keywords in Albanian and English (expanded)
        const bookingKeywords = [
            // Albanian
            'rezervim', 'rezervoj', 'rezervo', 'dua të rezervoj', 'më intereson', 'booking', 
            'reserve', 'dua', 'want', 'interesuar', 'interesuar jam',
            'mund të rezervoj', 'si mund të', 'çmim', 'kosto', 'kushton',
            'dhoma', 'suite', 'standard', 'deluxe', 'disponueshm',
            'qëndrim', 'pushim', 'për', 'natë', 'net', 'hotel', 'resort',
            
            // English  
            'book', 'booking', 'reserve', 'reservation', 'want to book', 'interested in',
            'available', 'room', 'stay', 'check in', 'check out', 'price', 'cost',
            'vacation', 'holiday', 'trip', 'visit', 'night', 'nights', 'hotel'
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
        // Extract from user messages only to avoid AI response contamination
        const userMessages = conversationHistory.filter(m => m.role === 'user').map(m => m.content);
        const allUserMessages = userMessages.join(' ') + ' ' + message;
        const lowerContext = allUserMessages.toLowerCase();
        
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
        
        console.log('🔍 Extracting info from USER messages only:', allUserMessages);
        
        // Extract name - prioritize current message, then search all conversations
        const namePatterns = [
            // Explicit patterns with better Albanian support
            /(?:emri im (?:është|eshte)?|quhem|jam)\s+([A-ZËÇÄÖÜ][a-zëçäöü\u00e9]+(?:\s+[A-ZËÇÄÖÜ][a-zëçäöü\u00e9]+)?)/i,
            /(?:my name is|i am|i'm|name:|emri:)\s+([A-ZËÇÄÖÜ][a-zëçäöü\u00e9]+(?:\s+[A-ZËÇÄÖÜ][a-zëçäöü\u00e9]+)?)/i,
            // More flexible patterns for names
            /\b([A-Z][a-zëçäöü\u00e9]{2,})\s+([A-Z][a-zëçäöü\u00e9]{2,})\b/g,
            // Single name in context
            /\b([A-Z][a-zëçäöü\u00e9]{2,15})\b/g
        ];
        
        // Check all user messages for name patterns
        for (const pattern of namePatterns) {
            // Ensure we have global flag for matchAll but don't duplicate flags
            const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g';
            const globalPattern = new RegExp(pattern.source, flags);
            
            const matches = [...allUserMessages.matchAll(globalPattern)];
            for (const match of matches) {
                if (match[1]) {
                    let name = match[1].trim();
                    if (match[2]) name += ' ' + match[2].trim(); // If there's a second name group
                    
                    // Enhanced exclusion words to avoid false positives
                    const excludeWords = ['Standard', 'Deluxe', 'Premium', 'Suite', 'Vila', 'Falo', 'Mountain', 'Room', 'Family', 'Panorama', 'Hotel', 'Resort', 'Check', 'Book', 'Want', 'Email', 'Phone'];
                    const isValidName = !excludeWords.some(word => name.toLowerCase().includes(word.toLowerCase())) && 
                                       name.length > 2 && 
                                       name.length < 50 &&
                                       /^[A-Za-zëçäöü\u00e9\s]+$/.test(name);
                    
                    if (isValidName) {
                        info.name = name;
                        console.log('✅ Name extracted:', name, 'from pattern:', pattern.source);
                        break;
                    }
                }
            }
            if (info.name) break; // Stop once we find a valid name
        }
        
        // Extract email
        const emailPattern = /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/;
        const emailMatch = allUserMessages.match(emailPattern);
        if (emailMatch && emailMatch[1]) {
            info.email = emailMatch[1].toLowerCase();
            console.log('✅ Email extracted:', info.email);
        }
        
        // Extract phone number - REQUIRED for booking
        const phonePatterns = [
            // Context-aware patterns (phone mentioned explicitly)
            /(?:my phone|phone|telefon|nr|numri|number)\s*(?:is|eshte|është|:)?\s*([+]?\d[\d\s-]{7,20})/gi,
            // Albanian format with flexible spacing
            /(\+355[\s-]?\d{2,3}[\s-]?\d{3}[\s-]?\d{4})/g,
            // International format with flexible spacing  
            /(\+\d{1,4}[\s-]?\d{2,3}[\s-]?\d{3}[\s-]?\d{3,4})/g,
            // Albanian mobile patterns
            /(069[\s-]?\d{3}[\s-]?\d{4}|068[\s-]?\d{3}[\s-]?\d{4}|067[\s-]?\d{3}[\s-]?\d{4})/g,
            // Standalone phone numbers (be careful not to match other numbers)
            /\b(\d{8,15})\b/g
        ];
        
        for (const pattern of phonePatterns) {
            // Ensure we have global flag for matchAll but don't duplicate flags
            const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g';
            const globalPattern = new RegExp(pattern.source, flags);
            
            const matches = [...allUserMessages.matchAll(globalPattern)];
            for (const match of matches) {
                if (match[1]) {
                    // Clean the phone number by removing spaces and dashes
                    const phone = match[1].replace(/[\s-]/g, '');
                    // Validate it looks like a real phone number
                    if (phone.length >= 8 && phone.length <= 15 && /^[+]?\d+$/.test(phone)) {
                        info.phone = phone;
                        console.log('✅ Phone extracted:', phone, 'from:', match[1]);
                        break;
                    }
                }
            }
            if (info.phone) break;
        }
        
        // Extract room type
        const roomKeywords = {
            'Standard': ['standard', 'normale', 'bazik'],
            'Deluxe': ['deluxe', 'familjare', 'family', 'luksoz'],
            'Suite': ['suite', 'premium', 'panorama', 'panoramike']
        };
        
        for (const [roomType, keywords] of Object.entries(roomKeywords)) {
            if (keywords.some(keyword => lowerContext.includes(keyword))) {
                info.roomType = roomType;
                console.log('✅ Room type extracted:', roomType);
                break;
            }
        }
        
        // Extract dates - improved with exact day extraction
        const datePatterns = [
            // DD/MM/YYYY
            /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/g,
            // DD MM YYYY  
            /(\d{1,2})\s+(\d{1,2})\s+(\d{4})/g
        ];
        
        const extractedDates = [];
        for (const pattern of datePatterns) {
            let match;
            const patternCopy = new RegExp(pattern.source, pattern.flags);
            while ((match = patternCopy.exec(allUserMessages)) !== null) {
                if (match[3]) {
                    const day = parseInt(match[1]);
                    const month = parseInt(match[2]) - 1; // JS months are 0-indexed
                    const year = parseInt(match[3]);
                    
                    if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 2024) {
                        const date = new Date(year, month, day);
                        extractedDates.push(date);
                        console.log('✅ Date extracted:', `${day}/${month + 1}/${year}`);
                    }
                }
            }
        }

        // Sort dates and assign check-in/check-out
        if (extractedDates.length >= 2) {
            extractedDates.sort((a, b) => a - b);
            info.checkIn = extractedDates[0].toISOString().split('T')[0];
            info.checkOut = extractedDates[1].toISOString().split('T')[0];
            console.log('✅ Dates assigned:', info.checkIn, 'to', info.checkOut);
        } else if (extractedDates.length === 1) {
            info.checkIn = extractedDates[0].toISOString().split('T')[0];
            // Default to 2 nights if only one date provided
            const checkOut = new Date(extractedDates[0]);
            checkOut.setDate(checkOut.getDate() + 2);
            info.checkOut = checkOut.toISOString().split('T')[0];
            console.log('✅ Single date with 2-night default:', info.checkIn, 'to', info.checkOut);
        }
        
        // Extract number of guests
        const guestPatterns = [
            /(\d+)\s*(?:person|persona|mysafir|guest|people|vetë|adult|të rritur|njerëz)/i,
            /për\s*(\d+)/i,
            /for\s*(\d+)/i,
            // Just a number when talking about guests
            /\b(\d+)\s*(?=people|persona|mysafir|vetë)/i
        ];
        
        for (const pattern of guestPatterns) {
            const match = allUserMessages.match(pattern);
            if (match && match[1]) {
                const guests = parseInt(match[1]);
                if (guests >= 1 && guests <= 10) {
                    info.guests = guests;
                    console.log('✅ Guests extracted:', guests);
                    break;
                }
            }
        }
        
        // Determine what's missing - phone IS REQUIRED for booking completion
        const required = ['name', 'email', 'phone', 'roomType', 'checkIn', 'checkOut', 'guests'];
        const missing = required.filter(field => !info[field]);
        
        console.log('📋 Final extracted info:', info);
        console.log('❌ Missing required fields:', missing);
        
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
                roomsBooked: 1, // ALWAYS 1 room per booking
                checkInDate: bookingInfo.checkIn,
                checkOutDate: bookingInfo.checkOut,
                numberOfGuests: bookingInfo.guests,
                specialRequests: bookingInfo.specialRequests || '',
                status: 'confirmed',
                source: 'Chatbot'
            };
            
            console.log('📋 Final booking data:', bookingData);
            
            // Validate dates - ONLY allow future dates (not today)
            const checkIn = new Date(bookingData.checkInDate);
            const checkOut = new Date(bookingData.checkOutDate);
            const today = new Date();
            today.setHours(23, 59, 59, 999); // End of today
            
            console.log('📅 Date validation (strict future only):');
            console.log('   End of today:', today.toISOString().split('T')[0]);
            console.log('   Check-in:', checkIn.toISOString().split('T')[0]);
            console.log('   Check-out:', checkOut.toISOString().split('T')[0]);
            
            // Only allow bookings starting tomorrow or later
            if (checkIn <= today) {
                console.log('❌ Check-in date must be in the future (tomorrow or later)');
                throw new Error('Check-in date must be in the future. Please select a date from tomorrow onwards.');
            }
            
            if (checkOut <= checkIn) {
                throw new Error('Check-out date must be after check-in date');
            }
            
            // Check for duplicate bookings (same email, dates, room type)
            console.log('🔍 Checking for duplicate bookings...');
            const existingBooking = await Booking.findOne({
                email: bookingData.email,
                roomType: bookingData.roomType,
                checkInDate: bookingData.checkInDate,
                checkOutDate: bookingData.checkOutDate,
                status: { $ne: 'cancelled' }
            });
            
            if (existingBooking) {
                console.log('⚠️ Duplicate booking detected:', existingBooking._id);
                throw new Error('A booking with the same details already exists');
            }
            
            console.log('✅ No duplicate booking found');
            
            // Check actual room availability
            console.log('🔍 Checking room availability before creating booking...');
            const availability = await this.checkRoomAvailability(
                bookingData.checkInDate,
                bookingData.checkOutDate,
                bookingData.roomType
            );
            
            console.log('📊 Availability result:', availability);
            
            if (!availability.available) {
                const roomInfo = availability.rooms?.find(r => r.roomType === bookingData.roomType);
                const availableRooms = roomInfo ? roomInfo.availableRooms : 0;
                throw new Error(`No ${bookingData.roomType} rooms available for the selected dates. Available: ${availableRooms}`);
            }
            
            // Create and save booking
            console.log('💾 Saving booking to database...');
            const booking = new Booking(bookingData);
            await booking.save();
            
            console.log('✅ Booking saved successfully:', booking._id);
            
            // Send emails
            let emailResults = { confirmation: false, admin: false };
            try {
                console.log('📧 Attempting to send confirmation emails...');
                emailResults.confirmation = await emailService.sendBookingConfirmation(booking);
                emailResults.admin = await emailService.sendAdminNotification(booking);
                
                console.log('📧 Email results:', emailResults);
                if (emailResults.confirmation) {
                    console.log('✅ Booking confirmation email sent successfully');
                } else {
                    console.log('⚠️ Booking confirmation email not sent (but booking was created)');
                }
            } catch (emailError) {
                console.error('❌ Email sending error (non-blocking):', emailError.message);
                emailResults.error = emailError.message;
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
    
    // Fixed room availability check
    async checkRoomAvailability(checkInDate, checkOutDate, roomType = null) {
        try {
            console.log('🔍=== ROOM AVAILABILITY CHECK ===');
            console.log('Check-in:', checkInDate);
            console.log('Check-out:', checkOutDate);
            console.log('Room type requested:', roomType);
            
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
            console.log('Types to check:', typesToCheck);

            for (const type of typesToCheck) {
                const roomConfig = roomTypes[type];
                if (!roomConfig) {
                    console.log('⚠️ Unknown room type:', type);
                    continue;
                }

                console.log(`\n🔍 Checking ${type} rooms:`);
                console.log('Total available:', roomConfig.total);
                
                // Find ALL conflicting bookings for this room type and date range
                // Use flexible matching for room types
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
                
                console.log('Found conflicting bookings:', conflictingBookings.length);
                
                // Calculate total rooms booked (sum of roomsBooked field)
                let totalRoomsBooked = 0;
                conflictingBookings.forEach(booking => {
                    const roomsBooked = booking.roomsBooked || 1; // Default to 1 if not set
                    totalRoomsBooked += roomsBooked;
                    console.log(`  - Booking ${booking._id}: ${roomsBooked} room(s), Guest: ${booking.guestName}, Email: ${booking.email}`);
                });
                
                console.log('Total rooms booked for', type + ':', totalRoomsBooked);
                const availableRooms = roomConfig.total - totalRoomsBooked;
                console.log('Available', type, 'rooms:', availableRooms);
                
                availabilityInfo.push({
                    roomType: type,
                    roomName: roomConfig.name,
                    totalRooms: roomConfig.total,
                    bookedRooms: totalRoomsBooked,
                    availableRooms: Math.max(0, availableRooms),
                    available: availableRooms > 0,
                    conflictingBookings: conflictingBookings.map(b => ({
                        id: b._id.toString().slice(-8),
                        guest: b.guestName,
                        email: b.email,
                        checkIn: b.checkInDate,
                        checkOut: b.checkOutDate,
                        roomsBooked: b.roomsBooked || 1
                    }))
                });
            }
            
            const result = {
                available: availabilityInfo.some(room => room.available),
                checkInDate: checkInDate,
                checkOutDate: checkOutDate,
                nights: Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)),
                rooms: availabilityInfo
            };
            
            console.log('📋 Final availability result:', {
                available: result.available,
                requestedType: roomType,
                roomSummary: availabilityInfo.map(r => `${r.roomType}: ${r.availableRooms}/${r.totalRooms} available`)
            });
            console.log('=== END AVAILABILITY CHECK ===\n');
            
            return result;

        } catch (error) {
            console.error('❌ Error checking availability:', error);
            return {
                available: false,
                error: 'Error checking room availability.'
            };
        }
    }
}

module.exports = ChatbotService;
