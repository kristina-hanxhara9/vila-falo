# Vila Falo - Quick Start Guide

## 🚀 How to Start the Application

### Prerequisites
- Node.js installed on your computer
- MongoDB Atlas account (free tier)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```

Edit the `.env` file with your actual values:
- Replace `MONGODB_URI` with your MongoDB connection string
- Generate a JWT secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- Set your admin credentials

### 3. Start the Application

**Development Mode (with auto-restart):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

### 4. Access the Application
- **Client Website**: http://localhost:5000
- **Admin Panel**: http://localhost:5000/admin
- **Admin Login**: http://localhost:5000/admin/login

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

## 🌐 Deploying to Heroku

### One-Time Setup

1. **Install Heroku CLI**
   ```bash
   # macOS with Homebrew
   brew tap heroku/brew && brew install heroku
   
   # Windows - Download from: https://devcenter.heroku.com/articles/heroku-cli
   
   # Ubuntu
   sudo snap install --classic heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create vila-falo-[your-name]
   # Replace [your-name] with something unique
   ```

4. **Set Environment Variables**
   ```bash
   # MongoDB connection string
   heroku config:set MONGODB_URI="your-mongodb-connection-string"
   
   # JWT Secret (generate with the command above)
   heroku config:set JWT_SECRET="your-64-character-jwt-secret"
   
   # Environment
   heroku config:set NODE_ENV="production"
   
   # Admin credentials
   heroku config:set ADMIN_USERNAME="your-admin-username"
   heroku config:set ADMIN_PASSWORD="your-secure-password"
   ```

### Deploy to Heroku

1. **Add and Commit Changes**
   ```bash
   git add .
   git commit -m "Initial deployment"
   ```

2. **Deploy**
   ```bash
   git push heroku main
   ```

3. **Open Your App**
   ```bash
   heroku open
   ```

### Update Existing Deployment

```bash
# Make your changes, then:
git add .
git commit -m "Update: description of changes"
git push heroku main
```

## 🔧 Useful Heroku Commands

```bash
# View logs
heroku logs --tail

# Check app status
heroku ps

# View config variables
heroku config

# Restart the app
heroku restart

# Open app in browser
heroku open

# Run commands on Heroku
heroku run bash
```

## 📱 Features

### Client Features
- **Responsive Design**: Works on mobile, tablet, desktop
- **Booking Calendar**: Interactive date selection
- **Room Selection**: Standard, Deluxe, Suite options
- **Multi-language**: Albanian and English support
- **Photo Gallery**: Beautiful resort images
- **Contact Forms**: Booking and newsletter signup

### Admin Features
- **Mobile-First Admin Panel**: Touch-friendly interface
- **Real-time Calendar**: Visual room availability
- **Booking Management**: Create, edit, delete bookings
- **Statistics Dashboard**: Occupancy rates and analytics
- **Responsive Design**: Works on all devices
- **Secure Authentication**: JWT-based admin login

## 🛠️ Troubleshooting

### Common Issues

1. **App won't start locally**
   ```bash
   # Check if MongoDB URI is set correctly
   echo $MONGODB_URI  # or check .env file
   
   # Try running with debug info
   DEBUG=* npm start
   ```

2. **Can't connect to MongoDB**
   - Verify your MongoDB Atlas connection string
   - Check that your IP is whitelisted in MongoDB Atlas
   - Ensure the database user has proper permissions

3. **Admin login not working**
   - Check that ADMIN_USERNAME and ADMIN_PASSWORD are set
   - Try resetting: `heroku config:set ADMIN_PASSWORD="newpassword"`

4. **Heroku deployment fails**
   ```bash
   # Check build logs
   heroku logs --tail
   
   # Ensure all dependencies are in package.json, not devDependencies
   # Verify Node.js version compatibility
   ```

## 📞 Need Help?

If you encounter any issues:
1. Check the console/terminal for error messages
2. Review the troubleshooting section above
3. Check Heroku logs: `heroku logs --tail`
4. Verify all environment variables are set correctly

## 🎉 Success!

Once deployed, your Vila Falo booking system will be live and ready to accept bookings!

**Remember to:**
- Test both client and admin functionality
- Update your domain/CORS settings if needed
- Set up regular database backups
- Monitor your application logs

Enjoy your new booking system! 🏔️✨
