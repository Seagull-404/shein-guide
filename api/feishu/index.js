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

// 通过访客ID查找记录
async function findRecordByVisitorId(visitorId) {
  const token = await getAccessToken();

  return new Promise((resolve, reject) => {
    const filter = JSON.stringify({
      conditions: [{
        field_name: '访客ID',
        operator: 'is',
        value: [visitorId]
      }]
    });

    const options = {
      hostname: 'open.feishu.cn',
      port: 443,
      path: `/open-apis/bitable/v1/apps/${FEISHU_CONFIG.baseId}/tables/${FEISHU_CONFIG.tableId}/records?filter=${encodeURIComponent(filter)}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.code === 0 && result.data && result.data.items && result.data.items.length > 0) {
            resolve(result.data.items[0].record_id);
          } else {
            resolve(null);
          }
        } catch (e) {
          reject(new Error(`解析查找响应失败: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => reject(new Error(`查找记录失败: ${e.message}`)));
    req.end();
  });
}

// 创建新记录
async function createFeishuRecord(record) {
  const token = await getAccessToken();

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
            reject(new Error(`创建记录失败: ${result.msg} (code: ${result.code})`));
          }
        } catch (e) {
          reject(new Error(`解析创建响应失败: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => reject(new Error(`创建记录失败: ${e.message}`)));
    req.write(postData);
    req.end();
  });
}

// 更新已有记录
async function updateFeishuRecord(recordId, record) {
  const token = await getAccessToken();

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      fields: record.fields
    });

    const options = {
      hostname: 'open.feishu.cn',
      port: 443,
      path: `/open-apis/bitable/v1/apps/${FEISHU_CONFIG.baseId}/tables/${FEISHU_CONFIG.tableId}/records/${recordId}`,
      method: 'PATCH',
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
            reject(new Error(`更新记录失败: ${result.msg} (code: ${result.code})`));
          }
        } catch (e) {
          reject(new Error(`解析更新响应失败: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => reject(new Error(`更新记录失败: ${e.message}`)));
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

    const visitorId = record.fields['访客ID'];
    if (!visitorId) {
      res.status(400).json({
        success: false,
        error: '请求格式错误：缺少访客ID'
      });
      return;
    }

    // 查找是否已有记录
    const existingRecordId = await findRecordByVisitorId(visitorId);
    let result;

    if (existingRecordId) {
      // 更新已有记录
      console.log('更新已有记录:', existingRecordId);
      result = await updateFeishuRecord(existingRecordId, record);
    } else {
      // 创建新记录
      console.log('创建新记录');
      result = await createFeishuRecord(record);
    }

    console.log('操作成功:', JSON.stringify(result, null, 2));

    res.status(200).json({
      success: true,
      message: existingRecordId ? '记录已更新' : '记录已创建',
      data: result
    });
  } catch (error) {
    console.error('操作失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
