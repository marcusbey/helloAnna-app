const fs = require('fs');
const path = require('path');

const filePath = path.resolve(
  __dirname,
  '../node_modules/zustand/esm/middleware.mjs'
);

if (!fs.existsSync(filePath)) {
  console.error('Zustand middleware.mjs not found!');
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// Replace import.meta.env with __DEV__ for React Native compatibility
content = content.replace(
  /\(import\.meta\.env\s?\?\s?import\.meta\.env\.MODE\s?:\s?(void 0|undefined)\)\s?!==\s?"production"/g,
  '__DEV__'
);

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Zustand patched successfully for React Native!');
