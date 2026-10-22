@echo off
chcp 65001 >nul
title HENTIKAN APLIKASI PERPUSTAKAAN SBTH
color 0C
cd /d "%~dp0"

echo ================================================================
echo           HENTIKAN APLIKASI PERPUSTAKAAN SBTH TK
echo ================================================================
echo.
echo Menutup server aplikasi dan membebaskan memori komputer...

taskkill /F /FI "WINDOWTITLE eq Perpustakaan SBTH Server*" >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1

echo.
echo [SUKSES] Server perpustakaan telah berhasil dihentikan.
echo Jendela ini akan otomatis tertutup dalam 3 detik.
ping 127.0.0.1 -n 3 >nul
exit /b 0
