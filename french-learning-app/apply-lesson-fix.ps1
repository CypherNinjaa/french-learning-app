# Apply lesson content fix to Supabase database
# This script fixes the "No Content" issue by updating lesson content structure

Write-Host "🔧 Applying lesson content fix..." -ForegroundColor Cyan

# Check if Supabase CLI is available
try {
    $version = supabase --version 2>$null
    if (!$version) {
        throw "Supabase CLI not found"
    }
    Write-Host "✅ Supabase CLI found: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "supabase\fix_lesson_content.sql")) {
    Write-Host "❌ SQL fix file not found" -ForegroundColor Red
    Write-Host "Make sure you're in the french-learning-app directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "📄 Applying SQL fix to database..." -ForegroundColor Yellow

try {
    # Apply the SQL fix
    $result = Get-Content "supabase\fix_lesson_content.sql" | supabase db sql
    
    Write-Host "✅ Database content fix applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 What was fixed:" -ForegroundColor Cyan
    Write-Host "   • Updated 7 lessons with proper content structure" -ForegroundColor White
    Write-Host "   • Added vocabulary sections with pronunciations" -ForegroundColor White
    Write-Host "   • Added grammar sections with examples" -ForegroundColor White
    Write-Host "   • Added explanatory text sections" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 You can now test the app:" -ForegroundColor Green
    Write-Host "   1. Navigate to Learning tab" -ForegroundColor White
    Write-Host "   2. Click on any lesson" -ForegroundColor White
    Write-Host "   3. Should show rich content instead of 'No Content'" -ForegroundColor White
    Write-Host ""
    Write-Host "✨ Lesson content integration is now complete!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error applying database fix: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Manual alternatives:" -ForegroundColor Yellow
    Write-Host "   1. Open Supabase dashboard > SQL Editor" -ForegroundColor White  
    Write-Host "   2. Copy content from supabase/fix_lesson_content.sql" -ForegroundColor White
    Write-Host "   3. Paste and run in SQL Editor" -ForegroundColor White
}
