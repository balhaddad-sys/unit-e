/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  CAMERA MODULE v7.0 - Quick & Simple                                         ║
 * ║  Minimal UI, fast capture, practical for clinical use                        ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

(function() {
    'use strict';

    const CameraModule = {
        version: '7.0.0',
        isReady: true,
        
        _stream: null,
        _modal: null,
        _onCapture: null,
        _onClose: null,
        _facingMode: 'environment',

        /**
         * Initialize camera module (for backwards compatibility)
         * @param {Object} options - Configuration options
         */
        init(options = {}) {
            this._onCapture = options.onCapture || null;
            this._onClose = options.onClose || null;
            return this;
        },

        /**
         * Open camera and capture image
         * @param {Function} onCapture - Callback with File object
         * @param {Function} onClose - Callback when closed
         */
        async open(onCapture, onClose) {
            if (onCapture) this._onCapture = onCapture;
            if (onClose) this._onClose = onClose;

            try {
                if (!navigator.mediaDevices?.getUserMedia) {
                    throw new Error('Camera not supported');
                }

                this._stream = await navigator.mediaDevices.getUserMedia({
                    video: { 
                        facingMode: this._facingMode,
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    },
                    audio: false
                }).catch(() => {
                    return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                });

                this._buildUI();
                return true;

            } catch (error) {
                console.error('[Camera]', error);
                alert('📷 ' + error.message);
                return false;
            }
        },

        _buildUI() {
            if (this._modal) this._modal.remove();

            this._modal = document.createElement('div');
            this._modal.id = 'cam-modal';
            this._modal.innerHTML = `
                <style>
                    #cam-modal {
                        position: fixed;
                        inset: 0;
                        background: #000;
                        z-index: 999999;
                        display: flex;
                        flex-direction: column;
                        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                    }
                    
                    .cam-preview {
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .cam-video {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                    .cam-video.mirror { transform: scaleX(-1); }
                    
                    /* Corner guides */
                    .cam-guides {
                        position: absolute;
                        inset: 40px;
                        pointer-events: none;
                    }
                    .cam-corner {
                        position: absolute;
                        width: 30px;
                        height: 30px;
                        border-color: rgba(16, 185, 129, 0.8);
                        border-style: solid;
                        border-width: 0;
                    }
                    .cam-corner.tl { top: 0; left: 0; border-top-width: 3px; border-left-width: 3px; border-radius: 8px 0 0 0; }
                    .cam-corner.tr { top: 0; right: 0; border-top-width: 3px; border-right-width: 3px; border-radius: 0 8px 0 0; }
                    .cam-corner.bl { bottom: 0; left: 0; border-bottom-width: 3px; border-left-width: 3px; border-radius: 0 0 0 8px; }
                    .cam-corner.br { bottom: 0; right: 0; border-bottom-width: 3px; border-right-width: 3px; border-radius: 0 0 8px 0; }
                    
                    .cam-hint {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        color: rgba(255,255,255,0.6);
                        font-size: 14px;
                        text-align: center;
                        pointer-events: none;
                    }
                    
                    .cam-flash {
                        position: absolute;
                        inset: 0;
                        background: white;
                        opacity: 0;
                        pointer-events: none;
                    }
                    .cam-flash.active { animation: camFlash 0.15s; }
                    @keyframes camFlash { from { opacity: 0.9; } to { opacity: 0; } }
                    
                    .cam-controls {
                        display: flex;
                        justify-content: space-around;
                        align-items: center;
                        padding: 24px;
                        padding-bottom: max(24px, env(safe-area-inset-bottom));
                        background: rgba(0,0,0,0.95);
                    }
                    
                    .cam-btn {
                        width: 50px;
                        height: 50px;
                        border-radius: 50%;
                        border: none;
                        background: rgba(255,255,255,0.15);
                        color: white;
                        font-size: 22px;
                        cursor: pointer;
                        transition: 0.2s;
                    }
                    .cam-btn:hover { background: rgba(255,255,255,0.25); }
                    
                    .cam-capture {
                        width: 72px;
                        height: 72px;
                        border-radius: 50%;
                        border: 4px solid white;
                        background: transparent;
                        cursor: pointer;
                        position: relative;
                        transition: 0.2s;
                    }
                    .cam-capture:hover { transform: scale(1.05); }
                    .cam-capture:active { transform: scale(0.95); }
                    .cam-capture::after {
                        content: '';
                        position: absolute;
                        inset: 6px;
                        background: white;
                        border-radius: 50%;
                    }
                </style>
                
                <div class="cam-preview">
                    <video class="cam-video" id="cam-video" autoplay playsinline muted></video>
                    <div class="cam-guides">
                        <div class="cam-corner tl"></div>
                        <div class="cam-corner tr"></div>
                        <div class="cam-corner bl"></div>
                        <div class="cam-corner br"></div>
                    </div>
                    <div class="cam-hint">Position document within guides</div>
                    <div class="cam-flash" id="cam-flash"></div>
                </div>
                
                <div class="cam-controls">
                    <button class="cam-btn" id="cam-close">✕</button>
                    <button class="cam-capture" id="cam-capture"></button>
                    <button class="cam-btn" id="cam-switch">🔄</button>
                </div>
                
                <canvas id="cam-canvas" style="display:none;"></canvas>
            `;

            document.body.appendChild(this._modal);

            // Setup video
            const video = this._modal.querySelector('#cam-video');
            video.srcObject = this._stream;
            video.play();

            // Events
            this._modal.querySelector('#cam-close').onclick = () => this.close();
            this._modal.querySelector('#cam-capture').onclick = () => this._capture();
            this._modal.querySelector('#cam-switch').onclick = () => this._switch();

            // Hide hint after 2 seconds
            setTimeout(() => {
                const hint = this._modal?.querySelector('.cam-hint');
                if (hint) hint.style.opacity = '0';
            }, 2000);
        },

        async _switch() {
            this._facingMode = this._facingMode === 'environment' ? 'user' : 'environment';
            this._stream?.getTracks().forEach(t => t.stop());

            try {
                this._stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: this._facingMode },
                    audio: false
                });
                const video = this._modal.querySelector('#cam-video');
                video.srcObject = this._stream;
                video.classList.toggle('mirror', this._facingMode === 'user');
                video.play();
            } catch (err) {
                console.error('[Camera] Switch failed:', err);
            }
        },

        _capture() {
            // Flash
            const flash = this._modal.querySelector('#cam-flash');
            flash.classList.add('active');
            setTimeout(() => flash.classList.remove('active'), 150);

            const video = this._modal.querySelector('#cam-video');
            const canvas = this._modal.querySelector('#cam-canvas');
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            
            if (this._facingMode === 'user') {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }
            
            ctx.drawImage(video, 0, 0);

            canvas.toBlob(blob => {
                const file = new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
                console.log('[Camera] Captured:', Math.round(blob.size/1024) + 'KB');
                
                if (this._onCapture) {
                    this._onCapture(file);
                }
                this.close();
            }, 'image/jpeg', 0.92);
        },

        close() {
            this._stream?.getTracks().forEach(t => t.stop());
            this._stream = null;
            this._modal?.remove();
            this._modal = null;
            if (this._onClose) this._onClose();
            console.log('[Camera] Closed');
        }
    };

    // Export
    window.CameraModule = CameraModule;
    window.AdvancedCameraModule = CameraModule;

    console.log('✅ Camera Module v7.0 ready (minimal UI)');

})();
