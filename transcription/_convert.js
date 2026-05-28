const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.docx'));

(async () => {
  for (const f of files) {
    const result = await mammoth.extractRawText({ path: path.join(dir, f) });
    const out = path.join(dir, f.replace(/\.docx$/, '.txt'));
    fs.writeFileSync(out, result.value, 'utf8');
    console.log(`${f} -> ${path.basename(out)} (${result.value.length} chars)`);
  }
})();
