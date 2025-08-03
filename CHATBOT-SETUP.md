# Vila Falo Chatbot Integration Guide

## 🤖 Overview

The Vila Falo chatbot is an intelligent assistant that helps visitors with:

- **Room availability checking** in real-time
- **Pricing information** for all room types  
- **Booking assistance** and guidance
- **Resort information** (activities, location, services)
- **Albanian language support** (primary) with English fallback

## 🚀 Features

### Core Functionality
- ✅ **Real-time booking availability** - Connects to your booking database
- ✅ **Smart date extraction** - Understands natural language dates
- ✅ **Albanian & English support** - Bilingual conversations
- ✅ **Google Gemini AI integration** - Advanced natural language processing
- ✅ **Mobile responsive design** - Works on all devices
- ✅ **Session management** - Maintains conversation context

### Technical Features
- ✅ **Database integration** - Uses existing Vila Falo booking system
- ✅ **Error handling & fallbacks** - Graceful failure handling
- ✅ **Memory management** - Automatic session cleanup
- ✅ **Admin statistics** - Usage monitoring
- ✅ **Accessibility support** - Screen reader friendly

## 📦 Installation

### 1. Install Dependencies

The chatbot has been integrated into your existing project. Install the new dependency:

```bash
npm install @google/generative-ai
```

### 2. Set up Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file:

```env
GEMINI_API_KEY=your-actual-api-key-here
```

### 3. Restart Your Server

```bash
npm run dev
```

## 🎯 Usage

### Automatic Integration
The chatbot automatically appears on:
- ✅ Main website (`index.html`) 
- ✅ Admin panel (`admin-panel.html`)
- ✅ All other pages (if you add the scripts)

### Manual Integration
To add the chatbot to other pages:

```html
<!-- Add before closing </body> tag -->
<link rel=\"stylesheet\" href=\"/css/chatbot.css\">
<script src=\"/js/chatbot.js\"></script>
```

### JavaScript API
```javascript
// Access the chatbot instance
const chatbot = window.vilaFaloChatbot;

// Open/close programmatically
chatbot.show();
chatbot.hide();

// Send custom message
chatbot.sendCustomMessage(\"Sa kushton një dhomë?\");

// Clear conversation
chatbot.clearConversation();
```

## 🔧 Configuration

### Chatbot Options
```javascript
// Custom configuration (optional)
const chatbot = new VilaFaloChatbot({
    apiEndpoint: '/api/chatbot',
    language: 'sq', // 'sq' for Albanian, 'en' for English
    autoOpen: false, // Auto-open on page load
    showNotification: true, // Show notification badge
    welcomeMessage: true // Show welcome message
});
```

## 🗣️ Albanian Language Examples

The chatbot understands Albanian naturally:

```
User: \"Sa kushton një dhomë për natë?\"
Bot: \"Çmimet për dhoma fillojne nga €70/natë për Dhomë Standard...\"

User: \"A keni dhoma të lira për 15 mars?\"
Bot: \"Le të kontrolloj disponueshmërinë për 15 mars...\"

User: \"Çfarë aktivitetesh keni në dimër?\"
Bot: \"Në dimër ofrojmë ski, snowboard, hiking...\"
```

## 💾 Database Integration

### How It Works
- **Same database** - Uses your existing `Booking` model
- **Real-time checks** - Queries actual availability
- **Room types** - Supports Standard, Deluxe, Suite
- **Date validation** - Prevents past dates and invalid ranges

### Room Configuration
```javascript
// In chatbotService.js
const roomTypes = {
    'Standard': { name: 'Standard Mountain Room', total: 5 },
    'Deluxe': { name: 'Deluxe Family Suite', total: 4 }, 
    'Suite': { name: 'Premium Panorama Suite', total: 3 }
};
```

## 📊 API Endpoints

### Chat Messages
```
POST /api/chatbot/message
Body: { message: "Pyetja ime", sessionId: "optional" }
```

### Check Availability  
```
GET /api/chatbot/availability?checkIn=2024-03-15&checkOut=2024-03-16&roomType=Standard
```

### Popular Questions
```
GET /api/chatbot/popular-questions
```

### Admin Statistics
```
GET /api/chatbot/stats
```

## 🎨 Customization

### Styling
Edit `/public/css/chatbot.css` to match your brand:

```css
:root {
    --chatbot-primary: #2a6d4e; /* Your brand color */
    --chatbot-secondary: #d9a566;
}
```

### Messages
Edit the context in `/chatbot/chatbotService.js`:

```javascript
this.context = `
    You are a helpful assistant for Vila Falo...
    [Your custom resort information]
`;
```

## 🔍 Testing

### Test Scenarios
1. **Basic Questions**: \"Ku ndodheni?\" 
2. **Pricing**: \"Sa kushton një dhomë?\"
3. **Availability**: \"A keni dhoma të lira për nesër?\"
4. **Booking**: \"Si mund të rezervoj?\"
5. **Activities**: \"Çfarë aktivitetesh keni?\"

### Date Formats Supported
- \"15/03/2024\" or \"15-03-2024\"
- \"15 mars 2024\"
- \"sot\" (today)
- \"nesër\" (tomorrow) 
- \"javën e ardhshme\" (next week)

## 🚨 Troubleshooting

### Common Issues

**Chatbot doesn't appear:**
- Check browser console for errors
- Verify CSS and JS files are loading
- Ensure server is running

**API errors:**
- Verify `GEMINI_API_KEY` in `.env`
- Check MongoDB connection
- Review server logs

**Database connection issues:**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify booking routes work

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('chatbot-debug', 'true');
```

## 📈 Admin Features

### View Statistics
Visit `/api/chatbot/stats` to see:
- Active chat sessions
- Memory usage  
- Uptime statistics

### Monitor Usage
Check server logs for:
- Chat interactions
- API errors
- Database queries

## 🔒 Security

### Data Protection
- **No persistent storage** - Conversations cleared after 1 hour
- **Input validation** - All user inputs sanitized
- **Rate limiting** - Prevents API abuse
- **Error handling** - No sensitive data in error messages

### Privacy
- **Session-based** - No user tracking
- **Temporary storage** - Conversations not permanently saved
- **GDPR compliant** - Easy to delete user data

## 🚀 Production Deployment

### Environment Variables
```env
GEMINI_API_KEY=your-production-api-key
NODE_ENV=production
```

### Performance Tips
- Monitor API usage (Gemini has usage limits)
- Consider Redis for session storage in high-traffic scenarios
- Enable response caching for common questions

## 📞 Support

### Getting Help
- Check the [Gemini API documentation](https://ai.google.dev/docs)
- Review server logs for errors
- Test API endpoints directly

### Extending Functionality
The chatbot is designed to be extensible. You can:
- Add new languages
- Integrate with booking forms
- Add payment processing
- Create custom commands

---

## ✅ Integration Complete!

Your Vila Falo chatbot is now:
1. ✅ **Connected to your booking system**
2. ✅ **Checking real availability** 
3. ✅ **Speaking Albanian fluently**
4. ✅ **Powered by Google Gemini AI**
5. ✅ **Mobile-friendly and accessible**

The chatbot will help reduce booking inquiries and provide 24/7 customer support for your guests! 🏔️

**Next Steps:**
1. Add your Gemini API key to `.env`
2. Run `npm install` to install dependencies
3. Start your server with `npm run dev`
4. Test the chatbot on your site
5. Customize the styling and messages as needed

Happy hosting! 🎿❄️
