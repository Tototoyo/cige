# 🔧 Quick Fix - API Key Error

## Issue
```
Uncaught Error: An API Key must be set when running in a browser
```

## Solution

### Step 1: Update Your `.env.local` File

Your `.env.local` file must use `VITE_` prefix for all variables. Update it to:

```env
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_APP_URL=http://localhost:5173
```

**Important:** Replace the placeholder values with your actual keys!

### Step 2: Restart the Development Server

After updating `.env.local`, you MUST restart:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Verify Your API Key

Make sure your Gemini API key:
- ✅ Starts with `AIza...`
- ✅ Has no extra spaces before or after
- ✅ Is from https://ai.google.dev/

## Why This Happens

**Vite requires the `VITE_` prefix** for all environment variables to be exposed to the browser. Without it, the variable won't be available.

❌ Wrong: `GEMINI_API_KEY=...`
✅ Correct: `VITE_GEMINI_API_KEY=...`

## Quick Checklist

- [ ] `.env.local` exists in project root
- [ ] All variables start with `VITE_`
- [ ] Gemini API key is correct
- [ ] No extra quotes around values
- [ ] Restarted dev server after changes

## Still Not Working?

### Check 1: File Location
```bash
# Make sure .env.local is in the right place
ls -la .env.local
# Should show the file in your project root
```

### Check 2: Verify Variables Load
Add this temporarily to `src/App.tsx` (line 18):
```typescript
console.log('API Key:', import.meta.env.VITE_GEMINI_API_KEY);
```

Check browser console (F12) - you should see your key (remove this after testing!)

### Check 3: Clear Cache
```bash
# Stop the server
# Clear Vite cache
rm -rf node_modules/.vite

# Restart
npm run dev
```

## Complete Example `.env.local`

```env
# Gemini AI API Key (from https://ai.google.dev/)
VITE_GEMINI_API_KEY=AIzaSyABCDEF1234567890_ExampleKey

# Supabase Configuration (from https://supabase.com)
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example_key

# Application URL
VITE_APP_URL=http://localhost:5173
```

## After Fixing

Once you've updated `.env.local` and restarted:
1. Open http://localhost:5173
2. Try generating content
3. Should work! ✅

## Need More Help?

See **SETUP-GUIDE.md** for detailed environment setup instructions.
