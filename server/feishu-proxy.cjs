/**
 * 飞书 API 代理服务
 * 用于处理前端发来的飞书表格写入请求
 */

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

// 飞书配置
const FEISHU_CONFIG = {
  appId: 'cli_a927f88bdc389bdf',
  appSecret: 'N5VooPOZcbWrdJzhg7tvHgreGdQsEene',
  baseId: 'QQmOb1kOsacDZksa7JRclM7snKf',
  tableId: 'tblVcBw1zUhWp6IU'
};

// 缓存访问令牌
let accessToken = null;
let tokenExpireTime = 0;

// 获取飞书访问令牌
async function getAccessToken() {
  // 检查缓存的令牌是否有效
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
            // 令牌有效期 2 小时，提前 5 分钟刷新
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
            console.error('飞书 API 错误:', result);
            reject(new Error(`写入表格失败: ${result.msg} (code: ${result.code})`));
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

// 创建 HTTP 服务器
const server = http.createServer(async (req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // API 路由：写入飞书表格
  if (pathname === '/api/feishu/record' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const record = JSON.parse(body);
        console.log('收到写入请求:', record);

        const result = await writeToFeishuTable(record);
        console.log('写入成功:', result);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: '记录已写入飞书表格',
          data: result
        }));
      } catch (error) {
        console.error('写入失败:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: error.message
        }));
      }
    });
    return;
  }

  // API 路由：健康检查
  if (pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      time: new Date().toISOString()
    }));
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 飞书代理服务已启动`);
  console.log(`📡 监听端口: ${PORT}`);
  console.log(`🔗 API 地址: http://localhost:${PORT}/api/feishu/record`);
  console.log(`📊 表格链接: https://my.feishu.cn/base/${FEISHU_CONFIG.baseId}`);
  console.log('');
  console.log('按 Ctrl+C 停止服务');
});

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n👋 服务已停止');
  process.exit(0);
});
