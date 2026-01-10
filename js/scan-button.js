/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SCAN BUTTON COMPONENT v1.0 - Professional Clinical Design                   ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

(function() {
    'use strict';

    const ScanButton = {
        _button: null,
        _callback: null,

        /**
         * Create the professional scan button
         * @param {Function} onScan - Callback when image is selected
         * @param {Object} options - Configuration options
         */
        create(onScan, options = {}) {
            this._callback = onScan;
            
            if (this._button) this._button.remove();

            this._button = document.createElement('button');
            this._button.id = 'scan-btn-pro';
            this._button.innerHTML = `
                <style>
                    #scan-btn-pro {
                        position: fixed;
                        bottom: 100px;
                        right: 20px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 14px 22px;
                        background: #ffffff;
                        border: 2px solid #e2e8f0;
                        border-radius: 14px;
                        color: #1e293b;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        font-size: 15px;
                        font-weight: 600;
                        cursor: pointer;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
                        z-index: 9999;
                        transition: all 0.2s ease;
                    }
                    
                    #scan-btn-pro:hover {
                        border-color: #10b981;
                        box-shadow: 0 6px 16px rgba(16, 185, 129, 0.15), 0 2px 4px rgba(0,0,0,0.04);
                        transform: translateY(-2px);
                    }
                    
                    #scan-btn-pro:active {
                        transform: translateY(0) scale(0.98);
                    }
                    
                    #scan-btn-pro .scan-icon {
                        width: 22px;
                        height: 22px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    #scan-btn-pro .scan-icon svg {
                        width: 100%;
                        height: 100%;
                    }
                    
                    #scan-btn-pro .scan-text {
                        letter-spacing: -0.2px;
                    }
                    
                    /* Subtle pulse animation for attention */
                    @keyframes scanPulse {
                        0%, 100% { box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04); }
                        50% { box-shadow: 0 4px 16px rgba(16, 185, 129, 0.12), 0 2px 4px rgba(0,0,0,0.04); }
                    }
                    
                    #scan-btn-pro.pulse {
                        animation: scanPulse 2s ease-in-out infinite;
                    }
                </style>
                
                <span class="scan-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                    </svg>
                </span>
                <span class="scan-text">Scan Lab</span>
            `;

            this._button.onclick = () => this._handleClick();
            document.body.appendChild(this._button);
            
            return this._button;
        },

        /**
         * Create icon-only version (more minimal)
         */
        createMinimal(onScan) {
            this._callback = onScan;
            
            if (this._button) this._button.remove();

            this._button = document.createElement('button');
            this._button.id = 'scan-btn-minimal';
            this._button.innerHTML = `
                <style>
                    #scan-btn-minimal {
                        position: fixed;
                        bottom: 100px;
                        right: 20px;
                        width: 56px;
                        height: 56px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #ffffff;
                        border: 2px solid #e2e8f0;
                        border-radius: 16px;
                        cursor: pointer;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                        z-index: 9999;
                        transition: all 0.2s ease;
                    }
                    
                    #scan-btn-minimal:hover {
                        border-color: #10b981;
                        box-shadow: 0 6px 16px rgba(16, 185, 129, 0.15);
                        transform: translateY(-2px);
                    }
                    
                    #scan-btn-minimal:active {
                        transform: translateY(0) scale(0.95);
                    }
                    
                    #scan-btn-minimal svg {
                        width: 26px;
                        height: 26px;
                    }
                </style>
                
                <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                </svg>
            `;

            this._button.onclick = () => this._handleClick();
            document.body.appendChild(this._button);
            
            return this._button;
        },

        /**
         * Create inline button (for placing inside containers)
         */
        createInline(onScan, options = {}) {
            const { text = 'Scan Lab', fullWidth = false } = options;
            
            const btn = document.createElement('button');
            btn.className = 'scan-btn-inline';
            btn.innerHTML = `
                <style>
                    .scan-btn-inline {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        padding: 14px 24px;
                        background: #ffffff;
                        border: 2px solid #e2e8f0;
                        border-radius: 12px;
                        color: #1e293b;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        font-size: 15px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        ${fullWidth ? 'width: 100%;' : ''}
                    }
                    
                    .scan-btn-inline:hover {
                        border-color: #10b981;
                        background: #f0fdf4;
                    }
                    
                    .scan-btn-inline:active {
                        transform: scale(0.98);
                    }
                    
                    .scan-btn-inline svg {
                        width: 20px;
                        height: 20px;
                    }
                </style>
                
                <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                </svg>
                <span>${text}</span>
            `;

            btn.onclick = () => {
                if (window.ImageInput) {
                    window.ImageInput.pick(onScan);
                } else {
                    // Fallback to file input
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                        const file = e.target.files?.[0];
                        if (file && onScan) onScan(file);
                    };
                    input.click();
                }
            };
            
            return btn;
        },

        _handleClick() {
            if (window.ImageInput) {
                window.ImageInput.pick(this._callback);
            } else {
                // Fallback to simple file input
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                    const file = e.target.files?.[0];
                    if (file && this._callback) this._callback(file);
                };
                input.click();
            }
        },

        /**
         * Remove the button
         */
        remove() {
            if (this._button) {
                this._button.remove();
                this._button = null;
            }
        },

        /**
         * Show/hide the button
         */
        show() {
            if (this._button) this._button.style.display = 'flex';
        },
        
        hide() {
            if (this._button) this._button.style.display = 'none';
        },

        /**
         * Enable pulse animation (draw attention)
         */
        enablePulse() {
            if (this._button) this._button.classList.add('pulse');
        },
        
        disablePulse() {
            if (this._button) this._button.classList.remove('pulse');
        }
    };

    // Export
    window.ScanButton = ScanButton;

    console.log('✅ ScanButton Component ready (Professional)');

})();
