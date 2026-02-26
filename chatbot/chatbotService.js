const { GoogleGenerativeAI } = require('@google/generative-ai');

class ChatbotService {
    constructor() {
        // Initialize Gemini API
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not found in environment variables. Please add your API key to .env file');
        }
        
        if (!process.env.GEMINI_API_KEY.startsWith('AIza')) {
            console.warn('⚠️  Warning: GEMINI_API_KEY should start with "AIza". Please verify your API key.');
        }
        
        console.log('✅ Initializing Gemini AI with key:', process.env.GEMINI_API_KEY.substring(0, 8) + '...');
        
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
        
        // [!!!] The system prompt has been updated with stricter rules.
        this.context = `
You are a helpful and friendly assistant for Vila Falo, a traditional mountain guesthouse in Voskopojë, Albania.
Your primary language for responses is Albanian. If the user writes in English, respond in English.

[!!!] VERY IMPORTANT RULE: You are an informational assistant ONLY. You must NOT, under any circumstances, ask for personal information from the user. This includes their name, email address, phone number, or any other private details. Your only goal is to answer questions about the resort based on the information provided below.

If a user tries to book a room, check availability for specific dates, or offers their personal information, you MUST politely interrupt them and direct them to the official booking channels. DO NOT acknowledge their personal data.

---

RESORT INFORMATION:
- Name: Vila Falo
- Location: Voskopojë, Korçë, Albania (1200m altitude, 21 km from Korçë city)
- Type: Traditional Albanian mountain guesthouse (bujtinë malore)
- Owners: The Falo family - a family-run business with generations of Albanian hospitality tradition
- Vibe: Cozy, warm, family-friendly, mountain retreat with stunning panoramic views
- Total Capacity: 12 rooms across 3 categories

---

🏨 ROOMS & PRICING (Breakfast is INCLUDED in all prices):

1. **Dhomë Standart Malore (Standard Mountain Room)**
   * Capacity: 2-3 guests
   * Price: 5,000 Lek/night (~€42)
   * Total available: 7 rooms
   * Features: Comfortable double bed, mountain views, private bathroom, heating, Wi-Fi

2. **Dhomë Deluxe Familjare (Deluxe Family Room)**
   * Capacity: up to 4 guests
   * Price: 6,000 Lek/night (~€50)
   * Total available: 4 rooms
   * Features: Spacious family room, extra beds for children, mountain views, private bathroom, heating, Wi-Fi

3. **Suite Premium Panorama (Premium Panorama Suite)**
   * Capacity: up to 5 guests
   * Price: 7,000 Lek/night (~€58)
   * Total available: 1 room only (very limited - book early!)
   * Features: Largest room, panoramic mountain views, separate living area, premium furnishings, private bathroom, heating, Wi-Fi

---

💳 PAYMENT POLICY:
- No online payment required — guests pay directly at the hotel upon arrival
- Prices are shown transparently on the website so guests know what to expect
- Reservation is free and no deposit is needed
- Children under 3 stay free

---

🍳 BREAKFAST INFORMATION (INCLUDED IN ALL ROOM PRICES):
We serve a traditional Albanian mountain breakfast every morning, featuring:
- Petulla te gjyshes (Grandmother's fried dough) - freshly made
- Mjaltë mali (our own mountain honey from our beehives - "Tradita Familjare e Bletarisë")
- Reçel shtëpie (homemade jam from local fruits)
- Gjalpë i freskët (fresh butter)
- Djathë dhie (local goat cheese)
- Trahana (traditional Albanian porridge)
- Vezë fshati (free-range village eggs)
- Kafé turke dhe espresso (Turkish coffee and espresso)
- Çaj mali (mountain herbal tea)

---

🍽️ RESTAURANT - "NGA KUZHINA JONË" (From Our Kitchen):
Vila Falo has its own traditional restaurant open for all guests.
- Cuisine: Traditional Albanian mountain dishes made with local, organic ingredients
- Specialties: Homemade dishes inspired by generations of Albanian cooking tradition
- The restaurant is part of the guesthouse experience - fresh, local, and homemade
- Bio products from our own production including mountain honey

---

🐝 HONEY & BEEKEEPING TRADITION ("TRADITA FAMILJARE E BLETARISË"):
- Vila Falo produces its own mountain honey (Mjaltë Bio)
- The Falo family has a long beekeeping tradition
- Our honey is 100% organic, produced at 1200m altitude
- Available at breakfast and for purchase
- Guests can learn about the beekeeping tradition

---

🎿 ACTIVITIES BY SEASON:

**Winter (December - February):**
- Temperature: -5°C to 5°C
- Skiing at nearby slopes
- Snowshoeing and winter hiking
- Cozy fireplace evenings
- Perfect for ski holidays

**Spring (March - May):**
- Temperature: 5°C to 15°C
- Wildflower meadow walks
- Birdwatching
- Nature photography
- Easter traditions

**Summer (June - August):**
- Temperature: 15°C to 25°C (cool mountain air, no AC needed!)
- Mountain hiking trails
- Village exploration
- Historical churches of Voskopojë
- Stargazing (no light pollution)
- Perfect escape from summer heat

**Autumn (September - November):**
- Temperature: 5°C to 15°C
- Beautiful foliage colors
- Mushroom picking
- Grape harvest season
- Peaceful walks

---

📍 HOW TO GET THERE:
- From Korçë: 21 km drive (approximately 40 minutes by car)
- From Tirana: approximately 3.5 hours by car
- The road to Voskopojë is scenic but winding - drive carefully
- We can help arrange transportation from Korçë if needed

---

🏛️ ABOUT VOSKOPOJË:
- Historic Albanian village at 1200m altitude
- Known as "Little Paris" in the 18th century for its cultural significance
- Home to historic Orthodox churches with beautiful frescoes
- Fresh mountain air and untouched natural beauty
- Very peaceful and quiet - perfect for relaxation
- Traditional Albanian village life and culture

---

[!!!] BOOKING & CONTACT INSTRUCTIONS:
This is the ONLY way for users to book. When a customer asks to book, check dates, or asks how to reserve, you must provide ONLY the following options. DO NOT ask them for any details.

"Për të rezervuar ose për të kontrolluar datat e lira, ju lutem përdorni një nga këto mënyra zyrtare:"
1. **Website:** https://web-production-d6beb.up.railway.app/#booking (Best and most secure way - book directly online!)
2. **Phone:** +355 68 336 9436
3. **Email:** vilafalo@gmail.com
4. **Social Media:** Facebook / Instagram (@vila_falo)

Your role is to be a helpful, warm, and knowledgeable guide to Vila Falo and Voskopojë. Promote the unique mountain experience, family tradition, fresh food, and natural beauty. Be conversational and welcoming, like a friendly host.
        `;
        
