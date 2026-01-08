/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  CAMERA MODULE v6.0 - Clean & Simple                                         ║
 * ║  No badge, just works                                                         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

(function() {
    'use strict';

    const CameraModule = {
        version: '6.0.0',
        isReady: true,
        
        _stream: null,
        _modal: null,
        _onCapture: null,
        _onClose: null,
        _facingMode: 'environment',
        _currentLayout: 'full',
        _gridOn: false,
        
        layouts: {
            full: { name: 'Full', ratio: null, icon: '📱' },
            square: { name: '1:1', ratio: 1, icon: '⬜' },
            doc: { name: '4:3', ratio: 4/3, icon: '📄' },
            portrait: { name: '3:4', ratio: 3/4, icon: '🖼️' },
            wide: { name: '16:9', ratio: 16/9, icon: '🎬' }
        },

        init(options = {}) {
            this._onCapture = options.onCapture || null;
            this._onClose = options.onClose || null;
            return this;
        },

        async open(onCapture, onClose) {
            if (onCapture) this._onCapture = onCapture;
            if (onClose) this._onClose = onClose;

            try {
                if (!navigator.mediaDevices?.getUserMedia) {
                    throw new Error('Camera not supported on this device');
                }

                // Request camera with preferences
                this._stream = await navigator.mediaDevices.getUserMedia({
                    video: { 
                        facingMode: this._facingMode, 
                        width: { ideal: 1920 }, 
                        height: { ideal: 1080 } 
                    },
                    audio: false
                }).catch(() => {
                    // Fallback without constraints
                    return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                });

                this._buildUI();
                console.log('[Camera] Opened successfully');
                return true;

            } catch (error) {
                console.error('[Camera] Error:', error);
                alert('📷 Camera Error: ' + error.message + '\n\nPlease check camera permissions.');
                return false;
            }
        },

        _buildUI() {
            if (this._modal) this._modal.remove();

            this._modal = document.createElement('div');
            this._modal.id = 'camera-modal-v6';
            this._modal.innerHTML = `
                <style>
                    #camera-modal-v6 {
                        position: fixed;
                        inset: 0;
                        background: #000;
                        z-index: 999999;
                        display: flex;
                        flex-direction: column;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    }
                    
                    /* Header */
                    .cm6-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 14px 18px;
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    }
                    .cm6-title {
                        color: white;
                        font-size: 17px;
                        font-weight: 700;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .cm6-close {
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        width: 38px;
                        height: 38px;
                        border-radius: 50%;
                        font-size: 18px;
                        cursor: pointer;
                        transition: 0.2s;
                    }
                    .cm6-close:hover { background: rgba(255,255,255,0.3); }
                    
                    /* Preview Area */
                    .cm6-preview {
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #0a0a0a;
                        position: relative;
                        overflow: hidden;
                    }
                    .cm6-video {
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                    }
                    .cm6-video.mirror { transform: scaleX(-1); }
                    
                    /* Frame Overlay */
                    .cm6-frame {
                        position: absolute;
                        border: 3px solid #10b981;
                        border-radius: 10px;
                        box-shadow: 0 0 0 9999px rgba(0,0,0,0.55);
                        pointer-events: none;
                        transition: 0.3s ease;
                    }
                    .cm6-frame.hidden { display: none; }
                    
                    /* Grid Overlay */
                    .cm6-grid {
                        position: absolute;
                        inset: 0;
                        pointer-events: none;
                        opacity: 0;
                        transition: 0.3s;
                    }
                    .cm6-grid.on {
                        opacity: 1;
                        background: 
                            linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px);
                        background-size: 33.33% 33.33%;
                    }
                    
                    /* Flash Effect */
                    .cm6-flash {
                        position: absolute;
                        inset: 0;
                        background: white;
                        opacity: 0;
                        pointer-events: none;
                    }
                    .cm6-flash.active { animation: cm6Flash 0.15s ease-out; }
                    @keyframes cm6Flash { from { opacity: 0.85; } to { opacity: 0; } }
                    
                    /* Layout Selector */
                    .cm6-layouts {
                        display: flex;
                        justify-content: center;
                        gap: 8px;
                        padding: 12px;
                        background: rgba(0,0,0,0.9);
                        overflow-x: auto;
                    }
                    .cm6-layout-btn {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 3px;
                        padding: 8px 12px;
                        background: rgba(255,255,255,0.1);
                        border: 2px solid transparent;
                        border-radius: 12px;
                        color: white;
                        cursor: pointer;
                        transition: 0.2s;
                        min-width: 56px;
                    }
                    .cm6-layout-btn:hover { background: rgba(255,255,255,0.18); }
                    .cm6-layout-btn.active {
                        background: rgba(16, 185, 129, 0.3);
                        border-color: #10b981;
                    }
                    .cm6-layout-icon { font-size: 20px; }
                    .cm6-layout-name { font-size: 10px; font-weight: 600; }
                    
                    /* Controls */
                    .cm6-controls {
                        padding: 18px;
                        background: linear-gradient(180deg, #111 0%, #000 100%);
                    }
                    .cm6-row {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 28px;
                    }
                    .cm6-btn {
                        width: 52px;
                        height: 52px;
                        background: rgba(255,255,255,0.12);
                        border: none;
                        border-radius: 50%;
                        color: white;
                        font-size: 22px;
                        cursor: pointer;
                        transition: 0.2s;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .cm6-btn:hover { background: rgba(255,255,255,0.22); transform: scale(1.08); }
                    .cm6-btn.active { background: rgba(16, 185, 129, 0.5); }
                    
                    /* Capture Button */
                    .cm6-capture {
                        width: 72px;
                        height: 72px;
                        background: #10b981;
                        border: 4px solid rgba(16, 185, 129, 0.4);
                        border-radius: 50%;
                        cursor: pointer;
                        position: relative;
                        transition: 0.2s;
                    }
                    .cm6-capture:hover { 
                        background: #059669; 
                        transform: scale(1.05);
                        box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
                    }
                    .cm6-capture:active { transform: scale(0.95); }
                    .cm6-capture-inner {
                        position: absolute;
                        inset: 4px;
                        background: white;
                        border-radius: 50%;
                    }
                    
                    /* Status Text */
                    .cm6-status {
                        text-align: center;
                        color: rgba(255,255,255,0.5);
                        font-size: 11px;
                        margin-top: 12px;
                    }
                </style>
                
                <div class="cm6-header">
                    <div class="cm6-title">📷 Camera</div>
                    <button class="cm6-close" id="cm6-close">✕</button>
                </div>
                
                <div class="cm6-preview">
                    <video class="cm6-video" id="cm6-video" autoplay playsinline muted></video>
                    <div class="cm6-frame hidden" id="cm6-frame"></div>
                    <div class="cm6-grid" id="cm6-grid"></div>
                    <div class="cm6-flash" id="cm6-flash"></div>
                </div>
                
                <div class="cm6-layouts" id="cm6-layouts"></div>
                
                <div class="cm6-controls">
                    <div class="cm6-row">
                        <button class="cm6-btn" id="cm6-grid-btn" title="Grid">▦</button>
                        <button class="cm6-capture" id="cm6-capture"><div class="cm6-capture-inner"></div></button>
                        <button class="cm6-btn" id="cm6-switch" title="Switch Camera">🔄</button>
                    </div>
                    <div class="cm6-status" id="cm6-status">Tap capture to take photo</div>
                </div>
                
                <canvas id="cm6-canvas" style="display:none;"></canvas>
            `;

            document.body.appendChild(this._modal);

            // Setup video
            const video = this._modal.querySelector('#cm6-video');
            video.srcObject = this._stream;
            video.play();

            // Build layouts
            this._buildLayouts();

            // Events
            this._modal.querySelector('#cm6-close').onclick = () => this.close();
            this._modal.querySelector('#cm6-capture').onclick = () => this._capture();
            this._modal.querySelector('#cm6-switch').onclick = () => this._switch();
            this._modal.querySelector('#cm6-grid-btn').onclick = () => this._toggleGrid();

            this._applyLayout('full');
            this._updateStatus();
        },

        _buildLayouts() {
            const container = this._modal.querySelector('#cm6-layouts');
            container.innerHTML = '';
            
            for (const [key, layout] of Object.entries(this.layouts)) {
                const btn = document.createElement('button');
                btn.className = 'cm6-layout-btn' + (key === this._currentLayout ? ' active' : '');
                btn.innerHTML = `<span class="cm6-layout-icon">${layout.icon}</span><span class="cm6-layout-name">${layout.name}</span>`;
                btn.onclick = () => {
                    container.querySelectorAll('.cm6-layout-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this._applyLayout(key);
                };
                container.appendChild(btn);
            }
        },

        _applyLayout(key) {
            this._currentLayout = key;
            const layout = this.layouts[key];
            const frame = this._modal.querySelector('#cm6-frame');
            const preview = this._modal.querySelector('.cm6-preview');

            if (!layout.ratio) {
                frame.classList.add('hidden');
                return;
            }

            frame.classList.remove('hidden');
            const rect = preview.getBoundingClientRect();
            const containerRatio = rect.width / rect.height;

            let w, h;
            if (layout.ratio > containerRatio) {
                w = rect.width * 0.85;
                h = w / layout.ratio;
            } else {
                h = rect.height * 0.85;
                w = h * layout.ratio;
            }

            frame.style.width = w + 'px';
            frame.style.height = h + 'px';
            frame.style.left = (rect.width - w) / 2 + 'px';
            frame.style.top = (rect.height - h) / 2 + 'px';
        },

        _toggleGrid() {
            this._gridOn = !this._gridOn;
            this._modal.querySelector('#cm6-grid').classList.toggle('on', this._gridOn);
            this._modal.querySelector('#cm6-grid-btn').classList.toggle('active', this._gridOn);
        },

        _updateStatus() {
            const status = this._modal.querySelector('#cm6-status');
            const cam = this._facingMode === 'environment' ? 'Back' : 'Front';
            status.textContent = `${cam} camera • ${this.layouts[this._currentLayout].name} layout`;
        },

        async _switch() {
            this._facingMode = this._facingMode === 'environment' ? 'user' : 'environment';
            this._stream?.getTracks().forEach(t => t.stop());

            try {
                this._stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: this._facingMode },
                    audio: false
                });
                const video = this._modal.querySelector('#cm6-video');
                video.srcObject = this._stream;
                video.classList.toggle('mirror', this._facingMode === 'user');
                video.play();
                this._updateStatus();
            } catch (err) {
                console.error('[Camera] Switch failed:', err);
            }
        },

        _capture() {
            // Flash effect
            const flash = this._modal.querySelector('#cm6-flash');
            flash.classList.add('active');
            setTimeout(() => flash.classList.remove('active'), 150);

            const video = this._modal.querySelector('#cm6-video');
            const canvas = this._modal.querySelector('#cm6-canvas');
            const layout = this.layouts[this._currentLayout];

            let sw = video.videoWidth, sh = video.videoHeight, sx = 0, sy = 0;

            // Crop based on layout
            if (layout.ratio) {
                const vr = sw / sh;
                if (layout.ratio > vr) {
                    const nh = sw / layout.ratio;
                    sy = (sh - nh) / 2;
                    sh = nh;
                } else {
                    const nw = sh * layout.ratio;
                    sx = (sw - nw) / 2;
                    sw = nw;
                }
            }

            canvas.width = sw;
            canvas.height = sh;
            const ctx = canvas.getContext('2d');

            // Mirror if front camera
            if (this._facingMode === 'user') {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }

            ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);

            // Convert to file
            canvas.toBlob(blob => {
                const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
                console.log('[Camera] Captured:', file.name, Math.round(blob.size/1024) + 'KB');
                
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

    console.log('✅ Camera Module v6.0 ready');

})();
