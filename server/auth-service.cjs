const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.resolve(__dirname, '../data/auth-db.json');
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CAPTCHA_TTL_MS = 10 * 60 * 1000;
const PHONE_PATTERN = /^1\d{10}$/;
const PLATFORM_CODES = new Set(['shein', 'ozon']);
const USER_ROLES = new Set(['user', 'admin']);
const SUPER_ADMIN_USERNAME = process.env.SUPER_ADMIN_USERNAME || 'admin';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || '021101';

function ensureDbFile() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
      nextUserId: 1,
      nextAuditLogId: 1,
      users: [],
      sessions: [],
      adminSessions: [],
      captchas: [],
      adminUsers: [],
      auditLogs: []
    }, null, 2), 'utf8');
  }
}

function readDb() {
  ensureDbFile();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8').replace(/^\uFEFF/, ''));
}

function writeDb(db) {
  ensureDbFile();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

function nowIso() {
  return new Date().toISOString();
}

function randomId(size = 24) {
  return crypto.randomBytes(size).toString('hex');
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

function verifyPassword(password, passwordHash, passwordSalt) {
  const { hash } = hashPassword(password, passwordSalt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(passwordHash, 'hex'));
}

function sanitizeUser(user) {
  return {
    id: user.id,
    phone: user.phone,
    nickname: user.nickname,
    referrer: user.referrer,
    registerPlatform: user.registerPlatform,
    status: user.status,
    accountRole: user.accountRole || 'user',
    isAdmin: (user.accountRole || 'user') === 'admin',
    sheinVip: !!user.sheinVip,
    ozonVip: !!user.ozonVip,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function sanitizeSuperAdmin(admin) {
  return {
    username: admin.username,
    role: 'super_admin',
    status: admin.status,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt
  };
}

function cleanupDb(db) {
  const now = Date.now();
  db.sessions = (db.sessions || []).filter((session) => new Date(session.expiresAt).getTime() > now);
  db.adminSessions = (db.adminSessions || []).filter((session) => new Date(session.expiresAt).getTime() > now);
  db.captchas = (db.captchas || []).filter((captcha) => new Date(captcha.expiresAt).getTime() > now);
}

function migrateDb(db) {
  db.nextUserId = Number(db.nextUserId || 1);
  db.nextAuditLogId = Number(db.nextAuditLogId || 1);
  db.users = Array.isArray(db.users) ? db.users : [];
  db.sessions = Array.isArray(db.sessions) ? db.sessions : [];
  db.adminSessions = Array.isArray(db.adminSessions) ? db.adminSessions : [];
  db.captchas = Array.isArray(db.captchas) ? db.captchas : [];
  db.auditLogs = Array.isArray(db.auditLogs) ? db.auditLogs : [];
  db.adminUsers = Array.isArray(db.adminUsers) ? db.adminUsers : [];

  for (const user of db.users) {
    if (!user.accountRole) user.accountRole = user.isAdmin ? 'admin' : 'user';
    if (!USER_ROLES.has(user.accountRole)) user.accountRole = 'user';
    if (typeof user.sheinVip !== 'boolean') user.sheinVip = !!user.sheinVip;
    if (typeof user.ozonVip !== 'boolean') user.ozonVip = !!user.ozonVip;
    if (!user.status) user.status = 'active';
    if (!user.updatedAt) user.updatedAt = user.createdAt || nowIso();
    delete user.userType;
  }

  const maxUserId = db.users.reduce((max, user) => Math.max(max, Number(user.id) || 0), 0);
  if (db.nextUserId <= maxUserId) db.nextUserId = maxUserId + 1;

  const superAdmin = db.adminUsers.find((item) => item.username === SUPER_ADMIN_USERNAME) || db.adminUsers.find((item) => item.role === 'super_admin');
  db.adminUsers = superAdmin ? [superAdmin] : [];
}

function ensureSuperAdmin(db) {
  const existing = db.adminUsers[0];
  if (existing) {
    existing.username = SUPER_ADMIN_USERNAME;
    existing.role = 'super_admin';
    if (!existing.status) existing.status = 'active';
    if (!existing.createdAt) existing.createdAt = nowIso();
    if (!existing.updatedAt) existing.updatedAt = existing.createdAt;
    return;
  }

  const timestamp = nowIso();
  const creds = hashPassword(SUPER_ADMIN_PASSWORD);
  db.adminUsers = [{
    username: SUPER_ADMIN_USERNAME,
    role: 'super_admin',
    status: 'active',
    passwordHash: creds.hash,
    passwordSalt: creds.salt,
    createdAt: timestamp,
    updatedAt: timestamp
  }];
}

function getDb() {
  const db = readDb();
  migrateDb(db);
  cleanupDb(db);
  ensureSuperAdmin(db);
  writeDb(db);
  return db;
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

function addAuditLog(db, actorType, actorName, action, detail) {
  db.auditLogs.unshift({
    id: db.nextAuditLogId++,
    actorType,
    actorName,
    action,
    detail: String(detail || ''),
    createdAt: nowIso()
  });
  db.auditLogs = db.auditLogs.slice(0, 300);
}

function createCaptcha() {
  const db = getDb();
  const left = Math.floor(Math.random() * 8) + 1;
  const right = Math.floor(Math.random() * 8) + 1;
  const captcha = {
    id: randomId(12),
    question: `${left} + ${right} = ?`,
    answer: String(left + right),
    expiresAt: new Date(Date.now() + CAPTCHA_TTL_MS).toISOString(),
    createdAt: nowIso()
  };
  db.captchas.push(captcha);
  writeDb(db);
  return { captchaId: captcha.id, question: captcha.question, expiresAt: captcha.expiresAt };
}

function registerUser(payload) {
  const { phone, password, nickname, referrer = '', registerPlatform } = payload || {};
  if (!PHONE_PATTERN.test(phone || '')) throw new Error('手机号格式不正确');
  if (!validatePassword(password)) throw new Error('密码至少 6 位');
  if (!nickname || String(nickname).trim().length < 2) throw new Error('昵称至少 2 个字符');
  if (!PLATFORM_CODES.has(registerPlatform)) throw new Error('入驻平台不合法');

  const db = getDb();
  if (db.users.some((user) => user.phone === phone)) throw new Error('该手机号已注册');

  const timestamp = nowIso();
  const creds = hashPassword(password);
  const user = {
    id: db.nextUserId++,
    phone,
    nickname: String(nickname).trim(),
    referrer: String(referrer || '').trim(),
    registerPlatform,
    status: 'active',
    accountRole: 'user',
    sheinVip: false,
    ozonVip: false,
    passwordHash: creds.hash,
    passwordSalt: creds.salt,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  db.users.push(user);
  writeDb(db);
  return sanitizeUser(user);
}

function createUserSession(db, userId) {
  const token = randomId(32);
  const session = {
    token,
    userId,
    createdAt: nowIso(),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString()
  };
  db.sessions.push(session);
  return session;
}

function loginUser(payload) {
  const { phone, password } = payload || {};
  if (!PHONE_PATTERN.test(phone || '')) throw new Error('手机号格式不正确');
  if (!password) throw new Error('请输入密码');

  const db = getDb();
  const user = db.users.find((item) => item.phone === phone);
  if (!user || user.status !== 'active') throw new Error('账号或密码错误');
  if (!verifyPassword(password, user.passwordHash, user.passwordSalt)) throw new Error('账号或密码错误');

  const session = createUserSession(db, user.id);
  writeDb(db);
  return { token: session.token, user: sanitizeUser(user), expiresAt: session.expiresAt };
}

function getUserFromToken(token) {
  if (!token) return null;
  const db = getDb();
  const session = db.sessions.find((item) => item.token === token);
  if (!session) return null;
  const user = db.users.find((item) => item.id === session.userId);
  if (!user || user.status !== 'active') return null;
  return sanitizeUser(user);
}

function requireManagerUser(token) {
  const user = getUserFromToken(token);
  if (!user || user.accountRole !== 'admin') {
    const error = new Error('无管理员权限');
    error.statusCode = 403;
    throw error;
  }
  return user;
}

function logoutToken(token) {
  if (!token) return;
  const db = getDb();
  db.sessions = db.sessions.filter((item) => item.token !== token);
  writeDb(db);
}

function createSuperAdminSession(db) {
  const token = randomId(32);
  const session = {
    token,
    username: SUPER_ADMIN_USERNAME,
    createdAt: nowIso(),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString()
  };
  db.adminSessions.push(session);
  return session;
}

function loginAdmin(payload) {
  const { username, password } = payload || {};
  const db = getDb();
  const superAdmin = db.adminUsers[0];
  if (!superAdmin || username !== superAdmin.username || superAdmin.status !== 'active') throw new Error('超级管理员账号或密码错误');
  if (!verifyPassword(password, superAdmin.passwordHash, superAdmin.passwordSalt)) throw new Error('超级管理员账号或密码错误');
  const session = createSuperAdminSession(db);
  addAuditLog(db, 'super_admin', superAdmin.username, 'super_admin.login', '超级管理员登录');
  writeDb(db);
  return { token: session.token, admin: sanitizeSuperAdmin(superAdmin), expiresAt: session.expiresAt };
}

function getAdminFromToken(token) {
  if (!token) return null;
  const db = getDb();
  const session = db.adminSessions.find((item) => item.token === token);
  if (!session) return null;
  const superAdmin = db.adminUsers[0];
  if (!superAdmin || superAdmin.status !== 'active') return null;
  return sanitizeSuperAdmin(superAdmin);
}

function requireSuperAdmin(token) {
  const admin = getAdminFromToken(token);
  if (!admin) {
    const error = new Error('无超级管理员权限');
    error.statusCode = 403;
    throw error;
  }
  return admin;
}

function logoutAdminToken(token) {
  if (!token) return;
  const db = getDb();
  db.adminSessions = db.adminSessions.filter((item) => item.token !== token);
  writeDb(db);
}

function listManageableUsers(token) {
  requireManagerUser(token);
  const db = getDb();
  return db.users
    .filter((user) => (user.accountRole || 'user') !== 'admin')
    .map(sanitizeUser)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function updateManageableUser(token, payload) {
  const adminUser = requireManagerUser(token);
  const { id, sheinVip, ozonVip, status } = payload || {};
  if (!id) throw new Error('缺少用户 ID');

  const db = getDb();
  const user = db.users.find((item) => item.id === Number(id));
  if (!user) throw new Error('用户不存在');
  if ((user.accountRole || 'user') === 'admin') {
    const error = new Error('不能操作其他管理员');
    error.statusCode = 403;
    throw error;
  }

  if (typeof sheinVip === 'boolean') user.sheinVip = sheinVip;
  if (typeof ozonVip === 'boolean') user.ozonVip = ozonVip;
  if (typeof status === 'string' && ['active', 'disabled'].includes(status)) user.status = status;
  user.updatedAt = nowIso();
  addAuditLog(db, 'admin_user', adminUser.phone, 'manager.update_user', JSON.stringify({ id, sheinVip, ozonVip, status }));
  writeDb(db);
  return sanitizeUser(user);
}

function listAllUsers(token) {
  requireSuperAdmin(token);
  const db = getDb();
  return db.users.map(sanitizeUser).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function updateUserBySuperAdmin(token, payload) {
  const superAdmin = requireSuperAdmin(token);
  const { id, sheinVip, ozonVip, status, accountRole } = payload || {};
  if (!id) throw new Error('缺少用户 ID');

  const db = getDb();
  const user = db.users.find((item) => item.id === Number(id));
  if (!user) throw new Error('用户不存在');

  if (typeof sheinVip === 'boolean') user.sheinVip = sheinVip;
  if (typeof ozonVip === 'boolean') user.ozonVip = ozonVip;
  if (typeof status === 'string' && ['active', 'disabled'].includes(status)) user.status = status;
  if (typeof accountRole === 'string') {
    if (!USER_ROLES.has(accountRole)) throw new Error('账号角色不合法');
    user.accountRole = accountRole;
    if (accountRole === 'admin') {
      user.sheinVip = true;
      user.ozonVip = true;
    }
  }
  user.updatedAt = nowIso();
  addAuditLog(db, 'super_admin', superAdmin.username, 'super_admin.update_user', JSON.stringify({ id, sheinVip, ozonVip, status, accountRole }));
  writeDb(db);
  return sanitizeUser(user);
}

function listAdminUsers(token) {
  requireSuperAdmin(token);
  const db = getDb();
  return db.users.filter((user) => (user.accountRole || 'user') === 'admin').map(sanitizeUser).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function listAuditLogs(token) {
  requireSuperAdmin(token);
  const db = getDb();
  return db.auditLogs.slice(0, 200);
}

module.exports = {
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
  listAuditLogs,
  sanitizeUser
};
