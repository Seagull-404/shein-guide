'use strict';
const https = require('https');

const FEISHU_CONFIG = {
  appId: 'cli_a927f88bdc389bdf',
  appSecret: 'N5VooPOZcbWrdJzhg7tvHgreGdQsEene',
  baseId: 'QQmOb1kOsacDZksa7JRclM7snKf',
  tableId: 'tblVcBw1zUhWp6IU'
};

let accessToken = null;
let tokenExpireTime = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpireTime) return accessToken;
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ app_id: FEISHU_CONFIG.appId, app_secret: FEISHU_CONFIG.appSecret });
    const req = https.request({
      hostname: 'open.feishu.cn', port: 443,
      path: '/open-apis/auth/v3/app_access_token/internal', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.code === 0) { 
            accessToken = result.app_access_token; 
            tokenExpireTime = Date.now() + (result.expire - 300) * 1000; 
            resolve(accessToken); 
          }
          else reject(new Error('获取令牌失败: ' + result.msg));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function writeToFeishuTable(record) {
  const token = await getAccessToken();
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ fields: record.fields });
    console.log('发送数据:', postData);
    const req = https.request({
      hostname: 'open.feishu.cn', port: 443,
      path: '/open-apis/bitable/v1/apps/' + FEISHU_CONFIG.baseId + '/tables/' + FEISHU_CONFIG.tableId + '/records',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token, 'Content-Length': Buffer.byteLength(postData) }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('飞书响应:', data);
        try {
          const result = JSON.parse(data);
          if (result.code === 0) resolve(result.data);
          else reject(new Error('写入失败: ' + (result.msg || JSON.stringify(result))));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

exports.main = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  try {
    const body = event.body ? (typeof event.body === 'string' ? JSON.parse(event.body) : event.body) : event;
    console.log('收到请求:', JSON.stringify(body, null, 2));
    
    // 验证请求数据
    if (!body || !body.fields) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: '请求格式错误：缺少 fields 字段' }) };
    }
    
    const result = await writeToFeishuTable(body);
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: '写入成功', data: result }) };
  } catch (error) {
    console.error('错误:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: error.message }) };
  }
};
