// src/common/messaging/messageLogger.js

export function logMessage({ type, to, content }) {
  const time = new Date().toISOString();
  console.log(`
[Message Log]
📩 نوع: ${type}
👤 گیرنده: ${to}
📝 متن: ${content}
⏰ زمان: ${time}
------------------------
  `);
}
