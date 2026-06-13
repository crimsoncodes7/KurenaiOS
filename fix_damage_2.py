import re

def fix_all(content):
    # Fix broken objects like:
    # {
    #  "h": "..." }
    # ,
    content = re.sub(r'\{\s+"(h|m|n|q|why|t|marks|ms|opts|ans|ans_m|why_m)": "([^"]*)" \}\s*,', r'    {\n      "\1": "\2"\n    },', content)
    
    # Fix the "n": "n": issue
    content = re.sub(r'"(h|m|n|q|why|t|marks|ms|opts|ans|ans_m|why_m)": "(h|m|n|q|why|t|marks|ms|opts|ans|ans_m|why_m)":', r'"\1":', content)
    
    # Fix callout bodies that became [ "string" ]
    content = re.sub(r'"body": \[ "([^"]*)" \]', r'"body": [ { "n": "\1" } ]', content)
    
    # Fix steps that became strings or broken
    # They should be { "h": "...", "m": "...", "n": "..." }
    
    # General cleanup of extra braces
    content = re.sub(r'\{\s+\{\s+', r'{\n      ', content)
    content = re.sub(r'\s+\}\s+\}', r'\n    }', content)
    
    # Fix commas at the end of blocks
    content = re.sub(r'\}\s+\n\s+\]', r'}\n  ]', content)
    
    return content

for filename in ['js/data/content/maths-applied.js', 'js/data/content/it-f201.js', 'js/data/content/cs-theory-computation.js', 'js/data/content/cs-theory-computation-2.js']:
    with open(filename, 'r') as f:
        content = f.read()
    content = fix_all(content)
    with open(filename, 'w') as f:
        f.write(content)
