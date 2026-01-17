# AJ VAULT - Quick Start Guide

## ✨ What's New

Your photo vault now has a **premium ChatGPT-like design** with:
- 🎨 Sophisticated teal/green accent color (#10a37f)
- 🌑 Premium gray/black theme
- 🔗 Real Google OAuth integration
- 📱 QR code sharing that actually works
- ✅ Production-ready deployment setup

---

## 🚀 Quick Setup (5 minutes)

### 1. Google OAuth Setup (Required for Google Photos/Drive)

1. **Go to**: https://console.cloud.google.com/
2. **Create/Select Project**
3. **Enable APIs**:
   - Google Photos Library API
   - Google Drive API
   - Google+ API
4. **Create OAuth Credentials**:
   - Type: Web application
   - Origins: `http://localhost:3000`, your Vercel URL
5. **Copy `.env.example` to `.env`** and add your credentials:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
   VITE_GOOGLE_API_KEY=your-api-key
   ```

### 2. Run Locally

```bash
cd photo-vault
npm install
npm run dev
```

Visit: http://localhost:3000

---

## 📤 Deploy to Vercel (3 minutes)

### Option 1: Auto-Deploy (Recommended)
1. Push to GitHub ✅ (Already done!)
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your `photo-vault` repository
5. Add environment variables:
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_GOOGLE_API_KEY`
   - `VITE_APP_URL` (Vercel will provide this)
6. Click Deploy 🚀

### Option 2: Vercel CLI
```bash
npm i -g vercel
vercel
```

---

## 🎯 Key Features

### 1. **Google Integration**
- Click "Connect Gmail" in sidebar
- Sign in with your Google account
- Photos automatically sync from Google Photos & Drive
- **Fallback**: Works without Google OAuth (demo mode)

### 2. **QR Code Sharing**
- Click "Share" button on any folder or library
- QR code generated instantly
- Anyone can scan to view photos (no login required)
- Share URL format: `https://your-app.com/share/abc123`

### 3. **Folder Organization**
- Create custom collections
- Drag photos into folders
- Mark favorites with ❤️

### 4. **Responsive Design**
- Works on desktop, tablet, mobile
- Touch-friendly interface
- Premium animations

---

## 🎨 Theme Colors

```css
Primary Accent:   #10a37f (ChatGPT Teal)
Background:       #0d0d0d (Deep Black)
Sidebar:          #171717 (Dark Gray)
Cards:            #1a1a1a (Medium Gray)
Borders:          #2a2a2a (Subtle Gray)
Text Primary:     #ececec (Off-White)
Text Secondary:   #8e8e8e (Light Gray)
```

---

## 📁 File Structure

```
photo-vault/
├── App.tsx              ← Main app with new theme
├── Router.tsx           ← Handles /share/* routes
├── index.tsx            ← Entry point
├── components/
│   ├── PhotoCard.tsx    ← Photo grid items
│   ├── ShareModal.tsx   ← QR code modal
│   └── Icons.tsx        ← SVG icons
├── src/
│   ├── config/
│   │   └── google.ts    ← Google API config
│   ├── services/
│   │   └── googleAuth.ts ← OAuth logic
│   └── pages/
│       └── SharedView.tsx ← Public share page
├── .env.example         ← Template for environment variables
├── vercel.json          ← Vercel config (SPA routing)
├── SETUP_GUIDE.md       ← Detailed setup instructions
└── DEPLOYMENT.md        ← Deployment guide
```

---

## 🔧 Troubleshooting

### Blank Page
- ✅ Fixed! Added script tag to index.html
- Check browser console for errors
- Verify all files are committed

### Google Auth Not Working
- **Option 1**: Add your Client ID/API Key to `.env`
- **Option 2**: Use demo mode (app prompts for email)
- Make sure authorized origins are set in Google Console

### QR Codes Not Working
- Share URLs must match your domain
- Check `Router.tsx` is properly imported in `index.tsx`
- Verify `vercel.json` exists for SPA routing

### Colors Look Wrong
- Clear browser cache
- Check `index.html` CSS variables
- Verify Tailwind CDN is loading

---

## 🎥 Demo Workflow

1. **Start App**: `npm run dev`
2. **Upload Photos**: Click "Add Shots" button
3. **Create Folder**: Navigate to folders, click "+"
4. **Share Folder**: Open folder → Click "Share" → QR code appears
5. **Test Share Link**: Open QR URL in incognito mode
6. **Connect Google**: Click "Connect Gmail" (requires setup)
7. **Sync Photos**: Photos from Google appear automatically

---

## 📞 Support

- **Documentation**: See `SETUP_GUIDE.md` for detailed instructions
- **Deployment**: See `DEPLOYMENT.md` for Vercel setup
- **Issues**: Check browser console first
- **Questions**: Review the code comments in each file

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Fill in `.env` with Google OAuth credentials
- [ ] Update authorized origins in Google Console
- [ ] Test Google login locally
- [ ] Test QR code generation
- [ ] Test share links work
- [ ] Deploy to Vercel
- [ ] Add Vercel URL to Google Console
- [ ] Test production deployment
- [ ] Share with users! 🎉

---

**Built with ❤️ by AJ STUDIOZ**

Your app is now production-ready with:
✅ Premium ChatGPT-like UI
✅ Google Photos/Drive integration
✅ Working QR code sharing
✅ Full documentation
✅ Vercel deployment config

**Next Step**: Deploy to Vercel and test!
