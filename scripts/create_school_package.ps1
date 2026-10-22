Add-Type -AssemblyName System.IO.Compression.FileSystem

$sourceDir = "d:\VIBECODES\APLIKASI PERPUSTAKAAN SBTH"
$targetZip = "d:\VIBECODES\PAKET_INSTALASI_PERPUSTAKAAN_SBTH_SEKOLAH.zip"
$desktopDir = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$desktopZip = Join-Path $desktopDir "PAKET_INSTALASI_PERPUSTAKAAN_SBTH_SEKOLAH.zip"

Write-Host "Menyiapkan paket sekolah..."
if (Test-Path $targetZip) { Remove-Item -Force $targetZip }

# Temporary staging to avoid copying .git directory
$tempStage = Join-Path $env:TEMP "SBTH_School_Stage"
if (Test-Path $tempStage) { Remove-Item -Recurse -Force $tempStage }
New-Item -ItemType Directory -Path $tempStage | Out-Null

$itemsToInclude = @(
    "Perpustakaan SBTH.exe",
    "PANDUAN_PENGGUNAAN.md",
    "README.md",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "next.config.ts",
    "INSTALLER_PENDUKUNG",
    "DOKUMENTASI_DAN_PANDUAN",
    "public",
    "src",
    ".next",
    "node_modules"
)

foreach ($item in $itemsToInclude) {
    $srcPath = Join-Path $sourceDir $item
    if (Test-Path $srcPath) {
        Copy-Item -Path $srcPath -Destination (Join-Path $tempStage $item) -Recurse -Force
    }
}

Write-Host "Mengompresi ke ZIP..."
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempStage, $targetZip, [System.IO.Compression.CompressionLevel]::Optimal, $false)

Remove-Item -Recurse -Force $tempStage

Write-Host "Menyalin ke Desktop..."
Copy-Item -Force $targetZip $desktopZip

$sizeMb = [Math]::Round((Get-Item $targetZip).Length / 1MB, 1)
Write-Host "SUKSES! Ukuran paket ZIP: $sizeMb MB"
