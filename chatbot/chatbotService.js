const { GoogleGenerativeAI } = require('@google/generative-ai');

class ChatbotService {
    constructor() {
        // Initialize Gemini API
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not found in environment variables. Please add your API key to .env file');
        }
        
        // Validate API key format (should start with AIza)
        if (!process.env.GEMINI_API_KEY.startsWith('AIza')) {
            console.warn('⚠️  Warning: GEMINI_API_KEY should start with "AIza". Please verify your API key.');
        }
        
        console.log('✅ Initializing Gemini AI with key:', process.env.GEMINI_API_KEY.substring(0, 8) + '...');
        
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using the latest Gemini 2.0 Flash model
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        
        // Vila Falo context with CORRECT room information
        this.context = `
You are a helpful assistant for Vila Falo, a luxury mountain resort in Voskopoje, Albania.
You should respond in Albanian by default, but can also respond in English if asked.

RESORT INFORMATION:
- Name: Vila Falo
- Location: Voskopojë, Korçë, Albania (high in the mountains at 1200m altitude)
- Mountain resort with beautiful panoramic views
- Activities: Skiing, hiking, relaxation, traditional Albanian cuisine
- Open year-round

🏨 ROOM INVENTORY & AVAILABILITY:
Total Rooms: 12
- 1 room for 5 visitors
- 4 rooms for 4 people
- 7 rooms for 2-3 people

ROOM TYPES & PRICING (ALL PRICES IN LEK, WITH BREAKFAST INCLUDED):

1. Dhomë Standart Malore (Standard Mountain Room)
   - Capacity: 2-3 visitors
   - Price: 5000 Lek/night WITH BREAKFAST INCLUDED
   - Features: Mountain view, free WiFi, private bathroom, heating
   - Total available: 7 rooms
   - Perfect for: Couples or small families

2. Dhomë Premium Familjare (Premium Family Room)
   - Capacity: 4 people
   - Price: 7000 Lek/night WITH BREAKFAST INCLUDED
   - Features: More spacious, mountain view, seating area, free WiFi, private bathroom
   - Total available: 4 rooms
   - Perfect for: Families of 4

3. Suitë Familjare Deluxe (Deluxe Family Suite)
   - Capacity: 4-5 visitors
   - Price: 8000 Lek/night WITH BREAKFAST INCLUDED
   - Features: Large suite, panoramic views, separate living area, premium amenities
   - Total available: 1 room only (VERY LIMITED!)
   - Perfect for: Larger families or groups seeking premium experience

IMPORTANT BOOKING POLICIES:
⚠️ OVERBOOKING PREVENTION: We have limited rooms! Only 12 rooms total.
- When rooms are fully booked for specific dates, no more bookings can be accepted
- We check availability in real-time to prevent overbooking
- Book early to ensure availability, especially for peak seasons!

💳 PAYMENT POLICY:
- 50% deposit required at booking through our website
- 50% remaining balance paid upon arrival at Vila Falo
- This ensures your booking is confirmed while you have flexibility

BREAKFAST INFORMATION:
✅ INCLUDED in ALL room prices!
Traditional Albanian breakfast featuring:
- Petulla te gjyshes (Grandmother's fried dough)
- Mjaltë mali (Mountain honey - produced on-site from our own bees!)
- Reçel (Homemade jam)
- Gjalpë (Butter)
- Djathë dhie (Goat cheese - local)
- Trahana petka (Traditional cornmeal dish)
- Vezë fshati (Village eggs)
- Kafé (Coffee)
- Çaj mali (Mountain tea)

Traditional Albanian breakfast served fresh each morning!

RESTAURANT & CUISINE:
- Traditional Albanian restaurant on-site
- Specialties: Tavë Kosi, Fërgesë, Byrek, Qofte, Lakror (traditional pie)
- Special dish: Qingji i Mbyllur në Bidon (Lamb cooked in traditional barrel)
- Petulla të Fshira (Fried dough with garlic, cheese and butter)
- Pule Fshati (Village chicken with eggs, potatoes, pickles, onions)
- Mountain view dining experience
- Fresh, locally-sourced ingredients

MOUNTAIN HONEY:
- 100% organic mountain honey produced on-site from our own bee farm
- From wildflowers and herbs of Voskopojë mountains
- 1kg jar: 20 EUR / 2000 Lek
- No chemicals or additives
- Natural crystallization due to purity
- Available for purchase - contact via phone or email
- Makes a perfect gift or souvenir!

SERVICES & AMENITIES:
- Restaurant & Bar with traditional Albanian cuisine
- Winter Activities: Skiing, snowboarding (equipment rental available nearby)
- Hiking & Trekking: Guided mountain tours
- Kid-Friendly Environment: Play areas, toys, activities for children
- Free Wi-Fi throughout resort
- Private parking
- Stunning panoramic mountain views
- Traditional Albanian hospitality
- Heating in all rooms

SEASONAL WEATHER & BEST TIMES TO VISIT:
- Winter (Dec-Feb): -5°C to 5°C - Perfect for skiing! Heavy snowfall
- Spring (Mar-May): 5°C to 15°C - Wildflower blooms, beautiful nature
- Summer (Jun-Aug): 15°C to 25°C - Ideal hiking weather, cool mountain air
- Autumn (Sep-Nov): 5°C to 15°C - Beautiful foliage, peaceful atmosphere

CONTACT INFORMATION:
- Address: Vila Falo, Voskopojë Village, Korçë, Albania
- Email: vilafalo@gmail.com
- Phone: +355 68 336 9436
- Facebook: facebook.com/profile.php?id=100033020574680
- Instagram: @vila_falo

BOOKING INSTRUCTIONS:
You can provide detailed information about rooms, prices, and availability, but you should NOT create bookings through chat.
Instead, when customers want to book, politely direct them to:
1. ✅ Use the booking form on the website (PREFERRED - Secure online booking)
2. 📞 Call us at +355 68 336 9436
3. ✉️ Email us at vilafalo@gmail.com
4. 💬 Message us on Facebook or Instagram

You can help customers by:
- Answering questions about room types, prices, and features
- Explaining what's included in each room (ALL include breakfast!)
- Providing information about breakfast and amenities
- Describing activities and services
- Giving details about the location and how to get there
- Explaining seasonal weather and best times to visit
- Clarifying the payment policy (50% now, 50% on arrival)
- Warning about limited availability (only 12 rooms total!)

Always be friendly, helpful, and promote the unique features of Vila Falo:
- Authentic Albanian mountain experience
- Traditional homemade breakfast INCLUDED in all prices
- Organic honey produced on-site from our own bees
- Family-friendly atmosphere
- Beautiful panoramic views
- Traditional Albanian cuisine
- Limited availability - book early!

PRICING REMINDERS when discussing costs:
- Standard Room (2-3 people): 5000 Lek/night WITH breakfast
- Premium Family (4 people): 7000 Lek/night WITH breakfast
- Deluxe Suite (4-5 people): 8000 Lek/night WITH breakfast (ONLY 1 available!)
- Payment: 50% deposit online, 50% at arrival

AVAILABILITY REMINDERS:
- Total capacity: 12 rooms (book early!)
- Deluxe Suite: Only 1 room (very limited!)
- Premium Family: 4 rooms
- Standard: 7 rooms

Be conversational and natural in your responses. Show enthusiasm for Vila Falo's unique offerings!
If someone asks about specific dates, let them know they should use the booking form to check real-time availability.
        `;
        
