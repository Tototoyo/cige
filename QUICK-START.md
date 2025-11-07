# ⚡ CineGen AI - Quick Start Guide

**Get your app running in 10 minutes!**

---

## Prerequisites Check

Before starting, verify you have:
- [ ] Node.js installed → Run `node --version` (need 18+)
- [ ] A Supabase account → [Sign up free](https://supabase.com)
- [ ] A Gemini API key → [Get free key](https://ai.google.dev/)

---

## 🚀 Step 1: Supabase Setup (5 min)

### A. Create Project
1. Go to https://supabase.com and sign in
2. Click **"New Project"**
3. Enter:
   - Name: `cinegen-ai`
   - Password: (create a strong one)
   - Region: (choose closest to you)
4. Click **"Create new project"**
5. ⏱️ Wait 1-2 minutes

### B. Run Database Schema
1. Click **"SQL Editor"** in left sidebar
2. Click **"New query"**
3. Open the file `supabase-schema.sql` from this project
4. Copy **everything** (Ctrl+A, Ctrl+C)
5. Paste into SQL Editor (Ctrl+V)
6. Click **"Run"** (or press Ctrl+Enter)
7. ✅ Should see: "Success. No rows returned"

### C. Get Credentials
1. Click **"Project Settings"** (gear icon)
2. Click **"API"** in left sidebar
3. Copy and save these:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJ...` (long string)

---

## ⚙️ Step 2: Configure App (2 min)

### A. Get Gemini API Key
1. Go to https://ai.google.dev/
2. Click **"Get API key in Google AI Studio"**
3. Sign in with Google
4. Click **"Create API Key"**
5. Copy the key (starts with `AIza...`)

### B. Set Up Environment
1. In project folder, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` in a text editor

3. Replace placeholders with your actual keys:
   ```env
   VITE_GEMINI_API_KEY=AIzaSyYourActualKeyHere
   VITE_SUPABASE_URL=https://yourproject.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGYourActualKeyHere
   VITE_APP_URL=http://localhost:5173
   ```

4. Save the file

---

## 💻 Step 3: Run App (3 min)

Open terminal in project folder:

```bash
# Install dependencies (takes 1-2 minutes)
npm install

# Start the app
npm run dev
```

You should see:
```
VITE v5.0.8  ready in 1234 ms

➜  Local:   http://localhost:5173/
```

**🎉 Open http://localhost:5173 in your browser!**

---

## ✅ Quick Test

### 1. Create Account
1. Click **"Sign Up"** (top right)
2. Enter email, password, and name
3. Click **"Create Account"**
4. ✅ You should be logged in!

### 2. Generate Content
1. Click **"Generate"** in navigation
2. Choose any generator (try "Storyboard")
3. Fill in the form
4. Click **"Generate"**
5. ⏱️ Wait 10-20 seconds
6. ✅ See your generated content!

### 3. View History
1. Click **"History"** in navigation
2. ✅ See your saved generation!

---

## 🚢 Deploy to Vercel (5 min)

### Quick Deploy
```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Add Environment Variables
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add all 4 variables from your `.env.local`
5. Click **Save**
6. Go to **Deployments** → **Redeploy**

**✅ Your app is now live!**

---

## 🐛 Troubleshooting

### Problem: `npm install` fails
```bash
# Solution: Clear cache and try again
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Cannot connect to Supabase"
- Double-check your `.env.local` file
- Make sure you copied the full URLs and keys
- Verify Supabase project is active

### Problem: "Gemini API error"
- Check your API key is correct
- Verify key has no extra spaces
- Try creating a new API key

### Problem: App won't start
```bash
# Solution: Check for errors
npm run dev

# If errors appear, try:
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📝 What's Next?

### Immediate (Today)
- ✅ Test all generators
- ✅ Try creating multiple accounts
- ✅ Check mobile view
- ✅ Share with a friend for feedback

### This Week
- 📝 Customize branding/colors
- 📝 Add your company info
- 🚀 Deploy to production
- 📱 Test on different devices

### This Month
- 📝 Create 10-15 blog posts
- 📢 Share on social media
- 🎨 Add more examples
- 📈 Start tracking analytics

---

## 💡 Pro Tips

1. **Keep `.env.local` secret** - Never commit to Git
2. **Backup Supabase** - Enable daily backups
3. **Test thoroughly** - Before showing to users
4. **Monitor errors** - Use browser console (F12)
5. **Start simple** - Get it working, then customize

---

## 🎯 Success Checklist

- [ ] Supabase project created ✅
- [ ] SQL schema executed ✅
- [ ] Environment variables configured ✅
- [ ] `npm install` completed ✅
- [ ] App runs at localhost:5173 ✅
- [ ] Can create account ✅
- [ ] Can generate content ✅
- [ ] Can view history ✅
- [ ] Deployed to production ✅

---

## 📚 Need More Help?

Read these in order:
1. **SETUP-GUIDE.md** - Detailed setup walkthrough
2. **DEPLOYMENT-CHECKLIST.md** - Complete deployment guide
3. **PROJECT-SUMMARY.md** - Full project overview
4. **docs/README-START-HERE.md** - Comprehensive documentation

---

## 🎉 You're All Set!

Your app is now:
- ✅ Running locally
- ✅ Connected to Supabase
- ✅ Generating content with AI
- ✅ Ready to deploy

**Time to build something awesome! 🚀**

---

*Quick start completed! See README.md for more details.*
