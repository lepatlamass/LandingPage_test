import os
import glob

replacements = {
    "bg-indigo-500 text-black dark:text-white": "bg-indigo-500 text-white",
    "bg-black/40": "bg-gray-100 dark:bg-black/40",
    "bg-black/20": "bg-gray-50 dark:bg-black/20",
    "bg-white/5": "bg-black/5 dark:bg-white/5",
    "text-black dark:text-gray-500": "text-gray-600 dark:text-gray-400",
    "text-black dark:text-gray-300 hover:text-black dark:text-gray-300": "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-gray-300",
    "text-black dark:text-gray-300 hover:text-black dark:text-white": "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white",
    "hover:bg-black/10 dark:hover:bg-black/10 dark:hover:bg-white/10": "hover:bg-black/10 dark:hover:bg-white/10"
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

# Process all tool components
for root, dirs, files in os.walk('src/components/tools'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

# Specific files
specific_files = [
    'src/components/auth/NavigationLoginButton.tsx',
    'src/components/ThemeToggle.tsx',
    'src/components/layout/Navbar.tsx'
]

for f in specific_files:
    if os.path.exists(f):
        process_file(f)

print("Done.")
