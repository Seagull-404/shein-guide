const SUPER_TOKEN_KEY = 'site_super_admin_token_v1'

const state = {
  admin: null,
  users: [],
  adminUsers: [],
  auditLogs: [],
  error: '',
  loginLoading: false,
  tab: 'users'
}

function getApiBase() {
  return window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : `${window.location.origin}/api`
}

function getToken() { return window.localStorage.getItem(SUPER_TOKEN_KEY) || '' }
function setToken(token) { if (token) window.localStorage.setItem(SUPER_TOKEN_KEY, token); else window.localStorage.removeItem(SUPER_TOKEN_KEY) }

async function apiRequest(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${getApiBase()}${path}`, { ...options, headers })
  const result = await response.json().catch(() => ({ success: false, error: '服务响应异常' }))
  if (!response.ok || !result.success) throw new Error(result.error || '请求失败')
  return result.data
}

function escapeHtml(value) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;') }

function render() {
  document.getElementById('app').innerHTML = `
    <style>
      *{box-sizing:border-box} body{margin:0;font-family:'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;background:#020617;color:#e2e8f0} button,input,select{font:inherit}
      .page{min-height:100vh;padding:24px}.shell{max-width:1320px;margin:0 auto}.card{background:#0f172a;border:1px solid #1e293b;border-radius:18px}.header,.toolbar{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:24px;margin-bottom:16px}
      .title{margin:8px 0 0;font-size:30px;font-weight:800}.muted{color:#94a3b8;font-size:14px}.btn{height:40px;padding:0 16px;border-radius:10px;border:1px solid #334155;background:#111827;color:#e2e8f0;cursor:pointer}.btn-primary{border:none;background:#2563eb;color:#fff;font-weight:700}.btn-pill{height:32px;border-radius:999px;padding:0 12px;font-size:12px}
      table{width:100%;border-collapse:collapse;font-size:14px} th,td{padding:14px 16px;border-bottom:1px solid #1e293b;text-align:left;white-space:nowrap}.table-wrap{overflow:auto}.alert{margin-bottom:16px;padding:12px 14px;border-radius:10px;font-size:14px;border:1px solid #7f1d1d;background:#450a0a;color:#fecaca}
      .tabs{display:flex;gap:8px;margin-bottom:16px}.tab{height:38px;padding:0 14px;border-radius:999px;border:1px solid #334155;background:#111827;color:#cbd5e1;cursor:pointer}.tab-active{background:#2563eb;color:#fff;border-color:#2563eb}.chip{display:inline-flex;height:28px;align-items:center;padding:0 10px;border-radius:999px;font-size:12px;font-weight:700}.chip-admin{background:#1d4ed8;color:#dbeafe}.chip-user{background:#334155;color:#e2e8f0}
    </style>
    <main class="page"><div class="shell">
      <section class="card header"><div><div class="muted">Hidden URL / Super Admin</div><h1 class="title">超级管理员后台</h1><p class="muted">${state.admin ? `${escapeHtml(state.admin.username)} / super_admin` : '通过隐藏 URL 进入'}</p></div><div style="display:flex;gap:12px">${state.admin ? '<button id="logout-btn" class="btn">退出</button>' : ''}</div></section>
      ${state.error ? `<div class="alert">${escapeHtml(state.error)}</div>` : ''}
      ${state.admin ? renderDashboard() : renderLogin()}
    </div></main>`
  bindEvents()
}

function renderLogin() {
  return `<section class="card" style="max-width:520px;padding:24px;margin:0 auto"><h2 style="margin:0 0 8px;font-size:24px">超级管理员登录</h2><p class="muted" style="margin-bottom:16px">请输入超级管理员账号与密码</p><form id="login-form"><div style="display:grid;gap:12px"><input class="btn" style="height:44px;text-align:left" name="username" value="admin" autocomplete="username"><input class="btn" style="height:44px;text-align:left" type="password" name="password" value="" placeholder="请输入密码" autocomplete="current-password"></div><button class="btn btn-primary" style="width:100%;margin-top:16px">${state.loginLoading ? '登录中...' : '进入超级管理员后台'}</button></form></section>`
}

function renderDashboard() {
  return `${renderTabs()}${state.tab === 'users' ? renderUsers() : ''}${state.tab === 'admins' ? renderAdminUsers() : ''}${state.tab === 'logs' ? renderLogs() : ''}`
}

function renderTabs() {
  const tabs = [{key:'users',label:'全部用户'},{key:'admins',label:'管理员用户'},{key:'logs',label:'日志'}]
  return `<div class="tabs">${tabs.map((tab)=>`<button class="tab ${state.tab===tab.key?'tab-active':''}" data-tab="${tab.key}">${tab.label}</button>`).join('')}</div>`
}

function renderUsers() {
  const rows = state.users.map((user)=>`<tr><td>${escapeHtml(user.phone)}</td><td>${escapeHtml(user.nickname)}</td><td><span class="chip ${user.accountRole==='admin'?'chip-admin':'chip-user'}">${escapeHtml(user.accountRole)}</span></td><td>${escapeHtml((user.registerPlatform||'').toUpperCase())}</td><td><button class="btn btn-pill" data-action="toggle-role" data-id="${user.id}">${user.accountRole==='admin'?'降级为普通用户':'升级为管理员'}</button></td><td><button class="btn btn-pill" data-action="toggle-vip" data-field="sheinVip" data-id="${user.id}">${user.sheinVip?'已开通':'未开通'}</button></td><td><button class="btn btn-pill" data-action="toggle-vip" data-field="ozonVip" data-id="${user.id}">${user.ozonVip?'已开通':'未开通'}</button></td><td><button class="btn btn-pill" data-action="toggle-status" data-id="${user.id}">${escapeHtml(user.status)}</button></td></tr>`).join('')
  return `<section class="card table-wrap"><div class="toolbar"><div><div style="font-size:18px;font-weight:700">全部用户</div><div class="muted">超级管理员可以在此升降级管理员</div></div><button id="refresh-users-btn" class="btn">刷新</button></div><table><thead><tr><th>手机号</th><th>昵称</th><th>角色</th><th>平台</th><th>管理员升降级</th><th>SHEIN VIP</th><th>OZON VIP</th><th>状态</th></tr></thead><tbody>${rows}</tbody></table></section>`
}

function renderAdminUsers() {
  const rows = state.adminUsers.map((user)=>`<tr><td>${escapeHtml(user.phone)}</td><td>${escapeHtml(user.nickname)}</td><td>${escapeHtml(user.status)}</td><td>${escapeHtml((user.createdAt||'').slice(0,10))}</td></tr>`).join('')
  return `<section class="card table-wrap"><div class="toolbar"><div><div style="font-size:18px;font-weight:700">管理员用户</div><div class="muted">这里只显示由普通用户升级出来的管理员</div></div><button id="refresh-admin-users-btn" class="btn">刷新</button></div><table><thead><tr><th>手机号</th><th>昵称</th><th>状态</th><th>创建时间</th></tr></thead><tbody>${rows}</tbody></table></section>`
}

function renderLogs() {
  const rows = state.auditLogs.map((log)=>`<tr><td>${escapeHtml((log.createdAt||'').replace('T',' ').slice(0,19))}</td><td>${escapeHtml(log.actorType)}</td><td>${escapeHtml(log.actorName)}</td><td>${escapeHtml(log.action)}</td><td style="white-space:normal;min-width:280px">${escapeHtml(log.detail)}</td></tr>`).join('')
  return `<section class="card table-wrap"><div class="toolbar"><div><div style="font-size:18px;font-weight:700">操作日志</div></div><button id="refresh-logs-btn" class="btn">刷新</button></div><table><thead><tr><th>时间</th><th>类型</th><th>操作人</th><th>动作</th><th>详情</th></tr></thead><tbody>${rows}</tbody></table></section>`
}

function bindEvents() {
  const loginForm = document.getElementById('login-form')
  if (loginForm) loginForm.addEventListener('submit', async (event) => { event.preventDefault(); const formData = new FormData(loginForm); await submitLogin({ username:String(formData.get('username')||'').trim(), password:String(formData.get('password')||'').trim() }) })
  const logoutBtn = document.getElementById('logout-btn')
  if (logoutBtn) logoutBtn.addEventListener('click', logout)
  document.querySelectorAll('[data-tab]').forEach((button)=>button.addEventListener('click', async ()=>{ state.tab = button.getAttribute('data-tab'); await refreshTab() }))
  const refreshUsersBtn = document.getElementById('refresh-users-btn')
  if (refreshUsersBtn) refreshUsersBtn.addEventListener('click', loadUsers)
  const refreshAdminUsersBtn = document.getElementById('refresh-admin-users-btn')
  if (refreshAdminUsersBtn) refreshAdminUsersBtn.addEventListener('click', loadAdminUsers)
  const refreshLogsBtn = document.getElementById('refresh-logs-btn')
  if (refreshLogsBtn) refreshLogsBtn.addEventListener('click', loadLogs)
  document.querySelectorAll('[data-action="toggle-role"]').forEach((button)=>button.addEventListener('click', async ()=>{ await toggleRole(Number(button.getAttribute('data-id'))) }))
  document.querySelectorAll('[data-action="toggle-vip"]').forEach((button)=>button.addEventListener('click', async ()=>{ await toggleVip(Number(button.getAttribute('data-id')), button.getAttribute('data-field')) }))
  document.querySelectorAll('[data-action="toggle-status"]').forEach((button)=>button.addEventListener('click', async ()=>{ await toggleStatus(Number(button.getAttribute('data-id'))) }))
}

async function submitLogin(payload) {
  state.error = ''; state.loginLoading = true; render()
  try { const result = await apiRequest('/admin/login', { method:'POST', body: JSON.stringify(payload) }); setToken(result.token); state.admin = result.admin; await refreshTab(false) } catch (error) { state.error = error.message }
  state.loginLoading = false; render()
}

async function fetchMe() {
  try { state.admin = await apiRequest('/admin/me', { method:'GET' }) } catch { setToken(''); state.admin = null }
}

async function refreshTab(shouldRender = true) {
  if (state.tab === 'users') await loadUsers(shouldRender)
  if (state.tab === 'admins') await loadAdminUsers(shouldRender)
  if (state.tab === 'logs') await loadLogs(shouldRender)
}

async function loadUsers(shouldRender = true) { if (shouldRender) render(); try { state.users = await apiRequest('/admin/users', { method:'GET' }) } catch (error) { state.error = error.message } render() }
async function loadAdminUsers(shouldRender = true) { if (shouldRender) render(); try { state.adminUsers = await apiRequest('/admin/admin-users', { method:'GET' }) } catch (error) { state.error = error.message } render() }
async function loadLogs(shouldRender = true) { if (shouldRender) render(); try { state.auditLogs = await apiRequest('/admin/audit-logs', { method:'GET' }) } catch (error) { state.error = error.message } render() }

async function patchUser(payload) { try { await apiRequest('/admin/user', { method:'PATCH', body: JSON.stringify(payload) }); await refreshTab(false) } catch (error) { state.error = error.message; render() } }
async function toggleRole(id) { const user = state.users.find((item)=>item.id===id); if (!user) return; await patchUser({ id, accountRole: user.accountRole === 'admin' ? 'user' : 'admin' }) }
async function toggleVip(id, field) { const user = state.users.find((item)=>item.id===id); if (!user) return; await patchUser({ id, [field]: !user[field] }) }
async function toggleStatus(id) { const user = state.users.find((item)=>item.id===id); if (!user) return; await patchUser({ id, status: user.status === 'active' ? 'disabled' : 'active' }) }

async function logout() { try { await apiRequest('/admin/logout', { method:'POST' }) } catch {} setToken(''); state.admin = null; state.users=[]; state.adminUsers=[]; state.auditLogs=[]; state.error=''; render() }

async function bootstrap() { render(); await fetchMe(); if (state.admin) await refreshTab(false); render() }
bootstrap()
