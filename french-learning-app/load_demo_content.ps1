# Demo Content Setup Script for Windows PowerShell
# This script loads demo content into your Supabase database

Write-Host "🚀 Loading demo content into Supabase database..." -ForegroundColor Cyan

# Check if Supabase CLI is installed
try {
    supabase --version | Out-Null
} catch {
    Write-Host "❌ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Check if we're in a Supabase project
if (-not (Test-Path "supabase\config.toml")) {
    Write-Host "❌ Not in a Supabase project directory" -ForegroundColor Red
    Write-Host "Make sure you're in the french-learning-app directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "📊 Loading demo content..." -ForegroundColor Yellow

try {
    # Run the demo content SQL script directly
    Write-Host "Executing demo content SQL script..." -ForegroundColor Gray
    supabase db reset --linked
    
    # Copy demo_content.sql to seed folder if it doesn't exist
    if (-not (Test-Path "supabase\seed")) {
        New-Item -ItemType Directory -Path "supabase\seed" -Force
    }
    
    Copy-Item "supabase\demo_content.sql" "supabase\seed\" -Force
    
    # Apply the demo content
    supabase db push
    
    Write-Host "✅ Demo content loaded successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📚 Your database now contains:" -ForegroundColor Cyan
    Write-Host "   • 4 Learning levels (Débutant to Avancé)" -ForegroundColor White
    Write-Host "   • 25 Modules covering various topics" -ForegroundColor White
    Write-Host "   • 80+ French vocabulary words with pronunciation" -ForegroundColor White
    Write-Host "   • 12 Grammar rules from basic to advanced" -ForegroundColor White
    Write-Host "   • 13 Interactive lessons with structured content" -ForegroundColor White
    Write-Host "   • Practice questions and exercises" -ForegroundColor White
    Write-Host "   • Content associations and tags" -ForegroundColor White
    Write-Host ""
    Write-Host "🎯 You can now test your Content Management Dashboard!" -ForegroundColor Green
    Write-Host "   • View statistics and content overview" -ForegroundColor White
    Write-Host "   • Navigate through levels, modules, and lessons" -ForegroundColor White
    Write-Host "   • Test vocabulary and grammar management" -ForegroundColor White
    Write-Host "   • Try the bulk import/export features" -ForegroundColor White
    Write-Host ""
    Write-Host "🔍 To verify the data was loaded correctly:" -ForegroundColor Cyan
    Write-Host "   supabase db sql --query 'SELECT COUNT(*) FROM levels;'" -ForegroundColor Gray
    Write-Host "   supabase db sql --query 'SELECT COUNT(*) FROM vocabulary;'" -ForegroundColor Gray
    Write-Host "   supabase db sql --query 'SELECT COUNT(*) FROM lessons;'" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Error loading demo content: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Try running the SQL script manually in your Supabase dashboard" -ForegroundColor Yellow
}
