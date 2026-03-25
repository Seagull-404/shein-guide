const USER_TOKEN_KEY = 'site_auth_token_v1'

const state = {
  user: null,
  users: [],
  error: ''
}

function getApiBase() {
  return window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : `${window.location.origin}/api`
}

function getToken() {
  return window.localStorage.getItem(USER_TOKEN_KEY) || ''
}

async function apiRequest(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${getApiBase()}${path}`, { ...options, headers })
  const result = await response.json().catch(() => ({ success: false, error: '服务响应异常' }))
  if (!response.ok || !result.success) throw new Error(result.error || '请求失败')
  return result.data
}

function escapeHtml(value) {
  return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
}

function render() {
  const app = document.getElementById('app')
  app.innerHTML = `
    <style>
      *{box-sizing:border-box} body{margin:0;font-family:'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;background:#f8fafc;color:#0f172a}
      button,input{font:inherit}.page{min-height:100vh;padding:24px}.shell{max-width:1180px;margin:0 auto}.card{background:#fff;border:1px solid #e2e8f0;border-radius:16px}
      .header,.toolbar{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:24px;margin-bottom:16px}.title{margin:8px 0 0;font-size:30px;font-weight:800}.muted{color:#64748b;font-size:14px}
      .btn{height:40px;padding:0 16px;border-radius:10px;border:1px solid #cbd5e1;background:#fff;cursor:pointer}.btn-primary{border:none;background:#2563eb;color:#fff;font-weight:700}.btn-pill{height:32px;border-radius:999px;padding:0 12px;font-size:12px}
      table{width:100%;border-collapse:collapse;font-size:14px} th,td{padding:14px 16px;border-bottom:1px solid #f1f5f9;text-align:left;white-space:nowrap}.table-wrap{overflow:auto}.alert{margin-bottom:16px;padding:12px 14px;border-radius:10px;font-size:14px;border:1px solid #fecaca;background:#fef2f2;color:#dc2626}
      .chip{display:inline-flex;height:28px;align-items:center;padding:0 10px;border-radius:999px;font-size:12px;font-weight:700;background:#e0f2fe;color:#075985}
    </style>
    <main class="page"><div class="shell">
      <section class="card header">
        <div><div class="muted">Admin Panel</div><h1 class="title">管理员后台</h1><p class="muted">${state.user ? `${escapeHtml(state.user.nickname)} / ${escapeHtml(state.user.phone)}` : '请通过网站登录管理员账号'} </p></div>
        <div style="display:flex;gap:12px"><a href="/shein/index.html" class="btn" style="display:inline-flex;align-items:center;text-decoration:none;color:#0f172a">返回首页</a></div>
      </section>
      ${state.error ? `<div class="alert">${escapeHtml(state.error)}</div>` : ''}
      ${state.user ? renderDashboard() : renderLocked()}
    </div></main>
  `
  bindEvents()
}

function renderLocked() {
  return `<section class="card" style="padding:24px"><div style="font-size:20px;font-weight:700;margin-bottom:8px">未进入管理员状态</div><p class="muted">请先在首页登录管理员用户，再从右上角状态入口进入后台。</p></section>`
}

function renderDashboard() {
  const rows = state.users.map((user) => `
    <tr>
      <td>${escapeHtml(user.phone)}</td>
      <td>${escapeHtml(user.nickname)}</td>
      <td>${escapeHtml((user.registerPlatform || '').toUpperCase())}</td>
      <td><button class="btn btn-pill" data-action="toggle-vip" data-field="sheinVip" data-id="${user.id}">${user.sheinVip ? '已开通' : '未开通'}</button></td>
      <td><button class="btn btn-pill" data-action="toggle-vip" data-field="ozonVip" data-id="${user.id}">${user.ozonVip ? '已开通' : '未开通'}</button></td>
      <td><button class="btn btn-pill" data-action="toggle-status" data-id="${user.id}">${escapeHtml(user.status)}</button></td>
      <td>${escapeHtml((user.createdAt || '').slice(0, 10))}</td>
    </tr>`).join('')

  return `
    <section class="card toolbar"><div><div style="font-size:18px;font-weight:700">普通用户管理</div></div><button id="refresh-btn" class="btn">刷新</button></section>
    <section class="card table-wrap"><table><thead><tr><th>手机号</th><th>昵称</th><th>平台</th><th>SHEIN VIP</th><th>OZON VIP</th><th>状态</th><th>创建时间</th></tr></thead><tbody>${rows}</tbody></table></section>
  `
}

function bindEvents() {
  const refreshBtn = document.getElementById('refresh-btn')
  if (refreshBtn) refreshBtn.addEventListener('click', loadUsers)
  document.querySelectorAll('[data-action="toggle-vip"]').forEach((button) => button.addEventListener('click', async () => {
    await toggleVip(Number(button.getAttribute('data-id')), button.getAttribute('data-field'))
  }))
  document.querySelectorAll('[data-action="toggle-status"]').forEach((button) => button.addEventListener('click', async () => {
    await toggleStatus(Number(button.getAttribute('data-id')))
  }))
}

async function loadMe() {
  try {
    const me = await apiRequest('/auth/me', { method: 'GET' })
    if (me.accountRole !== 'admin') throw new Error('当前账号不是管理员')
    state.user = me
  } catch (error) {
    state.user = null
    state.error = error.message
  }
}

async function loadUsers() {
  state.error = ''
  try {
    state.users = await apiRequest('/manager/users', { method: 'GET' })
  } catch (error) {
    state.error = error.message
  }
  render()
}

async function toggleVip(id, field) {
  const user = state.users.find((item) => item.id === id)
  if (!user) return
  state.error = ''
  try {
    const updated = await apiRequest('/manager/user', { method: 'PATCH', body: JSON.stringify({ id, [field]: !user[field] }) })
    state.users = state.users.map((item) => item.id === id ? updated : item)
  } catch (error) {
    state.error = error.message
  }
  render()
}

async function toggleStatus(id) {
  const user = state.users.find((item) => item.id === id)
  if (!user) return
  state.error = ''
  try {
    const updated = await apiRequest('/manager/user', { method: 'PATCH', body: JSON.stringify({ id, status: user.status === 'active' ? 'disabled' : 'active' }) })
    state.users = state.users.map((item) => item.id === id ? updated : item)
  } catch (error) {
    state.error = error.message
  }
  render()
}

async function bootstrap() {
  render()
  await loadMe()
  if (state.user) await loadUsers()
  else render()
}

bootstrap()