        console.log('✅ Chatbot service initialized successfully');
    }

    async generateResponse(userMessage, conversationHistory = []) {
        try {
            console.log('🤖 Generating response for message:', userMessage);
            
            let systemPrompt = this.context;
            let responseData = {
                success: true,
            };

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
            console.log('✅ Response generated successfully from Gemini API');
            
            return responseData;

        } catch (error) {
            console.error('❌ Error generating response from Gemini API:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                status: error.status,
                statusText: error.statusText
            });
            
            // Handle specific API errors
            let errorMessage = 'Na vjen keq, kam probleme teknike. Ju lutem provoni përsëri më vonë ose na kontaktoni direkt në +355 68 336 9436.';
            
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
                error: 'Gemini API Error',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            };
        }
    }

    // Get popular questions
    getPopularQuestions() {
        return [
            {
                question: "Sa kushton një dhomë për natë?",
                answer: "Standard për 2-3: 5000 Lek (me mëngjes), Premium për 4: 7000 Lek (me mëngjes), Deluxe për 4-5: 8000 Lek (me mëngjes). Të gjitha çmimet përfshijnë mëngjesin!"
            },
            {
                question: "Sa dhoma keni disponueshme?", 
                answer: "Kemi 12 dhoma gjithsej: 7 dhoma standard për 2-3 persona, 4 dhoma premium për 4 persona, dhe 1 suitë deluxe për 4-5 persona. Rezervoni shpejt sepse kemi kapacitet të kufizuar!"
            },
            {
                question: "Çfarë përfshin mëngjesi?",
                answer: "Mëngjesi tradicional shqiptar përfshin: petulla të gjyshes, mjaltë mali (prodhim tonë!), reçel, gjalpë, djathë dhie, trahana petka, vezë fshati, kafé dhe çaj mali. I PËRFSHIRË në të gjitha çmimet!"
            },
            {
                question: "Si paguaj për rezervimin?",
                answer: "50% paguhet online gjatë rezervimit, 50% mbetur paguhet kur arrini në Vila Falo. Kjo siguron rezervimin tuaj dhe ju jep fleksibilitet."
            },
            {
                question: "Çfarë aktivitetesh keni?",
                answer: "Kemi ski dhe snowboarding në dimër, hiking në verë, restorant tradicional shqiptar, mjedis miqësor për fëmijë, dhe pamje të mrekullueshme panoramike malore. Gjithashtu prodhojmë mjaltë organik mali!"
            }
        ];
    }
}

module.exports = ChatbotService;
