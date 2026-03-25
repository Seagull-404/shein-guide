import { computed, reactive } from 'vue'

const AUTH_TOKEN_KEY = 'site_auth_token_v1'
const state = reactive({
  token: typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_TOKEN_KEY) || '' : '',
  user: null,
  initialized: false
})

function getApiBase() {
  if (typeof window === 'undefined') return '/api'
  return window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : `${window.location.origin}/api`
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (state.token) headers.Authorization = `Bearer ${state.token}`
  const response = await fetch(`${getApiBase()}${path}`, { ...options, headers })
  const result = await response.json().catch(() => ({ success: false, error: '服务响应异常' }))
  if (!response.ok || !result.success) throw new Error(result.error || result.message || '请求失败')
  return result.data
}

function setToken(token) {
  state.token = token || ''
  if (typeof window !== 'undefined') {
    if (state.token) window.localStorage.setItem(AUTH_TOKEN_KEY, state.token)
    else window.localStorage.removeItem(AUTH_TOKEN_KEY)
  }
}

async function initializeAuth() {
  if (state.initialized) return
  state.initialized = true
  if (!state.token) return
  try {
    state.user = await request('/auth/me', { method: 'GET' })
  } catch {
    setToken('')
    state.user = null
  }
}

async function refreshMe() {
  if (!state.token) {
    state.user = null
    return null
  }
  try {
    state.user = await request('/auth/me', { method: 'GET' })
    return state.user
  } catch {
    setToken('')
    state.user = null
    return null
  }
}

async function register(payload) {
  await request('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
}

async function login(payload) {
  const result = await request('/auth/login', { method: 'POST', body: JSON.stringify(payload) })
  setToken(result.token)
  state.user = result.user
  return result.user
}

async function logout() {
  if (state.token) {
    try { await request('/auth/logout', { method: 'POST' }) } catch {}
  }
  setToken('')
  state.user = null
}

function hasVip(platform) {
  if (!state.user) return false
  if (platform === 'shein') return !!state.user.sheinVip
  if (platform === 'ozon') return !!state.user.ozonVip
  return false
}

export function useAuth() {
  return {
    state,
    user: computed(() => state.user),
    isLoggedIn: computed(() => !!state.user),
    isAdmin: computed(() => state.user?.accountRole === 'admin'),
    hasAnyVip: computed(() => !!(state.user?.sheinVip || state.user?.ozonVip || state.user?.accountRole === 'admin')),
    initializeAuth,
    refreshMe,
    register,
    login,
    logout,
    hasVip
  }
}
