# 🏔️ Vila Falo - Complete Booking System

A beautiful, responsive booking website for Vila Falo mountain resort in Voskopojë, Albania. Features a unified platform with client booking interface and intuitive mobile-first admin panel.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://your-heroku-app.herokuapp.com)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/database-MongoDB-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

## 🚀 Quick Start (3 Minutes)

```bash
# Install dependencies
npm install

# Copy the example env file and fill in your values
cp .env.example .env

# Start development server
npm run dev
```

**Access Your Application:**
- **Client Website**: http://localhost:5000
- **Admin Panel**: http://localhost:5000/admin
- **Admin Login**: Username: `admin`, Password: `admin123`

## ✨ Features Overview

### 🎯 Unified Platform
- **Single Application** serving both clients and admins
- **Responsive Design** optimized for all devices
- **Real-time Booking** system with instant updates
- **Secure Authentication** for admin access

### 👥 Client Features
- **📱 Mobile-First Design**: Perfect on phones, tablets, desktops
- **🗓️ Interactive Calendar**: Visual date selection with availability
- **🏨 Room Selection**: Standard, Deluxe, Suite options
- **🌍 Multi-language**: Albanian and English support
- **📸 Photo Gallery**: Beautiful resort images
- **📧 Contact Forms**: Booking and newsletter signup
- **❄️ Interactive Elements**: Snow effects, smooth animations

### 👨‍💼 Admin Features  
- **📱 Touch-Friendly Interface**: Optimized for mobile management
- **🗓️ Visual Calendar**: Date slider with booking indicators
- **📊 Real-time Statistics**: Room occupancy and analytics
- **✏️ Booking Management**: Create, edit, delete bookings
- **🔄 Live Updates**: Instant synchronization across views
- **🔐 Secure Access**: JWT-based authentication
- **📈 Dashboard Views**: Rooms, bookings, calendar modes

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB Atlas** account (free) - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Git** (optional) - [Download](https://git-scm.com/)

### 1. Get the Code
```bash
# If you have git
git clone [your-repo-url]
cd vila-falo

# If you downloaded ZIP
# Extract and navigate to the folder
```

### 2. Setup
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your settings
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# - ADMIN_USERNAME & ADMIN_PASSWORD: Your admin credentials

# Optional: validate your configuration
npm run validate

# Start the application
npm run dev  # Development mode
npm start    # Production mode
```

## 🌐 Deployment

This is a single Node/Express app that serves both the static site and the API from
one process, so it only needs one host. Any Node-friendly host works (Render, Railway,
Fly.io, etc.) — point it at this repo, set the environment variables from `.env.example`,
and use `npm start` as the start command.

## 📱 Admin Panel Features

The admin panel is designed for **real-world hotel management** with:

### 📅 Smart Calendar Interface
- **Date Slider**: Quick navigation through months
- **Visual Indicators**: Dots show dates with bookings
- **Touch-Friendly**: Optimized for mobile and tablet use

### 🏨 Room Management Views
- **Room Overview**: See all rooms at a glance
- **Status Indicators**: Available, Booked, Pending states
- **Quick Actions**: Tap to book or view details

### 📊 Real-Time Statistics
- **Occupancy Rates**: Live room availability percentages
- **Progress Bars**: Visual representation of bookings
- **Guest Counts**: Total active reservations

### ✏️ Booking Operations
- **Create**: Add new bookings with date validation
- **Edit**: Modify existing reservations
- **Delete**: Remove cancelled bookings
- **Status**: Update booking status (pending/confirmed/cancelled)

### 📱 Mobile-First Design
- **Touch Gestures**: Swipe through dates and rooms
- **Responsive Layout**: Adapts to any screen size
- **Fast Loading**: Optimized for mobile connections
- **Offline-Friendly**: Local data caching

## 🗄️ Database Schema

### Booking Model
```javascript
{
  guestName: String,           // Customer name
  email: String,               // Contact email  
  phone: String,               // Phone number
  checkInDate: Date,           // Arrival date
  checkOutDate: Date,          // Departure date
  roomType: String,            // Standard/Deluxe/Suite
  numberOfGuests: Number,      // Guest count
  specialRequests: String,     // Additional notes
  status: String,              // pending/confirmed/cancelled
  totalPrice: Number,          // Booking cost
  createdAt: Date             // Booking creation time
}
```

## 🔧 Configuration

### Environment Variables
```bash
# Required
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/vilafalo
JWT_SECRET=your-64-character-secret-key

# Admin Access
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# Optional
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
```

### Room Configuration
Edit room types and numbers in:
- **Client Side**: `public/js/booking.js`
- **Admin Side**: `public/admin-panel.html`

Default configuration:
- **Standard Rooms**: 1-5 (5 rooms)
- **Deluxe Rooms**: 6-9 (4 rooms)  
- **Suite Rooms**: 10-12 (3 rooms)

## 🔌 API Endpoints

### Booking Management
```bash
GET    /api/booking          # Get all bookings
POST   /api/booking          # Create booking
GET    /api/booking/:id      # Get specific booking
PUT    /api/booking/:id      # Update booking
DELETE /api/booking/:id      # Delete booking
```

### Admin Authentication
```bash
POST   /admin/login          # Admin login
GET    /admin/check          # Check auth status
GET    /admin/logout         # Logout
GET    /admin/dashboard      # Admin panel
```

### Health Monitoring
```bash
GET    /health               # Application health check
```

## 🛠️ Development

### Available Scripts
```bash
npm start          # Production mode
npm run dev        # Development with auto-restart
npm run validate   # Validate server configuration / env vars
```

### Project Structure
```
vila-falo/
├── 📄 server.js              # Main application server
├── 🔧 package.json           # Dependencies and scripts
├── ⚙️ .env.example           # Environment template
├── 📁 public/                # Client-side files
│   ├── 🏠 index.html         # Main booking website
│   ├── 👨‍💼 admin-panel.html   # Admin dashboard
│   ├── 🎨 css/               # Stylesheets
│   ├── ⚡ js/                # Client scripts
│   └── 🖼️ images/            # Static assets
├── 📁 models/                # Database schemas
│   ├── 📅 Booking.js         # Booking model
│   ├── 📧 Newsletter.js      # Newsletter model
│   └── 👤 users.js           # User model
├── 📁 routes/                # API endpoints
│   ├── 📅 bookingRoutes.js   # Booking CRUD
│   ├── 👨‍💼 adminRoutes.js    # Admin panel
│   └── 👤 users.js           # Authentication
├── 📁 controllers/           # Business logic
├── 📁 middleware/            # Custom middleware
└── 📁 config/                # Configuration
```

## 🐛 Troubleshooting

### Application Won't Start
```bash
# Check your configuration/env vars
npm run validate

# Common fixes:
# 1. Check MongoDB connection string in .env
# 2. Ensure JWT_SECRET is set (64+ characters)
# 3. Verify admin credentials are set
```

### Database Connection Issues
```bash
# Check environment variables
echo $MONGODB_URI

# Test connection
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'your-uri')
  .then(() => console.log('✅ Connected'))
  .catch(err => console.log('❌ Failed:', err.message));
