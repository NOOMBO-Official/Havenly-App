const fs = require('fs');
const files = [
  'src/components/CalendarWidget.tsx',
  'src/components/ClockWidget.tsx',
  'src/components/FinanceWidget.tsx',
  'src/components/HealthWidget.tsx',
  'src/components/NewsWidget.tsx',
  'src/components/NotesWidget.tsx',
  'src/components/SmartHomeWidget.tsx',
  'src/components/SystemStatsWidget.tsx',
  'src/components/ThreeDWeatherWidget.tsx',
  'src/components/TimersWidget.tsx',
  'src/components/IntelligentNow.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  let modified = false;

  if (!content.includes('useSettings')) {
    content = content.replace(/(import .* from "react";)/, `$1\nimport { useSettings } from "../contexts/SettingsContext";`);
    modified = true;
  }

  if (!content.includes('const { settings } = useSettings();')) {
    content = content.replace(/(const \[isExpanded, setIsExpanded\] = useState\(false\);)/, `const { settings } = useSettings();\n  $1`);
    modified = true;
  }

  if (content.includes('setIsExpanded(true);') && !content.includes('if (settings.tapToExpand) setIsExpanded(true);')) {
    content = content.replace(/setIsExpanded\(true\);/g, `if (settings.tapToExpand) setIsExpanded(true);`);
    modified = true;
  }

  if (content.includes('{/* Quick Action Overlay */}') && !content.includes('{settings.tapToExpand && (')) {
    content = content.replace(/\{\/\* Quick Action Overlay \*\/\}\s*<div className="absolute inset-0 bg-black\/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex items-center justify-center pointer-events-none">\s*<span className="text-white font-medium bg-white\/10 px-4 py-2 rounded-full backdrop-blur-md border border-white\/20">\s*Tap to Expand\s*<\/span>\s*<\/div>/, 
    `{/* Quick Action Overlay */}\n        {settings.tapToExpand && (\n          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex items-center justify-center pointer-events-none">\n            <span className="text-white font-medium bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20">\n              Tap to Expand\n            </span>\n          </div>\n        )}`);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
