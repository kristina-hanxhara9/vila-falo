#!/bin/bash

# Vila Falo - Stripe Payment Setup Script
# This script helps you set up Stripe payments quickly

echo "🏔️  Vila Falo - Stripe Payment Setup"
echo "======================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create a .env file first"
    exit 1
fi

echo "📋 This script will help you:"
echo "1. Install Stripe dependency"
echo "2. Update your .env with Stripe keys"
echo "3. Test your configuration"
echo ""

# Install Stripe
echo "📦 Installing Stripe..."
npm install stripe@17.5.0

if [ $? -eq 0 ]; then
    echo "✅ Stripe installed successfully"
else
    echo "❌ Failed to install Stripe"
    exit 1
fi

echo ""
echo "🔑 Stripe API Keys Setup"
echo "========================"
echo ""
echo "Please follow these steps to get your Stripe keys:"
echo "1. Go to https://dashboard.stripe.com/test/apikeys"
echo "2. Copy your Publishable key (starts with pk_test_)"
echo "3. Copy your Secret key (starts with sk_test_)"
echo ""

# Prompt for Stripe keys
read -p "Enter your Stripe Publishable Key (pk_test_...): " STRIPE_PUB_KEY
read -p "Enter your Stripe Secret Key (sk_test_...): " STRIPE_SECRET_KEY

# Validate keys
if [[ ! $STRIPE_PUB_KEY == pk_test_* ]]; then
    echo "⚠️  Warning: Publishable key doesn't start with pk_test_"
    read -p "Continue anyway? (y/n): " CONTINUE
    if [[ ! $CONTINUE == "y" ]]; then
        exit 1
    fi
fi

if [[ ! $STRIPE_SECRET_KEY == sk_test_* ]]; then
    echo "⚠️  Warning: Secret key doesn't start with sk_test_"
    read -p "Continue anyway? (y/n): " CONTINUE
    if [[ ! $CONTINUE == "y" ]]; then
        exit 1
    fi
fi

# Add or update keys in .env
echo ""
echo "📝 Updating .env file..."

# Check if keys already exist
if grep -q "STRIPE_PUBLISHABLE_KEY" .env; then
    # Update existing keys
    sed -i.bak "s|STRIPE_PUBLISHABLE_KEY=.*|STRIPE_PUBLISHABLE_KEY=$STRIPE_PUB_KEY|g" .env
    sed -i.bak "s|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY|g" .env
    echo "✅ Updated existing Stripe keys in .env"
else
    # Add new keys
    echo "" >> .env
    echo "# ==============================================# STRIPE PAYMENT CONFIGURATION" >> .env
    echo "# ==============================================" >> .env
    echo "STRIPE_PUBLISHABLE_KEY=$STRIPE_PUB_KEY" >> .env
    echo "STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY" >> .env
    echo "STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE" >> .env
    echo "✅ Added Stripe keys to .env"
fi

# Update booking.html with publishable key
echo ""
echo "📝 Updating booking.html..."
if [ -f public/booking.html ]; then
    sed -i.bak "s|const stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY');|const stripe = Stripe('$STRIPE_PUB_KEY');|g" public/booking.html
    echo "✅ Updated booking.html with your publishable key"
else
    echo "⚠️  Warning: public/booking.html not found"
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Test locally: npm run dev"
echo "2. Go to http://localhost:5000/booking.html"
echo "3. Use test card: 4242 4242 4242 4242"
echo "4. Deploy to Heroku: git push heroku main"
echo "5. Set Heroku env vars: heroku config:set STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY"
echo ""
echo "📚 For full instructions, see STRIPE-DEPLOYMENT-GUIDE.md"
echo ""
echo "🎉 Happy booking!"
