/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  ADVANCED CAMERA MODULE v3.0                                                  ║
 * ║  Professional Medical Imaging with Layout Options                             ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  Features:                                                                    ║
 * ║  • Multiple Layout Options (Full, Square, Document, Portrait)                ║
 * ║  • Grid Overlay for Alignment                                                 ║
 * ║  • Zoom Controls                                                              ║
 * ║  • Flash Toggle                                                               ║
 * ║  • Timer Mode                                                                 ║
 * ║  • Quality Settings                                                           ║
 * ║  • Enhanced iOS/Android Compatibility                                         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

(function(window) {
    'use strict';

    const AdvancedCameraModule = {
        // ═══════════════════════════════════════════════════════════════════════
        // CONFIGURATION
        // ═══════════════════════════════════════════════════════════════════════
        
        config: {
            // Image settings
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.92,
            format: 'image/jpeg',
            
            // Camera settings
            defaultFacingMode: 'environment',
            enableZoom: true,
            enableFlash: true,
            enableTimer: true,
            enableGrid: true,
            
            // Layout options
            defaultLayout: 'full',
            availableLayouts: {
                full: { name: 'Full Screen', aspectRatio: null, icon: '📱' },
                square: { name: 'Square (1:1)', aspectRatio: 1, icon: '⬜' },
                document: { name: 'Document (4:3)', aspectRatio: 4/3, icon: '📄' },
                portrait: { name: 'Portrait (3:4)', aspectRatio: 3/4, icon: '🖼️' },
                wide: { name: 'Wide (16:9)', aspectRatio: 16/9, icon: '🎬' },
                lab: { name: 'Lab Report', aspectRatio: 0.7, icon: '🧪' }
            },
            
            // Timer options
            timerOptions: [0, 3, 5, 10],
            
            // Grid options
            gridTypes: ['none', 'thirds', 'golden', 'center']
        },
        
        // ═══════════════════════════════════════════════════════════════════════
        // STATE
        // ═══════════════════════════════════════════════════════════════════════
        
        state: {
            isOpen: false,
            stream: null,
            videoElement: null,
            currentFacingMode: 'environment',
            currentLayout: 'full',
            currentZoom: 1,
            maxZoom: 4,
            flashMode: 'off',
            timerSeconds: 0,
            gridType: 'none',
            isCapturing: false,
            capabilities: null
        },
        
        // Callbacks
        _onCapture: null,
        _onClose: null,
        _onError: null,
        
        // DOM Elements
        _modal: null,
        _video: null,
        _canvas: null,
        _overlay: null,

        // ═══════════════════════════════════════════════════════════════════════
        // INITIALIZATION
        // ═══════════════════════════════════════════════════════════════════════
        
        init(options = {}) {
            this._onCapture = options.onCapture || null;
            this._onClose = options.onClose || null;
            this._onError = options.onError || console.error;
            
            // Merge config
            if (options.config) {
                this.config = { ...this.config, ...options.config };
            }
            
            this.state.currentLayout = this.config.defaultLayout;
            this.state.currentFacingMode = this.config.defaultFacingMode;
            
            console.log('[AdvancedCamera] Initialized');
            return this;
        },

        // ═══════════════════════════════════════════════════════════════════════
        // OPEN CAMERA
        // ═══════════════════════════════════════════════════════════════════════
        
        async open(onCapture, onClose) {
            if (onCapture) this._onCapture = onCapture;
            if (onClose) this._onClose = onClose;
            
            try {
                // Check support
                if (!this._isSupported()) {
                    throw new Error('Camera not supported on this device');
                }
                
                // Request camera
                await this._startCamera();
                
                // Build and show UI
                this._buildUI();
                this.state.isOpen = true;
                
                console.log('[AdvancedCamera] Opened');
                return true;
                
            } catch (error) {
                console.error('[AdvancedCamera] Open failed:', error);
                this._handleError(error);
                return false;
            }
        },
        
        // ═══════════════════════════════════════════════════════════════════════
        // CAMERA CONTROL
        // ═══════════════════════════════════════════════════════════════════════
        
        async _startCamera() {
            const constraints = {
                video: {
                    facingMode: this.state.currentFacingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            };
            
            try {
                this.state.stream = await navigator.mediaDevices.getUserMedia(constraints);
                
                // Get capabilities
                const track = this.state.stream.getVideoTracks()[0];
                if (track.getCapabilities) {
                    this.state.capabilities = track.getCapabilities();
                    if (this.state.capabilities.zoom) {
                        this.state.maxZoom = this.state.capabilities.zoom.max || 4;
                    }
                }
                
                console.log('[AdvancedCamera] Camera started');
                
            } catch (error) {
                // Try fallback without facingMode
                if (error.name === 'OverconstrainedError') {
                    console.log('[AdvancedCamera] Trying fallback constraints');
                    this.state.stream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: false
                    });
                } else {
                    throw error;
                }
            }
        },
        
        async _switchCamera() {
            this.state.currentFacingMode = this.state.currentFacingMode === 'environment' ? 'user' : 'environment';
            
            // Stop current stream
            this._stopStream();
            
            // Start new stream
            await this._startCamera();
            
            // Attach to video
            if (this._video) {
                this._video.srcObject = this.state.stream;
                await this._video.play();
            }
            
            // Update UI
            this._updateMirrorMode();
        },
        
        _stopStream() {
            if (this.state.stream) {
                this.state.stream.getTracks().forEach(track => track.stop());
                this.state.stream = null;
            }
        },
        
        // ═══════════════════════════════════════════════════════════════════════
        // UI BUILDER
        // ═══════════════════════════════════════════════════════════════════════
        
        _buildUI() {
            // Remove existing modal
            if (this._modal) {
                this._modal.remove();
            }
            
            // Create modal container
            this._modal = document.createElement('div');
            this._modal.id = 'advanced-camera-modal';
            this._modal.innerHTML = this._getModalHTML();
            
            // Add styles
            this._addStyles();
            
            // Append to body
            document.body.appendChild(this._modal);
            
            // Get references
            this._video = this._modal.querySelector('#camera-video');
            this._canvas = this._modal.querySelector('#camera-canvas');
            this._overlay = this._modal.querySelector('#camera-overlay');
            
            // Attach stream
            this._video.srcObject = this.state.stream;
            this._video.play();
            
            // Setup event listeners
            this._setupEventListeners();
            
            // Apply initial layout
            this._applyLayout(this.state.currentLayout);
            
            // Update mirror mode
            this._updateMirrorMode();
        },
        
        _getModalHTML() {
            return `
                <div class="adv-camera-backdrop">
                    <div class="adv-camera-container">
                        <!-- Top Bar -->
                        <div class="adv-camera-topbar">
                            <button class="adv-cam-btn adv-cam-close" id="cam-close">✕</button>
                            <div class="adv-camera-title">📷 Camera</div>
                            <button class="adv-cam-btn adv-cam-settings" id="cam-settings">⚙️</button>
                        </div>
                        
                        <!-- Video Container -->
                        <div class="adv-camera-video-wrapper" id="video-wrapper">
                            <video id="camera-video" autoplay playsinline muted></video>
                            <canvas id="camera-canvas" style="display:none;"></canvas>
                            
                            <!-- Overlay for grid/guides -->
                            <div id="camera-overlay" class="adv-camera-overlay">
                                <div class="grid-overlay" id="grid-overlay"></div>
                                <div class="layout-frame" id="layout-frame"></div>
                            </div>
                            
                            <!-- Timer Display -->
                            <div class="timer-display" id="timer-display" style="display:none;">
                                <span id="timer-count">3</span>
                            </div>
                            
                            <!-- Flash Animation -->
                            <div class="flash-overlay" id="flash-overlay"></div>
                        </div>
                        
                        <!-- Layout Selector -->
                        <div class="adv-camera-layouts" id="layout-selector">
                            ${this._getLayoutButtonsHTML()}
                        </div>
                        
                        <!-- Controls Bar -->
                        <div class="adv-camera-controls">
                            <div class="controls-row controls-secondary">
                                <button class="adv-cam-ctrl" id="cam-grid" title="Grid">
                                    <span class="ctrl-icon">▦</span>
                                    <span class="ctrl-label">Grid</span>
                                </button>
                                <button class="adv-cam-ctrl" id="cam-timer" title="Timer">
                                    <span class="ctrl-icon">⏱️</span>
                                    <span class="ctrl-label" id="timer-label">Off</span>
                                </button>
                                <button class="adv-cam-ctrl" id="cam-zoom" title="Zoom">
                                    <span class="ctrl-icon">🔍</span>
                                    <span class="ctrl-label" id="zoom-label">1x</span>
                                </button>
                            </div>
                            
                            <div class="controls-row controls-primary">
                                <button class="adv-cam-action adv-cam-gallery" id="cam-gallery">
                                    <span>📁</span>
                                </button>
                                <button class="adv-cam-capture" id="cam-capture">
                                    <div class="capture-ring"></div>
                                    <div class="capture-inner"></div>
                                </button>
                                <button class="adv-cam-action adv-cam-switch" id="cam-switch">
                                    <span>🔄</span>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Settings Panel (Hidden by default) -->
                        <div class="adv-camera-settings-panel" id="settings-panel" style="display:none;">
                            <div class="settings-header">
                                <span>Camera Settings</span>
                                <button class="settings-close" id="settings-close">✕</button>
                            </div>
                            <div class="settings-content">
                                <div class="setting-item">
                                    <label>Quality</label>
                                    <select id="quality-select">
                                        <option value="0.7">Normal (70%)</option>
                                        <option value="0.85">High (85%)</option>
                                        <option value="0.92" selected>Very High (92%)</option>
                                        <option value="1.0">Maximum (100%)</option>
                                    </select>
                                </div>
                                <div class="setting-item">
                                    <label>Resolution</label>
                                    <select id="resolution-select">
                                        <option value="1280">HD (1280px)</option>
                                        <option value="1920" selected>Full HD (1920px)</option>
                                        <option value="2560">QHD (2560px)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },
        
        _getLayoutButtonsHTML() {
            let html = '';
            for (const [key, layout] of Object.entries(this.config.availableLayouts)) {
                const isActive = key === this.state.currentLayout ? 'active' : '';
                html += `
                    <button class="layout-btn ${isActive}" data-layout="${key}" title="${layout.name}">
                        <span class="layout-icon">${layout.icon}</span>
                        <span class="layout-name">${layout.name}</span>
                    </button>
                `;
            }
            return html;
        },
        
        _addStyles() {
            if (document.getElementById('adv-camera-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'adv-camera-styles';
            styles.textContent = `
                /* ═══════════════════════════════════════════════════════════════════ */
                /* ADVANCED CAMERA STYLES                                              */
                /* ═══════════════════════════════════════════════════════════════════ */
                
                .adv-camera-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: #000;
                    z-index: 99999;
                    display: flex;
                    flex-direction: column;
                }
                
                .adv-camera-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    max-width: 100%;
                    max-height: 100%;
                    overflow: hidden;
                }
                
                /* Top Bar */
                .adv-camera-topbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background: rgba(0,0,0,0.8);
                    color: white;
                    z-index: 10;
                }
                
                .adv-camera-title {
                    font-size: 16px;
                    font-weight: 600;
                }
                
                .adv-cam-btn {
                    background: rgba(255,255,255,0.1);
                    border: none;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    font-size: 18px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .adv-cam-btn:hover {
                    background: rgba(255,255,255,0.2);
                }
                
                /* Video Wrapper */
                .adv-camera-video-wrapper {
                    flex: 1;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #111;
                    overflow: hidden;
                }
                
                #camera-video {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    transition: transform 0.3s;
                }
                
                #camera-video.mirror {
                    transform: scaleX(-1);
                }
                
                /* Overlay */
                .adv-camera-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                /* Grid Overlay */
                .grid-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                }
                
                .grid-overlay.thirds {
                    background-image: 
                        linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px);
                    background-size: 33.33% 33.33%;
                }
                
                .grid-overlay.golden {
                    background-image: 
                        linear-gradient(rgba(255,215,0,0.4) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,215,0,0.4) 1px, transparent 1px);
                    background-size: 38.2% 38.2%;
                    background-position: 30.9% 30.9%;
                }
                
                .grid-overlay.center {
                    background-image: 
                        linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px);
                    background-size: 50% 50%;
                    background-position: center;
                }
                
                /* Layout Frame */
                .layout-frame {
                    position: absolute;
                    border: 3px solid rgba(255,255,255,0.8);
                    border-radius: 8px;
                    box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);
                    transition: all 0.3s ease;
                }
                
                .layout-frame.hidden {
                    display: none;
                }
                
                /* Timer Display */
                .timer-display {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 120px;
                    font-weight: bold;
                    color: white;
                    text-shadow: 0 0 30px rgba(0,0,0,0.8);
                    z-index: 100;
                    animation: timerPulse 1s ease-in-out infinite;
                }
                
                @keyframes timerPulse {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
                }
                
                /* Flash Overlay */
                .flash-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: white;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.1s;
                }
                
                .flash-overlay.flash {
                    animation: flashAnimation 0.2s ease-out;
                }
                
                @keyframes flashAnimation {
                    0% { opacity: 0.8; }
                    100% { opacity: 0; }
                }
                
                /* Layout Selector */
                .adv-camera-layouts {
                    display: flex;
                    gap: 8px;
                    padding: 12px 16px;
                    background: rgba(0,0,0,0.9);
                    overflow-x: auto;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                
                .adv-camera-layouts::-webkit-scrollbar {
                    display: none;
                }
                
                .layout-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    padding: 8px 12px;
                    background: rgba(255,255,255,0.1);
                    border: 2px solid transparent;
                    border-radius: 12px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s;
                    min-width: 70px;
                    flex-shrink: 0;
                }
                
                .layout-btn:hover {
                    background: rgba(255,255,255,0.2);
                }
                
                .layout-btn.active {
                    background: rgba(16, 185, 129, 0.3);
                    border-color: #10b981;
                }
                
                .layout-icon {
                    font-size: 20px;
                }
                
                .layout-name {
                    font-size: 10px;
                    white-space: nowrap;
                }
                
                /* Controls */
                .adv-camera-controls {
                    padding: 16px;
                    background: rgba(0,0,0,0.95);
                }
                
                .controls-row {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 16px;
                }
                
                .controls-secondary {
                    margin-bottom: 20px;
                }
                
                .adv-cam-ctrl {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    padding: 8px 16px;
                    background: rgba(255,255,255,0.1);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .adv-cam-ctrl:hover {
                    background: rgba(255,255,255,0.2);
                }
                
                .adv-cam-ctrl.active {
                    background: rgba(16, 185, 129, 0.3);
                    color: #10b981;
                }
                
                .ctrl-icon {
                    font-size: 18px;
                }
                
                .ctrl-label {
                    font-size: 11px;
                }
                
                /* Capture Button */
                .adv-cam-capture {
                    position: relative;
                    width: 72px;
                    height: 72px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                }
                
                .capture-ring {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    border: 4px solid white;
                    border-radius: 50%;
                    transition: all 0.2s;
                }
                
                .capture-inner {
                    position: absolute;
                    top: 6px;
                    left: 6px;
                    right: 6px;
                    bottom: 6px;
                    background: white;
                    border-radius: 50%;
                    transition: all 0.2s;
                }
                
                .adv-cam-capture:hover .capture-inner {
                    background: #10b981;
                }
                
                .adv-cam-capture:active .capture-inner {
                    transform: scale(0.9);
                }
                
                .adv-cam-capture.capturing .capture-inner {
                    background: #ef4444;
                    animation: capturePulse 0.5s ease-in-out infinite;
                }
                
                @keyframes capturePulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(0.95); }
                }
                
                /* Action Buttons */
                .adv-cam-action {
                    width: 50px;
                    height: 50px;
                    background: rgba(255,255,255,0.1);
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
                
                .adv-cam-action:hover {
                    background: rgba(255,255,255,0.2);
                    transform: scale(1.1);
                }
                
                /* Settings Panel */
                .adv-camera-settings-panel {
                    position: absolute;
                    top: 60px;
                    right: 16px;
                    background: rgba(30,30,30,0.98);
                    border-radius: 16px;
                    padding: 16px;
                    min-width: 250px;
                    z-index: 100;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                }
                
                .settings-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: white;
                    font-weight: 600;
                    margin-bottom: 16px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                
                .settings-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 4px 8px;
                }
                
                .setting-item {
                    margin-bottom: 12px;
                }
                
                .setting-item label {
                    display: block;
                    color: rgba(255,255,255,0.7);
                    font-size: 12px;
                    margin-bottom: 6px;
                }
                
                .setting-item select {
                    width: 100%;
                    padding: 10px 12px;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 8px;
                    color: white;
                    font-size: 14px;
                }
                
                .setting-item select option {
                    background: #333;
                    color: white;
                }
                
                /* Mobile Optimizations */
                @media (max-width: 480px) {
                    .adv-camera-layouts {
                        padding: 8px 12px;
                    }
                    
                    .layout-btn {
                        padding: 6px 10px;
                        min-width: 60px;
                    }
                    
                    .layout-name {
                        font-size: 9px;
                    }
                    
                    .adv-cam-capture {
                        width: 64px;
                        height: 64px;
                    }
                    
                    .adv-cam-action {
                        width: 44px;
                        height: 44px;
                        font-size: 18px;
                    }
                }
            `;
            
            document.head.appendChild(styles);
        },
        
        // ═══════════════════════════════════════════════════════════════════════
        // EVENT LISTENERS
        // ═══════════════════════════════════════════════════════════════════════
        
        _setupEventListeners() {
            // Close button
            this._modal.querySelector('#cam-close').addEventListener('click', () => this.close());
            
            // Capture button
            this._modal.querySelector('#cam-capture').addEventListener('click', () => this._handleCapture());
            
            // Switch camera
            this._modal.querySelector('#cam-switch').addEventListener('click', () => this._switchCamera());
            
            // Gallery (fallback to file input)
            this._modal.querySelector('#cam-gallery').addEventListener('click', () => this._openGallery());
            
            // Grid toggle
            this._modal.querySelector('#cam-grid').addEventListener('click', () => this._toggleGrid());
            
            // Timer toggle
            this._modal.querySelector('#cam-timer').addEventListener('click', () => this._toggleTimer());
            
            // Zoom toggle
            this._modal.querySelector('#cam-zoom').addEventListener('click', () => this._toggleZoom());
            
            // Settings
            this._modal.querySelector('#cam-settings').addEventListener('click', () => this._toggleSettings());
            this._modal.querySelector('#settings-close').addEventListener('click', () => this._toggleSettings());
            
            // Quality change
            this._modal.querySelector('#quality-select').addEventListener('change', (e) => {
                this.config.quality = parseFloat(e.target.value);
            });
            
            // Resolution change
            this._modal.querySelector('#resolution-select').addEventListener('change', (e) => {
                this.config.maxWidth = parseInt(e.target.value);
            });
            
            // Layout buttons
            this._modal.querySelectorAll('.layout-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const layout = btn.dataset.layout;
                    this._applyLayout(layout);
                    
                    // Update active state
                    this._modal.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
            
            // Pinch zoom (mobile)
            this._setupPinchZoom();
        },
        
        _setupPinchZoom() {
            let initialDistance = 0;
            let initialZoom = 1;
            
            const videoWrapper = this._modal.querySelector('#video-wrapper');
            
            videoWrapper.addEventListener('touchstart', (e) => {
                if (e.touches.length === 2) {
                    initialDistance = this._getDistance(e.touches[0], e.touches[1]);
                    initialZoom = this.state.currentZoom;
                }
            });
            
            videoWrapper.addEventListener('touchmove', (e) => {
                if (e.touches.length === 2) {
                    e.preventDefault();
                    const currentDistance = this._getDistance(e.touches[0], e.touches[1]);
                    const scale = currentDistance / initialDistance;
                    const newZoom = Math.min(this.state.maxZoom, Math.max(1, initialZoom * scale));
                    this._setZoom(newZoom);
                }
            });
        },
        
        _getDistance(touch1, touch2) {
            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            return Math.sqrt(dx * dx + dy * dy);
        },
        
        // ═══════════════════════════════════════════════════════════════════════
        // LAYOUT MANAGEMENT
        // ═══════════════════════════════════════════════════════════════════════
        
        _applyLayout(layoutKey) {
            this.state.currentLayout = layoutKey;
            const layout = this.config.availableLayouts[layoutKey];
            const frame = this._modal.querySelector('#layout-frame');
            const wrapper = this._modal.querySelector('#video-wrapper');
            
            if (!layout.aspectRatio || layoutKey === 'full') {
                frame.classList.add('hidden');
                return;
            }
            
            frame.classList.remove('hidden');
            
            // Calculate frame size based on wrapper dimensions
            const wrapperRect = wrapper.getBoundingClientRect();
            const wrapperAspect = wrapperRect.width / wrapperRect.height;
            
            let frameWidth, frameHeight;
            
            if (layout.aspectRatio > wrapperAspect) {
                // Width-constrained
                frameWidth = wrapperRect.width * 0.9;
                frameHeight = frameWidth / layout.aspectRatio;
            } else {
                // Height-constrained
                frameHeight = wrapperRect.height * 0.9;
                frameWidth = frameHeight * layout.aspectRatio;
            }
            
            frame.style.width = `${frameWidth}px`;
            frame.style.height = `${frameHeight}px`;
        },
        
        // ═══════════════════════════════════════════════════════════════════════
        // GRID MANAGEMENT
        // ═══════════════════════════════════════════════════════════════════════
        
        _toggleGrid() {
            const gridTypes = this.config.gridTypes;
            const currentIndex = gridTypes.indexOf(this.state.gridType);
            const nextIndex = (currentIndex + 1) % gridTypes.length;
            this.state.gridType = gridTypes[nextIndex];
            
            const gridOverlay = this._modal.querySelector('#grid-overlay');
            gridOverlay.className = 'grid-overlay';
            
            if (this.state.gridType !== 'none') {
                gridOverlay.classList.add(this.state.gridType);
            }
            
            // Update button state
            const gridBtn = this._modal.querySelector('#cam-grid');
            gridBtn.classList.toggle('active', this.state.gridType !== 'none');
        },
        
        // ═══════════════════════════════════════════════════════════════════════
        // TIMER MANAGEMENT
        // ═══════════════════════════════════════════════════════════════════════
        
        _toggleTimer() {
            const options = this.config.timerOptions;
            const currentIndex = options.indexOf(this.state.timerSeconds);
            const nextIndex = (currentIndex + 1) % options.length;
            this.state.timerSeconds = options[nextIndex];
            
            // Update label
            const label = this._modal.querySelector('#timer-label');
            label.textContent = this.state.timerSeconds === 0 ? 'Off' : `${this.state.timerSeconds}s`;
            
            // Update button state
            const timerBtn = this._modal.querySelector('#cam-timer');
            timerBtn.classList.toggle('active', this.state.timerSeconds > 0);
        },
        
        async _runTimer() {
            const display = this._modal.querySelector('#timer-display');
            const count = this._modal.querySelector('#timer-count');
            
            display.style.display = 'block';
            
            for (let i = this.state.timerSeconds; i > 0; i--) {
                count.textContent = i;
                await this._sleep(1000);
            }
            
            display.style.display = 'none';
        },
        
        // ═══════════════════════════════════════════════════════════════════════
        // ZOOM MANAGEMENT
        // ═══════════════════════════════════════════════════════════════════════
        
        _toggleZoom() {
            const zoomLevels = [1, 1.5, 2, 3];
            const currentIndex = zoomLevels.indexOf(this.state.currentZoom);
            const nextIndex = (currentIndex + 1) % zoomLevels.length;
            this._setZoom(zoomLevels[nextIndex]);
        },
        
        _setZoom(zoom) {
            this.state.currentZoom = zoom;
            
            // Apply zoom via CSS transform
            this._video.style.transform = `scale(${zoom})${this.state.currentFacingMode === 'user' ? ' scaleX(-1)' : ''}`;
            
            // Update label
            const label = this._modal.querySelector('#zoom-label');
            label.textContent = `${zoom}x`;
            
            // Try hardware zoom if supported
            if (this.state.stream && this.state.capabilities?.zoom) {
                const track = this.state.stream.getVideoTracks()[0];
                track.applyConstraints({ advanced: [{ zoom: zoom }] }).catch(() => {});
            }
        },
        
        // ═══════════════════════════════════════════════════════════════════════
        // CAPTURE
        // ═══════════════════════════════════════════════════════════════════════
        
        async _handleCapture() {
            if (this.state.isCapturing) return;
            this.state.isCapturing = true;
            
            const captureBtn = this._modal.querySelector('#cam-capture');
            captureBtn.classList.add('capturing');
            
            try {
                // Run timer if set
                if (this.state.timerSeconds > 0) {
                    await this._runTimer();
                }
                
                // Flash effect
                this._flashEffect();
                
                // Capture image
                const imageData = await this._captureImage();
                
                // Convert to file
                const file = await this._dataURLtoFile(imageData, `capture-${Date.now()}.jpg`);
                
                // Callback
                if (this._onCapture) {
                    this._onCapture(file);
                }
                
                // Close after capture
                this.close();
                
            } catch (error) {
                console.error('[AdvancedCamera] Capture error:', error);
                this._handleError(error);
            } finally {
                this.state.isCapturing = false;
                captureBtn.classList.remove('capturing');
            }
        },
        
        async _captureImage() {
            const video = this._video;
            const canvas = this._canvas;
            const layout = this.config.availableLayouts[this.state.currentLayout];
            
            // Get video dimensions
            let sourceWidth = video.videoWidth;
            let sourceHeight = video.videoHeight;
            
            // Calculate crop if layout has aspect ratio
            let sx = 0, sy = 0, sw = sourceWidth, sh = sourceHeight;
            
            if (layout.aspectRatio) {
                const videoAspect = sourceWidth / sourceHeight;
                
                if (layout.aspectRatio > videoAspect) {
                    // Crop top and bottom
                    sh = sourceWidth / layout.aspectRatio;
                    sy = (sourceHeight - sh) / 2;
                } else {
                    // Crop left and right
                    sw = sourceHeight * layout.aspectRatio;
                    sx = (sourceWidth - sw) / 2;
                }
            }
            
            // Set canvas size
            let outputWidth = sw;
            let outputHeight = sh;
            
            if (outputWidth > this.config.maxWidth) {
                const scale = this.config.maxWidth / outputWidth;
                outputWidth = this.config.maxWidth;
                outputHeight *= scale;
            }
            
            canvas.width = outputWidth;
            canvas.height = outputHeight;
            
            // Draw
            const ctx = canvas.getContext('2d');
            
            // Handle mirror for front camera
            if (this.state.currentFacingMode === 'user') {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }
            
            ctx.drawImage(video, sx, sy, sw, sh, 0, 0, outputWidth, outputHeight);
            
            return canvas.toDataURL(this.config.format, this.config.quality);
        },
        
        _flashEffect() {
            const flash = this._modal.querySelector('#flash-overlay');
            flash.classList.add('flash');
            setTimeout(() => flash.classList.remove('flash'), 200);
        },
        
        // ═══════════════════════════════════════════════════════════════════════
        // UTILITIES
        // ═══════════════════════════════════════════════════════════════════════
        
        _updateMirrorMode() {
            if (this._video) {
                this._video.classList.toggle('mirror', this.state.currentFacingMode === 'user');
            }
        },
        
        _toggleSettings() {
            const panel = this._modal.querySelector('#settings-panel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        },
        
        _openGallery() {
            // Create hidden file input
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e) => {
                const file = e.target.files?.[0];
                if (file && this._onCapture) {
                    this._onCapture(file);
                    this.close();
                }
            };
            input.click();
        },
        
        async _dataURLtoFile(dataurl, filename) {
            const arr = dataurl.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) u8arr[n] = bstr.charCodeAt(n);
            return new File([u8arr], filename, { type: mime });
        },
        
        _sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        
        _isSupported() {
            return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        },
        
        _handleError(error) {
            let message = 'Camera error occurred';
            
            if (error.name === 'NotAllowedError') {
                message = 'Camera access denied. Please grant permission.';
            } else if (error.name === 'NotFoundError') {
                message = 'No camera found on this device.';
            } else if (error.name === 'NotReadableError') {
                message = 'Camera is in use by another application.';
            }
            
            if (this._onError) {
                this._onError(message);
            } else {
                alert(message);
            }
        },
        
        // ═══════════════════════════════════════════════════════════════════════
        // CLOSE
        // ═══════════════════════════════════════════════════════════════════════
        
        close() {
            this._stopStream();
            
            if (this._modal) {
                this._modal.remove();
                this._modal = null;
            }
            
            this.state.isOpen = false;
            
            if (this._onClose) {
                this._onClose();
            }
            
            console.log('[AdvancedCamera] Closed');
        },
        
        // ═══════════════════════════════════════════════════════════════════════
        // PUBLIC API
        // ═══════════════════════════════════════════════════════════════════════
        
        isOpen() {
            return this.state.isOpen;
        },
        
        getState() {
            return { ...this.state };
        },
        
        setLayout(layoutKey) {
            if (this.config.availableLayouts[layoutKey]) {
                this._applyLayout(layoutKey);
            }
        },
        
        getAvailableLayouts() {
            return Object.keys(this.config.availableLayouts);
        }
    };
    
    // Export
    window.AdvancedCameraModule = AdvancedCameraModule;
    window.CameraModule = AdvancedCameraModule; // Backwards compatibility
    
    // Add ready flag
    AdvancedCameraModule.isReady = true;
    AdvancedCameraModule.version = '3.0.0';
    
    console.log('✅ Advanced Camera Module v3.0 loaded');
    
    // ═══════════════════════════════════════════════════════════════════════
    // VISUAL INDICATOR - Shows badge when module is loaded
    // ═══════════════════════════════════════════════════════════════════════
    
    function showCameraBadge() {
        if (document.getElementById('camera-module-badge')) return;
        
        const style = document.createElement('style');
        style.textContent = `
            .camera-module-badge {
                position: fixed;
                top: 60px;
                right: 20px;
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
                z-index: 9998;
                animation: cameraBadgeSlide 0.5s ease-out;
                cursor: pointer;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            
            @keyframes cameraBadgeSlide {
                from { transform: translateX(100px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .camera-module-badge:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
            }
            
            .camera-badge-icon {
                font-size: 14px;
            }
            
            .camera-badge-close {
                margin-left: 8px;
                cursor: pointer;
                opacity: 0.7;
                font-size: 14px;
            }
            
            .camera-badge-close:hover {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
        
        const badge = document.createElement('div');
        badge.id = 'camera-module-badge';
        badge.className = 'camera-module-badge';
        badge.innerHTML = `
            <span class="camera-badge-icon">📷</span>
            <span>Advanced Camera v3.0</span>
            <span class="camera-badge-close" onclick="event.stopPropagation(); this.parentElement.remove();">×</span>
        `;
        
        badge.addEventListener('click', function(e) {
            if (e.target.classList.contains('camera-badge-close')) return;
            
            alert(`📷 ADVANCED CAMERA MODULE v3.0

Status: ✅ INSTALLED & READY

Features:
  📱 Multiple Layouts (Full, Square, Document, Portrait, Wide, Lab)
  ▦ Grid Overlays (Thirds, Golden Ratio, Center)
  ⏱️ Timer Mode (3s, 5s, 10s)
  🔍 Zoom Controls (1x - 4x)
  ⚙️ Quality Settings (70% - 100%)
  🔄 Front/Back Camera Switch
  
Usage:
  Click the 📷 button in Labs to open camera with layout options`);
        });
        
        document.body.appendChild(badge);
        
        // Auto-minimize after 10 seconds
        setTimeout(() => {
            if (badge && badge.parentElement) {
                badge.style.transition = 'all 0.5s ease';
                badge.style.padding = '6px 12px';
                badge.style.fontSize = '10px';
                badge.querySelector('span:nth-child(2)').textContent = 'Camera Ready';
            }
        }, 10000);
    }
    
    // Show badge when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showCameraBadge);
    } else {
        showCameraBadge();
    }
    
})(window);
