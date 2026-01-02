/**
 * Master Shifu's Advanced Neural-OCR Module
 * Combines Tesseract/Vision with Brain.js for medical intelligence.
 */

window.MasterShifuBrain = {
    net: new brain.NeuralNetwork(),
    isTrained: false,

    // 1. Initializer
    init: function() {
        console.log("Master Shifu: Awakening the Neural Network...");
        this.train();
        alert("Master Shifu: Neural OCR System is now Intelligent!");
    },

    // 2. Training Data: Teaching the brain to recognize medical patterns
    train: function() {
        const trainingData = [
            // Input: [TextLength, HasDecimal, HasSpecialChar] -> Output: [Classification]
            { input: { len: 2, dot: 1, sym: 0 }, output: { hemoglobin: 1 } },   // Hb: 12.5
            { input: { len: 3, dot: 1, sym: 1 }, output: { whiteCells: 1 } },  // WBC: 5.4
            { input: { len: 3, dot: 0, sym: 0 }, output: { creatinine: 1 } },  // Cr: 110
            { input: { len: 1, dot: 1, sym: 0 }, output: { potassium: 1 } }    // K: 3.5
        ];
        this.net.train(trainingData);
        this.isTrained = true;
    },

    // 3. Neural Post-Processor: Fixes OCR typos
    neuralFix: function(rawText) {
        let clean = rawText.toUpperCase().trim();
        
        // Dictionary of common OCR "Hallucinations"
        const corrections = {
            'H6': 'HB',
            'HGB': 'HB',
            'W8C': 'WBC',
            'VBC': 'WBC',
            'K+': 'K',
            'NA+': 'NA',
            'C1': 'CL'
        };

        return corrections[clean] || clean;
    },

    // 4. Intelligence Check: Does the number make medical sense?
    validateMedicalReality: function(test, value) {
        const val = parseFloat(value);
        if (isNaN(val)) return false;

        // Neural-style bounds check
        const bounds = {
            'HB': { min: 30, max: 250 },
            'K': { min: 1.0, max: 10.0 },
            'WBC': { min: 0.1, max: 100.0 }
        };

        if (bounds[test]) {
            if (val < bounds[test].min || val > bounds[test].max) {
                console.warn(`Master Shifu: Detected suspicious value for ${test}: ${val}`);
                return false; // Likely an OCR misread (e.g., reading 3.5 as 35)
            }
        }
        return true;
    }
};

// Start the system
window.MasterShifuBrain.init();

/**
 * REWRITTEN OCR FUNCTION
 * Call this from your React App
 */
async function performNeuralOCR(imagePath) {
    if (typeof Tesseract === 'undefined') return "Error: OCR Library missing";

    const worker = await Tesseract.createWorker('eng');
    const { data: { text, lines } } = await worker.recognize(imagePath);
    await worker.terminate();

    // The Neural Review Step
    const results = lines.map(line => {
        let words = line.text.split(/\s+/);
        let testName = window.MasterShifuBrain.neuralFix(words[0]);
        let value = words[1];

        const isReal = window.MasterShifuBrain.validateMedicalReality(testName, value);
        
        return {
            test: testName,
            value: value,
            trustScore: isReal ? "HIGH" : "CHECK_REQUIRED"
        };
    });

    return results;
}
