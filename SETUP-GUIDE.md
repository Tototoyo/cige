# 🚀 CineGen AI - Complete Setup Guide

This guide will walk you through every step to get your CineGen AI application running and deployed.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Environment Configuration](#environment-configuration)
4. [Local Development](#local-development)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 18+** installed ([Download](https://nodejs.org/))
- ✅ **Git** installed (optional, for version control)
- ✅ A **Supabase account** ([Sign up](https://supabase.com))
- ✅ A **Gemini API key** ([Get free key](https://ai.google.dev/))
- ✅ A code editor (VS Code recommended)

---

## Supabase Setup

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in the details:
   - **Name:** CineGen AI (or your preferred name)
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier is perfect to start
4. Click **"Create new project"**
5. ⏱️ Wait 1-2 minutes for the project to initialize

### Step 2: Run the Database Schema

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click the **"New query"** button
3. Open the `supabase-schema.sql` file from your project
4. **Select ALL content** (Ctrl+A / Cmd+A) and **copy** it
5. **Paste** the entire content into the SQL Editor
6. Click **"Run"** or press **Ctrl+Enter**
7. ✅ You should see: **"Success. No rows returned"**

**Important:** If you see any errors:
- Make sure you copied the ENTIRE file
- Check that nothing was cut off
- Try running it again

### Step 3: Get Your Supabase Credentials

1. In Supabase dashboard, click **"Project Settings"** (gear icon)
2. Click **"API"** in the left sidebar
3. Find and copy these two values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** Long string starting with `eyJ...`
4. 📝 Save these in a secure place (you'll need them next)

### Step 4: Configure Authentication (Optional but Recommended)

1. Go to **"Authentication"** > **"Providers"** in Supabase
2. Enable **"Email"** provider (should be on by default)
3. Under **"Email Auth"**:
   - **Confirm email:** Turn OFF (for easier testing)
   - You can enable this later in production
4. Click **"Save"**

---

## Environment Configuration

### Step 1: Get Gemini API Key

1. Go to [https://ai.google.dev/](https://ai.google.dev/)
2. Click **"Get API key in Google AI Studio"**
3. Sign in with your Google account
4. Click **"Create API Key"**
5. Copy the API key (starts with `AI...`)

### Step 2: Create Environment File

1. In your project folder, find `.env.example`
2. Create a copy and rename it to `.env.local`
   ```bash
   cp .env.example .env.local
   ```
3. Open `.env.local` in your code editor
4. Fill in your actual credentials:

```env
# Your Gemini API Key
VITE_GEMINI_API_KEY=AIzaSy...your_actual_key_here

# Your Supabase URL
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# Your Supabase Anon Key
VITE_SUPABASE_ANON_KEY=eyJhbG...your_actual_key_here

# Keep this for local development
VITE_APP_URL=http://localhost:5173
```

5. **Save the file**

⚠️ **IMPORTANT:** Never commit `.env.local` to Git! It's already in `.gitignore`.

---

## Local Development

### Step 1: Install Dependencies

Open your terminal in the project folder and run:

```bash
npm install
```

This will install all required packages. It may take 2-3 minutes.

### Step 2: Start Development Server

```bash
npm run dev
```

You should see:

```
VITE v5.0.8  ready in 1234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 3: Open in Browser

1. Open your browser
2. Go to: **http://localhost:5173**
3. 🎉 You should see the CineGen AI homepage!

---

## Testing

### Test 1: User Registration

1. Click **"Sign Up"** in the top right
2. Enter:
   - **Email:** test@example.com (use a real email you can access)
   - **Password:** TestPassword123!
   - **Full Name:** Test User
3. Click **"Create Account"**
4. ✅ You should be redirected to the dashboard
5. **Verify in Supabase:**
   - Go to Supabase dashboard > Authentication > Users
   - You should see your new user listed

### Test 2: Sign In

1. Click **"Sign Out"**
2. Click **"Sign In"**
3. Enter your email and password
4. Click **"Sign In"**
5. ✅ You should be logged in

### Test 3: Generate Content

1. Make sure you're logged in
2. Click **"Generate"** in the navigation
3. Choose any generator (e.g., "Storyboard")
4. Fill in the form fields
5. Click **"Generate"**
6. ⏱️ Wait 10-30 seconds
7. ✅ You should see generated content
8. **Verify in Supabase:**
   - Go to Supabase > Table Editor > generations
   - You should see your generation saved

### Test 4: View History

1. Click **"History"** in the navigation
2. ✅ You should see your previous generations
3. Try clicking on one to view details
4. Try deleting one

---

## Deployment

### Option 1: Deploy to Vercel (Recommended)

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

#### Step 3: Deploy

```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **Project name?** cinegen-ai (or your choice)
- **Directory?** ./  (just press Enter)
- **Override settings?** No

⏱️ Deployment takes 1-2 minutes.

#### Step 4: Add Environment Variables

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add each variable:
   - `VITE_GEMINI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_URL` (use your Vercel URL)
5. Click **"Save"**
6. Go to **Deployments** and click **"Redeploy"**

✅ Your app is now live!

### Option 2: Deploy to Netlify

#### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### Step 2: Login

```bash
netlify login
```

#### Step 3: Deploy

```bash
netlify deploy --prod
```

Follow prompts similar to Vercel.

#### Step 4: Add Environment Variables

1. Go to Netlify dashboard
2. Select your site
3. Go to **Site settings** > **Environment variables**
4. Add all your variables
5. Trigger a redeploy

---

## Troubleshooting

### Issue: "Cannot find module '@supabase/supabase-js'"

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Supabase connection failed"

**Possible causes:**
1. Wrong credentials in `.env.local`
2. Supabase project not active
3. SQL schema not run

**Solution:**
- Double-check your `.env.local` credentials
- Verify your Supabase project is running
- Re-run the SQL schema in Supabase

### Issue: "Authentication errors"

**Possible causes:**
1. SQL schema not run correctly
2. Auth provider not enabled
3. Email confirmation required

**Solution:**
- Re-run SQL schema
- Check Supabase Auth settings
- Disable email confirmation for testing

### Issue: "Generations not saving"

**Possible causes:**
1. Not logged in
2. Database permissions issue
3. Network problem

**Solution:**
- Make sure you're logged in
- Check Supabase logs for errors
- Check browser console for errors

### Issue: "Build fails on deployment"

**Possible causes:**
1. TypeScript errors
2. Missing dependencies
3. Environment variables not set

**Solution:**
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npm run lint

# Verify all environment variables are set in deployment platform
```

---

## Getting Help

If you're still stuck:

1. **Check the documentation in the `docs/` folder**
2. **Review console errors** - Open browser DevTools (F12)
3. **Check Supabase logs** - In Supabase dashboard > Logs
4. **Search the error message** - Copy error and search online

---

## Next Steps

Once everything is working:

1. ✅ Test all features thoroughly
2. 📝 Create 15-20 content pages (for AdSense)
3. 🎨 Customize the design/branding
4. 📱 Test on mobile devices
5. 🚀 Share with friends for feedback
6. 📈 Start building traffic
7. 💰 Apply for Google AdSense

---

## Success Checklist

- [ ] Supabase project created
- [ ] SQL schema executed successfully
- [ ] `.env.local` configured with all keys
- [ ] `npm install` completed
- [ ] App runs locally at localhost:5173
- [ ] Test user can sign up
- [ ] Test user can sign in
- [ ] Content generation works
- [ ] History shows saved generations
- [ ] App deployed to Vercel/Netlify
- [ ] All environment variables set in deployment
- [ ] Production app is accessible online

🎉 **Congratulations! You're ready to launch!**

---

*Need more help? See `docs/README-START-HERE.md` for additional guidance.*
