Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force -Path "assets\images" | Out-Null
$srcPath = "C:\Users\Hype\.gemini\antigravity\brain\fb03d5ab-8f88-4aa8-be8a-102826a15662\.user_uploaded\media_1793368445727_29fd9d88.jpg"
$img = [System.Drawing.Image]::FromFile($srcPath)

function Crop-Image($x, $y, $w, $h, $outputPath) {
    $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $g.DrawImage($img, $destRect, $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Saved $outputPath"
}

# Hero pets: top-right of 1st screen
Crop-Image 172 58 165 140 "assets\images\hero-pets.jpg"

# Clinic building: top-right of 2nd screen
Crop-Image 542 55 114 96 "assets\images\clinic.jpg"

# Login pets: bottom-left of 8th screen
Crop-Image 362 510 135 135 "assets\images\login-pets.jpg"

# Pet Mochi: center screen
Crop-Image 448 286 44 48 "assets\images\mochi.jpg"

# Pet Luna (Cat): vaccination list
Crop-Image 190 577 22 22 "assets\images\luna.jpg"

# Pet Oreo (Dog): vaccination list
Crop-Image 190 621 22 22 "assets\images\oreo.jpg"

$img.Dispose()
Write-Host "Asset extraction complete!"
