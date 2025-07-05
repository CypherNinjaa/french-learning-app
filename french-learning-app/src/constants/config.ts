// Environment configuration
// This file should be copied to .env and filled with actual values

import { getConfig } from '../config/productionConfig';

const config = getConfig();

// Supabase Configuration
export const supabaseConfig = {
	url: config.supabase.url,
	anonKey: config.supabase.anonKey,
};

// App Configuration
export const appConfig = {
	name: "FrenchMaster",
	version: "1.0.0",
	stage: "development",
};

// Feature Flags
export const features = {
	speechRecognition: false, // Will be enabled in Stage 5
	aiIntegration: false, // Will be enabled in Stage 6
	offlineMode: false, // Will be enabled in Stage 7
};
