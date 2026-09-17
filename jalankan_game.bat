@echo off
color 0A
echo ===================================================
echo   MEMULAI SERVER GAME LOKAL (UNTUK PC & MOBILE)
echo ===================================================
echo.
echo Game ini menggunakan sistem modul modern sehingga wajib dijalankan via Server.
echo Sedang menyiapkan server lokal...
echo.

:: Dapatkan IP lokal untuk akses dari HP (hanya berlaku jika terhubung ke WiFi/Jaringan yang sama)
for /f "tokens=14" %%a in ('ipconfig ^| findstr IPv4') do set ip=%%a

echo ===================================================
echo 🎮 BUKA LINK BERIKUT DI BROWSER PC ANDA:
echo    http://localhost:8000
echo.
echo 📱 UNTUK MAIN DI HP (Pastikan 1 WiFi dengan PC):
echo    Buka browser di HP dan ketik:
echo    http://%ip%:8000
echo ===================================================
echo.
echo Membuka browser...
start http://localhost:8000
echo.
echo Biarkan jendela hitam ini tetap terbuka selama bermain!
echo Tekan CTRL+C jika ingin mematikan server.
echo.

:: Pindah ke folder frontend dan jalankan server menggunakan Python bawaan
cd frontend
python -m http.server 8000
