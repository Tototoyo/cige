# 🆘 Troubleshooting Common Issues

## Issue 1: API Key Error ⚠️

### Error Message
```
Uncaught Error: An API Key must be set when running in a browser
```

### Solution

**Step 1:** Check your `.env.local` file has the correct format:

```env
VITE_GEMINI_API_KEY=AIzaSy...your_actual_key
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...your_actual_key
VITE_APP_URL=http://localhost:5173
```

**Important Points:**
- ✅ All variables MUST start with `VITE_`
- ✅ No quotes around the values
- ✅ No spaces before or after the `=`
- ✅ Replace ALL placeholder values with your actual keys

**Step 2:** Restart the dev server (REQUIRED after .env changes):
```bash
# Stop: Press Ctrl+C
# Start: 
npm run dev
```

**Step 3:** Clear browser cache and refresh (Ctrl+Shift+R)

See **API-KEY-FIX.md** for detailed instructions.

---

## Issue 2: Supabase Connection Failed

### Error Message
```
Failed to connect to Supabase
```

### Solution

**Check 1:** Verify `.env.local` has correct credentials:
```env
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...your_actual_anon_key
```

**Check 2:** Verify Supabase project is active:
- Go to https://supabase.com
- Check your project status
- Make sure it's not paused

**Check 3:** Verify SQL schema was executed:
- Go to Supabase > SQL Editor
- You should see tables: users, generations, user_stats
- If not, run `supabase-schema.sql` again

**Check 4:** Test connection:
```typescript
// Add to src/App.tsx temporarily
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
```

---

## Issue 3: Authentication Not Working

### Problem: Can't sign up or login

### Solution

**Check 1:** SQL Schema Executed?
- Go to Supabase > Table Editor
- Verify `users` table exists
- Verify `user_stats` table exists

**Check 2:** Auth Enabled?
- Go to Supabase > Authentication > Providers
- Verify "Email" is enabled
- Check if email confirmation is disabled (for testing)

**Check 3:** Check Browser Console (F12)
- Look for specific error messages
- Network tab should show requests to Supabase

**Check 4:** Try Incognito/Private Mode
- Sometimes cached data causes issues
- Test in clean browser session

---

## Issue 4: Module Not Found

### Error Message
```
Cannot find module '@supabase/supabase-js'
```

### Solution

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Issue 5: Build Fails

### Error Message
```
Build failed with errors
```

### Solution

**Step 1:** Check TypeScript errors:
```bash
npm run build
```

**Step 2:** Fix any errors shown

**Step 3:** Common issues:
- Missing imports
- Type errors
- Environment variables not set

**Step 4:** Try clean build:
```bash
rm -rf dist node_modules/.vite
npm install
npm run build
```

---

## Issue 6: Port Already in Use

### Error Message
```
Port 5173 is already in use
```

### Solution

**Option 1:** Kill the process:
```bash
# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or on Windows:
netstat -ano | findstr :5173
taskkill /PID <process_id> /F
```

**Option 2:** Use different port:
```bash
npm run dev -- --port 3000
```

---

## Issue 7: Blank Page / White Screen

### Problem: Page loads but shows nothing

### Solution

**Check 1:** Browser Console (F12)
- Look for JavaScript errors
- Check Network tab for failed requests

**Check 2:** Verify all dependencies installed:
```bash
npm install
```

**Check 3:** Check if API keys are loading:
```typescript
// Add to src/App.tsx
console.log('Environment:', import.meta.env);
```

**Check 4:** Try hard refresh:
- Chrome/Firefox: Ctrl+Shift+R
- Mac: Cmd+Shift+R

---

## Issue 8: Generation Not Saving

### Problem: Content generates but doesn't save to history

### Solution

**Check 1:** User logged in?
- Verify auth state in browser
- Check if user token exists

**Check 2:** Database tables exist?
- Go to Supabase > Table Editor
- Verify `generations` table exists
- Check if RLS policies are enabled

**Check 3:** Check Supabase logs:
- Go to Supabase > Logs
- Look for insert errors
- Check for permission issues

**Check 4:** Verify user_id:
```typescript
// In browser console
console.log(supabase.auth.getUser());
```

---

## Issue 9: Images Not Generating

### Problem: Text generates but no images

### Solution

**Check 1:** Gemini API quota:
- Go to https://ai.google.dev/
- Check your API quota
- Free tier: 60 requests/minute

**Check 2:** API key has image generation enabled:
- Some API keys don't have image generation
- Try creating a new API key

**Check 3:** Check browser console:
- Look for 429 (rate limit) errors
- Look for 403 (permission) errors

---

## Issue 10: npm install Fails

### Error Message
```
npm ERR! code EACCES
```

### Solution

**Option 1:** Fix permissions:
```bash
sudo chown -R $USER ~/.npm
```

**Option 2:** Clear npm cache:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Option 3:** Use different package manager:
```bash
# Try with yarn
npm install -g yarn
yarn install

# Or pnpm
npm install -g pnpm
pnpm install
```

---

## Quick Diagnostic Commands

```bash
# Check Node version (need 18+)
node --version

# Check npm version
npm --version

# Check if .env.local exists
ls -la .env.local

# Check if node_modules exists
ls -la node_modules

# Check running processes
lsof -ti:5173

# View last 20 lines of error log
tail -20 npm-debug.log
```

---

## Getting More Help

### Step 1: Gather Information
- What error message do you see?
- When does it happen?
- What did you try?
- Screenshot of error (if visual)

### Step 2: Check Resources
- Browser Console (F12)
- Network tab in DevTools
- Supabase logs
- Terminal output

### Step 3: Check Documentation
- QUICK-START.md
- SETUP-GUIDE.md
- API-KEY-FIX.md (for API issues)
- DEPLOYMENT-CHECKLIST.md

### Step 4: Common Solutions
1. Restart dev server
2. Clear cache
3. Reinstall dependencies
4. Check environment variables
5. Verify Supabase setup

---

## Emergency Reset

If everything is broken, start fresh:

```bash
# 1. Backup your .env.local
cp .env.local .env.backup

# 2. Clean everything
rm -rf node_modules package-lock.json dist .vite

# 3. Reinstall
npm install

# 4. Restore environment
cp .env.backup .env.local

# 5. Restart
npm run dev
```

---

## Still Stuck?

### Final Checklist
- [ ] Node.js 18+ installed
- [ ] npm install completed without errors
- [ ] .env.local exists with VITE_ prefix
- [ ] All API keys are correct
- [ ] Supabase project is active
- [ ] SQL schema was executed
- [ ] Dev server restarted after .env changes
- [ ] Browser cache cleared
- [ ] Tested in incognito mode

If all checked and still not working:
1. Check the specific error message
2. Search the error online
3. Review the relevant documentation section
4. Try the emergency reset above

---

**Most issues are caused by:**
1. Missing `VITE_` prefix (60%)
2. Not restarting server after .env changes (20%)
3. SQL schema not executed (10%)
4. Wrong API keys (10%)

Fix these first! ✅
