import https from 'https';

// 飞书配置（从环境变量读取，带默认值）
const FEISHU_CONFIG = {
  appId: process.env.FEISHU_APP_ID || 'cli_a927f88bdc389bdf',
  appSecret: process.env.FEISHU_APP_SECRET || 'N5VooPOZcbWrdJzhg7tvHgreGdQsEene',
  baseId: process.env.FEISHU_BASE_ID || 'QQmOb1kOsacDZksa7JRclM7snKf',
  tableId: process.env.FEISHU_TABLE_ID || 'tblVcBw1zUhWp6IU'
};

// 缓存访问令牌
let accessToken = null;
let tokenExpireTime = 0;

// 获取飞书访问令牌
async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpireTime) {
    return accessToken;
  }

  // 验证配置
  if (!FEISHU_CONFIG.appId || !FEISHU_CONFIG.appSecret) {
    throw new Error('飞书配置缺失：appId 或 appSecret 为空');
  }

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      app_id: FEISHU_CONFIG.appId,
      app_secret: FEISHU_CONFIG.appSecret
    });

    const options = {
      hostname: 'open.feishu.cn',
      port: 443,
      path: '/open-apis/auth/v3/app_access_token/internal',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.code === 0) {
            accessToken = result.app_access_token;
            tokenExpireTime = Date.now() + (result.expire - 300) * 1000;
            resolve(accessToken);
          } else {
            reject(new Error(`获取令牌失败: ${result.msg} (code: ${result.code})`));
          }
        } catch (e) {
          reject(new Error(`解析令牌响应失败: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => reject(new Error(`请求令牌失败: ${e.message}`)));
    req.write(postData);
    req.end();
  });
}

// 写入飞书表格
async function writeToFeishuTable(record) {
  const token = await getAccessToken();

  // 验证配置
  if (!FEISHU_CONFIG.baseId || !FEISHU_CONFIG.tableId) {
    throw new Error('飞书配置缺失：baseId 或 tableId 为空');
  }

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      fields: record.fields
    });

    const options = {
      hostname: 'open.feishu.cn',
      port: 443,
      path: `/open-apis/bitable/v1/apps/${FEISHU_CONFIG.baseId}/tables/${FEISHU_CONFIG.tableId}/records`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.code === 0) {
            resolve(result.data);
          } else {
            reject(new Error(`写入表格失败: ${result.msg} (code: ${result.code})`));
          }
        } catch (e) {
          reject(new Error(`解析表格响应失败: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => reject(new Error(`请求表格失败: ${e.message}`)));
    req.write(postData);
    req.end();
  });
}

// 解析请求 body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        if (!body) {
          resolve({});
        } else {
          resolve(JSON.parse(body));
        }
      } catch (e) {
        reject(new Error(`解析请求体失败: ${e.message}`));
      }
    });
    req.on('error', (e) => reject(new Error(`读取请求失败: ${e.message}`)));
  });
}

// Vercel Serverless Function 入口
export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只接受 POST 请求
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
    return;
  }

  try {
    const record = await parseBody(req);
    console.log('收到写入请求:', JSON.stringify(record, null, 2));

    // 验证请求数据
    if (!record || !record.fields) {
      res.status(400).json({
        success: false,
        error: '请求格式错误：缺少 fields 字段'
      });
      return;
    }

    const result = await writeToFeishuTable(record);
    console.log('写入成功:', JSON.stringify(result, null, 2));

    res.status(200).json({
      success: true,
      message: '记录已写入飞书表格',
      data: result
    });
  } catch (error) {
    console.error('写入失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
