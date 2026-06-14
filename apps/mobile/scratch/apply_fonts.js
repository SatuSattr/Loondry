const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Regex to capture key: { properties } in StyleSheet
// Matches word followed by colon, opening brace, anything that is not a closing brace, and closing brace.
const styleObjectRegex = /([a-zA-Z0-9_]+):\s*\{([^}]*)\}/g;

let modifiedCount = 0;

content = content.replace(styleObjectRegex, (match, key, body) => {
  // Check if this style has text-like properties or is a known text element
  const isTextRelated = 
    body.includes('fontSize') || 
    body.includes('color') || 
    body.includes('fontFamily') || 
    body.includes('textTransform') ||
    body.includes('lineHeight') ||
    body.includes('letterSpacing') ||
    key.toLowerCase().includes('text') || 
    key.toLowerCase().includes('title') || 
    key.toLowerCase().includes('label') ||
    key.toLowerCase().includes('badge') ||
    key.toLowerCase().includes('btn') ||
    key.toLowerCase().includes('input');

  if (!isTextRelated) {
    return match;
  }

  let newBody = body;
  
  // Determine if it already has a custom fontFamily
  if (newBody.includes('fontFamily')) {
    // If it has both fontFamily and fontWeight, remove fontWeight to prevent distortion in React Native
    if (newBody.includes('fontWeight')) {
      newBody = newBody.replace(/fontWeight:\s*['"][^'"]+['"],?/g, '');
      newBody = newBody.replace(/fontWeight:\s*\d+,?/g, '');
    }
    return `${key}: {${newBody}}`;
  }

  // Check for specific weights and replace with the appropriate Geist TTF font name
  let hasFontWeight = false;
  
  if (newBody.includes('fontWeight')) {
    hasFontWeight = true;
    
    // Bold weights
    if (newBody.match(/fontWeight:\s*['"]bold['"]/i) || newBody.match(/fontWeight:\s*['"](700|800|900)['"]/)) {
      newBody = newBody.replace(/fontWeight:\s*['"]?[a-zA-Z0-9_]+['"]?,?/g, "fontFamily: 'Geist-Bold',");
    } 
    // Semi-bold weight
    else if (newBody.match(/fontWeight:\s*['"]600['"]/)) {
      newBody = newBody.replace(/fontWeight:\s*['"]?600['"]?,?/g, "fontFamily: 'Geist-SemiBold',");
    } 
    // Medium weight
    else if (newBody.match(/fontWeight:\s*['"]500['"]/)) {
      newBody = newBody.replace(/fontWeight:\s*['"]?500['"]?,?/g, "fontFamily: 'Geist-Medium',");
    }
    // Normal / Regular
    else {
      newBody = newBody.replace(/fontWeight:\s*['"]?[a-zA-Z0-9_]+['"]?,?/g, "fontFamily: 'Geist-Regular',");
    }
  }

  // If it didn't have any fontWeight, default it to Geist-Regular
  if (!hasFontWeight) {
    // Append fontFamily Geist-Regular inside the body
    newBody = `\n    fontFamily: 'Geist-Regular',${newBody}`;
  }

  modifiedCount++;
  return `${key}: {${newBody}}`;
});

// Let's write the modified file
fs.writeFileSync(filePath, content, 'utf8');
console.log(`Processed ${modifiedCount} text style objects in App.tsx`);
