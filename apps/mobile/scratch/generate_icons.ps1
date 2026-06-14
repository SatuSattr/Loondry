Add-Type -AssemblyName System.Drawing

function Create-CenteredImage($logoPath, $outPath, $width, $height, $logoWidth, $bgColorString, $isTransparent) {
    # Load logo
    $logo = [System.Drawing.Image]::FromFile($logoPath)
    
    # Calculate scale
    $scale = $logoWidth / $logo.Width
    $logoHeight = [int]($logo.Height * $scale)
    
    # Create target bitmap
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    # Graphics settings for high quality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    # Fill background
    if ($isTransparent -eq $false) {
        $color = [System.Drawing.ColorTranslator]::FromHtml($bgColorString)
        $brush = New-Object System.Drawing.SolidBrush($color)
        $g.FillRectangle($brush, 0, 0, $width, $height)
        $brush.Dispose()
    } else {
        $g.Clear([System.Drawing.Color]::Transparent)
    }
    
    # Draw logo centered
    $x = [int](($width - $logoWidth) / 2)
    $y = [int](($height - $logoHeight) / 2)
    $g.DrawImage($logo, $x, $y, $logoWidth, $logoHeight)
    
    # Save image
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Clean up
    $g.Dispose()
    $bmp.Dispose()
    $logo.Dispose()
}

# 1. Create App Icon (assets/icon.png) - 1024x1024, blue background (#4196d2), white logo
Create-CenteredImage "assets/loondry-logo-white.png" "assets/icon.png" 1024 1024 450 "#4196d2" $false

# 2. Create Android Adaptive Icon Foreground (assets/android-icon-foreground.png) - 512x512, transparent, colored logo
Create-CenteredImage "assets/loondry-logo-colored.png" "assets/android-icon-foreground.png" 512 512 240 "" $true

# 3. Create Android Adaptive Icon Background (assets/android-icon-background.png) - 512x512, solid #E6F4FE
$bmpBg = New-Object System.Drawing.Bitmap(512, 512)
$gBg = [System.Drawing.Graphics]::FromImage($bmpBg)
$colorBg = [System.Drawing.ColorTranslator]::FromHtml("#E6F4FE")
$gBg.Clear($colorBg)
$bmpBg.Save("assets/android-icon-background.png", [System.Drawing.Imaging.ImageFormat]::Png)
$gBg.Dispose()
$bmpBg.Dispose()

# 4. Create Android Adaptive Icon Monochrome (assets/android-icon-monochrome.png) - 512x512, transparent, white logo
Create-CenteredImage "assets/loondry-logo-white.png" "assets/android-icon-monochrome.png" 512 512 240 "" $true

# 5. Create Splash Screen Icon (assets/splash-icon.png) - 2048x2048, transparent, horizontal brand white logo
Create-CenteredImage "assets/loondry-logo-brand-white.png" "assets/splash-icon.png" 2048 2048 1500 "" $true

# 6. Create Favicon (assets/favicon.png) - 48x48, transparent, colored logo
Create-CenteredImage "assets/loondry-logo-colored.png" "assets/favicon.png" 48 48 36 "" $true

Write-Host "Images generated successfully!"
