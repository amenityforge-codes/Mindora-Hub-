const fs = require('fs');

const file = fs.readFileSync('frontend/src/screens/admin/AchievementManagementScreen.tsx', 'utf-8');
const lines = file.split('\n');

let depth = 0;
let lastGoodLine = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const openBraces = (line.match(/{/g) || []).length;
  const closeBraces = (line.match(/}/g) || []).length;
  
  depth += openBraces - closeBraces;
  
  if (depth >= 0) {
    lastGoodLine = i + 1;
  }
  
  console.log(`Line ${i + 1}: Depth = ${depth}, Open = ${openBraces}, Close = ${closeBraces}, "${line.trim().substring(0, 50)}"`);
  
  if (depth < 0) {
    console.log(`\n❌ ERROR: More closing braces than opening braces at line ${i + 1}`);
    process.exit(1);
  }
}

console.log(`\n📊 Final depth: ${depth}`);
console.log(`✅ Last line with balanced braces: ${lastGoodLine}`);

if (depth > 0) {
  console.log(`\n❌ Missing ${depth} closing brace(s)`);
  console.log(`   The missing brace should be added before line ${lines.length}`);
}

