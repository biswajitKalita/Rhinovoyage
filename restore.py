import re
import os

log_path = r"C:\Users\BISWAJIT-PC\.gemini\antigravity\brain\3262665b-ffdc-4c6c-b967-ed39e016c0ca\.system_generated\logs\overview.txt"

with open(log_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the monolithic diff block for d:\Rhinovoyage\index.html
match = re.search(r'\[diff_block_start\]\n@@ -1,1055 \+1,8 @@\n(.*?)\[diff_block_end\]', content, re.DOTALL)
if not match:
    # try looking for any diff that starts with -<!DOCTYPE html> and ends with -</html>
    match = re.search(r'-<!DOCTYPE html>.*?-</html>', content, re.DOTALL)
    if not match:
        print("Could not find the HTML content in logs.")
        exit(1)
    diff_text = match.group(0)
    diff_lines = diff_text.splitlines()
else:
    diff_lines = match.group(1).splitlines()

html_lines = []
for line in diff_lines:
    if line.startswith('-'):
        html_lines.append(line[1:])

html = '\n'.join(html_lines)

# Remove the massive <style> block
html = re.sub(r'<style>.*?</style>', '', html, flags=re.DOTALL)

# Remove the massive <script> block
html = re.sub(r'<script>.*?</script>', '', html, flags=re.DOTALL)

# Inject modular links into <head>
links = """
<link rel="stylesheet" href="../src/css/global.css">
<link rel="stylesheet" href="../src/css/navbar.css">
<link rel="stylesheet" href="../src/css/hero.css">
<link rel="stylesheet" href="../src/css/about.css">
<link rel="stylesheet" href="../src/css/packages.css">
<link rel="stylesheet" href="../src/css/booking.css">
<link rel="stylesheet" href="../src/css/testimonials.css">
<link rel="stylesheet" href="../src/css/footer.css">
"""
html = html.replace('</head>', links + '</head>')

# Inject modular scripts into <body>
scripts = """
<script src="../src/js/main.js"></script>
<script src="../src/js/booking.js"></script>
<script src="../src/js/api.js"></script>
"""
html = html.replace('</body>', scripts + '</body>')

with open(r'd:\Rhinovoyage\client\public\index.html', 'w', encoding='utf-8') as out:
    out.write(html)
print("Successfully restored index.html!")
