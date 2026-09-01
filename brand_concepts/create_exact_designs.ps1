Add-Type -AssemblyName System.Drawing

$p1 = Resolve-Path "brand_concepts\concept_1_compass_star.jpg"
$p2 = Resolve-Path "brand_concepts\concept_2_monogram_a.jpg"

$bmp1 = [System.Drawing.Bitmap]::FromFile($p1)
$bmp2 = [System.Drawing.Bitmap]::FromFile($p2)

# ====================================================================
# 1. CREATE EXACT AETHER LOGO (Exact 'A' + Exact 'AETHER' & 'SCHOLARLY INTELLIGENCE')
# ====================================================================
$logo = New-Object System.Drawing.Bitmap(1024, 1024)
$gLogo = [System.Drawing.Graphics]::FromImage($logo)
$gLogo.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gLogo.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

# Sample background color in the gap region
$bgColor = $bmp2.GetPixel(512, 645)

# Copy top part (the exact 'A' monogram from concept 2) from Y=0 to Y=645
$srcRectA = New-Object System.Drawing.Rectangle(0, 0, 1024, 645)
$dstRectA = New-Object System.Drawing.Rectangle(0, 0, 1024, 645)
$gLogo.DrawImage($bmp2, $dstRectA, $srcRectA, [System.Drawing.GraphicsUnit]::Pixel)

# Copy bottom part (the exact 'AETHER' & 'SCHOLARLY INTELLIGENCE' text from concept 1) from Y=655 to Y=1024
$srcRectText = New-Object System.Drawing.Rectangle(0, 655, 1024, 369)
$dstRectText = New-Object System.Drawing.Rectangle(0, 655, 1024, 369)
$gLogo.DrawImage($bmp1, $dstRectText, $srcRectText, [System.Drawing.GraphicsUnit]::Pixel)

# Blend the 10px seam (Y=645 to Y=655) seamlessly with gradient interpolation
for ($y = 640; $y -le 660; $y++) {
    $alpha = ($y - 640.0) / 20.0
    for ($x = 0; $x -lt 1024; $x++) {
        $c2 = $bmp2.GetPixel($x, $y)
        $c1 = $bmp1.GetPixel($x, $y)
        $r = [int]($c2.R * (1 - $alpha) + $c1.R * $alpha)
        $g = [int]($c2.G * (1 - $alpha) + $c1.G * $alpha)
        $b = [int]($c2.B * (1 - $alpha) + $c1.B * $alpha)
        $logo.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $r, $g, $b))
    }
}

$logoPath = Join-Path (Get-Location) "brand_concepts\exact_aether_logo.jpg"
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]98)
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$logo.Save($logoPath, $jpegCodec, $encoderParams)
Write-Host "Created exact_aether_logo.jpg successfully!"

# ====================================================================
# 2. CREATE EXACT CELESTIAL STAR EMBLEM WITHOUT TEXT (from concept 1)
# ====================================================================
# In concept 1, the star and orbits span Y=0 to ~640.
# We remove the text (Y >= 650) and mirror/extend the clean space gradient downwards so the star sits majestically in the center.
$starEmblem = New-Object System.Drawing.Bitmap(1024, 1024)
$gStar = [System.Drawing.Graphics]::FromImage($starEmblem)
$gStar.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gStar.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

# Draw the exact star & orbit emblem (Y=0 to Y=645) shifted down by ~80px so it is perfectly centered
$starShiftY = 60
$srcRectStar = New-Object System.Drawing.Rectangle(0, 0, 1024, 645)
$dstRectStar = New-Object System.Drawing.Rectangle(0, $starShiftY, 1024, 645)

# Fill background with the exact dark slate gradient matching concept 1
for ($y = 0; $y -lt 1024; $y++) {
    # Sample background color along left edge
    $edgeColor = $bmp1.GetPixel(30, [Math]::Min($y, 1023))
    $pen = New-Object System.Drawing.Pen($edgeColor, 1)
    $gStar.DrawLine($pen, 0, $y, 1023, $y)
    $pen.Dispose()
}

# Overlay the exact star emblem from concept 1
$gStar.DrawImage($bmp1, $dstRectStar, $srcRectStar, [System.Drawing.GraphicsUnit]::Pixel)

# Smooth the bottom transition
for ($y = (640 + $starShiftY); $y -le [Math]::Min(1023, (665 + $starShiftY)); $y++) {
    $alpha = ($y - (640 + $starShiftY)) / 25.0
    for ($x = 0; $x -lt 1024; $x++) {
        $cStar = $starEmblem.GetPixel($x, $y)
        $cBg = $bmp1.GetPixel(30, $y)
        $r = [int]($cStar.R * (1 - $alpha) + $cBg.R * $alpha)
        $g = [int]($cStar.G * (1 - $alpha) + $cBg.G * $alpha)
        $b = [int]($cStar.B * (1 - $alpha) + $cBg.B * $alpha)
        $starEmblem.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $r, $g, $b))
    }
}

$emblemPath = Join-Path (Get-Location) "brand_concepts\exact_celestial_emblem.jpg"
$starEmblem.Save($emblemPath, $jpegCodec, $encoderParams)
Write-Host "Created exact_celestial_emblem.jpg successfully!"

# Also create widescreen 16:9 banner version (1920 x 1080) for backdrop usage
$backdrop = New-Object System.Drawing.Bitmap(1920, 1080)
$gBackdrop = [System.Drawing.Graphics]::FromImage($backdrop)
$gBackdrop.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gBackdrop.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

# Background fill with subtle cosmic glow
$centerColor = [System.Drawing.Color]::FromArgb(255, 14, 24, 42)
$outerColor = [System.Drawing.Color]::FromArgb(255, 8, 12, 20)
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(960, 0)),
    (New-Object System.Drawing.Point(960, 1080)),
    $centerColor,
    $outerColor
)
$gBackdrop.FillRectangle($brush, 0, 0, 1920, 1080)
$brush.Dispose()

# Draw centered star emblem (scale 1000x1000 centered in 1920x1080)
$dstBackdropRect = New-Object System.Drawing.Rectangle(460, 40, 1000, 1000)
$srcStarRect = New-Object System.Drawing.Rectangle(0, 0, 1024, 1024)
$gBackdrop.DrawImage($starEmblem, $dstBackdropRect, $srcStarRect, [System.Drawing.GraphicsUnit]::Pixel)

$backdropPath = Join-Path (Get-Location) "brand_concepts\exact_celestial_backdrop_16x9.jpg"
$backdrop.Save($backdropPath, $jpegCodec, $encoderParams)
Write-Host "Created exact_celestial_backdrop_16x9.jpg successfully!"

$bmp1.Dispose()
$bmp2.Dispose()
$logo.Dispose()
$starEmblem.Dispose()
$backdrop.Dispose()
$gLogo.Dispose()
$gStar.Dispose()
$gBackdrop.Dispose()
