# PowerShell script to update ALL image references to WebP format across the entire codebase

$webPath = "c:\Users\DomasLalas\Documents\GitHub\web"

Write-Host "🔍 Searching for all files with services image references..." -ForegroundColor Blue

# Find all files that contain /media/services/ references
$filesToUpdate = Get-ChildItem -Path "$webPath\src" -Recurse -Include "*.astro", "*.mdx", "*.md", "*.ts", "*.js" | 
    Where-Object { 
        $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
        $content -and $content -match '/media/services/.*\.(png|jpg|jpeg)(?!\.webp)'
    }

Write-Host "📁 Found $($filesToUpdate.Count) files to update:" -ForegroundColor Yellow
$filesToUpdate | ForEach-Object { Write-Host "   - $($_.Name)" -ForegroundColor Gray }

Write-Host "`n🔧 Starting updates..." -ForegroundColor Green

$totalUpdates = 0

foreach ($file in $filesToUpdate) {
    Write-Host "`n📝 Processing: $($file.Name)" -ForegroundColor Cyan
    
    try {
        $content = Get-Content -Path $file.FullName -Raw
        $originalContent = $content
        $fileUpdates = 0
        
        # Replace PNG references
        $pngMatches = [regex]::Matches($content, '(/media/services/[^''""\s]+)\.png(?!\.webp)')
        foreach ($match in $pngMatches) {
            $oldPath = $match.Groups[0].Value
            $newPath = $match.Groups[1].Value + '.webp'
            $content = $content.Replace($oldPath, $newPath)
            $fileUpdates++
            Write-Host "   ✓ $oldPath → $newPath" -ForegroundColor Green
        }
        
        # Replace JPG references
        $jpgMatches = [regex]::Matches($content, '(/media/services/[^''""\s]+)\.jpg(?!\.webp)')
        foreach ($match in $jpgMatches) {
            $oldPath = $match.Groups[0].Value
            $newPath = $match.Groups[1].Value + '.webp'
            $content = $content.Replace($oldPath, $newPath)
            $fileUpdates++
            Write-Host "   ✓ $oldPath → $newPath" -ForegroundColor Green
        }
        
        # Replace JPEG references
        $jpegMatches = [regex]::Matches($content, '(/media/services/[^''""\s]+)\.jpeg(?!\.webp)')
        foreach ($match in $jpegMatches) {
            $oldPath = $match.Groups[0].Value
            $newPath = $match.Groups[1].Value + '.webp'
            $content = $content.Replace($oldPath, $newPath)
            $fileUpdates++
            Write-Host "   ✓ $oldPath → $newPath" -ForegroundColor Green
        }
        
        # Fix double extensions like .png.webp
        $content = $content -replace '(/media/services/[^''""\s]+)\.png\.webp', '$1.webp'
        $content = $content -replace '(/media/services/[^''""\s]+)\.jpg\.webp', '$1.webp'
        $content = $content -replace '(/media/services/[^''""\s]+)\.jpeg\.webp', '$1.webp'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            $totalUpdates += $fileUpdates
            Write-Host "   💾 Saved $fileUpdates changes" -ForegroundColor Green
        } else {
            Write-Host "   ⚪ No changes needed" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "   ❌ Error processing file: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Update completed!" -ForegroundColor Green
Write-Host "📊 Total updates made: $totalUpdates" -ForegroundColor Yellow

# Verify results
Write-Host "`n🔍 Verifying results..." -ForegroundColor Blue
$remainingFiles = Get-ChildItem -Path "$webPath\src" -Recurse -Include "*.astro", "*.mdx", "*.md", "*.ts", "*.js" | 
    Where-Object { 
        $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
        $content -and $content -match '/media/services/.*\.(png|jpg|jpeg)(?!\.webp)'
    }

if ($remainingFiles.Count -eq 0) {
    Write-Host "✅ Success! No more PNG/JPG references found in services images." -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: $($remainingFiles.Count) files still have PNG/JPG references:" -ForegroundColor Yellow
    $remainingFiles | ForEach-Object { Write-Host "   - $($_.Name)" -ForegroundColor Yellow }
}
