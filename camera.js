/**
 * Camera Module for Unit E Ward Rounds
 * Handles camera input, file compression, and image capture functionality
 * Version: 1.0.0
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
            captureMode: 'environment' // Use back camera by default on mobile devices
        },

        // Internal state
        _cameraInput: null,
        _fileCallback: null,
        _debugCallback: null,

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
         */
        openCamera: function() {
            if (!this._cameraInput) {
                this._log('error', 'Camera input not initialized');
                return false;
            }

            try {
                this._log('info', 'Opening camera...');
                this._cameraInput.click();
                return true;
            } catch (error) {
                this._log('error', `Failed to open camera: ${error.message}`);
                return false;
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
                            const canvas = document.createElement('canvas');
                            let width = img.width;
                            let height = img.height;

                            // Calculate new dimensions while maintaining aspect ratio
                            if (width > maxWidth) {
                                height = Math.round((height * maxWidth) / width);
                                width = maxWidth;
                            }

                            canvas.width = width;
                            canvas.height = height;

                            // Get context with optimized settings
                            const ctx = canvas.getContext('2d', { alpha: false });

                            // White background for medical imaging consistency
                            ctx.fillStyle = '#FFFFFF';
                            ctx.fillRect(0, 0, width, height);

                            // Draw image with high quality
                            ctx.imageSmoothingEnabled = true;
                            ctx.imageSmoothingQuality = 'high';
                            ctx.drawImage(img, 0, 0, width, height);

                            // Convert to base64 with high quality
                            const compressed = canvas.toDataURL('image/jpeg', this.config.quality);

                            this._log('info', `Image compressed successfully: ${width}x${height}`);
                            resolve(compressed);

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
                captureMode: this.config.captureMode
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
