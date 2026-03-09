'use strict';
const https = require('https');

// 飞书配置
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
            reject(new Error(`获取令牌失败: ${result.msg}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// 写入飞书表格
async function writeToFeishuTable(record) {
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
            reject(new Error(`写入表格失败: ${result.msg}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// 腾讯云函数入口
exports.main_handler = async (event, context) => {
  // 解析请求体
  let body;
  try {
    if (event.body) {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } else {
      body = event;
    }
  } catch (e) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: '请求格式错误'
      })
    };
  }

  // 处理 OPTIONS 预检请求
  if (event.httpMethod === 'OPTIONS' || event.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  // 只接受 POST 请求
  const method = event.httpMethod || event.method || 'POST';
  if (method !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Method Not Allowed'
      })
    };
  }

  try {
    console.log('收到写入请求:', JSON.stringify(body, null, 2));

    if (!body || !body.fields) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: '请求格式错误：缺少 fields 字段'
        })
      };
    }

    const result = await writeToFeishuTable(body);
    console.log('写入成功:', JSON.stringify(result, null, 2));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: '记录已写入飞书表格',
        data: result
      })
    };
  } catch (error) {
    console.error('写入失败:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
