Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\sahim\.gemini\antigravity-ide\brain\77494001-0719-4b66-a955-309a7f2a0f04\student_avatars_row_1789336262921.jpg"
$destDir = "c:\Users\sahim\Desktop\msj\public"

$img = [System.Drawing.Image]::FromFile($sourcePath)
$w = $img.Width
$h = $img.Height
Write-Host "Source image size: $w x $h"

# 4 avatars horizontally distributed across the 16:9 image
# Width is around 1792 or 1280.
# The 4 circles are roughly located at:
# 1st circle: x = 0.02 * w to 0.26 * w
# 2nd circle: x = 0.26 * w to 0.50 * w
# 3rd circle: x = 0.50 * w to 0.74 * w
# 4th circle: x = 0.74 * w to 0.98 * w

# Let's calculate precise box for each avatar
$avatarW = [int]($w * 0.24)
$avatarH = [int]($h * 0.46)
$boxSize = [Math]::Min($avatarW, $avatarH)
$yOffset = [int]($h * 0.27)

for ($i = 0; $i -lt 4; $i++) {
    $xOffset = [int]($w * (0.025 + $i * 0.245))
    
    $bmp = New-Object System.Drawing.Bitmap($boxSize, $boxSize)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $srcRect = New-Object System.Drawing.Rectangle($xOffset, $yOffset, $boxSize, $boxSize)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $boxSize, $boxSize)
    
    $g.DrawImage($img, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    
    $outPath = Join-Path $destDir "student-avatar-$($i + 1).jpg"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $bmp.Dispose()
    Write-Host "Saved: $outPath"
}

$img.Dispose()
Write-Host "All 4 avatars cropped successfully!"
