/**
 * Camera Module for Unit E Ward Rounds
 * Handles camera input, file compression, and image capture functionality
 * Version: 2.1.0 - Fixed race conditions and iOS compatibility
 */

(function(window) {
    'use strict';

    /**
     * Camera Module
     * Provides camera capture functionality for medical imaging
     */
    const CameraModule = {
        // Configuration
        config: {
            maxWidth: 1600,
            quality: 0.95,
            acceptedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
            captureMode: 'environment', // Use back camera by default on mobile devices
            preferNativeCamera: true, // Prefer getUserMedia over file input
            previewEnabled: true // Show preview modal before capture
        },

        // Internal state
        _cameraInput: null,
        _fileCallback: null,
        _debugCallback: null,
        _stream: null,
        _videoElement: null,
        _previewModal: null,
        _currentFacingMode: 'environment',
        _isCapturing: false, // Prevent double captures

        /**
         * Initialize the camera module
         * @param {Object} options - Configuration options
         * @param {Function} options.onFileSelected - Callback when file is selected
         * @param {Function} options.onDebug - Optional debug logging callback
         */
        init: function(options = {}) {
            this._fileCallback = options.onFileSelected || null;
            this._debugCallback = options.onDebug || console.log;

            this._log('info', 'Camera module initialized');

            // Create hidden camera input if not exists
            if (!this._cameraInput) {
                this._createCameraInput();
            }

            return this;
        },

        /**
         * Create hidden camera input element
         * @private
         */
        _createCameraInput: function() {
            // Check if input already exists
            let existingInput = document.getElementById('camera-input-hidden');
            if (existingInput) {
                this._cameraInput = existingInput;
                this._log('info', 'Using existing camera input element');
                return;
            }

            // Create new input element
            const input = document.createElement('input');
            input.id = 'camera-input-hidden';
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = this.config.captureMode;
            input.style.display = 'none';

            // Add change event listener
            input.addEventListener('change', (e) => this._handleInputChange(e));

            // Append to body
            document.body.appendChild(input);
            this._cameraInput = input;

            this._log('info', 'Camera input element created and attached');
        },

        /**
         * Handle file input change event
         * @private
         */
        _handleInputChange: function(e) {
            const file = e.target.files?.[0];

            if (file) {
                this._log('info', `File selected: ${file.name} (${file.size} bytes)`);

                if (this._fileCallback) {
                    this._fileCallback(file);
                }
            } else {
                this._log('warning', 'No file selected');
            }

            // Reset input value to allow selecting the same file again
            e.target.value = '';
        },

        /**
         * Open camera to capture image
         * Uses getUserMedia if available and preferred, falls back to file input
         */
        openCamera: async function() {
            try {
                this._log('info', 'Opening camera...');
                
                // Check if getUserMedia is available and preferred
                if (this.config.preferNativeCamera && this._isGetUserMediaSupported()) {
                    this._log('info', 'Using getUserMedia API');
                    return await this._openNativeCamera();
                } else {
                    this._log('info', 'Using file input fallback');
                    return this._openFileInput();
                }
            } catch (error) {
                this._log('error', `Failed to open camera: ${error.message}`);
                
                // Fallback to file input if native camera fails
                if (this.config.preferNativeCamera) {
                    this._log('info', 'Falling back to file input');
                    return this._openFileInput();
                }
                return false;
            }
        },

        /**
         * Open file input (legacy method)
         * @private
         */
        _openFileInput: function() {
            if (!this._cameraInput) {
                this._log('error', 'Camera input not initialized');
                return false;
            }

            try {
                this._cameraInput.click();
                return true;
            } catch (error) {
                this._log('error', `Failed to open file input: ${error.message}`);
                return false;
            }
        },

        /**
         * Open native camera with getUserMedia
         * @private
         */
        _openNativeCamera: async function() {
            try {
                // Request camera permission
                await this._requestCameraPermission();
                
                // Create and show preview modal
                if (this.config.previewEnabled) {
                    await this._showPreviewModal();
                }
                
                return true;
            } catch (error) {
                this._log('error', `Native camera failed: ${error.message}`);
                throw error;
            }
        },

        /**
         * Request camera permission
         * @private
         */
        _requestCameraPermission: async function() {
            try {
                // Start with back camera (environment)
                const constraints = {
                    video: {
                        facingMode: this._currentFacingMode,
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    },
                    audio: false
                };

                this._stream = await navigator.mediaDevices.getUserMedia(constraints);
                this._log('info', 'Camera permission granted');
                return this._stream;
            } catch (error) {
                // Try without facingMode constraint if it fails (some devices don't support it)
                if (error.name === 'OverconstrainedError') {
                    this._log('warning', 'FacingMode constraint failed, trying without it');
                    try {
                        this._stream = await navigator.mediaDevices.getUserMedia({
                            video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
                            audio: false
                        });
                        this._log('info', 'Camera permission granted (without facingMode)');
                        return this._stream;
                    } catch (fallbackError) {
                        this._log('error', `Camera fallback also failed: ${fallbackError.message}`);
                    }
                }
                
                this._log('error', `Camera permission denied: ${error.message}`);
                this._showErrorMessage('Camera access denied. Please grant camera permissions and try again.');
                throw error;
            }
        },

        /**
         * Show camera preview modal
         * @private
         */
        _showPreviewModal: async function() {
            const self = this;
            
            return new Promise((resolve, reject) => {
                // Prevent multiple modals
                if (this._previewModal) {
                    this._log('warning', 'Preview modal already open');
                    resolve(false);
                    return;
                }

                // Create modal overlay
                const overlay = document.createElement('div');
                overlay.id = 'camera-preview-modal';
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.95);
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                `;

                // Create video element
                const video = document.createElement('video');
                video.autoplay = true;
                video.playsInline = true; // Critical for iOS
                video.muted = true; // Required for autoplay on iOS
                video.setAttribute('playsinline', ''); // iOS Safari
                video.setAttribute('webkit-playsinline', ''); // Older iOS
                video.style.cssText = `
                    max-width: 90%;
                    max-height: 70vh;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                    transform: ${self._currentFacingMode === 'user' ? 'scaleX(-1)' : 'none'};
                `;

                // Create controls container
                const controls = document.createElement('div');
                controls.style.cssText = `
                    display: flex;
                    gap: 16px;
                    margin-top: 24px;
                    flex-wrap: wrap;
                    justify-content: center;
                    padding: 0 16px;
                `;

                // Create buttons with enhanced styling
                const buttonStyle = `
                    padding: 14px 28px;
                    border: none;
                    border-radius: 50px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    touch-action: manipulation;
                    -webkit-tap-highlight-color: transparent;
                `;

                const captureBtn = document.createElement('button');
                captureBtn.innerHTML = '📸 Capture';
                captureBtn.style.cssText = buttonStyle + `
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                `;

                const switchBtn = document.createElement('button');
                switchBtn.innerHTML = '🔄 Switch Camera';
                switchBtn.style.cssText = buttonStyle + `
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                `;

                const cancelBtn = document.createElement('button');
                cancelBtn.innerHTML = '✕ Cancel';
                cancelBtn.style.cssText = buttonStyle + `
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                `;

                // Add hover effects
                [captureBtn, switchBtn, cancelBtn].forEach(btn => {
                    btn.addEventListener('mouseenter', () => {
                        btn.style.transform = 'translateY(-2px)';
                        btn.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
                    });
                    btn.addEventListener('mouseleave', () => {
                        btn.style.transform = 'translateY(0)';
                        btn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                    });
                });

                // Attach stream to video
                video.srcObject = self._stream;
                self._videoElement = video;

                // Explicitly play video (required for iOS)
                video.play().catch(err => {
                    self._log('warning', `Video autoplay failed: ${err.message}`);
                });

                // Button handlers
                captureBtn.onclick = async () => {
                    if (self._isCapturing) return; // Prevent double capture
                    self._isCapturing = true;
                    captureBtn.disabled = true;
                    captureBtn.innerHTML = '⏳ Processing...';
                    
                    try {
                        const imageData = await self._captureFromVideo(video);
                        self._cleanup();
                        if (overlay.parentNode) {
                            document.body.removeChild(overlay);
                        }
                        
                        // Convert to file and trigger callback
                        if (self._fileCallback && imageData) {
                            const file = await self._dataURLtoFile(imageData, `camera-capture-${Date.now()}.jpg`);
                            self._fileCallback(file);
                        }
                        
                        self._isCapturing = false;
                        resolve(true);
                    } catch (error) {
                        self._log('error', `Capture failed: ${error.message}`);
                        self._isCapturing = false;
                        captureBtn.disabled = false;
                        captureBtn.innerHTML = '📸 Capture';
                        self._showErrorMessage('Failed to capture photo. Please try again.');
                    }
                };

                switchBtn.onclick = async () => {
                    try {
                        switchBtn.disabled = true;
                        switchBtn.innerHTML = '⏳ Switching...';
                        await self._switchCamera(video);
                        // Update video mirror transform for front camera
                        video.style.transform = self._currentFacingMode === 'user' ? 'scaleX(-1)' : 'none';
                        switchBtn.disabled = false;
                        switchBtn.innerHTML = '🔄 Switch Camera';
                    } catch (error) {
                        self._log('error', `Switch camera failed: ${error.message}`);
                        switchBtn.disabled = false;
                        switchBtn.innerHTML = '🔄 Switch Camera';
                    }
                };

                cancelBtn.onclick = () => {
                    self._cleanup();
                    if (overlay.parentNode) {
                        document.body.removeChild(overlay);
                    }
                    resolve(false);
                };

                // Assemble modal
                controls.appendChild(captureBtn);
                controls.appendChild(switchBtn);
                controls.appendChild(cancelBtn);
                overlay.appendChild(video);
                overlay.appendChild(controls);

                // Add status text for iOS
                if (self._isIOS()) {
                    const statusText = document.createElement('div');
                    statusText.style.cssText = `
                        color: white;
                        text-align: center;
                        margin-top: 16px;
                        font-size: 14px;
                        opacity: 0.8;
                    `;
                    statusText.textContent = 'iOS detected - optimized camera handling enabled';
                    overlay.appendChild(statusText);
                }

                document.body.appendChild(overlay);
                self._previewModal = overlay;
            });
        },

        /**
         * Capture image from video element
         * @private
         */
        _captureFromVideo: async function(video) {
            // Wait for video to be ready
            if (video.readyState < 2) {
                await new Promise(resolve => {
                    video.onloadeddata = resolve;
                    setTimeout(resolve, 1000); // Fallback timeout
                });
            }

            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 1920;
            canvas.height = video.videoHeight || 1080;

            const ctx = canvas.getContext('2d');
            
            // If using front camera, flip the image
            if (this._currentFacingMode === 'user') {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }
            
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            return canvas.toDataURL('image/jpeg', this.config.quality);
        },

        /**
         * Switch between front and back camera
         * @private
         */
        _switchCamera: async function(video) {
            try {
                // Stop current stream
                if (this._stream) {
                    this._stream.getTracks().forEach(track => track.stop());
                }

                // Toggle facing mode
                this._currentFacingMode = this._currentFacingMode === 'environment' ? 'user' : 'environment';

                // Request new stream
                const constraints = {
                    video: {
                        facingMode: this._currentFacingMode,
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    },
                    audio: false
                };

                try {
                    this._stream = await navigator.mediaDevices.getUserMedia(constraints);
                } catch (constraintError) {
                    // Fallback without facingMode if not supported
                    this._log('warning', 'FacingMode switch failed, trying without constraint');
                    this._stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                }
                
                video.srcObject = this._stream;
                await video.play();

                this._log('info', `Switched to ${this._currentFacingMode} camera`);
            } catch (error) {
                this._log('error', `Failed to switch camera: ${error.message}`);
                this._showErrorMessage('Unable to switch camera. Your device may only have one camera.');
                throw error;
            }
        },

        /**
         * Convert data URL to File object
         * @private
         */
        _dataURLtoFile: async function(dataurl, filename) {
            const arr = dataurl.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            
            return new File([u8arr], filename, { type: mime });
        },

        /**
         * Cleanup camera resources
         * @private
         */
        _cleanup: function() {
            if (this._stream) {
                this._stream.getTracks().forEach(track => track.stop());
                this._stream = null;
            }
            if (this._videoElement) {
                this._videoElement.srcObject = null;
                this._videoElement = null;
            }
            this._previewModal = null;
            this._isCapturing = false;
            this._log('info', 'Camera resources cleaned up');
        },

        /**
         * Check if getUserMedia is supported
         * @private
         */
        _isGetUserMediaSupported: function() {
            return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        },

        /**
         * Check if running on iOS
         * @private
         */
        _isIOS: function() {
            return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        },

        /**
         * Show error message to user
         * @private
         */
        _showErrorMessage: function(message) {
            // Try to use toast notification if available
            if (window.showToast) {
                window.showToast('❌ ' + message);
            } else {
                alert(message);
            }
        },

        /**
         * Compress image file
         * @param {File} file - Image file to compress
         * @param {Number} maxWidth - Maximum width (optional)
         * @returns {Promise<String>} - Base64 encoded compressed image
         */
        compressImage: async function(file, maxWidth = null) {
            maxWidth = maxWidth || this.config.maxWidth;

            return new Promise((resolve, reject) => {
                // Validate file type
                if (!file || !file.type.startsWith('image/')) {
                    reject(new Error('Invalid file type. Please select an image.'));
                    return;
                }

                this._log('info', `Compressing image: ${file.name}`);

                const reader = new FileReader();

                reader.onload = (e) => {
                    const img = new Image();

                    img.onload = () => {
                        try {
                            // Get EXIF orientation
                            this._getOrientation(file, (orientation) => {
                                const canvas = document.createElement('canvas');
                                let width = img.width;
                                let height = img.height;

                                // Calculate new dimensions while maintaining aspect ratio
                                if (width > maxWidth) {
                                    height = Math.round((height * maxWidth) / width);
                                    width = maxWidth;
                                }

                                // Handle orientation
                                if (orientation > 4 && orientation < 9) {
                                    canvas.width = height;
                                    canvas.height = width;
                                } else {
                                    canvas.width = width;
                                    canvas.height = height;
                                }

                                // Get context with optimized settings
                                const ctx = canvas.getContext('2d', { alpha: false });

                                // White background for medical imaging consistency
                                ctx.fillStyle = '#FFFFFF';
                                ctx.fillRect(0, 0, canvas.width, canvas.height);

                                // Transform canvas based on EXIF orientation
                                switch (orientation) {
                                    case 2:
                                        ctx.transform(-1, 0, 0, 1, width, 0);
                                        break;
                                    case 3:
                                        ctx.transform(-1, 0, 0, -1, width, height);
                                        break;
                                    case 4:
                                        ctx.transform(1, 0, 0, -1, 0, height);
                                        break;
                                    case 5:
                                        ctx.transform(0, 1, 1, 0, 0, 0);
                                        break;
                                    case 6:
                                        ctx.transform(0, 1, -1, 0, height, 0);
                                        break;
                                    case 7:
                                        ctx.transform(0, -1, -1, 0, height, width);
                                        break;
                                    case 8:
                                        ctx.transform(0, -1, 1, 0, 0, width);
                                        break;
                                    default:
                                        break;
                                }

                                // Draw image with high quality
                                ctx.imageSmoothingEnabled = true;
                                ctx.imageSmoothingQuality = 'high';
                                ctx.drawImage(img, 0, 0, width, height);

                                // Convert to base64 with high quality
                                const compressed = canvas.toDataURL('image/jpeg', this.config.quality);

                                this._log('info', `Image compressed successfully: ${canvas.width}x${canvas.height}, orientation: ${orientation}`);
                                resolve(compressed);
                            });

                        } catch (error) {
                            this._log('error', `Compression failed: ${error.message}`);
                            reject(error);
                        }
                    };

                    img.onerror = () => {
                        const error = new Error('Failed to load image');
                        this._log('error', error.message);
                        reject(error);
                    };

                    img.src = e.target.result;
                };

                reader.onerror = () => {
                    const error = new Error('Failed to read file');
                    this._log('error', error.message);
                    reject(error);
                };

                reader.readAsDataURL(file);
            });
        },

        /**
         * Get EXIF orientation from image file
         * @private
         */
        _getOrientation: function(file, callback) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const view = new DataView(e.target.result);
                
                if (view.getUint16(0, false) !== 0xFFD8) {
                    callback(-2);
                    return;
                }
                
                const length = view.byteLength;
                let offset = 2;
                
                while (offset < length) {
                    if (view.getUint16(offset + 2, false) <= 8) {
                        callback(-1);
                        return;
                    }
                    
                    const marker = view.getUint16(offset, false);
                    offset += 2;
                    
                    if (marker === 0xFFE1) {
                        if (view.getUint32(offset += 2, false) !== 0x45786966) {
                            callback(-1);
                            return;
                        }
                        
                        const little = view.getUint16(offset += 6, false) === 0x4949;
                        offset += view.getUint32(offset + 4, little);
                        const tags = view.getUint16(offset, little);
                        offset += 2;
                        
                        for (let i = 0; i < tags; i++) {
                            if (view.getUint16(offset + (i * 12), little) === 0x0112) {
                                callback(view.getUint16(offset + (i * 12) + 8, little));
                                return;
                            }
                        }
                    } else if ((marker & 0xFF00) !== 0xFF00) {
                        break;
                    } else {
                        offset += view.getUint16(offset, false);
                    }
                }
                
                callback(-1);
            };
            
            reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
        },

        /**
         * Check if camera is supported
         * @returns {Boolean}
         */
        isCameraSupported: function() {
            // Check if getUserMedia API is available
            const hasGetUserMedia = !!(
                navigator.mediaDevices &&
                navigator.mediaDevices.getUserMedia
            );

            // Check if file input with capture is supported
            const input = document.createElement('input');
            const hasCapture = 'capture' in input;

            return hasGetUserMedia || hasCapture;
        },

        /**
         * Get camera status information
         * @returns {Object}
         */
        getStatus: function() {
            return {
                initialized: !!this._cameraInput,
                supported: this.isCameraSupported(),
                inputElement: !!this._cameraInput,
                captureMode: this.config.captureMode,
                hasGetUserMedia: this._isGetUserMediaSupported(),
                isIOS: this._isIOS()
            };
        },

        /**
         * Update configuration
         * @param {Object} newConfig - New configuration options
         */
        updateConfig: function(newConfig) {
            this.config = { ...this.config, ...newConfig };
            this._log('info', 'Configuration updated', this.config);
        },

        /**
         * Internal logging method
         * @private
         */
        _log: function(type, message, data = null) {
            const logMessage = `[Camera Module] ${message}`;

            if (this._debugCallback) {
                this._debugCallback(type, logMessage, data);
            }

            // Also log to console
            if (type === 'error') {
                console.error(logMessage, data || '');
            } else if (type === 'warning') {
                console.warn(logMessage, data || '');
            } else {
                console.log(logMessage, data || '');
            }
        },

        /**
         * Destroy camera module and clean up
         */
        destroy: function() {
            // Cleanup camera resources
            this._cleanup();
            
            // Remove input element
            if (this._cameraInput && this._cameraInput.parentNode) {
                this._cameraInput.parentNode.removeChild(this._cameraInput);
            }
            
            this._cameraInput = null;
            this._fileCallback = null;
            this._debugCallback = null;
            this._log('info', 'Camera module destroyed');
        }
    };

    // Export to window
    window.CameraModule = CameraModule;

    // Auto-initialize on DOM ready if config exists
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('[Camera Module] Ready for initialization');
        });
    }

})(window);
