# Deployment to Vercel

Your French Learning App web version is ready to deploy to Vercel!

## Files Created:

- `vercel.json` - Vercel configuration
- `dist/` folder - Built web version (created by `npm run build:web`)

## Deployment Steps:

### Option 1: Vercel CLI (Recommended)

1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

### Option 2: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will automatically detect the configuration

## Environment Variables on Vercel:

After deployment, add these environment variables in your Vercel dashboard:

1. `EXPO_PUBLIC_SUPABASE_URL` = `[Your Supabase URL]`
2. `EXPO_PUBLIC_SUPABASE_ANON_KEY` = `[Your Supabase Anon Key]`
3. `EXPO_PUBLIC_GROQ_API_KEY` = `[Your Groq API Key]`
4. `EXPO_PUBLIC_APP_ENV` = `production`

## Build Commands:

- Build: `npm run build:web`
- Local preview: `npm run web`

## Notes:

- The web version works with your existing Supabase backend
- All lesson progression features work on web
- Some mobile-specific features (like device storage) use web equivalents

Your app is now ready for web deployment! 🚀
