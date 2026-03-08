// 简单的测试端点
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.status(200).json({
    success: true,
    message: 'API 测试成功',
    timestamp: new Date().toISOString(),
    env: {
      hasAppId: !!process.env.FEISHU_APP_ID,
      hasAppSecret: !!process.env.FEISHU_APP_SECRET,
      hasBaseId: !!process.env.FEISHU_BASE_ID,
      hasTableId: !!process.env.FEISHU_TABLE_ID
    }
  });
}
