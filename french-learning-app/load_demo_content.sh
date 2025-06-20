#!/bin/bash

# Demo Content Setup Script
# This script loads demo content into your Supabase database

echo "🚀 Loading demo content into Supabase database..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory"
    echo "Make sure you're in the french-learning-app directory"
    exit 1
fi

echo "📊 Loading demo content..."

# Run the demo content SQL script
supabase db reset --linked
supabase db push
supabase db seed --with demo_content.sql

echo "✅ Demo content loaded successfully!"
echo ""
echo "📚 Your database now contains:"
echo "   • 4 Learning levels (Débutant to Avancé)"
echo "   • 25 Modules covering various topics"
echo "   • 80+ French vocabulary words with pronunciation"
echo "   • 12 Grammar rules from basic to advanced"
echo "   • 13 Interactive lessons with structured content"
echo "   • Practice questions and exercises"
echo "   • Content associations and tags"
echo ""
echo "🎯 You can now test your Content Management Dashboard!"
echo "   • View statistics and content overview"
echo "   • Navigate through levels, modules, and lessons"
echo "   • Test vocabulary and grammar management"
echo "   • Try the bulk import/export features"
echo ""
echo "🔍 To verify the data was loaded correctly:"
echo "   supabase db sql --query 'SELECT COUNT(*) FROM levels;'"
echo "   supabase db sql --query 'SELECT COUNT(*) FROM vocabulary;'"
echo "   supabase db sql --query 'SELECT COUNT(*) FROM lessons;'"
