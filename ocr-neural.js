/* ocr-neural.js - Master Shifu's AI Module */

// 1. Initial Connection Alert (Fixed lowercase 'a')
alert("Master Shifu: The Neural System is Online!");

// --- 2. OCR Function: The Reader ---
async function readTextFromImage(imagePath) {
    console.log("Master Shifu: Reading image...");
    
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

// --- 3. Neural Network: The Thinker ---
const net = (typeof brain !== 'undefined') ? new brain.NeuralNetwork() : null;

function trainBrain(data) {
    if(!net) return console.error("Brain not initialized");
    console.log("Master Shifu: Training the neural network...");
    net.train(data);
    console.log("Training complete.");
}

function askBrain(input) {
    if(!net) return;
    const result = net.run(input);
    console.log("Brain prediction:", result);
    return result;
}

// --- 4. System Status Visualizer & Test ---
(function checkSystem() {
    // Create status box
    const statusDiv = document.createElement('div');
    statusDiv.style = "position:fixed; bottom:10px; right:10px; background:rgba(0,0,0,0.8); color:#0f0; padding:10px; border-radius:5px; font-family:monospace; z-index:9999; border:1px solid #0f0; font-size:12px;";
    
    let brainOnline = (typeof brain !== 'undefined');
    let ocrOnline = (typeof Tesseract !== 'undefined');
    
    statusDiv.innerHTML = `
        <div style="font-weight:bold; margin-bottom:5px;">SYSTEM STATUS</div>
        <div>${brainOnline ? "✅ BRAIN ONLINE" : "❌ BRAIN OFFLINE"}</div>
        <div>${ocrOnline ? "✅ OCR ONLINE" : "❌ OCR OFFLINE"}</div>
        <div style="color:#aaa; margin-top:5px; font-size:10px;">ocr-neural.js connected</div>
    `;
    document.body.appendChild(statusDiv);

    // Run Neural Test if brain is online
    if (brainOnline) {
        setTimeout(() => {
            const testNet = new brain.NeuralNetwork();
            testNet.train([{input: [0, 0], output: [0]}, {input: [1, 1], output: [1]}]);
            const output = testNet.run([1, 1]);
            console.log("Neural Brain Self-Test Result: " + output[0]);
        }, 2000);
    }
})();
