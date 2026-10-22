@echo off
chcp 65001 >nul
title PASANG IKON DESKTOP PERPUSTAKAAN SBTH TK
color 0A
cd /d "%~dp0"

echo ================================================================
echo      MEMBUAT SHORTCUT PERPUSTAKAAN SBTH DI DESKTOP WINDOWS
echo ================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$wsh = New-Object -ComObject WScript.Shell; $desktop = [Environment]::GetFolderPath('Desktop'); $lnk = Join-Path $desktop 'Perpustakaan SBTH TK.lnk'; $s = $wsh.CreateShortcut($lnk); $s.TargetPath = '%~dp01_BUKA_APLIKASI_PERPUSTAKAAN.bat'; $s.WorkingDirectory = '%~dp0'; $s.IconLocation = '%~dp0public\app_icon.ico'; $s.Description = 'Aplikasi Perpustakaan Digital SBTH TK'; $s.Save(); Write-Host '[SUKSES] Ikon shortcut berhasil dipasang di Desktop!' -ForegroundColor Green"

echo.
echo ================================================================
echo Ikon 'Perpustakaan SBTH TK' sekarang sudah muncul di Desktop!
echo Anda bisa langsung klik 2x dari Desktop untuk membuka aplikasi.
echo ================================================================
echo.
ping 127.0.0.1 -n 3 >nul
exit /b 0
