const fs = require('fs');

const filePaths = [
  'src/app/admin/page.js',
  'src/app/admin/products/page.js'
];

filePaths.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Regular expression to aggressively find the button and its content
    const regex = /<button\s+className="block\s+w-full[\s\S]*?Quản lý Users[\s\S]*?<\/button>/m;
    
    const replacement = `<Link href="/admin/users" className="block px-4 py-3 text-slate-300 font-bold hover:bg-slate-800 hover:text-white rounded-xl transition">
            👥 Quản lý Users
          </Link>
          <Link href="/admin/vouchers" className="block px-4 py-3 text-slate-300 font-bold hover:bg-slate-800 hover:text-white rounded-xl transition">
            🎟️ Quản lý Vouchers
          </Link>`;
          
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath} successfully.`);
    } else {
      console.log(`Could not find target in ${filePath}`);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
});
