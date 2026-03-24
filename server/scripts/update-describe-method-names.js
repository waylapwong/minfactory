const fs = require('fs');
const path = require('path');
const glob = require('glob');

const root = path.resolve(__dirname, '../src');
const pattern = path.join(root, '**/*.spec.ts');

const files = glob.sync(pattern, { nodir: true });
let changedFiles = 0;

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  let changed = false;

  const newLines = lines.map((line) => {
    // match describe('something', where something is a single token starting with lowercase letter
    const match = line.match(/(\s*)describe\('\s*([a-z][A-Za-z0-9_]*)\s*',/);
    if (match) {
      const indent = match[1] || '';
      const name = match[2];
      const newLine = line.replace(`describe('${name}',`, `describe('${name}()',`);
      changed = true;
      return newLine;
    }
    return line;
  });

  if (changed) {
    fs.writeFileSync(file, newLines.join('\n'));
    changedFiles++;
    console.log('Updated', file);
  }
});

console.log(`Done. Updated ${changedFiles} files.`);
