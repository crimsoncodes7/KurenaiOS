
const fs = require('fs');
const path = require('path');

// Mock the window object
global.window = {};

function validateFile(filePath, expectedKeys) {
    console.log(`Validating ${filePath}...`);
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        eval(content);
        
        const keys = Object.keys(global.window.KOS_CONTENT);
        console.log('Found keys:', keys);
        
        const missing = expectedKeys.filter(k => !keys.includes(`compsci:${k}`));
        if (missing.length > 0) {
            console.error(`Missing keys in ${filePath}:`, missing);
            process.exit(1);
        }
        
        // Basic check for required fields in each entry
        expectedKeys.forEach(k => {
            const entry = global.window.KOS_CONTENT[`compsci:${k}`];
            if (!entry.notes) {
                console.error(`Entry ${k} is missing notes`);
                process.exit(1);
            }
            // Check for Callout + KV, Table, Steps, Code
            const hasCalloutKV = entry.notes.some(n => n.callout && n.callout.body && Array.isArray(n.callout.body) && n.callout.body.some(b => b.kv));
            const hasTable = entry.notes.some(n => n.table);
            const hasSteps = entry.notes.some(n => n.steps);
            const hasCSharpCode = entry.notes.some(n => n.code && n.code.lang === 'csharp');
            
            if (!hasCalloutKV) console.warn(`Entry ${k} might be missing Callout+KV (checked for nested KV in callout body)`);
            if (!hasTable) console.warn(`Entry ${k} missing Table`);
            if (!hasSteps) console.warn(`Entry ${k} missing Steps`);
            if (!hasCSharpCode) console.warn(`Entry ${k} missing C# Code`);
        });
        
        console.log(`${filePath} passed basic validation.\n`);
    } catch (e) {
        console.error(`Error validating ${filePath}:`, e);
        process.exit(1);
    }
}

const keys1 = ['4.3.1.1', '4.3.2.1', '4.3.3.1', '4.3.4.2', '4.3.5.1', '4.3.6.1', '4.1.1.16'];
validateFile('/Users/fj/Downloads/KurenaiOS 2/js/data/content/cs-algorithms.js', keys1);

const keys2 = ['4.3.4.1', '4.3.4.3', '4.3.5.2'];
validateFile('/Users/fj/Downloads/KurenaiOS 2/js/data/content/cs-algorithms-2.js', keys2);

console.log('Validation successful!');
