/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  CAMERA MODULE v5.0 - AUTO-PATCH                                             ║
 * ║  Works with existing HTML - No changes needed!                               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

(function() {
    'use strict';

    const VERSION = '5.0.0';

    // ═══════════════════════════════════════════════════════════════════════════
    // CAMERA MODULE
    // ═══════════════════════════════════════════════════════════════════════════

    const CameraModule = {
        version: VERSION,
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
            this._onError = options.onError || console.error;
            return this;
        },

        async open(onCapture, onClose) {
            if (onCapture) this._onCapture = onCapture;
            if (onClose) this._onClose = onClose;

            try {
                if (!navigator.mediaDevices?.getUserMedia) {
                    throw new Error('Camera not supported');
                }

                this._stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: this._facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
                    audio: false
                }).catch(() => navigator.mediaDevices.getUserMedia({ video: true, audio: false }));

                this._buildUI();
                return true;

            } catch (error) {
                console.error('[Camera] Error:', error);
                alert('📷 Camera Error: ' + error.message);
                return false;
            }
        },

        _buildUI() {
            if (this._modal) this._modal.remove();

            this._modal = document.createElement('div');
            this._modal.id = 'adv-camera-modal';
            this._modal.innerHTML = `
                <style>
                    #adv-camera-modal {
                        position: fixed;
                        inset: 0;
                        background: #000;
                        z-index: 999999;
                        display: flex;
                        flex-direction: column;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    }
                    .acm-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 16px 20px;
                        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    }
                    .acm-title {
                        color: white;
                        font-size: 18px;
                        font-weight: 700;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    .acm-close {
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        font-size: 20px;
                        cursor: pointer;
                        transition: 0.2s;
                    }
                    .acm-close:hover { background: rgba(255,255,255,0.3); }
                    
                    .acm-preview {
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #0a0a0a;
                        position: relative;
                        overflow: hidden;
                    }
                    .acm-video {
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                    }
                    .acm-video.mirror { transform: scaleX(-1); }
                    
                    .acm-frame {
                        position: absolute;
                        border: 3px solid #10b981;
                        border-radius: 12px;
                        box-shadow: 0 0 0 9999px rgba(0,0,0,0.6);
                        pointer-events: none;
                        transition: 0.3s;
                    }
                    .acm-frame.hidden { display: none; }
                    
                    .acm-grid {
                        position: absolute;
                        inset: 0;
                        pointer-events: none;
                        opacity: 0;
                        transition: 0.3s;
                    }
                    .acm-grid.on {
                        opacity: 1;
                        background: 
                            linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px);
                        background-size: 33.33% 33.33%;
                    }
                    
                    .acm-flash {
                        position: absolute;
                        inset: 0;
                        background: white;
                        opacity: 0;
                        pointer-events: none;
                    }
                    .acm-flash.active { animation: acmFlash 0.15s; }
                    @keyframes acmFlash { from { opacity: 0.9; } to { opacity: 0; } }
                    
                    .acm-layouts {
                        display: flex;
                        justify-content: center;
                        gap: 10px;
                        padding: 14px;
                        background: #111;
                    }
                    .acm-layout-btn {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 4px;
                        padding: 10px 14px;
                        background: rgba(255,255,255,0.08);
                        border: 2px solid transparent;
                        border-radius: 14px;
                        color: white;
                        cursor: pointer;
                        transition: 0.2s;
                        min-width: 60px;
                    }
                    .acm-layout-btn:hover { background: rgba(255,255,255,0.15); }
                    .acm-layout-btn.active {
                        background: rgba(16, 185, 129, 0.25);
                        border-color: #10b981;
                    }
                    .acm-layout-icon { font-size: 22px; }
                    .acm-layout-name { font-size: 11px; font-weight: 500; }
                    
                    .acm-controls {
                        padding: 20px;
                        background: linear-gradient(135deg, #1e1e2e 0%, #111 100%);
                    }
                    .acm-row {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 24px;
                    }
                    .acm-btn {
                        width: 54px;
                        height: 54px;
                        background: rgba(255,255,255,0.12);
                        border: none;
                        border-radius: 50%;
                        color: white;
                        font-size: 24px;
                        cursor: pointer;
                        transition: 0.2s;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .acm-btn:hover { background: rgba(255,255,255,0.2); transform: scale(1.1); }
                    .acm-btn.active { background: rgba(16, 185, 129, 0.4); }
                    
                    .acm-capture {
                        width: 76px;
                        height: 76px;
                        background: white;
                        border: 5px solid rgba(255,255,255,0.4);
                        border-radius: 50%;
                        cursor: pointer;
                        position: relative;
                        transition: 0.2s;
                    }
                    .acm-capture:hover { background: #10b981; border-color: #10b981; }
                    .acm-capture:active { transform: scale(0.95); }
                    .acm-capture-inner {
                        position: absolute;
                        inset: 5px;
                        background: inherit;
                        border-radius: 50%;
                    }
                </style>
                
                <div class="acm-header">
                    <div class="acm-title">📷 Camera</div>
                    <button class="acm-close" id="acm-close">✕</button>
                </div>
                
                <div class="acm-preview">
                    <video class="acm-video" id="acm-video" autoplay playsinline muted></video>
                    <div class="acm-frame hidden" id="acm-frame"></div>
                    <div class="acm-grid" id="acm-grid"></div>
                    <div class="acm-flash" id="acm-flash"></div>
                </div>
                
                <div class="acm-layouts" id="acm-layouts"></div>
                
                <div class="acm-controls">
                    <div class="acm-row">
                        <button class="acm-btn" id="acm-grid-btn" title="Grid">▦</button>
                        <button class="acm-capture" id="acm-capture"><div class="acm-capture-inner"></div></button>
                        <button class="acm-btn" id="acm-switch" title="Switch">🔄</button>
                    </div>
                </div>
                
                <canvas id="acm-canvas" style="display:none;"></canvas>
            `;

            document.body.appendChild(this._modal);

            // Setup video
            const video = this._modal.querySelector('#acm-video');
            video.srcObject = this._stream;
            video.play();

            // Build layouts
            this._buildLayouts();

            // Events
            this._modal.querySelector('#acm-close').onclick = () => this.close();
            this._modal.querySelector('#acm-capture').onclick = () => this._capture();
            this._modal.querySelector('#acm-switch').onclick = () => this._switch();
            this._modal.querySelector('#acm-grid-btn').onclick = () => this._toggleGrid();

            this._applyLayout('full');
        },

        _buildLayouts() {
            const container = this._modal.querySelector('#acm-layouts');
            for (const [key, layout] of Object.entries(this.layouts)) {
                const btn = document.createElement('button');
                btn.className = 'acm-layout-btn' + (key === this._currentLayout ? ' active' : '');
                btn.innerHTML = `<span class="acm-layout-icon">${layout.icon}</span><span class="acm-layout-name">${layout.name}</span>`;
                btn.onclick = () => {
                    container.querySelectorAll('.acm-layout-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this._applyLayout(key);
                };
                container.appendChild(btn);
            }
        },

        _applyLayout(key) {
            this._currentLayout = key;
            const layout = this.layouts[key];
            const frame = this._modal.querySelector('#acm-frame');
            const preview = this._modal.querySelector('.acm-preview');

            if (!layout.ratio) {
                frame.classList.add('hidden');
                return;
            }

            frame.classList.remove('hidden');
            const rect = preview.getBoundingClientRect();
            const containerRatio = rect.width / rect.height;

            let w, h;
            if (layout.ratio > containerRatio) {
                w = rect.width * 0.88;
                h = w / layout.ratio;
            } else {
                h = rect.height * 0.88;
                w = h * layout.ratio;
            }

            frame.style.width = w + 'px';
            frame.style.height = h + 'px';
            frame.style.left = (rect.width - w) / 2 + 'px';
            frame.style.top = (rect.height - h) / 2 + 'px';
        },

        _toggleGrid() {
            this._gridOn = !this._gridOn;
            this._modal.querySelector('#acm-grid').classList.toggle('on', this._gridOn);
            this._modal.querySelector('#acm-grid-btn').classList.toggle('active', this._gridOn);
        },

        async _switch() {
            this._facingMode = this._facingMode === 'environment' ? 'user' : 'environment';
            this._stream?.getTracks().forEach(t => t.stop());

            try {
                this._stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: this._facingMode },
                    audio: false
                });
                const video = this._modal.querySelector('#acm-video');
                video.srcObject = this._stream;
                video.classList.toggle('mirror', this._facingMode === 'user');
                video.play();
            } catch (err) {
                console.error('[Camera] Switch failed:', err);
            }
        },

        _capture() {
            // Flash
            const flash = this._modal.querySelector('#acm-flash');
            flash.classList.add('active');
            setTimeout(() => flash.classList.remove('active'), 150);

            const video = this._modal.querySelector('#acm-video');
            const canvas = this._modal.querySelector('#acm-canvas');
            const layout = this.layouts[this._currentLayout];

            let sw = video.videoWidth, sh = video.videoHeight, sx = 0, sy = 0;

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

            if (this._facingMode === 'user') {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }

            ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);

            canvas.toBlob(blob => {
                const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
                if (this._onCapture) this._onCapture(file);
                this.close();
            }, 'image/jpeg', 0.92);
        },

        close() {
            this._stream?.getTracks().forEach(t => t.stop());
            this._stream = null;
            this._modal?.remove();
            this._modal = null;
            if (this._onClose) this._onClose();
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // AUTO-PATCH: Override FAB camera button
    // ═══════════════════════════════════════════════════════════════════════════

    function patchCameraButton() {
        // Watch for FAB menu camera button clicks
        document.addEventListener('click', function(e) {
            const target = e.target.closest('.fab-menu-item');
            if (!target) return;
            
            // Check if it's the camera button (contains 📷 or "Camera")
            const text = target.textContent || '';
            if (text.includes('📷') || text.toLowerCase().includes('camera')) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                console.log('[Camera] Intercepted camera button click');
                
                // Find the handleFileInput function by looking for file input nearby
                const fileInput = document.querySelector('input[type="file"][accept*="image"]');
                
                CameraModule.open(
                    (file) => {
                        console.log('[Camera] Photo captured:', file.name);
                        // Trigger file input change event with our file
                        if (fileInput) {
                            const dt = new DataTransfer();
                            dt.items.add(file);
                            fileInput.files = dt.files;
                            fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    },
                    () => console.log('[Camera] Closed')
                );
            }
        }, true); // Use capture phase to intercept before React
        
        console.log('[Camera] Auto-patch installed');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EXPORT
    // ═══════════════════════════════════════════════════════════════════════════

    window.CameraModule = CameraModule;
    window.AdvancedCameraModule = CameraModule;

    console.log('✅ Camera Module v' + VERSION + ' loaded (auto-patch)');

    // ═══════════════════════════════════════════════════════════════════════════
    // BADGE
    // ═══════════════════════════════════════════════════════════════════════════

    function showBadge() {
        if (document.getElementById('cam-ready-badge')) return;

        const badge = document.createElement('div');
        badge.id = 'cam-ready-badge';
        badge.style.cssText = `
            position: fixed;
            top: 60px;
            right: 16px;
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            color: white;
            padding: 8px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 15px rgba(99,102,241,0.4);
            z-index: 99998;
            cursor: pointer;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            animation: camIn 0.4s ease-out;
        `;
        badge.innerHTML = `📷 <span>Camera v5</span> <span style="opacity:0.6;cursor:pointer" onclick="event.stopPropagation();this.parentElement.remove()">×</span>`;

        const style = document.createElement('style');
        style.textContent = `@keyframes camIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
        document.head.appendChild(style);

        badge.onclick = () => alert(`📷 Camera Module v${VERSION}\n\n✅ Status: READY\n\nFeatures:\n• 5 Layout Options\n• Grid Overlay\n• Front/Back Switch\n• High Quality Capture\n\nClick 📷 in Labs to use!`);

        document.body.appendChild(badge);

        setTimeout(() => {
            if (badge.parentElement) {
                badge.querySelector('span').textContent = 'Cam ✓';
                badge.style.padding = '6px 10px';
                badge.style.fontSize = '10px';
            }
        }, 8000);
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            showBadge();
            patchCameraButton();
        });
    } else {
        showBadge();
        patchCameraButton();
    }

})();
