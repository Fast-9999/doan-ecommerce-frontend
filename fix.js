const fs = require('fs');

try {
  // Sửa page.js
  let file1 = 'c:/Users/MSI/Do_An_Ecom/doan-ecommerce-frontend/src/app/admin/inbox/page.js';
  let content1 = fs.readFileSync(file1, 'utf8');
  content1 = content1.replace('let token = user?.token || user?.accessToken;', 'let auth_token = token || user?.token || user?.accessToken;');
  content1 = content1.replace('token = localStorage.getItem("token");', 'auth_token = localStorage.getItem("token");');
  content1 = content1.replace('`Bearer ${token}`', '`Bearer ${auth_token}`');
  fs.writeFileSync(file1, content1, 'utf8');

  // Sửa ChatBubble.js
  let file2 = 'c:/Users/MSI/Do_An_Ecom/doan-ecommerce-frontend/src/components/ChatBubble.js';
  let content2 = fs.readFileSync(file2, 'utf8');
  content2 = content2.replace('let token = user?.token || user?.accessToken;', 'let auth_token = token || user?.token || user?.accessToken;');
  content2 = content2.replace('token = localStorage.getItem("token");', 'auth_token = localStorage.getItem("token");');
  content2 = content2.replace('`Bearer ${token}`', '`Bearer ${auth_token}`');
  content2 = content2.replace("const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN' || user?.username === 'phattest' || user?.role?.name === 'admin';", "const isAdmin = user && (user.role === 'admin' || user.role === 'ADMIN' || user.username === 'phattest' || user.role?.name === 'admin' || user.role === '69c79a3c076efe132ceab729');");
  fs.writeFileSync(file2, content2, 'utf8');

  console.log('Update done successfully via script!');
} catch(e) {
  console.error(e);
}
