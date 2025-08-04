# Vila Falo Deployment Fix

## Problem
Your Heroku app is crashing with the error: `Cannot find module './operations/add_user'`

This is caused by corrupted node_modules or caching issues in the MongoDB library.

## Solution

### Option 1: Run the automated fix script
```bash
chmod +x fix-deployment.sh
./fix-deployment.sh
```

### Option 2: Manual steps
```bash
# 1. Remove corrupted node_modules
rm -rf node_modules

# 2. Clear npm cache
npm cache clean --force

# 3. Reinstall dependencies (this will use package-lock.json for consistency)
npm install

# 4. Test locally
npm run health
npm start
```

## Deploy to Heroku

After fixing locally:

```bash
# Add all changes
git add .

# Commit the changes
git commit -m "Fix: Rebuild node_modules to resolve MongoDB module error"

# Deploy to Heroku
git push heroku main
```

## Additional Steps (if still failing)

If the issue persists, also clear Heroku's cache:

```bash
# Clear Heroku cache
heroku plugins:install heroku-repo
heroku repo:purge_cache -a vila-falo-resort

# Redeploy
git push heroku main
```

## Verify the Fix

Check your Heroku logs after deployment:
```bash
heroku logs --tail -a vila-falo-resort
```

You should see successful startup messages instead of the module error.
