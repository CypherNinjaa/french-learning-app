// Production Configuration

// This file contains fallback configuration when environment variables are not available
// The actual API keys should be stored in .env file (not committed to Git)

export const PRODUCTION_CONFIG = {
  // Supabase Configuration (fallback values only)
  SUPABASE: {
    URL: '', // Leave empty - use environment variables
    ANON_KEY: '' // Leave empty - use environment variables
  },
  
  // Groq AI Configuration (fallback values only)
  GROQ: {
    API_KEY: '' // Leave empty - use environment variables

  },

  // App Environment
  APP_ENV: 'production'
};


// Helper function to safely get environment variables with validation
const getEnvVar = (key: string, fallback: string): string => {
  let value = fallback;
  
  // In React Native/Expo, environment variables are available at build time
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    value = process.env[key];
  }
  
  // Validate that required API keys are not empty
  if (!value && (key.includes('API_KEY') || key.includes('URL') || key.includes('ANON_KEY'))) {
    console.error(`❌ Missing required environment variable: ${key}`);
    console.error(`Please add ${key} to your .env file`);
    // Don't throw error in production, just log warning
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`Missing required environment variable: ${key}. Please check your .env file.`);
    }
  }
  
  return value;
};

// Export the configuration with environment variable validation
export const getConfig = () => {
  const config = {

    supabase: {
      url: getEnvVar('EXPO_PUBLIC_SUPABASE_URL', PRODUCTION_CONFIG.SUPABASE.URL),
      anonKey: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY', PRODUCTION_CONFIG.SUPABASE.ANON_KEY)
    },
    groq: {
      apiKey: getEnvVar('EXPO_PUBLIC_GROQ_API_KEY', PRODUCTION_CONFIG.GROQ.API_KEY)
    },
    appEnv: getEnvVar('EXPO_PUBLIC_APP_ENV', PRODUCTION_CONFIG.APP_ENV)
  };

  // Log configuration status (without exposing keys)
  console.log('🔧 App Configuration Loaded:');
  console.log(`   Supabase URL: ${config.supabase.url ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Supabase Key: ${config.supabase.anonKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Groq API Key: ${config.groq.apiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Environment: ${config.appEnv}`);
  
  return config;

};
