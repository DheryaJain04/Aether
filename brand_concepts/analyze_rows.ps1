Add-Type -AssemblyName System.Drawing

$bmp1 = [System.Drawing.Bitmap]::FromFile((Resolve-Path "brand_concepts\concept_1_compass_star.jpg"))
$bmp2 = [System.Drawing.Bitmap]::FromFile((Resolve-Path "brand_concepts\concept_2_monogram_a.jpg"))

Write-Host "Analyzing row brightness around text region..."

for ($y = 550; $y -lt 1000; $y += 15) {
    $rowBright1 = 0
    $rowBright2 = 0
    for ($x = 200; $x -lt 824; $x += 10) {
        $c1 = $bmp1.GetPixel($x, $y)
        $c2 = $bmp2.GetPixel($x, $y)
        $rowBright1 += ($c1.R + $c1.G + $c1.B)
        $rowBright2 += ($c2.R + $c2.G + $c2.B)
    }
    Write-Host "Y=$y : Img1 Brightness=$rowBright1 | Img2 Brightness=$rowBright2"
}

$bmp1.Dispose()
$bmp2.Dispose()
