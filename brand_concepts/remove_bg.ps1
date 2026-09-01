Add-Type -AssemblyName System.Drawing

$srcPath = Resolve-Path "brand_concepts\exact_aether_logo.jpg"
$src = [System.Drawing.Bitmap]::FromFile($srcPath)
$width = $src.Width
$height = $src.Height

# Create ARGB 32-bit transparent bitmap
$png = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Background threshold: The dark background has max(R,G,B) around 15-28
# We want pure dark pixels to be alpha=0, and glowing edges to smoothly transition.
for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
        $c = $src.GetPixel($x, $y)
        
        # Brightness measure
        $maxVal = [Math]::Max($c.R, [Math]::Max($c.G, $c.B))
        $luminance = 0.299 * $c.R + 0.587 * $c.G + 0.114 * $c.B

        if ($maxVal -le 24) {
            # Completely transparent background
            $png.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } elseif ($maxVal -lt 55) {
            # Soft smooth alpha falloff for outer aura
            $alphaRatio = ($maxVal - 24) / (55.0 - 24.0)
            $alpha = [int]($alphaRatio * $alphaRatio * 255)
            $alpha = [Math]::Max(0, [Math]::Min(255, $alpha))
            $png.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
        } else {
            # Solid glowing logo content
            $png.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
        }
    }
}

# Save as transparent PNG
$outPath = Join-Path (Get-Location) "brand_concepts\exact_aether_logo_transparent.png"
$png.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created exact_aether_logo_transparent.png successfully!"

# Also create an isolated ICON-ONLY transparent PNG (the 'A' mark only, cropping out text)
$iconRect = New-Object System.Drawing.Rectangle(120, 100, 784, 550)
$iconPng = New-Object System.Drawing.Bitmap(784, 550, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($iconPng)
$g.DrawImage($png, (New-Object System.Drawing.Rectangle(0, 0, 784, 550)), $iconRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

$iconOutPath = Join-Path (Get-Location) "brand_concepts\exact_aether_icon_transparent.png"
$iconPng.Save($iconOutPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created exact_aether_icon_transparent.png successfully!"

$src.Dispose()
$png.Dispose()
$iconPng.Dispose()
