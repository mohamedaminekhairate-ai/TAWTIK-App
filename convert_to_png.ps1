Add-Type -AssemblyName System.Drawing
$iconPath = "c:\Users\dell\OneDrive\Bureau\Project_test\assets\images\icon-square.png"
$outputPath = "c:\Users\dell\OneDrive\Bureau\Project_test\assets\images\icon-square-final.png"

try {
    $image = [System.Drawing.Image]::FromFile($iconPath)
    $image.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $image.Dispose()
    # Replace the original with the fixed one
    Move-Item -Force $outputPath $iconPath
    Write-Host "Successfully converted to PNG."
} catch {
    Write-Error "Failed to convert image: $_"
    exit 1
}
