const fs = require('fs');
const path = 'c:\\\\Users\\\\hp\\\\Desktop\\\\DroguerieApp\\\\src\\\\app\\\\admin\\\\settings\\\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/\s*const \[activeTab, setActiveTab\] = useState\('General'\);/, '');
content = content.replace(/\s*const tabs = \['General', 'Localization', 'Shipping', 'Taxes', 'Payments'\];/, '');
content = content.replace(/\s*\{\/\* Tabs \*\/\}([\s\S]*?)<\/div>/, '');
content = content.replace(/\s*\{activeTab === 'General' && \(/, '');

// The rest of the tabs start from `{activeTab === 'Localization' && (` up to `)}` before `{/* Bottom Sticky Footer */}`
content = content.replace(/\s*\}\)\}\s*\{activeTab === 'Localization' && \([\s\S]*?(?=\s*\{\/\* Bottom Sticky Footer \*\/\})/, '\n            </div>\n');

fs.writeFileSync(path, content);
