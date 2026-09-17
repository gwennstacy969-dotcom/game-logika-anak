/**
 * ============================================
 * MenuScene — Menu Utama Game (Premium Edition)
 * ============================================
 * 
 * Tampilan menu utama dengan:
 * - Layout Grid 2 kolom untuk memuat lebih banyak game
 * - Efek Glassmorphism (semi-transparan, modern)
 * - Latar belakang partikel interaktif
 * - Tombol-tombol dengan glow dan bounce animation
 */
export class MenuScene extends Phaser.Scene {

    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Fade in
        this.cameras.main.fadeIn(500);

        // --- Background ---
        this._createPremiumBackground(width, height);

        // --- Judul Game ---
        this._createTitle(width, height);

        // --- Input Nama Anak ---
        this._createNameInput(width, height);

        // --- Container Scroll/Grid ---
        this._createGameGrid(width, height);

        // --- Maskot Interaktif ---
        this._createMascot(width, height);

        // --- Tombol Fullscreen (Mobile Friendly) ---
        this._createFullscreenButton(width, height);
    }

    _createPremiumBackground(width, height) {
        // Gradient animated di CSS, di sini kita buat transparan atau subtle dark overlay
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.2); 
        bg.fillRect(0, 0, width, height);

        // Glowing Orbs (Soft Lights)
        this.orb1 = this.add.circle(width * 0.1, height * 0.2, 200, 0x667eea, 0.4);
        this.orb2 = this.add.circle(width * 0.9, height * 0.8, 250, 0xff758c, 0.4);
        this.orb1.setBlendMode(Phaser.BlendModes.ADD);
        this.orb2.setBlendMode(Phaser.BlendModes.ADD);

        // Animate orbs
        this.tweens.add({
            targets: this.orb1,
            x: width * 0.3,
            y: height * 0.4,
            duration: 8000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.tweens.add({
            targets: this.orb2,
            x: width * 0.7,
            y: height * 0.5,
            duration: 10000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Particles
        this._createParticles(width, height);
    }

    _createParticles(width, height) {
        // Gunakan phaser particle manager
        const particles = this.add.particles(0, 0, 'particle', {
            x: { min: 0, max: width },
            y: { min: height, max: height + 100 },
            lifespan: { min: 4000, max: 8000 },
            speedY: { min: -20, max: -60 },
            scale: { start: 0.5, end: 0 },
            quantity: 2,
            blendMode: 'ADD'
        });
        
        // Coba buat texture partikel on the fly jika tidak ada gambar
        if (!this.textures.exists('glow_particle')) {
            const g = this.add.graphics();
            g.fillStyle(0xffffff, 1);
            g.fillCircle(8, 8, 8);
            g.generateTexture('glow_particle', 16, 16);
            g.destroy();
        }
        
        particles.setTexture('glow_particle');
        particles.setAlpha(0.3);
    }

    _createTitle(width, height) {
        // Judul utama dengan efek Glow / Shadow
        const title = this.add.text(width / 2, 80, '🌟 Logika & Matematika 🌟', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '52px',
            fontStyle: '900',
            color: '#ffffff',
            align: 'center',
            stroke: '#2a0845',
            strokeThickness: 8,
            shadow: { offsetX: 0, offsetY: 5, color: '#00000088', blur: 10, fill: true }
        }).setOrigin(0.5).setScale(0);

        // Subjudul
        const subtitle = this.add.text(width / 2, 140, 'Petualangan Cerdas Usia 4-7 Tahun', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '24px',
            fontWeight: '700',
            color: '#FFD700', // Gold color
            align: 'center',
            shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 4, fill: true }
        }).setOrigin(0.5).setAlpha(0);

        // Animasi masuk
        this.tweens.add({ targets: title, scaleX: 1, scaleY: 1, duration: 800, ease: 'Elastic.easeOut' });
        this.tweens.add({ targets: subtitle, alpha: 1, y: 135, duration: 600, delay: 400, ease: 'Sine.easeOut' });
    }

    _createNameInput(width, height) {
        const y = 220;

        // Glassmorphism Input Field
        const inputBg = this.add.graphics();
        inputBg.fillStyle(0xffffff, 0.1); // Semi transparent
        inputBg.fillRoundedRect(width / 2 - 150, y, 300, 50, 25);
        inputBg.lineStyle(2, 0xffffff, 0.5); // Solid border
        inputBg.strokeRoundedRect(width / 2 - 150, y, 300, 50, 25);

        // Teks input 
        let currentName = this.registry.get('playerName') || 'Siapa namamu?';
        let prefix = this.registry.get('playerName') ? '👤 ' : '✏️ ';

        this.nameText = this.add.text(width / 2, y + 25, prefix + currentName, {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Interaktif
        const inputZone = this.add.zone(width / 2, y + 25, 300, 50)
            .setInteractive({ useHandCursor: true });

        // Hover effect
        inputZone.on('pointerover', () => {
            inputBg.clear();
            inputBg.fillStyle(0xffffff, 0.2); 
            inputBg.fillRoundedRect(width / 2 - 150, y, 300, 50, 25);
            inputBg.lineStyle(2, 0xffffff, 0.8); 
            inputBg.strokeRoundedRect(width / 2 - 150, y, 300, 50, 25);
        });

        inputZone.on('pointerout', () => {
            inputBg.clear();
            inputBg.fillStyle(0xffffff, 0.1); 
            inputBg.fillRoundedRect(width / 2 - 150, y, 300, 50, 25);
            inputBg.lineStyle(2, 0xffffff, 0.5); 
            inputBg.strokeRoundedRect(width / 2 - 150, y, 300, 50, 25);
        });

        inputZone.on('pointerdown', () => {
            const name = prompt('Masukkan nama anak hebat:', 
                this.registry.get('playerName') || '');
            
            if (name && name.trim() !== '') {
                this.registry.set('playerName', name.trim());
                this.nameText.setText(`👤 ${name.trim()}`);
            }

            const audioManager = this.registry.get('audioManager');
            if (audioManager) audioManager.init();
        });
    }

    _createGameGrid(width, height) {
        // Setup Grid 2 Kolom untuk 7 game
        const startY = 340;
        const col1X = width / 2 - 220;
        const col2X = width / 2 + 220;
        const rowHeight = 90;

        const games = [
            { id: 'ShapeSortScene', title: '🧩 Cocok Bentuk', desc: 'Seret bentuk ke tempatnya!', color: 0x4ECB71 },
            { id: 'CountingScene', title: '🔢 Berhitung', desc: 'Hitung benda & pilih angka', color: 0x4A90D9 },
            { id: 'ColorMatchScene', title: '🎨 Warna Warni', desc: 'Kelompokkan benda', color: 0xFFB03B },
            { id: 'MemoryScene', title: '🃏 Kartu Memori', desc: 'Cari pasangan gambar', color: 0x9B59B6 },
            { id: 'PatternScene', title: '🔄 Tebak Pola', desc: 'Lengkapi urutan', color: 0xE74C3C },
            { id: 'CodingScene', title: '🤖 Robot Coding', desc: 'Program jalan robot', color: 0x00CEC9 },
            { id: 'MazeScene', title: '🗺️ Labirin Pintar', desc: 'Cari jalan keluar', color: 0xFD79A8 },
            { id: 'NumberCatchScene', title: '🎈 Tangkap Angka', desc: 'Pecahkan balon (Baru!)', color: 0x0984E3 }
        ];

        games.forEach((game, index) => {
            // Tentukan kolom dan baris
            const col = index % 2 === 0 ? col1X : col2X;
            const row = startY + Math.floor(index / 2) * rowHeight;
            
            // Jika ganjil dan ini item terakhir, taruh di tengah
            let xPos = col;
            if (index === games.length - 1 && games.length % 2 !== 0) {
                xPos = width / 2;
            }

            this._createGlassButton(
                xPos, row, 
                game.title, game.desc, 
                game.color, 
                () => { this._startGame(game.id); },
                index * 100 // Delay animasi beruntun
            );
        });
    }

    _startGame(sceneKey) {
        const audioManager = this.registry.get('audioManager');
        if (audioManager) {
            audioManager.init();
            audioManager.playPop();
        }
        
        // Transisi mewah
        this.cameras.main.fadeOut(500, 255, 255, 255);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(sceneKey);
        });
    }

    /**
     * Tombol Glassmorphism Baru
     */
    _createGlassButton(x, y, label, desc, color, onClick, delay = 0) {
        const btnWidth = 400;
        const btnHeight = 75;

        const container = this.add.container(x, y);
        container.setScale(0); // Mulai dari scale 0 untuk animasi masuk

        // --- Base Glow Background (Solid Color, tapi ada di layer bawah) ---
        const glow = this.add.graphics();
        glow.fillStyle(color, 0.4);
        glow.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 20);
        
        // --- Glass overlay ---
        const bg = this.add.graphics();
        bg.fillStyle(0xffffff, 0.15); 
        bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 20);
        // Border
        bg.lineStyle(2, 0xffffff, 0.6);
        bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 20);

        container.add([glow, bg]);

        // --- Teks ---
        const labelText = this.add.text(0, -12, label, {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '24px',
            fontWeight: '900',
            color: '#ffffff',
            align: 'center',
            shadow: { offsetX: 1, offsetY: 2, color: '#00000088', blur: 3, fill: true }
        }).setOrigin(0.5);

        const descText = this.add.text(0, 15, desc, {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '15px',
            fontWeight: '600',
            color: '#ffffffee',
            align: 'center'
        }).setOrigin(0.5);

        container.add([labelText, descText]);

        // --- Hit Area ---
        container.setSize(btnWidth, btnHeight);
        container.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true
        });

        // --- Interaksi ---
        const redrawGlow = (alpha, scale) => {
            glow.clear();
            glow.fillStyle(color, alpha);
            // Bikin glow sedikit lebih besar saat hover
            glow.fillRoundedRect((-btnWidth/2) - scale, (-btnHeight/2) - scale, btnWidth + (scale*2), btnHeight + (scale*2), 20);
        };

        container.on('pointerover', () => {
            redrawGlow(0.7, 5);
            this.tweens.add({
                targets: container,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 150,
                ease: 'Back.easeOut'
            });
        });

        container.on('pointerout', () => {
            redrawGlow(0.4, 0);
            this.tweens.add({
                targets: container,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 150,
                ease: 'Sine.easeOut'
            });
        });

        container.on('pointerdown', () => {
            const audioManager = this.registry.get('audioManager');
            if (audioManager) audioManager.init();

            this.tweens.add({
                targets: container,
                scaleX: 0.9,
                scaleY: 0.9,
                duration: 100,
                yoyo: true,
                ease: 'Sine.easeInOut',
                onComplete: () => {
                    if (onClick) onClick();
                }
            });
        });

        // --- Animasi Masuk berurutan ---
        this.tweens.add({
            targets: container,
            scaleX: 1,
            scaleY: 1,
            duration: 500,
            delay: delay,
            ease: 'Back.easeOut'
        });
    }

    _createMascot(width, height) {
        // Mascot (Owl) dipindah agak ke kiri bawah
        const mascot = this.add.text(80, height - 90, '🦉', { fontSize: '90px' }).setOrigin(0.5);
        mascot.setInteractive({ useHandCursor: true });
        
        // Animasi bernapas (breathing) yang lebih bouncy
        this.tweens.add({
            targets: mascot,
            scaleX: 1.05,
            scaleY: 0.95,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Bubble Chat (Glassmorphism style)
        const bubble = this.add.container(170, height - 150);
        
        const bg = this.add.graphics();
        bg.fillStyle(0xffffff, 0.85); // Putih agak solid agar teks terbaca
        bg.fillRoundedRect(0, 0, 180, 60, 20);
        bg.lineStyle(2, 0xffffff, 1);
        bg.strokeRoundedRect(0, 0, 180, 60, 20);
        
        // Panah bubble ke arah maskot
        bg.beginPath();
        bg.moveTo(10, 60);
        bg.lineTo(15, 80);
        bg.lineTo(35, 60);
        bg.fillPath();

        const msg = this.add.text(90, 30, 'Klik Aku!', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333333'
        }).setOrigin(0.5);

        bubble.add([bg, msg]);
        bubble.setAlpha(0);
        bubble.setScale(0);

        mascot.on('pointerdown', () => {
            const audioManager = this.registry.get('audioManager');
            if (audioManager) {
                audioManager.init();
                audioManager.playPop();
            }

            // Animasi lompat maskot (squash & stretch)
            this.tweens.chain({
                targets: mascot,
                tweens: [
                    { scaleY: 0.8, scaleX: 1.2, duration: 100 },
                    { y: mascot.y - 60, scaleY: 1.1, scaleX: 0.9, duration: 200, ease: 'Power2' },
                    { y: mascot.y, scaleY: 0.9, scaleX: 1.1, duration: 200, ease: 'Bounce.easeOut' },
                    { scaleY: 1, scaleX: 1, duration: 100 }
                ]
            });

            bubble.setAlpha(1);
            bubble.setScale(1);
            
            const chats = ['Halo teman!', 'Semangat!', 'Kamu Hebat!', 'Ayo Belajar!', 'Wah, Seru!'];
            msg.setText(Phaser.Math.RND.pick(chats));

            this.tweens.add({
                targets: bubble,
                y: height - 170,
                alpha: 0,
                duration: 2000,
                delay: 1500,
                ease: 'Sine.easeIn',
                onComplete: () => { bubble.y = height - 150; }
            });
            });
        });
    }

    _createFullscreenButton(width, height) {
        // Tombol Fullscreen di pojok kanan atas
        const btn = this.add.container(width - 60, 50);
        const bg = this.add.graphics();
        bg.fillStyle(0xffffff, 0.15);
        bg.fillRoundedRect(-30, -20, 60, 40, 10);
        bg.lineStyle(2, 0xffffff, 0.5);
        bg.strokeRoundedRect(-30, -20, 60, 40, 10);
        
        const icon = this.add.text(0, 0, '🔲', { fontSize: '24px' }).setOrigin(0.5);
        btn.add([bg, icon]);
        
        btn.setSize(60, 40);
        btn.setInteractive({ useHandCursor: true }).setDepth(200);

        btn.on('pointerdown', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });

        // Hover animation
        btn.on('pointerover', () => {
            this.tweens.add({ targets: btn, scale: 1.1, duration: 100 });
        });
        btn.on('pointerout', () => {
            this.tweens.add({ targets: btn, scale: 1, duration: 100 });
        });
    }
}
