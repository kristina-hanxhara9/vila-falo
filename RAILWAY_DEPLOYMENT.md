# Railway Deployment Guide - Vila Falo Booking System

This guide explains how to deploy your complete Vila Falo application (frontend + backend) to Railway.app.

## What Gets Deployed

✅ **Frontend:** All HTML, CSS, JavaScript files
✅ **Backend:** Express API server with all endpoints
✅ **Database:** Connection to MongoDB Atlas

Everything runs on ONE Railway service - no separation needed!

---

## Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click "Sign Up" or "Login with GitHub"
3. Authorize Railway to access your GitHub account
4. You're ready to deploy!

---

## Step 2: Deploy from GitHub

1. Go to Railway Dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Search and select: `kristina-hanxhara9/vila-falo`
5. Select branch: `claude/improve-booking-system-MZ2Jt`
6. Click **"Deploy"**

Railway will automatically:
- Read `railway.json`
- Install dependencies (`npm install`)
- Build the app
- Start `node server.js`

---

## Step 3: Configure Environment Variables

Once deployment starts, you need to add these variables to Railway:

### Required Variables

1. **MONGODB_URI** (Database Connection)
   ```
   mongodb+srv://username:password@cluster.mongodb.net/vilafalo?retryWrites=true&w=majority
   ```
   - Get from MongoDB Atlas
   - See setup instructions in `.env.example`

2. **EMAIL_USER** (Booking Confirmation Emails)
   ```
   vilafalo@gmail.com
   ```

3. **EMAIL_PASS** (Gmail App Password - NOT your regular password)
   ```
   your_gmail_app_password_here
   ```
   - Get from Gmail: https://myaccount.google.com → Security → App passwords
   - See detailed instructions in `.env.example`

4. **JWT_SECRET** (Authentication)
   ```
   your-secure-random-string-of-64-characters-or-more
   ```
   - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Optional Variables

5. **GEMINI_API_KEY** (AI Chatbot)
   ```
   AIza... (from https://makersuite.google.com/app/apikey)
   ```

6. **ADMIN_USERNAME** (Admin Panel Login)
   ```
   admin
   ```

7. **ADMIN_PASSWORD** (Admin Panel Login)
   ```
   your_secure_password
   ```

### In Railway Dashboard:

1. Click your project
2. Click **"Variables"** tab
3. Add each variable:
   - Click **"New Variable"**
   - Enter Name and Value
   - Click Add
4. Click **"Deploy"** to apply changes

---

## Step 4: Verify Deployment

Once deployment completes:

1. Click on your deployment
2. Find the **"Domains"** section
3. Copy the generated URL (e.g., `https://vila-falo-production.up.railway.app`)
4. Visit that URL in your browser
5. You should see your booking website! 🎉

---

## Step 5: Test Booking System

### Frontend Tests:
- ✅ Homepage loads with all sections
- ✅ Booking form appears
- ✅ Price calculator works (select dates/room → price updates)
- ✅ Form submission works

### Backend Tests:
- ✅ API health: `https://your-url/api/booking` → returns bookings
- ✅ Booking creation works (fill form → success message)
- ✅ Admin panel accessible: `https://your-url/admin/login`
- ✅ Email notifications sent

---

## Step 6: Set Up Custom Domain (Optional)

Want your own domain instead of `railway.app` subdomain?

1. In Railway project, go **"Settings"**
2. Click **"Domains"** → **"Add Custom Domain"**
3. Enter your domain (e.g., `vilafalo.com`)
4. Follow DNS configuration steps
5. Done! Traffic routes to Railway

---

## Troubleshooting

### App Won't Start
**Check logs:**
1. Click deployment in Railway
2. Go to **"Logs"** tab
3. Look for error messages
4. Common issues:
   - Missing `MONGODB_URI` → add it in Variables
   - Missing `EMAIL_PASS` → add it in Variables
   - Port already in use → should be auto-handled

### Emails Not Sending
1. Check `EMAIL_USER` and `EMAIL_PASS` in Variables
2. Use Gmail App Password (not your regular password)
3. Check Gmail security settings allowed "Less secure apps"

### Database Connection Error
1. Verify `MONGODB_URI` is correct
2. Check MongoDB Atlas IP whitelist includes Railway IPs
3. Test connection string locally first

### Check Logs
Always check Railway logs when something goes wrong:
- Click your project
- View **Logs** tab for detailed error messages

---

## Updating Your App

When you push new code to `claude/improve-booking-system-MZ2Jt`:

1. Railway watches for changes
2. Automatically rebuilds and redeploys
3. No action needed from you!

Or force redeploy:
1. Click project in Railway
2. Click **"Redeploy"** button
3. Choose latest deployment
4. Click **"Redeploy"**

---

## Monitoring & Support

### View Logs:
- Railway Dashboard → Project → **Logs**

### View Metrics:
- Railway Dashboard → Project → **Metrics**

### Check Status:
- Railway Dashboard → Project → **Health**

### Get Help:
- Railway Docs: https://docs.railway.app/
- Support: https://railway.app/support

---

## Cost Estimate

Railway pricing is **pay-as-you-go**:
- **Free tier:** $5 credit/month (includes most small apps)
- **Beyond free:** ~$0.50 per 1000 executions
- **Typical cost:** $5-15/month for a small booking system

Much cheaper than Heroku!

---

## Your Deployment Checklist

- [ ] Railway account created
- [ ] GitHub repo connected
- [ ] `MONGODB_URI` added to Variables
- [ ] `EMAIL_USER` and `EMAIL_PASS` added
- [ ] `JWT_SECRET` added
- [ ] Deployment complete and running
- [ ] Website loads in browser
- [ ] Booking form works
- [ ] Admin panel accessible
- [ ] Emails send (test booking)
- [ ] Custom domain configured (optional)

---

## Success! 🎉

Your Vila Falo booking system is live on Railway!
- Website: https://your-railway-url
- Admin: https://your-railway-url/admin/login
- API: https://your-railway-url/api/booking

Enjoy your fully functional, scalable booking system at a fraction of Heroku's cost!
