const http = require('http');
const https = require('https');
const { getFeishuConfig, assertFeishuConfig } = require('./feishu-config.cjs');
const {
  createCaptcha,
  registerUser,
  loginUser,
  loginAdmin,
  getUserFromToken,
  getAdminFromToken,
  logoutToken,
  logoutAdminToken,
  listManageableUsers,
  updateManageableUser,
  listAllUsers,
  updateUserBySuperAdmin,
  listAdminUsers,
  listAuditLogs
} = require('./auth-service.cjs');

let accessToken = null;
let tokenExpireTime = 0;

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('请求体 JSON 解析失败'));
      }
    });
    req.on('error', reject);
  });
}

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : '';
}

async function getAccessToken() {
  const feishuConfig = getFeishuConfig();
  assertFeishuConfig(feishuConfig, ['appId', 'appSecret']);
  if (accessToken && Date.now() < tokenExpireTime) return accessToken;
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ app_id: feishuConfig.appId, app_secret: feishuConfig.appSecret });
    const request = https.request({
      hostname: 'open.feishu.cn',
      port: 443,
      path: '/open-apis/auth/v3/app_access_token/internal',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.code !== 0) return reject(new Error(`获取飞书令牌失败: ${result.msg}`));
          accessToken = result.app_access_token;
          tokenExpireTime = Date.now() + (result.expire - 300) * 1000;
          resolve(accessToken);
        } catch (error) {
          reject(error);
        }
      });
    });
    request.on('error', reject);
    request.write(postData);
    request.end();
  });
}

async function writeToFeishuTable(record) {
  const feishuConfig = getFeishuConfig(record.target || 'legacy');
  assertFeishuConfig(feishuConfig, ['appId', 'appSecret', 'baseId', 'tableId']);
  const token = await getAccessToken();
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ fields: record.fields });
    const request = https.request({
      hostname: 'open.feishu.cn',
      port: 443,
      path: `/open-apis/bitable/v1/apps/${feishuConfig.baseId}/tables/${feishuConfig.tableId}/records`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.code !== 0) return reject(new Error(`写入飞书失败: ${result.msg}`));
          resolve(result.data);
        } catch (error) {
          reject(error);
        }
      });
    });
    request.on('error', reject);
    request.write(postData);
    request.end();
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    const pathname = new URL(req.url, 'http://localhost').pathname;

    if (pathname === '/api/auth/captcha' && req.method === 'GET') return sendJson(res, 200, { success: true, data: createCaptcha() });
    if (pathname === '/api/auth/register' && req.method === 'POST') return sendJson(res, 200, { success: true, data: registerUser(await parseBody(req)) });
    if (pathname === '/api/auth/login' && req.method === 'POST') return sendJson(res, 200, { success: true, data: loginUser(await parseBody(req)) });
    if (pathname === '/api/auth/logout' && req.method === 'POST') {
      logoutToken(getBearerToken(req));
      return sendJson(res, 200, { success: true });
    }
    if (pathname === '/api/auth/me' && req.method === 'GET') {
      const user = getUserFromToken(getBearerToken(req));
      if (!user) return sendJson(res, 401, { success: false, error: '未登录或登录已过期' });
      return sendJson(res, 200, { success: true, data: user });
    }

    if (pathname === '/api/manager/users' && req.method === 'GET') return sendJson(res, 200, { success: true, data: listManageableUsers(getBearerToken(req)) });
    if (pathname === '/api/manager/user' && req.method === 'PATCH') return sendJson(res, 200, { success: true, data: updateManageableUser(getBearerToken(req), await parseBody(req)) });

    if (pathname === '/api/admin/login' && req.method === 'POST') return sendJson(res, 200, { success: true, data: loginAdmin(await parseBody(req)) });
    if (pathname === '/api/admin/logout' && req.method === 'POST') {
      logoutAdminToken(getBearerToken(req));
      return sendJson(res, 200, { success: true });
    }
    if (pathname === '/api/admin/me' && req.method === 'GET') {
      const admin = getAdminFromToken(getBearerToken(req));
      if (!admin) return sendJson(res, 401, { success: false, error: '未登录或登录已过期' });
      return sendJson(res, 200, { success: true, data: admin });
    }
    if (pathname === '/api/admin/users' && req.method === 'GET') return sendJson(res, 200, { success: true, data: listAllUsers(getBearerToken(req)) });
    if (pathname === '/api/admin/user' && req.method === 'PATCH') return sendJson(res, 200, { success: true, data: updateUserBySuperAdmin(getBearerToken(req), await parseBody(req)) });
    if (pathname === '/api/admin/admin-users' && req.method === 'GET') return sendJson(res, 200, { success: true, data: listAdminUsers(getBearerToken(req)) });
    if (pathname === '/api/admin/audit-logs' && req.method === 'GET') return sendJson(res, 200, { success: true, data: listAuditLogs(getBearerToken(req)) });

    if ((pathname === '/api/feishu' || pathname === '/api/feishu/record') && req.method === 'POST') {
      return sendJson(res, 200, { success: true, data: await writeToFeishuTable(await parseBody(req)) });
    }
    if (pathname === '/api/health' && req.method === 'GET') return sendJson(res, 200, { success: true, time: new Date().toISOString() });

    sendJson(res, 404, { success: false, error: 'Not Found' });
  } catch (error) {
    sendJson(res, error.statusCode || 400, { success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Local API server listening on http://localhost:${PORT}`);
});
