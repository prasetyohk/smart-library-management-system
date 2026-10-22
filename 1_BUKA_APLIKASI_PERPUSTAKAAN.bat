@echo off
chcp 65001 >nul
title PERPUSTAKAAN DIGITAL SBTH TK - SERVER AKTIF
color 0B

echo ================================================================
echo           SISTEM PERPUSTAKAAN DIGITAL SBTH TK
echo ================================================================
echo.

:: 1. Pindah ke direktori script ini
cd /d "%~dp0"

:: 2. Pastikan path Node.js terbaca di sistem
set "PATH=%PATH%;C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;%LocalAppData%\Programs\node"

where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [PERINGATAN] Node.js belum terdeteksi di komputer ini!
    echo Silakan buka folder 'INSTALLER_PENDUKUNG' lalu instal file:
    echo 'node-js v24.22.0-x64.msi'
    echo.
    pause
    exit /b 1
)

:: 3. Cek apakah server perpustakaan sudah menyala di port 3000
echo [1/3] Memeriksa status server perpustakaan...
curl.exe -s -m 1 http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Server perpustakaan sudah aktif!
    echo [2/3] Membuka browser web...
    start http://localhost:3000
    echo [3/3] Selesai! Aplikasi siap digunakan.
    ping 127.0.0.1 -n 3 >nul
    exit /b 0
)

:: 4. Jika port 3000 terkunci sisa proses lama, bersihkan terlebih dahulu
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Menyegarkan sesi port 3000 sebelumnya...
    taskkill /F /IM node.exe >nul 2>&1
    ping 127.0.0.1 -n 2 >nul
)

:: 5. Menyalakan server Next.js di latar belakang
echo [2/3] Menyalakan server aplikasi perpustakaan...
echo       (Harap tunggu sebentar, browser web akan otomatis terbuka)
start /min "Perpustakaan SBTH Server" cmd /c "npm run dev"

:: 6. Tunggu hingga server benar-benar siap merespons (maksimal 30 detik)
set ATTEMPTS=0
:WAIT_LOOP
set /a ATTEMPTS+=1
ping 127.0.0.1 -n 2 >nul
curl.exe -s -m 1 http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 goto SERVER_READY

if %ATTEMPTS% geq 30 (
    echo [INFO] Membuka browser web...
    goto SERVER_READY
)
goto WAIT_LOOP

:SERVER_READY
echo [3/3] Server siap! Membuka browser web...
start http://localhost:3000

echo.
echo ================================================================
echo   ✓ APLIKASI PERPUSTAKAAN SBTH TK BERHASIL DIBUKA!
echo.
echo   Alamat Browser : http://localhost:3000
echo.
echo   [CATATAN PENTING]
echo   • Biarkan jendela ini tetap terbuka selama memakai aplikasi.
echo   • Untuk menutup aplikasi saat selesai, cukup tutup jendela ini
echo     atau jalankan file: 2_HENTIKAN_APLIKASI.bat
echo ================================================================
echo.
echo Tekan tombol apa saja untuk mematikan server perpustakaan...
pause >nul

echo Menghentikan server perpustakaan...
taskkill /F /FI "WINDOWTITLE eq Perpustakaan SBTH Server*" >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
exit /b 0