"
```

### Admin Panel Access Issues
```bash
# Check admin credentials
heroku config:get ADMIN_USERNAME
heroku config:get ADMIN_PASSWORD

# Reset admin password
heroku config:set ADMIN_PASSWORD="newpassword"
```

### Performance Issues
```bash
# Check app status
heroku ps

# View performance metrics
heroku logs --tail

# Monitor database performance in MongoDB Atlas dashboard
```

## 📈 Monitoring & Analytics

### Built-in Health Checks
- **System Status**: `/health` endpoint
- **Database Connectivity**: Automatic monitoring  
- **Error Tracking**: Console and file logging

### Production Monitoring
- **Heroku Metrics**: Built-in dashboard
- **MongoDB Atlas**: Database performance monitoring
- **Custom Analytics**: Booking trends and patterns

## 🔐 Security Features

### Authentication
- **JWT Tokens**: Secure admin sessions
- **Password Hashing**: bcrypt encryption
- **Session Management**: Automatic token expiry

### Data Protection
- **Input Validation**: Mongoose schema validation
- **SQL Injection**: MongoDB native protection
- **XSS Protection**: Content-Type headers
- **CORS**: Configurable origin restrictions

## 🌍 Localization

### Supported Languages
- **Albanian** (sq): Primary language
- **English** (en): Secondary language

### Adding New Languages
1. Update language files in `public/js/`
2. Add translation functions
3. Update admin panel language strings

## 📞 Support & Community

### Getting Help
- **📖 Documentation**: Check README and guides
- **🔍 Config Check**: Run `npm run validate`
- **📋 Logs**: Check your host's application logs
- **💬 Issues**: Create GitHub issues for bugs

### Contributing
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **Albanian Tourism** for inspiration
- **MongoDB Atlas** for database hosting
- **Heroku** for application hosting
- **Open Source Community** for amazing tools

---

## 🎉 You're Ready!

Your Vila Falo booking system is now ready to handle real bookings!

**Next Steps:**
1. **Test Everything**: Try booking from client side, managing from admin
2. **Customize Branding**: Update colors, images, text for your resort
3. **Go Live**: Deploy to Heroku and share your booking URL
4. **Monitor**: Keep an eye on bookings and system performance

**Your Live URLs:**
- **Customer Bookings**: `https://your-app.herokuapp.com`
- **Admin Management**: `https://your-app.herokuapp.com/admin`

**🏔️ Vila Falo - Your Mountain Adventure Awaits! ⛷️**

Made with ❤️ in Albania 🇦🇱
