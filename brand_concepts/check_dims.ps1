Add-Type -AssemblyName System.Drawing

$p1 = Resolve-Path "brand_concepts\concept_1_compass_star.jpg"
$p2 = Resolve-Path "brand_concepts\concept_2_monogram_a.jpg"

$bmp1 = [System.Drawing.Bitmap]::FromFile($p1)
$bmp2 = [System.Drawing.Bitmap]::FromFile($p2)

Write-Host "Concept 1 Size: $($bmp1.Width) x $($bmp1.Height)"
Write-Host "Concept 2 Size: $($bmp2.Width) x $($bmp2.Height)"

$bmp1.Dispose()
$bmp2.Dispose()