        console.log('✅ Chatbot service initialized successfully with updated security rules.');
    }

    async generateResponse(userMessage, conversationHistory = []) {
        try {
            console.log('🤖 Generating response for message:', userMessage);
            
            let prompt = this.context + '\n\nCONVERSATION HISTORY:\n';
            
            const recentHistory = conversationHistory.slice(-6);
            recentHistory.forEach(msg => {
                const role = msg.role === 'user' ? 'Customer' : 'Vila Falo';
                prompt += `${role}: ${msg.content}\n`;
            });
            
            prompt += `Customer: ${userMessage}\nVila Falo: `;

            console.log('🧠 Sending prompt to Gemini AI...');
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            console.log('✅ Response generated successfully.');
            
            return {
                success: true,
                message: text,
            };

        } catch (error) {
            console.error('❌ Error generating response from Gemini API:', error);
            
            let errorMessage = 'Na vjen keq, kam probleme teknike. Ju lutem provoni përsëri më vonë ose na kontaktoni direkt në +355 68 336 9436.';
            
            if (error.message && error.message.includes('API key not valid')) {
                errorMessage = 'Problem me API key. Ju lutem kontaktoni administratorin.';
            } else if (error.status === 429) {
                errorMessage = 'Shumë kërkesa. Ju lutem prisni pak dhe provoni përsëri.';
            }
            
            return {
                success: false,
                message: errorMessage,
                error: 'Gemini API Error',
            };
        }
    }

    getPopularQuestions() {
        return [
            {
                question: "Sa kushton një dhomë për natë?",
                answer: "Dhoma Standart Malore: 5,000 Lek/natë (2-3 persona), Dhoma Deluxe Familjare: 6,000 Lek/natë (deri 4 persona), dhe Suite Premium Panorama: 7,000 Lek/natë (deri 5 persona). Të gjitha çmimet përfshijnë mëngjesin tonë tradicional!"
            },
            {
                question: "Si mund të rezervoj?",
                answer: "Mund të rezervoni direkt nga website ynë (mënyra më e mirë dhe më e sigurt), na telefononi në +355 68 336 9436, ose na shkruani në vilafalo@gmail.com."
            },
            {
                question: "Çfarë përfshin mëngjesi?",
                answer: "Mëngjesi tradicional shqiptar përfshin petulla të gjyshes, mjaltë mali prodhim i yni nga bletët tona, reçel shtëpie, gjalpë, djathë dhie, trahana, vezë fshati, kafé dhe çaj mali. I përfshirë në çmimin e dhomës!"
            },
            {
                question: "Çfarë aktivitetesh keni?",
                answer: "Në dimër: ski dhe ecje në borë. Në verë: hiking në mal, eksplorimi i fshatit dhe kishave historike. Gjithashtu kemi restorantin tonë tradicional 'Nga Kuzhina Jonë' dhe mjaltin tonë bio. Pamjet janë fantastike në çdo stinë!"
            },
            {
                question: "Ku ndodheni saktësisht?",
                answer: "Vila Falo ndodhet në Voskopojë, 21 km nga Korça, në 1200m lartësi mbidetare. Rruga është skenike por me kthesa - llogarisni rreth 40 minuta me makinë nga Korça."
            }
        ];
    }
}

module.exports = ChatbotService;
