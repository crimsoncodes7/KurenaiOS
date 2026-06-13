
const fs = require('fs');
const path = require('path');

// Mock the window object
global.window = {};

function validateFile(filePath) {
    console.log(`Validating ${filePath}...`);
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Reset window.KOS_CONTENT for each file
        global.window.KOS_CONTENT = {};
        eval(content);
        
        const keys = Object.keys(global.window.KOS_CONTENT);
        console.log('Found keys:', keys);
        
        if (keys.length === 0) {
            console.error(`No keys found in ${filePath}`);
            process.exit(1);
        }

        keys.forEach(key => {
            const entry = global.window.KOS_CONTENT[key];
            if (!entry.notes) {
                console.error(`Entry ${key} is missing notes`);
                process.exit(1);
            }
            
            // Check for plain lists in notes
            entry.notes.forEach(note => {
                if (typeof note === 'string') {
                    if (note.match(/^\s*[-*•]/m) || note.includes('<ul>') || note.includes('<li>')) {
                        console.error(`Plain list found in ${key} notes: "${note}"`);
                        process.exit(1);
                    }
                    console.error(`Plain text string found in ${key} notes (must be boxed): "${note}"`);
                    process.exit(1);
                }
            });
        });
        
        console.log(`${filePath} passed basic validation.\n`);
    } catch (e) {
        console.error(`Error validating ${filePath}:`, e);
        process.exit(1);
    }
}

const files = [
    'js/data/content/cs-datastructures.js',
    'js/data/content/cs-databases-sys.js',
    'js/data/content/cs-networking-ethics.js',
    'js/data/content/cs-advanced.js'
];

files.forEach(f => {
    const fullPath = path.join('/Users/fj/Downloads/KurenaiOS 2', f);
    if (fs.existsSync(fullPath)) {
        validateFile(fullPath);
    } else {
        console.warn(`File not found: ${fullPath}`);
    }
});

console.log('Validation successful!');
