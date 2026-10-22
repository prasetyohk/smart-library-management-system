@echo off
chcp 65001 >nul
title PASANG IKON DESKTOP PERPUSTAKAAN SBTH TK
color 0A
cd /d "%~dp0"

echo ================================================================
echo      MEMBUAT SHORTCUT PERPUSTAKAAN SBTH DI DESKTOP WINDOWS
echo ================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$wsh = New-Object -ComObject WScript.Shell; $desktop = [Environment]::GetFolderPath('Desktop'); $lnk = Join-Path $desktop 'Perpustakaan SBTH TK.lnk'; $s = $wsh.CreateShortcut($lnk); $s.TargetPath = '%~dp0Perpustakaan SBTH.exe'; $s.WorkingDirectory = '%~dp0'; $s.IconLocation = '%~dp0Perpustakaan SBTH.exe,0'; $s.Description = 'Aplikasi Perpustakaan Digital SBTH TK'; $s.Save(); Write-Host '[SUKSES] Ikon aplikasi berhasil dipasang di Desktop!' -ForegroundColor Green"

echo.
echo ================================================================
echo Ikon aplikasi 'Perpustakaan SBTH TK' sekarang sudah ada di Desktop!
echo Anda bisa langsung klik 2x dari Desktop untuk membuka aplikasi.
echo ================================================================
echo.
ping 127.0.0.1 -n 3 >nul
exit /b 0
