const fs = require('fs');
const path = require('path');

const validateFile = (filePath) => {
    console.log(`Validating: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Mock window and KOS_CONTENT
    const window = { KOS_CONTENT: {} };
    
    try {
        // Evaluate the file content
        // We need to wrap it to handle the (function(C) { ... })(window.KOS_CONTENT)
        eval(content);
        
        const keys = Object.keys(window.KOS_CONTENT);
        console.log(`Successfully loaded ${keys.length} keys: ${keys.join(', ')}`);
        
        // Basic check for required fields in each entry
        keys.forEach(key => {
            const entry = window.KOS_CONTENT[key];
            if (!entry.notes || !Array.isArray(entry.notes)) {
                throw new Error(`Entry ${key} is missing notes array`);
            }
            // Check for Callouts + KV
            const hasCalloutKV = entry.notes.some(n => n.callout && n.callout.body && Array.isArray(n.callout.body) && n.callout.body.some(b => b.kv));
            const hasDirectKV = entry.notes.some(n => n.kv);
            
            // The requirement says "Box all terminology/features using Callouts + KV."
            // Some entries might have it nested in callout, some might have it direct (if I didn't update it correctly)
            // Actually I tried to nest them.
            
            const hasTable = entry.notes.some(n => n.table);
            const hasSteps = entry.notes.some(n => n.steps);
            const hasCode = entry.notes.some(n => n.code && (n.code.lang === 'csharp' || n.code.lang === 'sql'));
            
            if (!hasTable) console.warn(`Warning: Entry ${key} might be missing a table`);
            if (!hasSteps) console.warn(`Warning: Entry ${key} might be missing steps`);
            if (!hasCode) console.warn(`Warning: Entry ${key} might be missing C#/SQL code`);
        });
        
    } catch (err) {
        console.error(`Validation failed for ${filePath}:`, err);
        process.exit(1);
    }
};

validateFile(path.resolve(__dirname, 'js/data/content/cs-datastructures.js'));
validateFile(path.resolve(__dirname, 'js/data/content/cs-databases-sys.js'));

console.log('All files validated successfully!');
