/* ═══════════════════════════════════════════════════════════════════════════
   OCR ENGINE v3.2 - Google Vision API Integration (URL override + timeout)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const CONFIG = {
    // Fallback only — will be overridden by window.__VISION_API_URL__ if present
    VISION_API_URL:
      "https://script.google.com/macros/s/AKfycbwIMPGxFT1F00rKjOEsMrfxjYn6g5hbIRYGi11QdFxVloAIjjARf0UDc4z1hFgudHYk/exec",
    MAX_IMAGE_WIDTH: 1600,
    JPEG_QUALITY: 0.8,
    TIMEOUT_MS: 25000,
  };

  const getVisionUrl = () =>
    (window.__VISION_API_URL__ || window.VISION_API_PROXY_URL || CONFIG.VISION_API_URL || "").trim();

  const compressImage = (file, maxWidth = CONFIG.MAX_IMAGE_WIDTH) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width,
            height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d", { alpha: false });
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL("image/jpeg", CONFIG.JPEG_QUALITY));
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const callVisionAPI = async (dataUrl, callbacks = {}) => {
    const { onProgress, onStage, onLog } = callbacks;

    const visionUrl = getVisionUrl();
    if (!visionUrl) throw new Error("Vision API URL is missing");

    onLog?.("info", `Starting Google Vision OCR...`);
    onStage?.("Preparing image...");
    onProgress?.(10);

    let imageData = dataUrl;
    if (imageData.includes(",")) imageData = imageData.split(",")[1];

    onStage?.("Sending to Google Vision...");
    onProgress?.(30);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

    try {
      // NOTE: No custom headers => avoids CORS preflight (OPTIONS)
      const response = await fetch(visionUrl, {
        method: "POST",
        body: JSON.stringify({
          action: "ocr",
          image: imageData,
          mode: "DOCUMENT_TEXT_DETECTION",
        }),
        cache: "no-store",
        redirect: "follow",
        signal: controller.signal,
      });

      onProgress?.(70);
      onStage?.("Processing response...");

      if (!response.ok) {
        throw new Error(`Vision API HTTP ${response.status}`);
      }

      const responseText = await response.text();

      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        console.error("Raw response:", responseText);
        throw new Error("Failed to parse Vision API response (non-JSON)");
      }

      if (result.error) throw new Error(result.error);

      onProgress?.(95);
      onLog?.("success", `Vision API returned ${result.text?.length || 0} characters`);

      return {
        text: result.text || "",
        confidence: result.confidence || 85,
        lines: result.lines || [],
        source: "google_vision",
      };
    } catch (err) {
      // Better hint for the common “NetworkError”
      if (err?.name === "AbortError") {
        onLog?.("error", "Vision API failed: Request timed out");
        throw new Error("Vision API timed out");
      }
      onLog?.("error", `Vision API failed: ${err.message}`);
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  };

  const runOCR = async (imageSource, callbacks = {}) => {
    const { onProgress, onStage, onLog } = callbacks;
    try {
      let dataUrl = imageSource;

      if (imageSource instanceof File) {
        onStage?.("Compressing image...");
        onProgress?.(5);
        dataUrl = await compressImage(imageSource);
      }

      const result = await callVisionAPI(dataUrl, callbacks);

      onProgress?.(100);
      onStage?.("Complete");
      return result;
    } catch (err) {
      onLog?.("error", `OCR failed: ${err.message}`);
      throw err;
    }
  };

  window.OCREngine = {
    version: "3.2",
    runOCR,
    compressImage,
    callVisionAPI,
    config: CONFIG,
    isReady: true,
  };

  console.log("[OCREngine v3.2] Google Vision OCR module loaded");
})();