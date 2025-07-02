// Production Configuration
// This file contains the actual API keys and configuration needed for the app to work
// In a real production app, these would be environment variables

export const PRODUCTION_CONFIG = {
  // Supabase Configuration (replace with your actual values)
  SUPABASE: {
    URL: 'https://ozcdaztxzadwdytuzfay.supabase.co', // Your actual URL
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96Y2RhenR4emFkd2R5dHV6ZmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMjg3MDQsImV4cCI6MjA2NTcwNDcwNH0.bFWfC7Ndo_AXb0sILIfLEAo_jZpy_J1h-KrZL9nQHJk' // Your actual key
  },
  
  // Groq AI Configuration
  GROQ: {
    API_KEY: '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'
  },

  // App Environment
  APP_ENV: 'production'
};

// Helper function to safely get environment variables
const getEnvVar = (key: string, fallback: string): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || fallback;
  }
  return fallback;
};

// Export the configuration with fallbacks
export const getConfig = () => {
  return {
    supabase: {
      url: getEnvVar('EXPO_PUBLIC_SUPABASE_URL', PRODUCTION_CONFIG.SUPABASE.URL),
      anonKey: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY', PRODUCTION_CONFIG.SUPABASE.ANON_KEY)
    },
    groq: {
      apiKey: getEnvVar('EXPO_PUBLIC_GROQ_API_KEY', PRODUCTION_CONFIG.GROQ.API_KEY)
    },
    appEnv: getEnvVar('EXPO_PUBLIC_APP_ENV', PRODUCTION_CONFIG.APP_ENV)
  };
};
