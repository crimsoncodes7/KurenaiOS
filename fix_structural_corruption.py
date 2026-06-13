import re
import os

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Pattern: } followed by a line with just a comma, then a line starting with {
    # Specifically looking for the case where the outer object wasn't closed.
    # We want to replace:
    #       }
    # ,
    #     {
    # with:
    #       }
    #     },
    #     {
    
    # Use regex to find and replace
    new_content = re.sub(r'(\s+)\}\n,\n(\s+)\{', r'\1}\n\2},\n\2{', content)
    
    # Also handle the case where the comma might have some spaces around it but is on its own line
    new_content = re.sub(r'(\s+)\}\n\s*,\s*\n(\s+)\{', r'\1}\n\2},\n\2{', new_content)

    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")
    else:
        print(f"No changes for {filepath}")

files_to_fix = [
    'js/data/content/it-f201.js',
    'js/data/content/maths-applied.js',
    'js/data/content/cs-theory-computation.js',
    'js/data/content/cs-theory-computation-2.js'
]

for f in files_to_fix:
    if os.path.exists(f):
        fix_file(f)
    else:
        print(f"File not found: {f}")
