
import re
import sys

def fix_content(content):
    # 1. Fix the corrupted closing clusters
    # Patterns like }]}}]}; or }}}]}; should be simplified to }]};
    # Also handle clusters with extra spaces/newlines
    content = re.sub(r'\}\s*\](?:\s*\}\s*\])+\s*\};', '}\n  ]\n};', content)
    
    # 2. Fix the missing closing braces in code/callout blocks
    
    # it:F201.2.1 XML Example
    content = content.replace(
        '"src": "<customer id=\\"101\\">\\n  <name>John Doe</name>\\n  <orders>\\n    <order date=\\"2024-01-01\\">Laptop</order>\\n  </orders>\\n</customer>"\n    }',
        '"src": "<customer id=\\"101\\">\\n  <name>John Doe</name>\\n  <orders>\\n    <order date=\\"2024-01-01\\">Laptop</order>\\n  </orders>\\n</customer>"\n            }\n          }'
    )
    
    # it:F201.2.1 JSON Example
    content = content.replace(
        '"src": "{\\n  \\"id\\": 101,\\n  \\"name\\": \\"John Doe\\",\\n  \\"orders\\": [\\n    { \\"date\\": \\"2024-01-01\\", \\"item\\": \\"Laptop\\" }\\n  ]\\n}"\n    }',
        '"src": "{\\n  \\"id\\": 101,\\n  \\"name\\": \\"John Doe\\",\\n  \\"orders\\": [\\n    { \\"date\\": \\"2024-01-01\\", \\"item\\": \\"Laptop\\" }\\n  ]\\n}"\n            }\n          }'
    )
    
    # it:F201.2.4 Hadoop Example
    content = content.replace(
        '"src": "function map(key, value):\\n  for each word in value:\\n    emit(word, 1)\\n\\nfunction reduce(key, values):\\n  sum = 0\\n  for each v in values:\\n    sum += v\\n  emit(key, sum)"\n    }',
        '"src": "function map(key, value):\\n  for each word in value:\\n    emit(word, 1)\\n\\nfunction reduce(key, values):\\n  sum = 0\\n  for each v in values:\\n    sum += v\\n  emit(key, sum)"\n            }\n          }'
    )
    
    # it:F201.3.1 Classification Example
    content = content.replace(
        '"src": "function classifyEmail(email):\\n  score = 0\\n  if email.contains(\\"win money\\") then score += 10\\n  if email.contains(\\"cheap\\") then score += 5\\n  if email.sender not in contact_list then score += 20\\n  \\n  if score > 15 then return \\"SPAM\\"\\n  else return \\"HAM\\""\n    }',
        '"src": "function classifyEmail(email):\\n  score = 0\\n  if email.contains(\\"win money\\") then score += 10\\n  if email.contains(\\"cheap\\") then score += 5\\n  if email.sender not in contact_list then score += 20\\n  \\n  if score > 15 then return \\"SPAM\\"\\n  else return \\"HAM\\""\n            }\n          }'
    )

    # 3. Fix missing outer braces for callouts in notes array
    # Look for { "callout": { ... } } ] but missing the outer }
    # This is trickier because of the nesting. 
    # Let's try to match the end of a callout block that is immediately followed by ]
    
    def callout_fixer(match):
        block = match.group(0)
        # If it has 2 closing braces, it's likely fine. 
        # If it has only one closing brace before ], it's broken.
        # Example: "body": [ { "n": "..." } ] } ]
        # Count the number of { and }
        if block.count('{') > block.count('}'):
            # Missing one or more }
            # Add one } and see. 
            return block.replace('} ]', '} } ]')
        return block

    content = re.sub(r'\{[^{}]*"callout":\s*\{[^{}]*\}\s*\]', callout_fixer, content)
    # Actually, the above regex is too simple. 
    
    # Let's just use a more direct approach for the end of notes sections.
    content = re.sub(r'\}\s*\}\s*\]\s*,\s*"flashcards"', '}\n    }\n  ],\n  "flashcards"', content)
    # If it was missing one:
    content = re.sub(r'(?<=\s)\}\s*\]\s*,\s*"flashcards"', '}\n    }\n  ],\n  "flashcards"', content)

    # 4. Map callout types
    content = content.replace('"t": "danger"', '"t": "warn"')
    content = content.replace('"t": "important"', '"t": "info"')
    content = content.replace('"t": "example"', '"t": "info"')
    content = content.replace('"t": "key"', '"t": "info"')
    content = content.replace('"t": "process"', '"t": "info"')

    # 5. Wrap math symbols/variables in $
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
            # Only wrap if it's NOT already in $
            s = re.sub(r'(?<!\$)\b' + re.escape(v) + r'\b(?!\$)', r'$' + v + r'$', s)
        # Single letter V and others if they look like variables
        s = re.sub(r'(?<!\$)\bV\b(?!\$)', r'$V$', s)
        # Numerical values with units or signs
        s = re.sub(r'(?<!\$)\b(\d+(?:\.\d+)?%)\b(?!\$)', r'$\1$', s)
        s = re.sub(r'(?<!\$)\b(£\d+(?:\.\d+)?[mb]?)\b(?!\$)', r'$\1$', s)
        s = re.sub(r'(?<!\$)\b(~?\d+%)\b(?!\$)', r'$\1$', s)
        return s

    content = re.sub(r'"([^"]*)"', math_replacer, content)

    return content

if __name__ == "__main__":
    with open("/Users/fj/Downloads/KurenaiOS 2/js/data/content/it-f201.js", "r") as f:
        content = f.read()
    
    new_content = fix_content(content)
    
    with open("/Users/fj/Downloads/KurenaiOS 2/js/data/content/it-f201.js", "w") as f:
        f.write(new_content)
