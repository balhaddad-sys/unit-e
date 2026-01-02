/* ocr-neural.js - Master Shifu's Neural Module */

// 1. Force Global Exposure so React can see it
window.MasterShifuBrain = {
    net: null,
    isReady: false,
    
    init: function() {
        if (typeof brain !== 'undefined') {
            this.net = new brain.NeuralNetwork();
            this.isReady = true;
            console.log("Master Shifu: Neural Brain Initialized");
            alert("Master Shifu: The Neural System is Online!");
        } else {
            console.error("Brain.js library not found!");
        }
    }
};

// Initialize the brain immediately
window.MasterShifuBrain.init();

// --- Test the logic ---
setTimeout(() => {
    if (window.MasterShifuBrain.isReady) {
        window.MasterShifuBrain.net.train([{input: [0], output: [0]}, {input: [1], output: [1]}]);
        console.log("Self-test complete.");
    }
}, 2000);
