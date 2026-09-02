export class ProfileScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ProfileScene' });
    }

    create() {
        // Background
        this.cameras.main.setBackgroundColor('#667eea');

        // Title
        this.add.text(this.cameras.main.centerX, 100, 'Siapa yang bermain hari ini?', {
            fontFamily: 'Fredoka One, Arial, sans-serif',
            fontSize: '48px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.loadingText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Memuat profil...', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.profileContainer = this.add.container(0, 0);

        this.fetchProfiles();
    }

    async fetchProfiles() {
        try {
            // Kita coba fetch dari API backend
            const response = await fetch('http://localhost/backend/api/get_profiles.php');
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.renderProfiles(result.data);
                } else {
                    this.showError('Gagal memuat profil');
                }
            } else {
                this.showError('API tidak ditemukan. Pastikan backend berjalan.');
            }
        } catch (error) {
            console.error(error);
            // Fallback for local testing if backend isn't available
            console.log("Menggunakan profil lokal (fallback)");
            this.renderProfiles([
                { id: 1, nama: 'Tamu', avatar: 'default' }
            ]);
        }
    }

    renderProfiles(profiles) {
        this.loadingText.destroy();

        let startX = this.cameras.main.centerX - (profiles.length * 100);
        if(profiles.length === 0) {
            startX = this.cameras.main.centerX;
            const noProfile = this.add.text(startX, this.cameras.main.centerY - 50, 'Belum ada profil.', {
                fontFamily: 'Arial', fontSize: '24px', fill: '#ffffff'
            }).setOrigin(0.5);
            this.profileContainer.add(noProfile);
        }

        profiles.forEach((profile, index) => {
            const x = startX + (index * 200);
            const y = this.cameras.main.centerY;

            // Simple box for profile
            const box = this.add.rectangle(x, y, 180, 220, 0xffffff, 0.2)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => box.setFillStyle(0xffffff, 0.4))
                .on('pointerout', () => box.setFillStyle(0xffffff, 0.2))
                .on('pointerdown', () => this.selectProfile(profile));

            const name = this.add.text(x, y - 40, profile.nama, {
                fontFamily: 'Fredoka One, Arial',
                fontSize: '32px',
                fill: '#ffffff'
            }).setOrigin(0.5);

            // Render Achievements
            const key = `achievements_${profile.id || profile.nama}`;
            const achievements = JSON.parse(localStorage.getItem(key) || '[]');
            let achText = achievements.length > 0 ? `🏆 ${achievements.length} Piala` : 'Belum ada piala';
            
            const pialaText = this.add.text(x, y + 30, achText, {
                fontFamily: 'Nunito, Arial',
                fontSize: '18px',
                fill: '#FFD700',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);

            this.profileContainer.add([box, name, pialaText]);
        });

        // Add Create Profile button (Simplified for now - just uses Guest)
        const createBtn = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 100, '+ Main Sebagai Tamu Baru', {
            fontFamily: 'Arial',
            fontSize: '28px',
            fill: '#ffeb3b',
            backgroundColor: '#ff5722',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => this.selectProfile({id: 0, nama: 'Tamu Baru'}));
    }

    selectProfile(profile) {
        // Save to global state / registry
        this.registry.set('currentProfile', profile);
        
        // Start audio / bgm (User has interacted)
        const audioManager = this.registry.get('audioManager');
        if(audioManager) {
            audioManager.init();
            audioManager.playPop();
            audioManager.playBGM();
        }

        // Transition to Menu Scene
        this.cameras.main.fade(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MenuScene');
        });
    }

    showError(msg) {
        this.loadingText.setText(msg);
        
        // Add fallback button
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 80, 'Main Offline (Tanpa Simpan)', {
            fontFamily: 'Arial', fontSize: '24px', fill: '#000000', backgroundColor: '#ffffff', padding: {x: 10, y: 10}
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            this.selectProfile({id: 0, nama: 'Pemain Offline'});
        });
    }
}
