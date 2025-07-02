# AI API Key Setup Instructions

## Issue

Your Groq API key appears to be invalid or expired, which is causing the AI functionality to fail in your built app.

## Solution Steps

### 1. Get a New Groq API Key

1. Go to [Groq Console](https://console.groq.com)
2. Create an account or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (it will start with `gsk_`)

### 2. Update Your Configuration

Once you have the new API key, update it in this file:
`src/config/productionConfig.ts`

Replace the current API key in the GROQ.API_KEY field with your new key.

### 3. Alternative: Use Environment Variables (Recommended for Production)

Create a `.env` file in your project root and add:

```
EXPO_PUBLIC_GROQ_API_KEY=your_new_api_key_here
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### 4. Test Locally

Run this command to test the AI functionality:

```bash
node scripts/test-ai-simple.js
```

### 5. Rebuild Your App

After updating the API key, rebuild your APK:

```bash
eas build -p android --profile apk
```

## Current Build Status

Your app has been configured to handle both environment variables and hardcoded values as fallbacks. The AI service has been updated to use the centralized configuration.

## Files Modified

- `src/config/productionConfig.ts` - Centralized configuration
- `src/config/aiConfig.ts` - Updated to use centralized config
- `src/constants/config.ts` - Updated Supabase config
- `src/services/groqService.ts` - Fixed to use config instead of env vars

## Next Steps

1. Get a valid Groq API key
2. Update the configuration
3. Test locally
4. Rebuild the app
