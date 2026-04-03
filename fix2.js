const fs = require('fs');

try {
  let file2 = 'c:/Users/MSI/Do_An_Ecom/doan-ecommerce-frontend/src/components/ChatBubble.js';
  let content2 = fs.readFileSync(file2, 'utf8');
  content2 = content2.replace(
    'const senderId = msg.sender?._id || msg.sender;',
    'const senderId = String(msg.sender?._id || msg.sender || "");'
  );
  content2 = content2.replace(
    'const isMine = senderId === (user._id || user.id || user.userId || user.data?._id);',
    'const myId = String(user?._id || user?.id || user?.userId || user?.data?._id || "");\n                const isMine = senderId === myId;'
  );
  fs.writeFileSync(file2, content2, 'utf8');

  console.log('Update ChatBubble done successfully via script!');
} catch(e) {
  console.error(e);
}
