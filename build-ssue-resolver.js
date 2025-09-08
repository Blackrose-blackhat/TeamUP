// filename: refactor-statements.js
// Usage: node refactor-statements.js /path/to/your/project

const fs = require('fs');
const path = require('path');

const projectDir = process.argv[2];
if (!projectDir) {
  console.error('Please provide your project directory path!');
  process.exit(1);
}

const fileExtensions = ['.ts', '.tsx'];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath, callback);
    } else if (fileExtensions.includes(path.extname(fullPath))) {
      callback(fullPath);
    }
  });
}

function refactorFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1️⃣ Convert `&&` expressions
  content = content.replace(
    /^\s*(\S.*?)\s*&&\s*(.+);$/gm,
    (match, condition, expr) => `if (${condition}) { ${expr}; }`
  );

  // 2️⃣ Convert ternary used as statement
  content = content.replace(
    /^\s*(.+?)\s*\?\s*(.+?)\s*:\s*(.+?);$/gm,
    (match, condition, trueExpr, falseExpr) =>
      `if (${condition}) { ${trueExpr}; } else { ${falseExpr}; }`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Refactored: ${filePath}`);
}

// Run
walkDir(projectDir, refactorFile);
console.log('✅ Refactoring completed.');
