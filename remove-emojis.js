// Bulk emoji removal script for ARBOR
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Map of emoji → text replacement
const REPLACEMENTS = [
  // Weather / nature
  ['🌧️', ''], ['🌧', ''], ['🌡️', ''], ['🌡', ''], ['🌤️', ''], ['🌤', ''],
  ['🌦️', ''], ['🌦', ''], ['☀️', ''], ['☀', ''], ['💧', ''], ['💨', ''],
  ['🌐', ''], ['🌊', ''],
  // People / roles
  ['👥', ''], ['👤', ''], ['👋', ''], ['🕵️', ''], ['🕵', ''],
  // Objects / tools
  ['📡', ''], ['📱', ''], ['📋', ''], ['📑', ''], ['📊', ''],
  ['📍', ''], ['📅', ''], ['📲', ''], ['📣', ''],
  ['💳', ''], ['💎', ''], ['💸', ''], ['💰', ''],
  ['🔍', ''], ['🔗', ''], ['🔔', ''], ['🔄', ''],
  ['🛡️', ''], ['🛡', ''], ['🚧', ''], ['🚨', ''],
  ['🗺️', ''], ['🗺', ''], ['🏠', ''],
  ['⚡', ''], ['⏳', ''],
  // Status / check
  ['✅', ''], ['✓', '✓'], ['❌', ''], ['✕', '✕'],
  ['⚠️', ''], ['⚠', ''],
  ['🔴', ''], ['🟡', ''], ['🟢', ''],
  ['⊘', ''],
  // Celebration
  ['🎉', ''], ['🎊', ''],
  // AI / tech
  ['🤖', ''], ['🧠', ''], ['🔮', ''],
  // Misc
  ['⬜', ''], ['✦', ''],
  ['😷', ''], ['🍕', ''], ['🚗', ''],
  ['🚪', ''],
  // Common prefix patterns in labels
  ['← ', ''], ['→', '>'],
];

// Patterns that should be replaced with specific text
const CONTEXTUAL = [
  // Toast messages
  [/⚡ ₹/g, 'INR '],
  [/💸 ₹/g, 'INR '],
  // Info blocks  
  [/💡 /g, ''],
  [/ℹ️ /g, ''],
  // Status indicators
  [/● FIRING/g, 'ACTIVE'],
  [/● Active/g, 'Active'],
  [/◌ Training/g, 'Training'],
  [/● /g, ''],
  [/◐ /g, ''],
];

function getAllFiles(dir, ext) {
  let results = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && item !== 'node_modules' && item !== '.git') {
      results = results.concat(getAllFiles(fullPath, ext));
    } else if (ext.some(e => item.endsWith(e))) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = getAllFiles(srcDir, ['.jsx', '.js']);
let totalChanges = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Apply simple replacements
  for (const [emoji, replacement] of REPLACEMENTS) {
    if (content.includes(emoji)) {
      content = content.split(emoji).join(replacement);
    }
  }

  // Apply contextual regex replacements
  for (const [pattern, replacement] of CONTEXTUAL) {
    content = content.replace(pattern, replacement);
  }

  // Clean up artifacts: double spaces, empty spans with just spaces
  content = content.replace(/  +/g, ' ');
  // Fix empty icon spans like <span style={...}></span> by keeping them (they'll just be empty)

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    totalChanges++;
    console.log(`Updated: ${path.relative(__dirname, file)}`);
  }
}

console.log(`\nDone! Updated ${totalChanges} files.`);
