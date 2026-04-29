import os

dir_path = r'c:\Users\User\OneDrive\Desktop\prac'
for filename in os.listdir(dir_path):
    if filename.endswith('.html'):
        filepath = os.path.join(dir_path, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        if filename != 'index.html':
            if '<main>' in content:
                content = content.replace('<main>', '<main class="page-container">')
        else:
            pass
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
