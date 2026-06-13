const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../js/data/content/cs-programming.js');
const content = fs.readFileSync(filePath, 'utf8');

global.window = {};

try {
    eval(content);
    console.log('Validation successful: File is syntactically correct and loads into global context.');
    
    const requiredKeys = [
        "compsci:4.1.1.1", "compsci:4.1.1.2", "compsci:4.1.1.3", "compsci:4.1.1.4", "compsci:4.1.1.5",
        "compsci:4.1.1.6", "compsci:4.1.1.7", "compsci:4.1.1.8", "compsci:4.1.1.9", "compsci:4.1.1.10",
        "compsci:4.1.1.11", "compsci:4.1.1.12", "compsci:4.1.1.13", "compsci:4.1.1.14", "compsci:4.1.1.15",
        "compsci:4.1.2.3", "compsci:4.2.1.3"
    ];

    requiredKeys.forEach(key => {
        if (!global.window.KOS_CONTENT[key]) {
            throw new Error(`Missing key: ${key}`);
        }
        // Basic check for code blocks where required (4.1.1.13, 4.1.1.15)
        if (["compsci:4.1.1.13", "compsci:4.1.1.15"].includes(key)) {
            const hasCode = global.window.KOS_CONTENT[key].notes.some(n => n.code);
            if (!hasCode) {
                throw new Error(`Key ${key} is missing a code block.`);
            }
        }
    });

    console.log('Key check successful: All required sub-topics are present.');

} catch (err) {
    console.error('Validation failed:', err);
    process.exit(1);
}
