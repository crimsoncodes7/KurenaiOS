
import re

def fix_content(content):
    # Fix the mistake from the previous run: too many closing braces
    content = content.replace('}\n    }\n    }\n  ]', '}\n    }\n  ]')
    
    # Fix the corrupted nesting clusters if any are left
    content = re.sub(r'\}\s*\](?:\s*\}\s*\])+\s*\};', '}\n  ]\n};', content)
    
    # Map callout types
    content = content.replace('"t": "danger"', '"t": "warn"')
    content = content.replace('"t": "important"', '"t": "info"')
    content = content.replace('"t": "example"', '"t": "info"')
    content = content.replace('"t": "key"', '"t": "info"')
    content = content.replace('"t": "process"', '"t": "info"')

    # Wrap math symbols/variables in $
    math_vars = [
        'ROI', '6Vs', 'IoT', 'NLP', 'DBMS', 'RDBMS', 'IoE', 'GPS', 'CCTV', 
        'JSON', 'XML', 'SQL', 'NoSQL', 'AWS', 'API', 'IT', 'AI', 'ML', 
        'GDPR', 'UK GDPR', 'DPA', 'ICO', 'Hadoop', 'Spark', 'TCP/IP', 'IP', 'MAC'
    ]
    
    def math_replacer(match):
        s = match.group(0)
        # Avoid already wrapped
        if '$' in s: return s
        # Avoid being inside another word (use word boundaries)
        for v in math_vars:
            s = re.sub(r'(?<!\$)\b' + re.escape(v) + r'\b(?!\$)', r'$' + v + r'$', s)
        # Single letter V and others
        s = re.sub(r'(?<!\$)\bV\b(?!\$)', r'$V$', s)
        # Numerical values
        s = re.sub(r'(?<!\$)\b(\d+(?:\.\d+)?%)\b(?!\$)', r'$\1$', s)
        s = re.sub(r'(?<!\$)\b(£\d+(?:\.\d+)?[mb]?)\b(?!\$)', r'$\1$', s)
        s = re.sub(r'(?<!\$)\b(~?\d+%)\b(?!\$)', r'$\1$', s)
        return s

    content = re.sub(r'"([^"]*)"', math_replacer, content)
    
    # Fix double $$ if any
    content = content.replace('$$', '$')
    content = content.replace('$$', '$')

    return content

if __name__ == "__main__":
    with open("/Users/fj/Downloads/KurenaiOS 2/js/data/content/it-f201.js", "r") as f:
        content = f.read()
    
    new_content = fix_content(content)
    
    with open("/Users/fj/Downloads/KurenaiOS 2/js/data/content/it-f201.js", "w") as f:
        f.write(new_content)
