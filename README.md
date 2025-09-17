# 📞 Escape Call Assistant

A Progressive Web App (PWA) that allows users to trigger real phone calls with a single tap for urgent situations. Perfect for meetings, awkward situations, or whenever you need a quick escape route!

## 🚀 Features

- **One-Tap Emergency Call**: Instantly place a call to your phone
- **Scheduled Calls**: Schedule calls for 1-60 minutes in the future
- **Customizable Messages**: Set your own TTS message or use the default
- **PWA Support**: Install on mobile/desktop as a native-like app
- **Real-Time Status**: Track call status and scheduled calls
- **Offline Ready**: Basic functionality works offline

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript PWA
- **Backend**: Node.js + Express
- **Telephony**: Twilio API
- **Styling**: Modern CSS with responsive design
- **Deployment**: Can be deployed to any hosting platform

## 📱 Demo

The app provides:
1. Phone number setup with validation
2. Immediate escape call button
3. Schedule call options (1, 3, 5, 10 minutes or custom)
4. Real-time call status monitoring
5. Scheduled calls management

## 🔧 Setup Instructions

### Prerequisites

1. **Node.js** (v14 or higher)
2. **Twilio Account** with:
   - Account SID
   - Auth Token
   - Twilio Phone Number

### Installation

1. **Clone/Download the project**
   ```bash
   cd dummy_call
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Twilio credentials**
   
   Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your Twilio credentials:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   PORT=3000
   NODE_ENV=development
   DEFAULT_MESSAGE=Please call me back urgently. I need to step away from this meeting.
   ```

4. **Start the application**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

5. **Access the app**
   - Web App: http://localhost:3000
   - The app will be available as a PWA (can be installed on mobile/desktop)

### Getting Twilio Credentials

1. **Sign up for Twilio**: https://www.twilio.com/try-twilio
2. **Get your Account SID and Auth Token** from the Twilio Console Dashboard
3. **Buy a phone number** or use the trial number
4. **Add your phone number to verified numbers** (for trial accounts)

### Twilio Trial Account Limitations

- Trial accounts can only call verified phone numbers
- Add your phone number to verified numbers in Twilio Console
- Trial accounts have limited credits ($15.50 typically)

## 📋 API Endpoints

### POST `/api/twilio/call/immediate`
Place an immediate escape call
```json
{
  "phoneNumber": "+1234567890",
  "message": "Custom message (optional)"
}
```

### POST `/api/twilio/call/schedule`
Schedule a call for later
```json
{
  "phoneNumber": "+1234567890",
  "message": "Custom message (optional)",
  "delayMinutes": 5
}
```

### GET `/api/twilio/calls/scheduled`
Get all scheduled calls

### DELETE `/api/twilio/call/schedule/:callId`
Cancel a scheduled call

### GET `/api/twilio/call/status/:callSid`
Get status of a specific call

## 🎯 Usage

1. **First Time Setup**:
   - Enter your phone number (with country code)
   - Optionally customize the message
   - Save settings

2. **Emergency Call**:
   - Tap "📞 ESCAPE CALL NOW" button
   - Your phone will ring within seconds
   - Answer to hear the escape message

3. **Scheduled Call**:
   - Choose a preset time (1, 3, 5, 10 minutes)
   - Or enter custom minutes
   - Call will be placed automatically at scheduled time

4. **PWA Installation**:
   - Visit the app in a browser
   - Look for "Add to Home Screen" prompt
   - Install for native app-like experience

## 🔒 Security & Privacy

- Phone numbers stored locally in browser
- No data transmitted except to Twilio for calls
- Calls are not recorded
- Messages are processed through Twilio's TTS
- All API calls require valid phone number format

## 🚀 Deployment Options

### Heroku
```bash
git init
git add .
git commit -m "Initial commit"
heroku create your-app-name
git push heroku main
```

### Vercel
```bash
npm install -g vercel
vercel
```

### Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Environment Variables for Production
Set these on your hosting platform:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `NODE_ENV=production`
- `DEFAULT_MESSAGE`

## 🛠️ Development

### Project Structure
```
dummy_call/
├── client/           # PWA Frontend
│   ├── index.html   # Main HTML
│   ├── app.js       # JavaScript logic
│   ├── styles.css   # CSS styles
│   ├── manifest.json # PWA manifest
│   └── sw.js        # Service worker
├── server/          # Node.js Backend
│   ├── index.js     # Express server
│   ├── routes/      # API routes
│   └── services/    # Business logic
├── package.json     # Dependencies
└── README.md        # This file
```

### Adding Features

1. **New TTS Voices**: Modify `twilioService.js` to use different Twilio voices
2. **Call Recording**: Enable recording in Twilio call options (privacy considerations)
3. **SMS Integration**: Add SMS backup using Twilio SMS API
4. **Multiple Numbers**: Support calling multiple numbers in sequence
5. **Call History**: Store call history in database

## 🐛 Troubleshooting

### Common Issues

1. **"Twilio credentials not configured"**
   - Check `.env` file exists and has correct values
   - Verify Account SID and Auth Token are correct

2. **"Failed to place call"**
   - Verify phone number format (+1234567890)
   - Check if number is verified (trial accounts)
   - Ensure Twilio account has sufficient balance

3. **PWA not installing**
   - Use HTTPS in production
   - Ensure manifest.json is accessible
   - Check browser PWA support

4. **Scheduled calls not working**
   - Server must stay running for scheduled calls
   - Check server logs for cron job execution

## 📄 License

MIT License - Feel free to use this for personal or commercial projects.

## 🙋‍♂️ Support

For issues or questions:
1. Check the troubleshooting section
2. Review Twilio documentation
3. Check browser console for errors

---

**⚠️ Disclaimer**: This app is for demonstration purposes. Use responsibly and be mindful of call costs and recipient consent.
