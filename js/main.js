/**
 * ============================================
 * Main.js — Entry Point Game
 * ============================================
 * 
 * Konfigurasi Phaser 3 game engine dan registrasi scenes.
 * 
 * Scale Mode: FIT → canvas menyesuaikan layar tanpa distorsi
 * Base Resolution: 1280×720 (16:9 landscape)
 */
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { ShapeSortScene } from './scenes/ShapeSortScene.js';
import { CountingScene } from './scenes/CountingScene.js';
import { ColorMatchScene } from './scenes/ColorMatchScene.js';

// ============================================
// PHASER GAME CONFIGURATION
// ============================================
const config = {
    // --- Renderer ---
    type: Phaser.AUTO,  // Otomatis pilih WebGL atau Canvas

    // --- Scale Manager ---
    // Mengatur agar game responsif di semua ukuran layar & orientasi
    scale: {
        mode: Phaser.Scale.FIT,               // Fit ke container, pertahankan aspect ratio
        autoCenter: Phaser.Scale.CENTER_BOTH,  // Tengah horizontal & vertikal
        width: 1280,                           // Lebar desain basis (px)
        height: 720,                           // Tinggi desain basis (px)
        parent: 'game-container',              // ID elemen HTML container

        // Batas minimum (HP kecil portrait)
        min: {
            width: 320,
            height: 240
        },
        // Batas maximum (monitor besar)
        max: {
            width: 1920,
            height: 1080
        }
    },

    // --- Background Color ---
    // Warna di belakang scenes (terlihat saat letterbox)
    backgroundColor: '#0f0e17',

    // --- Scene Registration ---
    // Urutan: BootScene → MenuScene → ShapeSortScene → CountingScene → ColorMatchScene
    scene: [BootScene, MenuScene, ShapeSortScene, CountingScene, ColorMatchScene],

    // --- Input Configuration ---
    input: {
        // Aktifkan touch untuk mobile
        touch: {
            capture: true   // Capture touch events agar tidak scroll
        },
        // Mouse untuk desktop
        mouse: {
            capture: true
        }
    },

    // --- Render Settings ---
    render: {
        pixelArt: false,         // Anti-alias aktif (shapes halus)
        antialias: true,
        roundPixels: false,
        transparent: false
    },

    // --- DOM Container (untuk input HTML jika diperlukan) ---
    dom: {
        createContainer: true
    }
};

// ============================================
// LAUNCH GAME
// ============================================
const game = new Phaser.Game(config);

// --- Orientation Lock (untuk mobile) ---
// Coba lock ke landscape agar gameplay optimal
if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(() => {
        // Tidak semua browser mendukung orientation lock
        console.info('ℹ️ Orientation lock tidak didukung di browser ini.');
    });
}

// --- Sembunyikan loading screen HTML saat game sudah siap ---
// Strategi berlapis agar tidak stuck loading:
// 1. Game 'ready' event (paling cepat)
// 2. window.load (fallback jika ready sudah lewat)
// 3. Hard timeout 6 detik (fallback terakhir)

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            if (loadingScreen.parentNode) loadingScreen.remove();
        }, 600);
    }
}

// Strategi 1: Saat Phaser game instance siap
game.events.once('ready', () => {
    setTimeout(hideLoadingScreen, 200);
});

// Strategi 2: window.load (untuk kasus CDN cepat selesai sebelum listener terpasang)
if (document.readyState === 'complete') {
    setTimeout(hideLoadingScreen, 400);
} else {
    window.addEventListener('load', () => {
        setTimeout(hideLoadingScreen, 400);
    });
}

// Strategi 3: Hard timeout — pastikan tidak stuck lebih dari 6 detik
setTimeout(hideLoadingScreen, 6000);

// --- Prevent context menu pada game canvas (klik kanan) ---
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
});

// --- Prevent touch defaults pada canvas (scroll, zoom, pull-to-refresh) ---
// Ini memastikan semua touch event diteruskan ke Phaser tanpa dicuri browser
document.addEventListener('touchmove', (e) => {
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchstart', (e) => {
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
}, { passive: false });

// --- Log info ---
console.log('🎮 Game Logika & Matematika Dasar');
console.log('📐 Base Resolution: 1280×720');
console.log('🌐 Scale Mode: FIT (responsive)');
