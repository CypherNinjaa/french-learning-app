#!/bin/bash

# French Learning App - Environment Setup Script
# This script helps you set up the development environment

echo "🚀 Setting up French Learning App development environment..."

# Check if .env exists
if [ -f .env ]; then
    echo "✅ .env file already exists"
else
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: You need to edit .env and add your API keys!"
    echo "   1. Get Supabase keys from: https://app.supabase.com"
    echo "   2. Get Groq API key from: https://console.groq.com"
    echo "   3. Edit .env file and replace placeholder values"
    echo ""
fi

# Check if node_modules exists
if [ -d node_modules ]; then
    echo "✅ Dependencies already installed"
else
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Run: npx expo start"
echo "3. Scan QR code with Expo Go app"
echo ""
echo "Need help? Check README.md for detailed instructions"
