# 🚀 Heroku Deployment Guide - Vila Falo

This guide will help you deploy your Vila Falo booking system to Heroku in minutes.

## Prerequisites

1. **Heroku Account**: [Sign up for free](https://signup.heroku.com/)
2. **MongoDB Atlas**: [Free cluster setup](https://www.mongodb.com/cloud/atlas)
3. **Git installed** on your computer
4. **Heroku CLI** installed

## Step 1: Install Heroku CLI

### macOS (with Homebrew)
```bash
brew tap heroku/brew && brew install heroku
```

### Windows
Download and install from: https://devcenter.heroku.com/articles/heroku-cli

### Ubuntu/Linux
```bash
sudo snap install --classic heroku
```

## Step 2: Prepare Your MongoDB Database

1. **Create MongoDB Atlas Account** (free)
   - Go to https://www.mongodb.com/cloud/atlas
   - Create a free account
   - Create a new cluster (choose free tier)

2. **Get Connection String**
   - In MongoDB Atlas, click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with your database name (e.g., `vilafalo`)

   Example: `mongodb+srv://username:password@cluster.mongodb.net/vilafalo?retryWrites=true&w=majority`

3. **Whitelist IP Addresses**
   - In MongoDB Atlas, go to Network Access
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for Heroku)

## Step 3: Deploy to Heroku

### Quick Deploy (One Command)
```bash
# Navigate to your project folder
cd vila-falo

# Run the automated deployment
npm run deploy
```

### Manual Deploy (Step by Step)

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   # Replace 'your-app-name' with something unique
   heroku create vila-falo-your-name
   ```

3. **Set Environment Variables**
   ```bash
   # MongoDB connection string (REQUIRED)
   heroku config:set MONGODB_URI="your-mongodb-connection-string-here"
   
   # JWT Secret (REQUIRED) - Generate a secure one:
   heroku config:set JWT_SECRET="$(node -e 'console.log(require("crypto").randomBytes(64).toString("hex"))')"
   
   # Environment
   heroku config:set NODE_ENV="production"
   
   # Admin credentials (change these!)
   heroku config:set ADMIN_USERNAME="admin"
   heroku config:set ADMIN_PASSWORD="your-secure-password"
   
   # Optional: CORS origin (your domain)
   heroku config:set CORS_ORIGIN="https://your-app-name.herokuapp.com"
   ```

4. **Deploy Your Code**
   ```bash
   git add .
   git commit -m "Initial deployment to Heroku"
   git push heroku main
   ```

5. **Open Your App**
   ```bash
   heroku open
   ```

## Step 4: Verify Deployment

After deployment, your app will be available at:
- **Client Website**: `https://your-app-name.herokuapp.com`
- **Admin Panel**: `https://your-app-name.herokuapp.com/admin`
- **Admin Login**: `https://your-app-name.herokuapp.com/admin/login`

### Test Your Deployment

1. **Visit the client website** - should show Vila Falo booking page
2. **Try making a booking** - should work without errors
3. **Login to admin panel** - use your admin credentials
4. **Check admin dashboard** - should show mobile-friendly interface

## Step 5: Domain Setup (Optional)

### Add Custom Domain
```bash
# Add your domain
heroku domains:add www.your-domain.com
heroku domains:add your-domain.com

# Get DNS target
heroku domains
```

### Configure DNS
In your domain registrar, add:
- **CNAME record**: `www` → `your-app-name.herokuapp.com`
- **ALIAS/ANAME record**: `@` → `your-app-name.herokuapp.com`

### Enable SSL
```bash
heroku certs:auto:enable
```

## Common Deployment Issues & Solutions

### Issue: "Application Error"
```bash
# Check logs for errors
heroku logs --tail

# Common fixes:
heroku config:set NODE_ENV=production
heroku restart
```

### Issue: Database Connection Failed
```bash
# Check if MongoDB URI is set
heroku config:get MONGODB_URI

# Make sure URI is correct and includes:
# - Correct username/password
# - Database name
# - Network access is configured in MongoDB Atlas
```

### Issue: Admin Login Not Working
```bash
# Check admin credentials
heroku config:get ADMIN_USERNAME
heroku config:get ADMIN_PASSWORD

# Reset if needed
heroku config:set ADMIN_PASSWORD="new-password"
```

### Issue: JWT Errors
```bash
# Generate and set new JWT secret
heroku config:set JWT_SECRET="$(node -e 'console.log(require("crypto").randomBytes(64).toString("hex"))')"
```

## Useful Heroku Commands

```bash
# View app logs
heroku logs --tail

# Check app status
heroku ps

# Restart app
heroku restart

# View configuration
heroku config

# Open app in browser
heroku open

# Run commands on Heroku
heroku run bash

# Scale dynos (for paid plans)
heroku ps:scale web=2
```

## Updating Your App

When you make changes to your code:

```bash
# Quick update
npm run deploy

# Manual update
git add .
git commit -m "Description of changes"
git push heroku main
```

## Monitoring & Maintenance

### Enable Monitoring
- **Heroku Metrics**: Built-in monitoring dashboard
- **New Relic**: Free tier available through Heroku addons
- **Papertrail**: Logging addon

### Regular Maintenance
```bash
# Update dependencies monthly
npm audit
npm update

# Check app health
heroku logs --tail

# Monitor database performance in MongoDB Atlas
```

## Production Checklist

Before going live:

- [ ] Custom domain configured
- [ ] SSL certificate enabled
- [ ] Admin password changed from default
- [ ] Database backups configured
- [ ] Error monitoring setup
- [ ] Performance monitoring enabled
- [ ] CORS origin set to your domain
- [ ] Test all functionality:
  - [ ] Client booking form
  - [ ] Admin login
  - [ ] Admin dashboard
  - [ ] Mobile responsiveness
  - [ ] Email notifications (if configured)

## Cost Information

### Free Tier Includes:
- **Heroku**: 550-1000 dyno hours/month (enough for small apps)
- **MongoDB Atlas**: 512MB storage (sufficient for thousands of bookings)

### Paid Plans Start At:
- **Heroku Hobby**: $7/month (always-on, custom domains)
- **MongoDB Atlas**: $9/month (more storage and features)

## Support

If you encounter issues:

1. **Check logs**: `heroku logs --tail`
2. **Review this guide** for common solutions
3. **MongoDB Atlas Support**: Check their documentation
4. **Heroku Support**: Check their dev center

## Success! 🎉

Your Vila Falo booking system is now live on Heroku! 

**Next Steps:**
1. Share your booking URL with customers
2. Train staff on the admin panel
3. Monitor bookings and system performance
4. Consider setting up automated backups

**Your URLs:**
- **Customer Booking**: `https://your-app-name.herokuapp.com`
- **Admin Dashboard**: `https://your-app-name.herokuapp.com/admin`

Enjoy your new online booking system! 🏔️✨
