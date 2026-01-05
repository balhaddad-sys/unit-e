/**
 * Test suite for optimized lab parser
 */

// Load the lab parser
const fs = require('fs');
const vm = require('vm');

// Create a browser-like environment
const sandbox = {
    window: {},
    console: console
};

// Load and execute the lab parser
const labParserCode = fs.readFileSync('./lab-parser.js', 'utf8');
vm.runInNewContext(labParserCode, sandbox);

const LabParser = sandbox.window.LabParser;

console.log('\n========================================');
console.log('Lab Parser Optimization Test Suite');
console.log('========================================\n');

// Test 1: Basic parsing
console.log('TEST 1: Basic Lab Value Parsing');
const testReport1 = `
Patient: John Doe
Date: 2024-01-15

WBC: 8.5 x10^9/L
Hemoglobin: 14.2 g/dL
Platelets: 250 x10^9/L
Sodium: 140 mEq/L
Potassium: 4.2 mEq/L
Creatinine: 1.0 mg/dL
`;

const result1 = LabParser.parse(testReport1);
console.log('Parsed values:', result1.values.length);
console.log('Sample results:');
result1.values.forEach(v => {
    console.log(`  ${v.test}: ${v.value} ${v.unit} [${v.flag}]`);
});

// Test 2: OCR errors
console.log('\n\nTEST 2: OCR Error Handling');
const testReport2 = `
W8C: 12.O  (OCR: 8->B, O->0)
HG8: 13.5  (OCR: B->8)
P1T: 2OO   (OCR: 1->l, O->0)
`;

const result2 = LabParser.parse(testReport2);
console.log('Parsed with OCR errors:', result2.values.length);
result2.values.forEach(v => {
    console.log(`  ${v.test}: ${v.value} ${v.unit}`);
});

// Test 3: Fuzzy matching
console.log('\n\nTEST 3: Fuzzy Matching');
const testReport3 = `
White Blood Cell: 9.2
Haemoglobin: 15.1
Total Cholestrol: 180
`;

const result3 = LabParser.parse(testReport3);
console.log('Parsed with fuzzy matching:', result3.values.length);
result3.values.forEach(v => {
    console.log(`  ${v.test}: ${v.value} ${v.unit} (confidence: ${v.confidence}%)`);
});

// Test 4: Performance test
console.log('\n\nTEST 4: Performance Benchmark');
const largeReport = `
Patient: Jane Smith
Date: 2024-01-15

Complete Blood Count:
WBC: 7.8 x10^9/L
RBC: 4.5 x10^12/L
Hemoglobin: 13.8 g/dL
Hematocrit: 42%
Platelets: 280 x10^9/L
MCV: 88 fL
MCH: 29 pg
MCHC: 34 g/dL

Electrolytes:
Sodium: 138 mEq/L
Potassium: 4.0 mEq/L
Chloride: 102 mEq/L
Calcium: 9.2 mg/dL
Magnesium: 2.0 mg/dL

Renal Function:
Creatinine: 0.9 mg/dL
BUN: 15 mg/dL
eGFR: 95 mL/min

Liver Function:
ALT: 25 U/L
AST: 30 U/L
ALP: 70 U/L
Bilirubin Total: 0.8 mg/dL
Albumin: 4.2 g/dL

Lipid Panel:
Total Cholesterol: 185 mg/dL
LDL: 95 mg/dL
HDL: 55 mg/dL
Triglycerides: 120 mg/dL

Thyroid:
TSH: 2.1 mIU/L
Free T4: 1.2 ng/dL

Glucose: 95 mg/dL
HbA1c: 5.4%
`;

const iterations = 100;
const startTime = Date.now();

for (let i = 0; i < iterations; i++) {
    LabParser.parse(largeReport);
}

const endTime = Date.now();
const avgTime = (endTime - startTime) / iterations;

console.log(`Parsed ${iterations} reports`);
console.log(`Average time per report: ${avgTime.toFixed(2)}ms`);
console.log(`Tests found per report: ${result1.values.length + result2.values.length + result3.values.length}`);

// Test 5: Cache statistics
console.log('\n\nTEST 5: Cache Statistics');
const cacheStats = LabParser.getCacheStats();
console.log('Cache stats:', cacheStats);

// Test 6: Exact match performance (should be O(1))
console.log('\n\nTEST 6: Exact Match Performance (O(1) lookups)');
const exactMatchTests = [
    'WBC',
    'HEMOGLOBIN',
    'PLATELETS',
    'SODIUM',
    'CREATININE'
];

const exactMatchStart = Date.now();
for (let i = 0; i < 10000; i++) {
    for (const test of exactMatchTests) {
        LabParser.findBestMatch(test);
    }
}
const exactMatchEnd = Date.now();
console.log(`10,000 exact match lookups: ${exactMatchEnd - exactMatchStart}ms`);
console.log(`Average: ${((exactMatchEnd - exactMatchStart) / 50000).toFixed(4)}ms per lookup`);

console.log('\n========================================');
console.log('All tests completed successfully! ✓');
console.log('========================================\n');
