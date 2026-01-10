/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  IMAGE INPUT MODULE v1.0 - Quick & Practical                                 ║
 * ║  Multiple easy ways to input images for lab scanning                         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // IMAGE INPUT MODULE
    // ═══════════════════════════════════════════════════════════════════════
    const ImageInput = {
        version: '1.0.0',
        isReady: true,
        
        _callback: null,
        _modal: null,

        /**
         * Quick image picker - shows simple options
         * @param {Function} onImage - Callback with File object
         */
        pick(onImage) {
            this._callback = onImage;
            this._showPicker();
        },

        /**
         * Direct camera capture
         */
        camera(onImage) {
            this._callback = onImage;
            this._openCamera();
        },

        /**
         * Direct gallery/file picker
         */
        gallery(onImage) {
            this._callback = onImage;
            this._openGallery();
        },

        /**
         * Show the picker modal with all options
         */
        _showPicker() {
            if (this._modal) this._modal.remove();

            this._modal = document.createElement('div');
            this._modal.id = 'img-input-modal';
            this._modal.innerHTML = `
                <style>
                    #img-input-modal {
                        position: fixed;
                        inset: 0;
                        background: rgba(0,0,0,0.6);
                        z-index: 999999;
                        display: flex;
                        align-items: flex-end;
                        justify-content: center;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        animation: imgFadeIn 0.2s ease;
                    }
                    @keyframes imgFadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes imgSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                    
                    .img-sheet {
                        background: white;
                        border-radius: 20px 20px 0 0;
                        width: 100%;
                        max-width: 400px;
                        padding: 20px;
                        padding-bottom: max(20px, env(safe-area-inset-bottom));
                        animation: imgSlideUp 0.3s ease;
                    }
                    
                    .img-handle {
                        width: 40px;
                        height: 5px;
                        background: #e0e0e0;
                        border-radius: 3px;
                        margin: 0 auto 16px;
                    }
                    
                    .img-title {
                        font-size: 18px;
                        font-weight: 700;
                        text-align: center;
                        margin-bottom: 20px;
                        color: #1f2937;
                    }
                    
                    .img-options {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 12px;
                        margin-bottom: 16px;
                    }
                    
                    .img-option {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 8px;
                        padding: 20px 12px;
                        border: 2px solid #e5e7eb;
                        border-radius: 16px;
                        background: #f9fafb;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .img-option:hover {
                        border-color: #10b981;
                        background: #ecfdf5;
                        transform: translateY(-2px);
                    }
                    .img-option:active {
                        transform: scale(0.97);
                    }
                    
                    .img-option-icon {
                        font-size: 32px;
                    }
                    .img-option-label {
                        font-size: 13px;
                        font-weight: 600;
                        color: #374151;
                    }
                    
                    .img-drop-zone {
                        border: 2px dashed #d1d5db;
                        border-radius: 12px;
                        padding: 24px;
                        text-align: center;
                        color: #6b7280;
                        font-size: 14px;
                        margin-bottom: 16px;
                        transition: all 0.2s;
                    }
                    .img-drop-zone.dragover {
                        border-color: #10b981;
                        background: #ecfdf5;
                        color: #059669;
                    }
                    .img-drop-zone-icon {
                        font-size: 28px;
                        margin-bottom: 8px;
                    }
                    
                    .img-cancel {
                        width: 100%;
                        padding: 16px;
                        border: none;
                        border-radius: 12px;
                        background: #f3f4f6;
                        color: #374151;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: background 0.2s;
                    }
                    .img-cancel:hover {
                        background: #e5e7eb;
                    }
                    
                    .img-hidden-input {
                        display: none;
                    }
                </style>
                
                <div class="img-sheet">
                    <div class="img-handle"></div>
                    <div class="img-title">📷 Add Lab Image</div>
                    
                    <div class="img-options">
                        <div class="img-option" id="img-camera">
                            <span class="img-option-icon">📸</span>
                            <span class="img-option-label">Camera</span>
                        </div>
                        <div class="img-option" id="img-gallery">
                            <span class="img-option-icon">🖼️</span>
                            <span class="img-option-label">Gallery</span>
                        </div>
                        <div class="img-option" id="img-files">
                            <span class="img-option-icon">📁</span>
                            <span class="img-option-label">Files</span>
                        </div>
                    </div>
                    
                    <div class="img-drop-zone" id="img-drop">
                        <div class="img-drop-zone-icon">⬇️</div>
                        <div>Drop image here or <strong>paste</strong> from clipboard</div>
                    </div>
                    
                    <button class="img-cancel" id="img-cancel">Cancel</button>
                    
                    <input type="file" accept="image/*" capture="environment" class="img-hidden-input" id="img-camera-input">
                    <input type="file" accept="image/*" class="img-hidden-input" id="img-gallery-input">
                    <input type="file" accept="image/*,.pdf" class="img-hidden-input" id="img-file-input">
                </div>
            `;

            document.body.appendChild(this._modal);

            // Event handlers
            const modal = this._modal;
            const self = this;

            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) self._close();
            });

            // Cancel button
            modal.querySelector('#img-cancel').onclick = () => self._close();

            // Camera option
            modal.querySelector('#img-camera').onclick = () => {
                modal.querySelector('#img-camera-input').click();
            };

            // Gallery option  
            modal.querySelector('#img-gallery').onclick = () => {
                modal.querySelector('#img-gallery-input').click();
            };

            // Files option
            modal.querySelector('#img-files').onclick = () => {
                modal.querySelector('#img-file-input').click();
            };

            // File inputs
            modal.querySelector('#img-camera-input').onchange = (e) => self._handleFile(e);
            modal.querySelector('#img-gallery-input').onchange = (e) => self._handleFile(e);
            modal.querySelector('#img-file-input').onchange = (e) => self._handleFile(e);

            // Drag & drop
            const dropZone = modal.querySelector('#img-drop');
            
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            });
            
            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('dragover');
            });
            
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                    self._processFile(file);
                }
            });

            // Paste handler
            document.addEventListener('paste', this._pasteHandler = (e) => {
                const items = e.clipboardData?.items;
                if (!items) return;
                
                for (const item of items) {
                    if (item.type.startsWith('image/')) {
                        e.preventDefault();
                        const file = item.getAsFile();
                        if (file) self._processFile(file);
                        break;
                    }
                }
            });
        },

        _handleFile(e) {
            const file = e.target.files?.[0];
            if (file) {
                this._processFile(file);
            }
        },

        _processFile(file) {
            console.log('[ImageInput] Processing:', file.name, Math.round(file.size/1024) + 'KB');
            
            if (this._callback) {
                this._callback(file);
            }
            
            this._close();
        },

        _openCamera() {
            // Create a temporary file input for camera
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = 'environment';
            input.onchange = (e) => {
                const file = e.target.files?.[0];
                if (file && this._callback) {
                    this._callback(file);
                }
            };
            input.click();
        },

        _openGallery() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files?.[0];
                if (file && this._callback) {
                    this._callback(file);
                }
            };
            input.click();
        },

        _close() {
            if (this._pasteHandler) {
                document.removeEventListener('paste', this._pasteHandler);
                this._pasteHandler = null;
            }
            if (this._modal) {
                this._modal.remove();
                this._modal = null;
            }
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // QUICK SCAN BUTTON COMPONENT
    // Creates a floating scan button that can be added anywhere
    // ═══════════════════════════════════════════════════════════════════════
    const QuickScanButton = {
        _button: null,
        _callback: null,

        /**
         * Create a floating scan button
         * @param {Object} options - Configuration
         * @param {Function} options.onScan - Callback when image selected
         * @param {string} options.position - 'bottom-right', 'bottom-left', 'top-right', 'top-left'
         */
        create(options = {}) {
            const { onScan, position = 'bottom-right' } = options;
            this._callback = onScan;

            if (this._button) this._button.remove();

            this._button = document.createElement('button');
            this._button.id = 'quick-scan-btn';
            
            const positions = {
                'bottom-right': 'bottom: 90px; right: 20px;',
                'bottom-left': 'bottom: 90px; left: 20px;',
                'top-right': 'top: 20px; right: 20px;',
                'top-left': 'top: 20px; left: 20px;'
            };

            this._button.innerHTML = `
                <style>
                    #quick-scan-btn {
                        position: fixed;
                        ${positions[position] || positions['bottom-right']}
                        width: 60px;
                        height: 60px;
                        border-radius: 50%;
                        border: none;
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        color: white;
                        font-size: 26px;
                        cursor: pointer;
                        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
                        z-index: 9999;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    #quick-scan-btn:hover {
                        transform: scale(1.08);
                        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
                    }
                    #quick-scan-btn:active {
                        transform: scale(0.95);
                    }
                </style>
                📷
            `;

            this._button.onclick = () => {
                ImageInput.pick((file) => {
                    if (this._callback) this._callback(file);
                });
            };

            document.body.appendChild(this._button);
            return this._button;
        },

        remove() {
            if (this._button) {
                this._button.remove();
                this._button = null;
            }
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // INLINE SCAN BUTTON
    // A button that can be placed inline (not floating)
    // ═══════════════════════════════════════════════════════════════════════
    function createInlineScanButton(onScan, options = {}) {
        const { 
            text = '📷 Scan Lab', 
            size = 'medium',
            variant = 'primary' 
        } = options;

        const btn = document.createElement('button');
        
        const sizes = {
            small: 'padding: 8px 16px; font-size: 13px;',
            medium: 'padding: 12px 24px; font-size: 15px;',
            large: 'padding: 16px 32px; font-size: 17px;'
        };

        const variants = {
            primary: 'background: linear-gradient(135deg, #10b981, #059669); color: white;',
            secondary: 'background: #f3f4f6; color: #374151; border: 2px solid #e5e7eb;',
            outline: 'background: transparent; color: #10b981; border: 2px solid #10b981;'
        };

        btn.style.cssText = `
            ${sizes[size] || sizes.medium}
            ${variants[variant] || variants.primary}
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border: none;
        `;

        btn.textContent = text;
        
        btn.onmouseover = () => btn.style.transform = 'translateY(-2px)';
        btn.onmouseout = () => btn.style.transform = '';
        
        btn.onclick = () => {
            ImageInput.pick(onScan);
        };

        return btn;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EXPOSE GLOBAL API
    // ═══════════════════════════════════════════════════════════════════════
    window.ImageInput = ImageInput;
    window.QuickScanButton = QuickScanButton;
    window.createInlineScanButton = createInlineScanButton;

    // Also expose as LabScanner for convenience
    window.LabScanner = {
        pick: (cb) => ImageInput.pick(cb),
        camera: (cb) => ImageInput.camera(cb),
        gallery: (cb) => ImageInput.gallery(cb),
        createButton: (opts) => QuickScanButton.create(opts),
        createInlineButton: createInlineScanButton
    };

    console.log('✅ ImageInput Module v1.0 ready');
    console.log('   Usage: ImageInput.pick(file => ...) or LabScanner.pick(file => ...)');

})();
