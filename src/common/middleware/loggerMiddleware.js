// middleware/requestLogger.js

const consoleColors = {
  request: '\x1b[36m%s\x1b[0m',    // Cyan
  success: '\x1b[32m%s\x1b[0m',    // Green
  error: '\x1b[31m%s\x1b[0m',      // Red
  warning: '\x1b[33m%s\x1b[0m',    // Yellow
  info: '\x1b[34m%s\x1b[0m',       // Blue
  separator: '\x1b[90m%s\x1b[0m',  // Gray
};

export const requestLogger = (req, res, next) => {
  const requestId = Date.now() + Math.random().toString(36).substr(2, 9);
  req.requestId = requestId;
  req.startTime = Date.now();

  // ذخیره تابع اصلی json برای ضبط پاسخ
  const originalJson = res.json;
  res.json = function(body) {
    res.responseBody = body;
    return originalJson.call(this, body);
  };

  // نمایش درخواست ورودی
  console.log(consoleColors.separator, '══════════════════════════════════════════════════════════════');
  console.log(consoleColors.request, `📥 INCOMING REQUEST [ID: ${requestId}]`);
  console.log(consoleColors.info, `   Method: ${req.method}`);
  console.log(consoleColors.info, `   URL: ${req.originalUrl}`);
  console.log(consoleColors.info, `   IP: ${req.ip || req.connection.remoteAddress}`);
  console.log(consoleColors.info, `   Timestamp: ${new Date().toISOString()}`);
  
  if (Object.keys(req.query).length > 0) {
    console.log(consoleColors.info, `   Query: ${JSON.stringify(req.query)}`);
  }

  // لاگ پاسخ زمانی که کامل شد
  res.on('finish', () => {
    const processingTime = Date.now() - req.startTime;
    
    if (res.statusCode >= 400) {
      console.log(consoleColors.error, `❌ ERROR RESPONSE [ID: ${requestId}]`);
    } else {
      console.log(consoleColors.success, `✅ SUCCESS RESPONSE [ID: ${requestId}]`);
    }
    
    console.log(consoleColors.info, `   Status: ${res.statusCode}`);
    console.log(consoleColors.info, `   Processing Time: ${processingTime}ms`);
    console.log(consoleColors.info, `   Timestamp: ${new Date().toISOString()}`);
    
    if (res.responseBody) {
      const responseStr = JSON.stringify(res.responseBody);
      console.log(consoleColors.info, `   Response: ${responseStr}`);
    }
    
    console.log(consoleColors.separator, '══════════════════════════════════════════════════════════════\n');
  });

  next();
};