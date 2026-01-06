/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  CAMERA MODULE v4.0 - With Layout Options                                    ║
 * ║  Professional Medical Imaging                                                 ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

(function() {
    'use strict';

    const VERSION = '4.0.0';

    // ═══════════════════════════════════════════════════════════════════════════
    // CAMERA MODULE
    // ═══════════════════════════════════════════════════════════════════════════

    const CameraModule = {
        version: VERSION,
        isReady: true,
        
        // State
        _stream: null,
        _video: null,
        _modal: null,
        _onCapture: null,
        _onClose: null,
        _facingMode: 'environment',
        _currentLayout: 'full',
        _gridEnabled: false,
        
        // Layouts
        layouts: {
            full: { name: 'Full', ratio: null, icon: '📱' },
            square: { name: 'Square', ratio: 1, icon: '⬜' },
            document: { name: 'Document', ratio: 4/3, icon: '📄' },
            portrait: { name: 'Portrait', ratio: 3/4, icon: '🖼️' },
            wide: { name: 'Wide', ratio: 16/9, icon: '🎬' }
        },

        /**
         * Initialize the camera module
         */
        init(options = {}) {
            this._onCapture = options.onCapture || null;
            this._onClose = options.onClose || null;
            this._onError = options.onError || console.error;
            console.log('[CameraModule] Initialized v' + VERSION);
            return this;
        },

        /**
         * Open the camera
         */
        async open(onCapture, onClose) {
            if (onCapture) this._onCapture = onCapture;
            if (onClose) this._onClose = onClose;

            try {
                // Check support
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error('Camera not supported');
                }

                // Request camera
                this._stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: this._facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
                    audio: false
                }).catch(async () => {
                    // Fallback without facingMode
                    return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                });

                // Build UI
                this._buildModal();
                
                console.log('[CameraModule] Camera opened');
                return true;

            } catch (error) {
                console.error('[CameraModule] Error:', error);
                if (this._onError) this._onError(error.message);
                alert('Camera error: ' + error.message);
                return false;
            }
        },

        /**
         * Build the camera modal UI
         */
        _buildModal() {
            // Remove existing
            if (this._modal) this._modal.remove();

            // Create modal
            this._modal = document.createElement('div');
            this._modal.id = 'camera-module-modal';
            this._modal.innerHTML = `
                <style>
                    #camera-module-modal {
                        position: fixed;
                        top: 0; left: 0; right: 0; bottom: 0;
                        background: #000;
                        z-index: 999999;
                        display: flex;
                        flex-direction: column;
                        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                    }
                    .cam-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 12px 16px;
                        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                        color: white;
                    }
                    .cam-title {
                        font-size: 16px;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .cam-close-btn {
                        background: rgba(255,255,255,0.1);
                        border: none;
                        color: white;
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        font-size: 20px;
                        cursor: pointer;
                    }
                    .cam-video-container {
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #111;
                        position: relative;
                        overflow: hidden;
                    }
                    .cam-video {
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                    }
                    .cam-video.mirror {
                        transform: scaleX(-1);
                    }
                    .cam-frame {
                        position: absolute;
                        border: 3px solid rgba(16, 185, 129, 0.8);
                        border-radius: 8px;
                        box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);
                        pointer-events: none;
                        transition: all 0.3s;
                    }
                    .cam-frame.hidden {
                        display: none;
                    }
                    .cam-grid {
                        position: absolute;
                        top: 0; left: 0; right: 0; bottom: 0;
                        pointer-events: none;
                        opacity: 0;
                        transition: opacity 0.3s;
                    }
                    .cam-grid.active {
                        opacity: 1;
                        background-image: 
                            linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px);
                        background-size: 33.33% 33.33%;
                    }
                    .cam-layouts {
                        display: flex;
                        gap: 8px;
                        padding: 12px;
                        background: rgba(0,0,0,0.9);
                        overflow-x: auto;
                        justify-content: center;
                    }
                    .cam-layout-btn {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 4px;
                        padding: 10px 16px;
                        background: rgba(255,255,255,0.1);
                        border: 2px solid transparent;
                        border-radius: 12px;
                        color: white;
                        cursor: pointer;
                        transition: all 0.2s;
                        min-width: 70px;
                    }
                    .cam-layout-btn:hover {
                        background: rgba(255,255,255,0.2);
                    }
                    .cam-layout-btn.active {
                        background: rgba(16, 185, 129, 0.3);
                        border-color: #10b981;
                    }
                    .cam-layout-icon {
                        font-size: 20px;
                    }
                    .cam-layout-name {
                        font-size: 11px;
                    }
                    .cam-controls {
                        padding: 16px;
                        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                    }
                    .cam-controls-row {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 20px;
                    }
                    .cam-action-btn {
                        width: 50px;
                        height: 50px;
                        background: rgba(255,255,255,0.15);
                        border: none;
                        border-radius: 50%;
                        color: white;
                        font-size: 22px;
                        cursor: pointer;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .cam-action-btn:hover {
                        background: rgba(255,255,255,0.25);
                        transform: scale(1.1);
                    }
                    .cam-action-btn.active {
                        background: rgba(16, 185, 129, 0.4);
                    }
                    .cam-capture-btn {
                        width: 72px;
                        height: 72px;
                        background: white;
                        border: 4px solid rgba(255,255,255,0.3);
                        border-radius: 50%;
                        cursor: pointer;
                        position: relative;
                        transition: all 0.2s;
                    }
                    .cam-capture-btn:hover {
                        background: #10b981;
                    }
                    .cam-capture-btn:active {
                        transform: scale(0.95);
                    }
                    .cam-capture-inner {
                        position: absolute;
                        top: 6px; left: 6px; right: 6px; bottom: 6px;
                        background: white;
                        border-radius: 50%;
                        transition: all 0.2s;
                    }
                    .cam-capture-btn:hover .cam-capture-inner {
                        background: #10b981;
                    }
                    .cam-flash {
                        position: absolute;
                        top: 0; left: 0; right: 0; bottom: 0;
                        background: white;
                        opacity: 0;
                        pointer-events: none;
                        z-index: 100;
                    }
                    .cam-flash.active {
                        animation: flashAnim 0.2s ease-out;
                    }
                    @keyframes flashAnim {
                        0% { opacity: 0.9; }
                        100% { opacity: 0; }
                    }
                </style>
                
                <div class="cam-header">
                    <div class="cam-title">📷 Camera</div>
                    <button class="cam-close-btn" id="cam-close">✕</button>
                </div>
                
                <div class="cam-video-container" id="cam-video-container">
                    <video class="cam-video" id="cam-video" autoplay playsinline muted></video>
                    <div class="cam-frame hidden" id="cam-frame"></div>
                    <div class="cam-grid" id="cam-grid"></div>
                    <div class="cam-flash" id="cam-flash"></div>
                </div>
                
                <div class="cam-layouts" id="cam-layouts"></div>
                
                <div class="cam-controls">
                    <div class="cam-controls-row">
                        <button class="cam-action-btn" id="cam-grid-btn" title="Grid">▦</button>
                        <button class="cam-capture-btn" id="cam-capture">
                            <div class="cam-capture-inner"></div>
                        </button>
                        <button class="cam-action-btn" id="cam-switch" title="Switch Camera">🔄</button>
                    </div>
                </div>
                
                <canvas id="cam-canvas" style="display:none;"></canvas>
            `;

            document.body.appendChild(this._modal);

            // Get elements
            this._video = this._modal.querySelector('#cam-video');
            this._video.srcObject = this._stream;
            this._video.play();

            // Build layout buttons
            this._buildLayouts();

            // Event listeners
            this._modal.querySelector('#cam-close').onclick = () => this.close();
            this._modal.querySelector('#cam-capture').onclick = () => this._capture();
            this._modal.querySelector('#cam-switch').onclick = () => this._switchCamera();
            this._modal.querySelector('#cam-grid-btn').onclick = () => this._toggleGrid();

            // Apply initial layout
            this._applyLayout('full');
        },

        /**
         * Build layout selection buttons
         */
        _buildLayouts() {
            const container = this._modal.querySelector('#cam-layouts');
            container.innerHTML = '';

            for (const [key, layout] of Object.entries(this.layouts)) {
                const btn = document.createElement('button');
                btn.className = 'cam-layout-btn' + (key === this._currentLayout ? ' active' : '');
                btn.innerHTML = `
                    <span class="cam-layout-icon">${layout.icon}</span>
                    <span class="cam-layout-name">${layout.name}</span>
                `;
                btn.onclick = () => {
                    container.querySelectorAll('.cam-layout-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this._applyLayout(key);
                };
                container.appendChild(btn);
            }
        },

        /**
         * Apply layout frame
         */
        _applyLayout(key) {
            this._currentLayout = key;
            const layout = this.layouts[key];
            const frame = this._modal.querySelector('#cam-frame');
            const container = this._modal.querySelector('#cam-video-container');

            if (!layout.ratio || key === 'full') {
                frame.classList.add('hidden');
                return;
            }

            frame.classList.remove('hidden');

            const rect = container.getBoundingClientRect();
            const containerRatio = rect.width / rect.height;

            let w, h;
            if (layout.ratio > containerRatio) {
                w = rect.width * 0.9;
                h = w / layout.ratio;
            } else {
                h = rect.height * 0.9;
                w = h * layout.ratio;
            }

            frame.style.width = w + 'px';
            frame.style.height = h + 'px';
            frame.style.left = (rect.width - w) / 2 + 'px';
            frame.style.top = (rect.height - h) / 2 + 'px';
        },

        /**
         * Toggle grid overlay
         */
        _toggleGrid() {
            this._gridEnabled = !this._gridEnabled;
            const grid = this._modal.querySelector('#cam-grid');
            const btn = this._modal.querySelector('#cam-grid-btn');
            grid.classList.toggle('active', this._gridEnabled);
            btn.classList.toggle('active', this._gridEnabled);
        },

        /**
         * Switch between front and back camera
         */
        async _switchCamera() {
            this._facingMode = this._facingMode === 'environment' ? 'user' : 'environment';

            // Stop current stream
            if (this._stream) {
                this._stream.getTracks().forEach(t => t.stop());
            }

            try {
                this._stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: this._facingMode },
                    audio: false
                });

                this._video.srcObject = this._stream;
                this._video.classList.toggle('mirror', this._facingMode === 'user');
                await this._video.play();

            } catch (err) {
                console.error('[CameraModule] Switch error:', err);
            }
        },

        /**
         * Capture photo
         */
        async _capture() {
            // Flash effect
            const flash = this._modal.querySelector('#cam-flash');
            flash.classList.add('active');
            setTimeout(() => flash.classList.remove('active'), 200);

            // Capture
            const video = this._video;
            const canvas = this._modal.querySelector('#cam-canvas');
            const layout = this.layouts[this._currentLayout];

            let sw = video.videoWidth;
            let sh = video.videoHeight;
            let sx = 0, sy = 0;

            // Crop if layout has aspect ratio
            if (layout.ratio) {
                const videoRatio = sw / sh;
                if (layout.ratio > videoRatio) {
                    const newH = sw / layout.ratio;
                    sy = (sh - newH) / 2;
                    sh = newH;
                } else {
                    const newW = sh * layout.ratio;
                    sx = (sw - newW) / 2;
                    sw = newW;
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
                
                if (this._onCapture) {
                    this._onCapture(file);
                }

                this.close();
            }, 'image/jpeg', 0.92);
        },

        /**
         * Close camera
         */
        close() {
            if (this._stream) {
                this._stream.getTracks().forEach(t => t.stop());
                this._stream = null;
            }

            if (this._modal) {
                this._modal.remove();
                this._modal = null;
            }

            if (this._onClose) {
                this._onClose();
            }

            console.log('[CameraModule] Closed');
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // EXPORT
    // ═══════════════════════════════════════════════════════════════════════════

    window.CameraModule = CameraModule;
    window.AdvancedCameraModule = CameraModule;

    console.log('✅ Camera Module v' + VERSION + ' loaded');

    // ═══════════════════════════════════════════════════════════════════════════
    // SHOW BADGE
    // ═══════════════════════════════════════════════════════════════════════════

    function showBadge() {
        if (document.getElementById('cam-badge')) return;

        const badge = document.createElement('div');
        badge.id = 'cam-badge';
        badge.style.cssText = `
            position: fixed;
            top: 60px;
            right: 16px;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 8px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 4px 15px rgba(59,130,246,0.4);
            z-index: 99998;
            cursor: pointer;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            animation: camBadgeIn 0.5s ease-out;
        `;
        badge.innerHTML = `📷 <span>Camera Ready</span> <span style="opacity:0.7;cursor:pointer" onclick="event.stopPropagation();this.parentElement.remove()">×</span>`;

        badge.onclick = () => {
            alert(`📷 CAMERA MODULE v${VERSION}

✅ Status: READY

Features:
• 5 Layout Options (Full, Square, Document, Portrait, Wide)
• Grid Overlay (Rule of Thirds)
• Front/Back Camera Switch
• High Quality Capture (92%)

Click the 📷 button in Labs to use.`);
        };

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes camBadgeIn {
                from { transform: translateX(100px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(badge);

        // Auto-minimize
        setTimeout(() => {
            if (badge.parentElement) {
                badge.querySelector('span').textContent = 'Cam ✓';
                badge.style.padding = '6px 10px';
                badge.style.fontSize = '10px';
            }
        }, 8000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showBadge);
    } else {
        showBadge();
    }

})();
