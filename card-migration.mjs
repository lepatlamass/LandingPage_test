import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');

const replacements = [
  // Cards and backgrounds
  { regex: /(?<!dark:)bg-\[#1a1c21\]/g, replacement: 'bg-white dark:bg-[#1a1c21]' },
  { regex: /(?<!dark:)bg-\[#16181e\]/g, replacement: 'bg-white dark:bg-[#16181e]' },
  
  // Icon wrappers and small boxes
  { regex: /(?<!dark:)bg-\[#2a2d39\]/g, replacement: 'bg-black/5 dark:bg-[#2a2d39]' },
  { regex: /(?<!dark:)hover:bg-\[#22252b\]/g, replacement: 'hover:bg-black/5 dark:hover:bg-[#22252b]' },

  // Gradients
  { regex: /(?<!dark:)from-\[#1a1c21\]/g, replacement: 'from-white dark:from-[#1a1c21]' },
  { regex: /(?<!dark:)to-\[#1e2028\]/g, replacement: 'to-zinc-50 dark:to-[#1e2028]' },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      for (const { regex, replacement } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Cards theme migration complete.');
