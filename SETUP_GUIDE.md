# AJ VAULT - Premium Photo Storage & Sharing

A modern, ChatGPT-styled photo vault application with Google Photos/Drive integration and QR code sharing.

## 🎨 Features

- **Premium UI**: ChatGPT-like interface with sophisticated gray/white/black theme
- **Google Integration**: Connect your Gmail to sync photos from Google Photos and Google Drive
- **QR Code Sharing**: Share folders or entire library via scannable QR codes
- **Folder Organization**: Organize your photos into custom collections
- **Favorites**: Mark and quickly access your favorite photos
- **Responsive Design**: Works beautifully on desktop and mobile devices

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Photos Library API
   - Google Drive API
   - Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000` and your production URL
   - Authorized redirect URIs: `http://localhost:3000` and your production URL

5. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

6. Update `.env` with your credentials:
```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your_api_key_here
VITE_APP_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

## 📱 How to Use

### Connect Google Account
1. Click "Connect Gmail" in the sidebar
2. Sign in with your Google account
3. Grant permissions for Photos and Drive access
4. Your photos will automatically sync

### Create Folders
1. Navigate to folders section
2. Click the "+" button
3. Name your folder and add photos

### Share via QR Code
1. Open any folder or your main library
2. Click the "Share" button
3. A QR code will be generated
4. Anyone can scan it to view your shared photos (no account needed)

### QR Code Sharing
- Folders: Share specific collections privately
- Library: Share your entire photo vault
- No authentication required for viewers
- Links remain active until you revoke them

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_GOOGLE_API_KEY`
   - `VITE_APP_URL` (your Vercel URL)
4. Update Google OAuth authorized origins with your Vercel URL
5. Deploy!

### Other Platforms

The app works on any static hosting platform that supports SPAs:
- Netlify
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront

## 🎨 UI Theme

The application uses a premium color scheme inspired by ChatGPT:
- Primary Accent: `#10a37f` (Teal/Green)
- Background: `#0d0d0d` (Deep Black)
- Sidebar: `#171717` (Dark Gray)
- Cards: `#1a1a1a` (Medium Gray)
- Text Primary: `#ececec` (Off-White)
- Text Secondary: `#8e8e8e` (Light Gray)

## 🔒 Privacy & Security

- All data stored locally in your browser
- Google OAuth for secure authentication
- No server-side storage (currently)
- Share links can be revoked anytime
- No tracking or analytics

## 📦 Tech Stack

- **React** 19.2.3 - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling (via CDN)
- **QR Code React** - QR code generation
- **Google APIs** - Photos & Drive integration

## 🛠️ Development

### Project Structure

```
photo-vault/
├── components/          # Reusable UI components
│   ├── Icons.tsx
│   ├── PhotoCard.tsx
│   └── ShareModal.tsx
├── src/
│   ├── config/         # Configuration files
│   │   └── google.ts
│   ├── services/       # API services
│   │   └── googleAuth.ts
│   └── pages/          # Page components
│       └── SharedView.tsx
├── App.tsx             # Main application
├── Router.tsx          # Client-side routing
├── index.tsx           # App entry point
├── types.ts            # TypeScript definitions
└── vite.config.ts      # Vite configuration
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🐛 Troubleshooting

### Google Auth Not Working
- Verify your Client ID and API Key in `.env`
- Check authorized origins in Google Console
- Make sure APIs are enabled in Google Cloud Console

### Blank Page on Vercel
- Ensure all environment variables are set
- Check browser console for errors
- Verify build completed successfully

### QR Codes Not Working
- Share URLs must match your production domain
- Check Router.tsx is properly configured
- Verify localStorage has share IDs

## 📝 License

MIT License - feel free to use for personal or commercial projects

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

Built with ❤️ by AJ STUDIOZ
