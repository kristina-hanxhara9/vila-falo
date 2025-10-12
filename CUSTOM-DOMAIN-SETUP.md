# 🌐 CUSTOM DOMAIN SETUP - vilafalo.com

## Current Situation
- Your app: https://vila-falo-resort-8208afd24e04.herokuapp.com
- You want: https://vilafalo.com (and www.vilafalo.com)
- Admin should be: https://vilafalo.com/admin

---

## ✅ STEP-BY-STEP GUIDE

### Step 1: Add Domain to Heroku

```bash
# Login to Heroku
heroku login

# Navigate to your app directory
cd /Users/kristinahanxhara/vila-falo/vila-falo

# Add your custom domain
heroku domains:add vilafalo.com
heroku domains:add www.vilafalo.com

# Get DNS targets (save these for next step)
heroku domains
```

**Expected Output:**
```
Domain Name          DNS Target
───────────────────  ─────────────────────────────────────
vilafalo.com         <some-dns-target>.herokudns.com
www.vilafalo.com     <some-dns-target>.herokudns.com
```

---

### Step 2: Update DNS Settings (at your domain registrar)

Go to where you bought vilafalo.com (GoDaddy, Namecheap, etc.) and add these DNS records:

#### For Root Domain (vilafalo.com):
```
Type: ALIAS or ANAME
Host: @
Value: <dns-target-from-step-1>.herokudns.com
TTL: Automatic or 3600
```

#### For WWW Subdomain (www.vilafalo.com):
```
Type: CNAME
Host: www
Value: <dns-target-from-step-1>.herokudns.com
TTL: Automatic or 3600
```

**⚠️ Note:** If your registrar doesn't support ALIAS/ANAME for root domain, use CNAME flattening or Cloudflare.

---

### Step 3: Enable SSL/HTTPS

```bash
# Heroku automatically provisions SSL certificates
# Wait 10-60 minutes after adding domain

# Check SSL status
heroku certs:auto

# Should show:
# === Automatic Certificate Management is enabled on vila-falo-resort
```

---

### Step 4: Verify Domain is Working

```bash
# Wait 10-60 minutes for DNS to propagate
# Then test:

curl -I https://vilafalo.com
curl -I https://www.vilafalo.com
curl -I https://vilafalo.com/admin
```

---

## 🔧 TROUBLESHOOTING

### DNS Not Propagating?
```bash
# Check DNS propagation status
nslookup vilafalo.com
nslookup www.vilafalo.com

# Or use online tools:
# https://www.whatsmydns.net/#A/vilafalo.com
```

### SSL Certificate Issues?
```bash
# Force certificate refresh
heroku certs:auto:refresh

# Check certificate status
heroku certs:auto
```

---

## 📋 COMMON DNS REGISTRAR GUIDES

### GoDaddy:
1. Go to: https://dcc.godaddy.com/manage/
2. Click on your domain
3. DNS → Manage Zones
4. Add the records above

### Namecheap:
1. Go to: Domain List → Manage
2. Advanced DNS
3. Add the records above

### Cloudflare (Recommended):
1. Transfer DNS to Cloudflare (free)
2. Add CNAME records for both @ and www
3. Enable "Full (strict)" SSL mode

---

## ✅ AFTER SETUP COMPLETE

Your URLs will work like this:
- ✅ https://vilafalo.com → Main website
- ✅ https://www.vilafalo.com → Main website
- ✅ https://vilafalo.com/admin → Admin login
- ✅ https://vilafalo.com/admin/dashboard → Admin panel
- ✅ https://vilafalo.com/admin.html → Admin interface

**Old URL will still work:**
- ✅ https://vila-falo-resort-8208afd24e04.herokuapp.com → Auto-redirects to vilafalo.com

---

## 🚀 QUICK SETUP SCRIPT

```bash
#!/bin/bash
echo "Setting up vilafalo.com..."

# Add domains
heroku domains:add vilafalo.com
heroku domains:add www.vilafalo.com

# Get DNS targets
echo ""
echo "📋 Copy these DNS targets and add them to your domain registrar:"
echo ""
heroku domains

echo ""
echo "✅ Next steps:"
echo "1. Go to your domain registrar (where you bought vilafalo.com)"
echo "2. Add DNS records shown above"
echo "3. Wait 10-60 minutes for DNS propagation"
echo "4. Your site will be live at https://vilafalo.com"
```

---

## ⏱️ TIMELINE

- **Add domain to Heroku:** 1 minute
- **Update DNS records:** 5 minutes
- **DNS propagation:** 10-60 minutes (sometimes up to 24 hours)
- **SSL certificate:** Automatic (10-60 minutes after DNS works)

---

## 📞 NEED HELP?

**Where did you buy vilafalo.com?**
Let me know your domain registrar and I'll give you exact step-by-step instructions!

Common registrars:
- GoDaddy
- Namecheap
- Google Domains
- Cloudflare
- Other?
