alert("Master Shifu: The Neural System is Online!");

/* * ocr-neural.js
 * Location: Root directory (same as index.html)
 */

// --- 1. OCR Function: The Reader ---
async function readTextFromImage(imagePath) {
    console.log("Master Shifu: Reading image...");
    
    // Check if Tesseract is loaded
    if (typeof Tesseract === 'undefined') {
        console.error("Tesseract library not found."); 
        return;
    }

    try {
        const worker = await Tesseract.createWorker('eng');
        const ret = await worker.recognize(imagePath);
        console.log("Read complete:", ret.data.text);
        await worker.terminate();
        return ret.data.text;
    } catch (err) {
        console.error("OCR Failed:", err);
    }
}

// --- 2. Neural Network: The Thinker ---
// We initialize this immediately so it is ready when called.
const net = new brain.NeuralNetwork();

function trainBrain(data) {
    console.log("Master Shifu: Training the neural network...");
    net.train(data);
    console.log("Training complete.");
}

function askBrain(input) {
    const result = net.run(input);
    console.log("Brain prediction:", result);
    return result;
}

// Example: Auto-train on load (Optional - remove if not needed yet)
// trainBrain([{input: [0, 0], output: [0]}, {input: [1, 1], output: [1]}]);
// --- TEST THE BRAIN ---
setTimeout(() => {
    if (typeof brain === 'undefined') {
        alert("⚠️ Error: Neural Brain Library is MISSING!");
    } else {
        const net = new brain.NeuralNetwork();
        net.train([{input: [0, 0], output: [0]}, {input: [1, 1], output: [1]}]);
        const output = net.run([1, 1]);
        alert("🧠 Neural Brain Active! \nTest Result: " + output[0]);
    }
}, 3000); // Waits 3 seconds to ensure everything loaded
// Master Shifu's System Status Visualizer
(function checkSystem() {
    const statusDiv = document.createElement('div');
    statusDiv.style = "position:fixed; bottom:10px; right:10px; background:rgba(0,0,0,0.8); color:#0f0; padding:10px; border-radius:5px; font-family:monospace; z-index:9999; border:1px solid #0f0; font-size:12px;";
    
    let brainStatus = (typeof brain !== 'undefined') ? "✅ BRAIN ONLINE" : "❌ BRAIN OFFLINE";
    let ocrStatus = (typeof Tesseract !== 'undefined') ? "✅ OCR ONLINE" : "❌ OCR OFFLINE";
    
    statusDiv.innerHTML = `
        <div style="font-weight:bold; margin-bottom:5px;">SYSTEM STATUS</div>
        <div>${brainStatus}</div>
        <div>${ocrStatus}</div>
        <div style="color:#aaa; margin-top:5px; font-size:10px;">File: ocr-neural.js connected</div>
    `;
    
    document.body.appendChild(statusDiv);
})();

