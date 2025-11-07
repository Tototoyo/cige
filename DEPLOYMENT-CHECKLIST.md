# 🚀 Deployment Checklist for CineGen AI

Use this checklist to ensure a smooth deployment to production.

---

## Pre-Deployment Checklist

### Environment Setup
- [ ] All environment variables configured
- [ ] Gemini API key tested and working
- [ ] Supabase credentials verified
- [ ] `.env.local` never committed to git
- [ ] `.gitignore` includes `.env.local`

### Testing
- [ ] All generators work locally
- [ ] User authentication tested (signup/login/logout)
- [ ] Generation history displays correctly
- [ ] Mobile responsive design verified
- [ ] Cross-browser testing completed (Chrome, Firefox, Safari)
- [ ] No console errors in browser DevTools
- [ ] Database operations work correctly

### Security
- [ ] SQL schema with RLS policies deployed
- [ ] No API keys in source code
- [ ] Content moderation enabled
- [ ] Input validation working
- [ ] Protected routes enforced

### Legal & Compliance
- [ ] Privacy Policy page reviewed
- [ ] Terms of Service page reviewed  
- [ ] Cookie Policy page reviewed
- [ ] Cookie consent banner working
- [ ] Contact page functional
- [ ] About page completed

---

## Vercel Deployment

### Step 1: Prepare Repository (Optional but Recommended)

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Production ready"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/cinegen-ai.git
git push -u origin main
```

### Step 2: Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Step 3: Configure in Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add these variables (for Production):
   - `VITE_GEMINI_API_KEY` = your_gemini_key
   - `VITE_SUPABASE_URL` = your_supabase_url
   - `VITE_SUPABASE_ANON_KEY` = your_supabase_key
   - `VITE_APP_URL` = https://your-app.vercel.app
5. Click **Save**
6. Go to **Deployments** and redeploy

### Step 4: Configure Custom Domain (Optional)

1. In Vercel dashboard > **Settings** > **Domains**
2. Click **Add**
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic)

---

## Netlify Deployment

### Step 1: Deploy via CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build and deploy
netlify deploy --prod --build
```

### Step 2: Configure in Netlify Dashboard

1. Go to [app.netlify.com](https://app.netlify.com)
2. Select your site
3. Go to **Site settings** > **Environment variables**
4. Add all variables:
   - `VITE_GEMINI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_URL`
5. Go to **Deploys** and click **Trigger deploy**

### Step 3: Configure Custom Domain (Optional)

1. Go to **Domain management**
2. Click **Add custom domain**
3. Follow verification steps
4. Configure DNS
5. Enable HTTPS (automatic)

---

## Post-Deployment Checklist

### Immediate Testing
- [ ] Visit production URL
- [ ] Test signup with real email
- [ ] Test login
- [ ] Generate content (test each generator)
- [ ] View generation history
- [ ] Test on mobile device
- [ ] Test all navigation links
- [ ] Verify images load correctly
- [ ] Check page load times

### Monitoring Setup
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configure analytics (Google Analytics, Plausible)
- [ ] Enable Vercel/Netlify analytics
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)

### SEO & Performance
- [ ] Add meta descriptions to all pages
- [ ] Create sitemap.xml
- [ ] Create robots.txt
- [ ] Submit to Google Search Console
- [ ] Test page speed (Google PageSpeed Insights)
- [ ] Optimize images if needed
- [ ] Enable caching headers

### Security Hardening
- [ ] Enable HTTPS (should be automatic)
- [ ] Configure security headers
- [ ] Set up CSP (Content Security Policy)
- [ ] Rate limiting configured in Supabase
- [ ] Regular security audits scheduled

---

## Environment Variables Reference

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` | ✅ Yes |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbG...` | ✅ Yes |
| `VITE_APP_URL` | Your app's URL | `https://yourapp.com` | ✅ Yes |
| `VITE_ADSENSE_CLIENT_ID` | AdSense publisher ID | `ca-pub-123456` | ❌ No |

---

## Troubleshooting Deployment

### Build Fails

**Error:** "Module not found"
```bash
# Solution: Clear cache and rebuild
rm -rf node_modules package-lock.json .next dist
npm install
npm run build
```

**Error:** "TypeScript errors"
```bash
# Solution: Fix TypeScript errors locally first
npm run lint
# Fix all errors, then commit and redeploy
```

### Environment Variables Not Working

**Issue:** App can't connect to Supabase
- Verify all env variables are set in deployment platform
- Check for typos in variable names
- Ensure no quotes around values
- Redeploy after adding variables

### Slow Performance

**Possible causes:**
- Large bundle size
- Unoptimized images
- No caching headers

**Solutions:**
- Run `npm run build` and check bundle size
- Optimize/compress images
- Enable CDN caching
- Use image optimization services

---

## DNS Configuration for Custom Domain

### For Vercel:

Add these DNS records in your domain provider:

| Type | Name | Value |
|------|------|-------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

### For Netlify:

Add these DNS records:

| Type | Name | Value |
|------|------|-------|
| A | @ | 75.2.60.5 |
| CNAME | www | your-site.netlify.app |

---

## Monitoring Checklist

After deployment, monitor:

- [ ] Error rates (aim for < 1%)
- [ ] Page load times (aim for < 3s)
- [ ] API response times (aim for < 500ms)
- [ ] Uptime (aim for 99.9%+)
- [ ] User signups
- [ ] Generation usage
- [ ] Database performance

---

## Backup Strategy

### Supabase Automatic Backups
- Free tier: Daily backups (7-day retention)
- Pro tier: Point-in-time recovery

### Manual Backup Procedure
1. Go to Supabase dashboard
2. Database > Backups
3. Create backup before major changes
4. Download backup file
5. Store securely

---

## Update Procedure

When you need to update the app:

1. **Test locally first:**
   ```bash
   git pull origin main
   npm install
   npm run build
   npm run preview
   ```

2. **Deploy update:**
   ```bash
   git push origin main
   # Vercel/Netlify will auto-deploy
   ```

3. **Verify deployment:**
   - Check deployment logs
   - Test critical features
   - Monitor error rates

---

## Emergency Rollback

If something goes wrong:

### Vercel:
1. Go to Deployments
2. Find previous working deployment
3. Click three dots > Promote to Production

### Netlify:
1. Go to Deploys
2. Find previous deploy
3. Click "Publish deploy"

---

## Success Metrics

Track these metrics post-launch:

### Week 1:
- [ ] Zero critical errors
- [ ] At least 10 test users
- [ ] All features working
- [ ] Page load < 3 seconds

### Month 1:
- [ ] 100+ registered users
- [ ] 500+ generations created
- [ ] 99% uptime
- [ ] Mobile traffic > 40%

### Month 3:
- [ ] 500+ daily visitors
- [ ] 1000+ registered users  
- [ ] Ready for AdSense application
- [ ] Positive user feedback

---

## 🎉 Deployment Complete!

Once all checks pass:

✅ Your app is live  
✅ All features working  
✅ Monitoring active  
✅ Backups configured  
✅ Ready for users  

**Next steps:**
1. Start marketing
2. Create content
3. Build traffic
4. Apply for AdSense
5. Start earning! 💰

---

*For issues, check logs in Vercel/Netlify dashboard and Supabase logs.*
