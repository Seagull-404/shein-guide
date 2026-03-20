<template>
  <main style="min-height:100vh;background:#f8fafc;padding:24px;box-sizing:border-box;">
    <div style="max-width:1100px;margin:0 auto;">
      <header style="background:#fff;border:1px solid #e2e8f0;padding:24px;border-radius:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;gap:16px;">
        <div>
          <div style="font-size:12px;color:#64748b;letter-spacing:.18em;text-transform:uppercase;font-weight:700;">Admin Panel</div>
          <h1 style="margin:8px 0 0;font-size:32px;color:#0f172a;">VIP 用户管理</h1>
          <p style="margin:8px 0 0;color:#64748b;">固定管理员账号：admin，密码：123456</p>
        </div>
        <button v-if="admin" @click="logoutAdmin" style="border:1px solid #cbd5e1;background:#fff;padding:10px 16px;border-radius:10px;cursor:pointer;">退出登录</button>
      </header>

      <section v-if="!admin" style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;">
        <h2 style="margin:0 0 16px;font-size:24px;color:#0f172a;">管理员登录</h2>
        <p style="margin:0 0 16px;color:#64748b;">系统会优先自动登录固定管理员账号。如果失败，再使用下面的表单。</p>
        <p v-if="errorMessage" style="margin:0 0 16px;padding:12px 14px;border:1px solid #fecaca;background:#fef2f2;color:#dc2626;border-radius:10px;">{{ errorMessage }}</p>
        <form @submit.prevent="submitLogin" style="display:grid;gap:16px;">
          <label style="display:grid;gap:6px;color:#334155;font-size:14px;">
            <span>账号</span>
            <input v-model="loginForm.username" type="text" placeholder="请输入管理员账号" style="height:44px;padding:0 14px;border:1px solid #cbd5e1;border-radius:10px;outline:none;" />
          </label>
          <label style="display:grid;gap:6px;color:#334155;font-size:14px;">
            <span>密码</span>
            <input v-model="loginForm.password" type="password" placeholder="请输入管理员密码" style="height:44px;padding:0 14px;border:1px solid #cbd5e1;border-radius:10px;outline:none;" />
          </label>
          <button :disabled="loading" style="height:46px;border:none;background:#2563eb;color:#fff;border-radius:10px;font-weight:700;cursor:pointer;">{{ loading ? '登录中...' : '登录后台' }}</button>
        </form>
      </section>

      <section v-else style="display:grid;gap:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:20px 24px;">
          <div>
            <div style="font-size:18px;font-weight:700;color:#0f172a;">用户列表</div>
            <div style="font-size:14px;color:#64748b;">共 {{ users.length }} 个账号</div>
          </div>
          <button @click="loadUsers" style="border:1px solid #cbd5e1;background:#fff;padding:10px 16px;border-radius:10px;cursor:pointer;">刷新</button>
        </div>

        <div v-if="errorMessage" style="padding:12px 14px;border:1px solid #fecaca;background:#fef2f2;color:#dc2626;border-radius:10px;">{{ errorMessage }}</div>

        <div style="overflow:auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead style="background:#f8fafc;color:#64748b;">
              <tr>
                <th v-for="head in headers" :key="head" style="text-align:left;padding:14px 16px;border-bottom:1px solid #e2e8f0;">{{ head }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="userItem in users" :key="userItem.id">
                <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">{{ userItem.phone }}</td>
                <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">{{ userItem.nickname }}</td>
                <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">{{ userItem.referrer || '-' }}</td>
                <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;text-transform:uppercase;">{{ userItem.registerPlatform }}</td>
                <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
                  <button @click="toggleVip(userItem, 'sheinVip')" style="border:1px solid #cbd5e1;background:#fff;padding:6px 10px;border-radius:999px;cursor:pointer;">{{ userItem.sheinVip ? '已开通' : '未开通' }}</button>
                </td>
                <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
                  <button @click="toggleVip(userItem, 'ozonVip')" style="border:1px solid #cbd5e1;background:#fff;padding:6px 10px;border-radius:999px;cursor:pointer;">{{ userItem.ozonVip ? '已开通' : '未开通' }}</button>
                </td>
                <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
                  <button @click="toggleStatus(userItem)" style="border:1px solid #cbd5e1;background:#fff;padding:6px 10px;border-radius:999px;cursor:pointer;">{{ userItem.status }}</button>
                </td>
                <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">{{ userItem.createdAt?.slice(0, 10) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'

const ADMIN_TOKEN_KEY = 'site_admin_token_v1'
const headers = ['手机号', '昵称', '推荐人', '注册平台', 'SHEIN VIP', 'OZON VIP', '状态', '注册时间']
const admin = ref(null)
const users = ref([])
const errorMessage = ref('')
const loading = ref(false)
const loginForm = reactive({ username: 'admin', password: '123456' })

function getApiBase() {
  return window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : `${window.location.origin}/api`
}

function getToken() {
  return window.localStorage.getItem(ADMIN_TOKEN_KEY) || ''
}

function setToken(token) {
  if (token) window.localStorage.setItem(ADMIN_TOKEN_KEY, token)
  else window.localStorage.removeItem(ADMIN_TOKEN_KEY)
}

async function adminRequest(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${getApiBase()}${path}`, { ...options, headers })
  const result = await response.json().catch(() => ({ success: false, error: '服务响应异常' }))
  if (!response.ok || !result.success) throw new Error(result.error || '请求失败')
  return result.data
}

async function fetchAdminMe() {
  try {
    admin.value = await adminRequest('/admin/me', { method: 'GET' })
    return admin.value
  } catch {
    setToken('')
    admin.value = null
    return null
  }
}

async function submitLogin() {
  errorMessage.value = ''
  loading.value = true
  try {
    const result = await adminRequest('/admin/login', { method: 'POST', body: JSON.stringify(loginForm) })
    setToken(result.token)
    admin.value = result.admin
    await loadUsers()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

async function ensureAdminSession() {
  const current = await fetchAdminMe()
  if (current) {
    await loadUsers()
    return
  }
  try {
    const result = await adminRequest('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password: '123456' })
    })
    setToken(result.token)
    admin.value = result.admin
    await loadUsers()
  } catch (error) {
    errorMessage.value = error.message
  }
}

async function loadUsers() {
  errorMessage.value = ''
  try {
    users.value = await adminRequest('/admin/users', { method: 'GET' })
  } catch (error) {
    errorMessage.value = error.message
  }
}

async function toggleVip(userItem, field) {
  errorMessage.value = ''
  try {
    const updated = await adminRequest('/admin/user', { method: 'PATCH', body: JSON.stringify({ id: userItem.id, [field]: !userItem[field] }) })
    users.value = users.value.map((item) => (item.id === updated.id ? updated : item))
  } catch (error) {
    errorMessage.value = error.message
  }
}

async function toggleStatus(userItem) {
  errorMessage.value = ''
  try {
    const updated = await adminRequest('/admin/user', { method: 'PATCH', body: JSON.stringify({ id: userItem.id, status: userItem.status === 'active' ? 'disabled' : 'active' }) })
    users.value = users.value.map((item) => (item.id === updated.id ? updated : item))
  } catch (error) {
    errorMessage.value = error.message
  }
}

async function logoutAdmin() {
  try { await adminRequest('/admin/logout', { method: 'POST' }) } catch {}
  setToken('')
  admin.value = null
  users.value = []
}

onMounted(async () => {
  await ensureAdminSession()
})
</script>
