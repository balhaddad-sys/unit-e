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

