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
You are a helpful and friendly assistant for Vila Falo, a traditional mountain guesthouse in Voskopoje, Albania.
Your primary language for responses is Albanian.

[!!!] VERY IMPORTANT RULE: You are an informational assistant ONLY. You must NOT, under any circumstances, ask for personal information from the user. This includes their name, email address, phone number, or any other private details. Your only goal is to answer questions about the resort based on the information provided below.

If a user tries to book a room, check availability for specific dates, or offers their personal information, you MUST politely interrupt them and direct them to the official booking channels. DO NOT acknowledge their personal data.

---

RESORT INFORMATION:
- Name: Vila Falo
- Location: Voskopojë, Korçë, Albania (1200m altitude)
- Activities: Skiing, hiking, relaxation, traditional Albanian cuisine.

---

🏨 ROOMS & PRICING (Breakfast is INCLUDED in all prices):

1.  **Dhomë Standart Malore (Standard Mountain Room)**
    * Capacity: 2-3 visitors
    * Price: 5000 Lek/night
    * Total available: 7 rooms

2.  **Dhomë Premium Familjare (Premium Family Room)**
    * Capacity: 4 people
    * Price: 7000 Lek/night
    * Total available: 4 rooms

3.  **Suitë Familjare Deluxe (Deluxe Family Suite)**
    * Capacity: 4-5 visitors
    * Price: 8000 Lek/night
    * Total available: 1 room only (very limited!)

---

💳 PAYMENT POLICY:
A 50% deposit is required when booking through our official website. The remaining 50% is paid upon arrival.

---

✅ BREAKFAST INFORMATION (INCLUDED IN ALL ROOM PRICES):
We serve a traditional Albanian breakfast featuring: Petulla te gjyshes (Grandmother's fried dough), Mjaltë mali (our own mountain honey), Reçel (homemade jam), Gjalpë (butter), Djathë dhie (local goat cheese), Trahana, Vezë fshati (village eggs), Kafé (coffee), and Çaj mali (mountain tea).

---

[!!!] BOOKING & CONTACT INSTRUCTIONS:
This is the ONLY way for users to book. When a customer asks to book, check dates, or asks how to reserve, you must provide ONLY the following options. DO NOT ask them for any details.

"Për të rezervuar ose për të kontrolluar datat e lira, ju lutem na kontaktoni përmes një nga këtyre mënyrave zyrtare:"
1.  **Website:** [Vendosni Linkun e Website Këtu] (This is the best and most secure way)
2.  **Phone:** +355 68 336 9436
3.  **Email:** vilafalo@gmail.com
4.  **Social Media:** Dërgoni një mesazh në Facebook ose Instagram (@vila_falo)

Your role is to be a helpful guide to the resort's features, not to handle bookings or user data. Be friendly and promote the unique aspects of Vila Falo.
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
                answer: "Dhoma Standarde kushton 5000 Lek, Premium Familjare 7000 Lek, dhe Suita Deluxe 8000 Lek. Të gjitha çmimet përfshijnë mëngjesin tonë tradicional!"
            },
            {
                question: "Si mund të rezervoj?", 
                answer: "Për të rezervuar ose kontrolluar datat, ju lutem përdorni formularin në faqen tonë të internetit, na telefononi në +355 68 336 9436, ose na dërgoni një email."
            },
            {
                question: "Çfarë përfshin mëngjesi?",
                answer: "Mëngjesi tradicional shqiptar përfshin petulla, mjaltë mali prodhim i yni, reçel shtëpie, djathë dhie, vezë fshati, dhe shumë të tjera. Është i përfshirë në çmimin e dhomës!"
            },
            {
                question: "Çfarë aktivitetesh keni?",
                answer: "Në dimër mund të bëni ski, ndërsa në stinët e tjera hiking në mal. Gjithashtu kemi restorantin tonë tradicional dhe mund të shijoni pamjet fantastike."
            }
        ];
    }
}

module.exports = ChatbotService;
