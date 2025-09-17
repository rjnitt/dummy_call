# 🚀 Deployment Guide - Vercel

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project directory**
   ```bash
   cd /Users/jainrohit/Project/dummy_call
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? **Y**
   - Which scope? Choose your account
   - Link to existing project? **N**
   - What's your project's name? **escape-call-assistant**
   - In which directory is your code located? **./** (current directory)

### Option 2: Deploy via GitHub + Vercel Dashboard

1. **Initialize Git and push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Escape Call Assistant"
   git branch -M main
   git remote add origin https://github.com/yourusername/escape-call-assistant.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Deploy!

## 🔐 Environment Variables Setup

After deployment, you **MUST** set up environment variables in Vercel:

### Via Vercel Dashboard:
1. Go to your project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables:

| Variable | Value | Example |
|----------|-------|---------|
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID | `AC288837aa6ab42632d46881ce89ca4bbf` |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token | `your_auth_token_here` |
| `TWILIO_PHONE_NUMBER` | Your Twilio Phone Number | `+18583302457` |
| `NODE_ENV` | `production` | `production` |
| `DEFAULT_MESSAGE` | Your default message | `Please call me back urgently! I need to step away from this meeting.` |

### Via Vercel CLI:
```bash
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_AUTH_TOKEN
vercel env add TWILIO_PHONE_NUMBER
vercel env add NODE_ENV
vercel env add DEFAULT_MESSAGE
```

## 🔄 Redeploy After Adding Environment Variables

After adding environment variables, redeploy:
```bash
vercel --prod
```

## 🧪 Testing Your Deployment

1. **Get your Vercel URL** (e.g., `https://escape-call-assistant.vercel.app`)
2. **Test the PWA:**
   - Visit your URL
   - Enter your phone number
   - Click "Escape Call Now"
   - Your phone should ring!

## 📱 PWA Installation

Your deployed app is now a full PWA:
- **Mobile**: Visit URL → "Add to Home Screen"
- **Desktop**: Visit URL → Install icon in address bar

## 🎯 Production URLs

After deployment, your app will have these endpoints:
- **PWA**: `https://your-app.vercel.app`
- **API**: `https://your-app.vercel.app/api/twilio/call/immediate`
- **TwiML**: `https://your-app.vercel.app/api/twilio/twiml/escape-message`

## 🔧 Custom Domain (Optional)

1. **In Vercel Dashboard:**
   - Go to Settings → Domains
   - Add your custom domain
   - Follow DNS setup instructions

## 📊 Monitoring

- **Vercel Dashboard**: Monitor deployments and performance
- **Twilio Console**: Monitor call logs and usage
- **Browser DevTools**: Test PWA functionality

## 🚨 Important Notes

1. **Free Tier Limits**: Vercel free tier has function execution limits
2. **Twilio Costs**: Monitor your Twilio usage for call costs
3. **Environment Security**: Never commit `.env` files to git
4. **Phone Number Verification**: Ensure your target numbers are verified in Twilio (trial accounts)

## 🐛 Troubleshooting

### Common Issues:

1. **"Twilio credentials not configured"**
   - Check environment variables are set in Vercel
   - Redeploy after adding env vars

2. **"Failed to place call"**
   - Verify phone number format (+country code)
   - Check Twilio account balance
   - Ensure phone number is verified (trial accounts)

3. **PWA not installing**
   - Ensure HTTPS (automatic on Vercel)
   - Check manifest.json is accessible

### Logs:
- **Vercel Logs**: Check function logs in Vercel dashboard
- **Browser Console**: Check for frontend errors

---

🎉 **Your Escape Call Assistant is now live and ready to help you escape any situation!**
