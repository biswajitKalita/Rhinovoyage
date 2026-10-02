import json
import re

with open('client/public/src/js/packages-data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the array content using a regex that captures everything between `const packagesData = [` and `];`
match = re.search(r'const packagesData\s*=\s*(\[.*?\]);', content, re.DOTALL)
if match:
    # This is rough because JS object keys aren't quoted.
    # It's easier to just do it via Node by fixing the export.
    pass
