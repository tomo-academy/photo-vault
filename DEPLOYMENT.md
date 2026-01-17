# Vercel Configuration

## Build Settings
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## Environment Variables (Add these in Vercel Dashboard)

```
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your_api_key_here
VITE_APP_URL=https://your-app.vercel.app
```

## Deployment Steps

1. Push code to GitHub repository
2. Import project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

## Google OAuth Setup for Production

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Add your Vercel URL to Authorized JavaScript origins:
   - `https://your-app.vercel.app`
3. Add to Authorized redirect URIs:
   - `https://your-app.vercel.app`
4. Save changes

## SPA Routing Configuration

Vercel automatically handles SPA routing for Vite apps. The `vercel.json` configuration ensures all routes are directed to `index.html`.

## Post-Deployment Checklist

- [ ] Test Google OAuth login
- [ ] Test QR code generation
- [ ] Test share links (e.g., `/share/abc123`)
- [ ] Verify photo upload works
- [ ] Check folder creation
- [ ] Test on mobile devices
