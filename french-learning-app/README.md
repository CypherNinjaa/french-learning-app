# French Learning App

A comprehensive French learning application built with React Native and Expo, featuring AI-powered practice sessions, adaptive learning, and gamification.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- Git

### Environment Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd french-learning-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # Copy the example environment file
   cp .env.example .env
   ```

4. **Configure your API keys**

   Edit the `.env` file and replace the placeholder values:

   ```bash
   # Supabase Configuration (required)
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Groq AI Configuration (required)
   EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key

   # App Environment
   EXPO_PUBLIC_APP_ENV=development
   ```

   **Where to get API keys:**

   - **Supabase**: Sign up at [supabase.com](https://supabase.com), create a project, go to Settings → API
   - **Groq**: Sign up at [console.groq.com](https://console.groq.com), go to API Keys

5. **Run the application**
   ```bash
   npx expo start
   ```

## 🔐 Security Notes

- **Never commit your `.env` file** - It contains sensitive API keys
- The `.env` file is already in `.gitignore` to prevent accidental commits
- Use `.env.example` as a template for new developers
- For production deployment, set environment variables in your hosting platform

## 🧰 Environment Variables

| Variable                        | Description                              | Required |
| ------------------------------- | ---------------------------------------- | -------- |
| `EXPO_PUBLIC_SUPABASE_URL`      | Your Supabase project URL                | ✅       |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key              | ✅       |
| `EXPO_PUBLIC_GROQ_API_KEY`      | Your Groq AI API key                     | ✅       |
| `EXPO_PUBLIC_APP_ENV`           | App environment (development/production) | ❌       |

## 🔧 Development

```bash
# Start development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Build for production
npx expo build
```

## 📱 Features

- 🤖 **AI-Powered Learning**: Personalized exercises using Groq AI
- 📚 **Adaptive Practice**: Sessions adapt to your learning progress
- 🎯 **Focused Training**: Target specific weak areas
- ⚡ **Quick Practice**: Time-limited rapid-fire exercises
- 📊 **Progress Analytics**: Track your learning journey
- 🎮 **Gamification**: Points, streaks, and achievements
- 💬 **Conversational AI**: Practice French conversations

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
├── services/           # API services (Groq, Supabase)
├── config/             # Configuration files
├── contexts/           # React contexts
├── constants/          # App constants and theme
└── types/              # TypeScript type definitions
```

## 🛡️ Security Best Practices

1. **API Key Management**

   - Store in environment variables only
   - Use different keys for development/production
   - Rotate keys regularly

2. **Git Security**

   - Never commit sensitive data
   - Use `.gitignore` effectively
   - Review commits before pushing

3. **Production Deployment**
   - Set environment variables in hosting platform
   - Use secure HTTPS endpoints
   - Enable proper CORS settings

## 🚨 Troubleshooting

### Common Issues

**"Missing required environment variable" error:**

- Check your `.env` file exists and has all required variables
- Restart the development server after changing environment variables

**"Groq API error: 401":**

- Verify your `EXPO_PUBLIC_GROQ_API_KEY` is correct
- Check if your Groq API key has expired

**Supabase connection issues:**

- Verify your `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Check Supabase project status

## 📄 License

This project is licensed under the MIT License.
