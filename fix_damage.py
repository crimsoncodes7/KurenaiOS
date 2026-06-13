import sys
import re

def fix_file(path):
    with open(path, 'r') as f:
        content = f.read()
    
    # Fix { "n": "key": "value" } -> { "key": "value" }
    content = re.sub(r'\{ "n": "(h|m|n|q|why|t|marks|ms|opts|ans|ans_m|why_m)":', r'{ "\1":', content)
    
    # Fix { "n": "value" } -> "value" where it was likely a string in an array (table, flashcards, etc)
    # This is tricky. Let's look for common patterns.
    # In tables/rows/flashcards, we have [ { "n": "..." }, { "n": "..." } ]
    # We want [ "...", "..." ]
    
    # Fix double open braces from my failed sed
    content = content.replace('{\n    {', '{\n')
    content = content.replace('}\n    }', '}\n')
    
    # Fix { "n": "Simple random" } -> "Simple random"
    content = re.sub(r'\{ "n": "([^"]*)" \}', r'"\1"', content)
    
    with open(path, 'w') as f:
        f.write(content)

fix_file('js/data/content/maths-applied.js')
fix_file('js/data/content/it-f201.js')
fix_file('js/data/content/cs-theory-computation.js')
fix_file('js/data/content/cs-theory-computation-2.js')
