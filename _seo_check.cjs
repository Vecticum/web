const fs = require('fs');
const path = require('path');

function getMetaFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;
  const fm = frontmatterMatch[1];
  
  const lines = fm.split('\n');
  let inMeta = false;
  let mTitle = '', mDesc = '', tTitle = '', tDesc = '';
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^meta:/)) { inMeta = true; continue; }
    if (inMeta && /^\S/.test(lines[i])) { inMeta = false; }
    if (inMeta && /^\s+title:/.test(lines[i])) {
      mTitle = lines[i].replace(/^\s+title:\s*['"]?/, '').replace(/['"]?\s*$/, '');
    }
    if (inMeta && /^\s+description:/.test(lines[i])) {
      mDesc = lines[i].replace(/^\s+description:\s*['"]?/, '').replace(/['"]?\s*$/, '');
    }
    if (!inMeta && /^title:/.test(lines[i])) {
      tTitle = lines[i].replace(/^title:\s*['"]?/, '').replace(/['"]?\s*$/, '');
    }
    if (!inMeta && /^description:/.test(lines[i])) {
      tDesc = lines[i].replace(/^description:\s*['"]?/, '').replace(/['"]?\s*$/, '');
    }
  }
  
  return { metaTitle: mTitle, metaDesc: mDesc, title: tTitle, desc: tDesc };
}

const dirs = ['src/content/services', 'src/content/industries', 'src/content/blog', 'src/content/recomendations', 'src/content/careers'];
const results = [];

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const data = getMetaFromFile(path.join(dir, file));
    if (data) {
      const effectiveTitle = data.metaTitle || data.title;
      const effectiveDesc = data.metaDesc || data.desc;
      const titleLen = effectiveTitle.length;
      const descLen = effectiveDesc.length;
      
      const issues = [];
      if (titleLen === 0) issues.push('NO_TITLE');
      else if (titleLen < 30) issues.push('TITLE_SHORT(' + titleLen + ')');
      else if (titleLen > 60) issues.push('TITLE_LONG(' + titleLen + ')');
      
      if (descLen === 0) issues.push('NO_DESC');
      else if (descLen < 120) issues.push('DESC_SHORT(' + descLen + ')');
      else if (descLen > 160) issues.push('DESC_LONG(' + descLen + ')');
      
      if (issues.length > 0) {
        results.push(dir + '/' + file);
        console.log(dir + '/' + file + ': ' + issues.join(', '));
        console.log('  Title(' + titleLen + '): ' + effectiveTitle.substring(0,90));
        console.log('  Desc(' + descLen + '): ' + effectiveDesc.substring(0,90));
        console.log('');
      } else {
        console.log(dir + '/' + file + ': OK | Title(' + titleLen + ') Desc(' + descLen + ')');
      }
    }
  }
}

console.log('\n--- Total files with issues: ' + results.length + ' ---');
