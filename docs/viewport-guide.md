# 📐 Panduan UI/UX — Viewport Responsif

## Prinsip Dasar

Game ini menggunakan **resolusi desain 1280×720** (16:9) sebagai basis. Phaser Scale Manager akan otomatis menyesuaikan ukuran canvas agar pas di layar apapun tanpa distorsi (gepeng).

---

## 1. Konfigurasi Phaser Scale Manager

```javascript
const config = {
    scale: {
        mode: Phaser.Scale.FIT,        // Fit ke container tanpa distorsi
        autoCenter: Phaser.Scale.CENTER_BOTH, // Tengah horizontal & vertikal
        width: 1280,                    // Lebar desain basis
        height: 720,                    // Tinggi desain basis
        parent: 'game-container',       // ID elemen HTML container
        min: {
            width: 480,                 // Minimum untuk HP kecil
            height: 270
        },
        max: {
            width: 1920,               // Maximum untuk monitor besar
            height: 1080
        }
    }
};
```

### Penjelasan Mode Scale:

| Mode | Deskripsi |
|------|-----------|
| `FIT` | Canvas di-resize agar muat di container, mempertahankan aspect ratio. Akan ada "letterbox" (bar hitam) jika aspect ratio container berbeda. |
| `ENVELOP` | Canvas di-resize agar menutupi seluruh container. Bagian yang kelebihan akan terpotong. |
| `RESIZE` | Canvas mengikuti ukuran container secara dinamis. Butuh layout responsif. |

**Rekomendasi: Gunakan `FIT`** — paling aman untuk game anak karena semua elemen selalu terlihat.

---

## 2. Setup HTML & CSS

### Meta Viewport (WAJIB untuk mobile)

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, 
    maximum-scale=1.0, user-scalable=no">
```

- `user-scalable=no` → mencegah zoom pinch yang mengganggu gameplay
- `maximum-scale=1.0` → mencegah zoom otomatis saat input focus

### CSS Anti-Scroll

```css
/* Mencegah scroll/bounce saat drag di mobile */
html, body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    width: 100%;
    height: 100%;
    touch-action: none;           /* PENTING: disable gesture default */
    -webkit-touch-callout: none;  /* iOS: disable callout menu */
    -webkit-user-select: none;    /* Disable text selection */
    user-select: none;
}

#game-container {
    width: 100vw;
    height: 100vh;
}

/* Safe area untuk HP dengan notch */
#game-container {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
}
```

---

## 3. Panduan Ukuran Elemen UI (Ramah Anak)

Target pengguna: anak usia 4-7 tahun → jari kecil tapi motorik belum presisi.

| Elemen | Ukuran Minimum | Rekomendasi |
|--------|---------------|-------------|
| Tombol | 48×48 px | **80×80 px** |
| Objek drag | 64×64 px | **100×100 px** |
| Hitbox (area sentuh) | 1x visual | **1.5x visual** |
| Font teks | 18px | **24-32px** |
| Jarak antar elemen | 8px | **24px+** |

### Tips Hitbox Besar:

```javascript
// Perbesar area sentuh tanpa mengubah visual
shape.setInteractive({
    hitArea: new Phaser.Geom.Rectangle(-25, -25, 150, 150),
    hitAreaCallback: Phaser.Geom.Rectangle.Contains
});
```

---

## 4. Handling Orientasi Layar

### Landscape Lock (Disarankan)

```javascript
// Di main.js, setelah game dimuat:
if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(() => {
        // Beberapa browser tidak mendukung lock
        console.log('Orientation lock tidak didukung');
    });
}
```

### Deteksi & Pesan Rotasi

```javascript
// Di scene, cek orientasi
checkOrientation() {
    if (window.innerHeight > window.innerWidth) {
        // Portrait — tampilkan pesan "Putar HP Anda"
        this.showRotateMessage();
    } else {
        this.hideRotateMessage();
    }
}
```

---

## 5. Testing Checklist

### Browser Desktop
- [ ] Chrome: resize window dari 1920×1080 ke 800×600
- [ ] Firefox: sama
- [ ] Canvas tetap proporsional (tidak gepeng)
- [ ] Letterbox muncul jika aspect ratio berbeda

### Mobile (Chrome DevTools)
- [ ] iPhone SE (375×667) — landscape
- [ ] iPhone 14 (390×844) — landscape
- [ ] Samsung Galaxy S21 (360×800) — landscape
- [ ] iPad (768×1024) — landscape
- [ ] Tidak bisa scroll saat drag
- [ ] Tidak ada zoom saat double-tap

### Touch Testing
- [ ] Drag-and-drop responsif di touch
- [ ] Tidak ada delay 300ms (sudah di-handle Phaser)
- [ ] Multi-touch tidak menyebabkan bug

---

## 6. Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Canvas gepeng/stretched | Pastikan mode `FIT`, bukan `NONE` |
| Bisa scroll saat drag | Tambahkan `touch-action: none` di CSS |
| Game terlalu kecil di HP | Pastikan meta viewport ada |
| Letterbox warna salah | Set `backgroundColor` di Phaser config |
| Blur di retina display | Phaser otomatis handle device pixel ratio |
