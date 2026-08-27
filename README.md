# 🎮 Game Logika & Matematika Dasar

Game edukasi cross-platform (Web & Mobile) untuk anak usia **4-7 tahun** bertema logika dan matematika dasar.

## ✨ Fitur

- 🧩 **Mencocokkan Bentuk** — Drag-and-drop shape sorting
- ⭐ **Sistem Bintang** — Penguatan positif, tanpa Game Over
- 📱 **Responsif** — Berfungsi di PC dan smartphone
- 👨‍👩‍👧 **Parent Dashboard** — API untuk memantau progres anak

## 🛠️ Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Game Engine | Phaser.js 3 (HTML5) |
| Styling | Vanilla CSS |
| Backend API | PHP (PDO + MySQL) |
| Database | MySQL |

## 🚀 Cara Menjalankan

### Game (Frontend)

```bash
# Masuk ke folder game
cd game

# Jalankan local server (pilih salah satu):

# Opsi 1: Python
python -m http.server 8080

# Opsi 2: PHP built-in server
php -S localhost:8080

# Opsi 3: npx serve
npx -y serve .
```

Buka `http://localhost:8080` di browser.

### Backend API

1. Import `backend/sql/schema.sql` ke MySQL
2. Edit `backend/config/database.php` (sesuaikan kredensial)
3. Letakkan folder `backend/` di document root web server (Apache/Nginx)
4. Akses API di `http://localhost/backend/api/`

## 📁 Struktur Proyek

```
game-logika-anak/
├── game/          # Phaser.js game frontend
├── backend/       # PHP REST API
└── docs/          # Dokumentasi
```

## 📝 Lisensi

Proyek edukasi — Hak cipta dilindungi.
