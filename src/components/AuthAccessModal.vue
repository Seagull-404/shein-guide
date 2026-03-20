<template>
  <div v-if="show" class="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
    <div class="w-full max-w-lg rounded-3xl border border-white/70 bg-white/95 p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-extrabold uppercase tracking-[0.28em] text-brand-600">Member Access</p>
          <h2 class="mt-2 text-2xl font-extrabold text-slate-800">{{ title }}</h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">{{ subtitle }}</p>
        </div>
        <button type="button" class="text-slate-400 transition-transform hover:rotate-90 hover:text-slate-600" @click="emit('close')">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="mb-6 inline-flex rounded-full bg-slate-100 p-1 text-sm font-semibold">
        <button type="button" class="rounded-full px-4 py-2 transition-colors" :class="mode === 'login' ? 'bg-white text-brand-700 shadow' : 'text-slate-500'" @click="emit('switch-mode', 'login')">登录</button>
        <button type="button" class="rounded-full px-4 py-2 transition-colors" :class="mode === 'register' ? 'bg-white text-brand-700 shadow' : 'text-slate-500'" @click="emit('switch-mode', 'register')">注册</button>
      </div>

      <p v-if="errorMessage" class="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{{ errorMessage }}</p>
      <p v-if="successMessage" class="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ successMessage }}</p>

      <section v-if="mode === 'login'" class="space-y-4">
        <form class="space-y-4" @submit.prevent="handleLogin">
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">手机号</label>
            <input v-model="loginForm.phone" type="text" class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="请输入手机号" />
          </div>
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">密码</label>
            <input v-model="loginForm.password" type="password" class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="请输入密码" />
          </div>
          <button class="w-full rounded-xl bg-brand-600 px-6 py-3 font-bold text-white transition hover:bg-brand-500 disabled:opacity-70" :disabled="loading">{{ loading ? '登录中...' : '登录并继续' }}</button>
        </form>
        <button type="button" class="w-full text-sm font-semibold text-brand-700 transition hover:text-brand-600" @click="emit('switch-mode', 'register')">没有账号？去注册</button>
      </section>

      <section v-else class="space-y-4">
        <form class="space-y-4" @submit.prevent="handleRegister">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">手机号</label>
              <input v-model="registerForm.phone" type="text" class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="11 位手机号" />
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">昵称</label>
              <input v-model="registerForm.nickname" type="text" class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="至少 2 个字符" />
            </div>
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">密码</label>
              <input v-model="registerForm.password" type="password" class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="至少 8 位" />
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">推荐人</label>
              <input v-model="registerForm.referrer" type="text" class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="选填" />
            </div>
          </div>
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">入驻平台</label>
            <div class="grid grid-cols-2 gap-3">
              <button type="button" class="rounded-xl border px-4 py-3 text-sm font-semibold transition" :class="registerForm.registerPlatform === 'shein' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'" @click="registerForm.registerPlatform = 'shein'">SHEIN</button>
              <button type="button" class="rounded-xl border px-4 py-3 text-sm font-semibold transition" :class="registerForm.registerPlatform === 'ozon' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'" @click="registerForm.registerPlatform = 'ozon'">OZON</button>
            </div>
          </div>
          <button class="w-full rounded-xl bg-brand-600 px-6 py-3 font-bold text-white transition hover:bg-brand-500 disabled:opacity-70" :disabled="loading">{{ loading ? '注册中...' : '注册并返回登录' }}</button>
        </form>
        <button type="button" class="w-full text-sm font-semibold text-brand-700 transition hover:text-brand-600" @click="emit('switch-mode', 'login')">已有账号？去登录</button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useAuth } from '../composables/useAuth'

const props = defineProps({
  show: { type: Boolean, default: false },
  platform: { type: String, default: 'shein' },
  mode: { type: String, default: 'login' }
})

const emit = defineEmits(['close', 'authenticated', 'switch-mode'])
const { register, login } = useAuth()

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const loginForm = reactive({ phone: '', password: '' })
const registerForm = reactive({
  phone: '',
  password: '',
  nickname: '',
  referrer: '',
  registerPlatform: 'shein'
})

const title = computed(() => `${props.platform.toUpperCase()} 教程权限验证`)
const subtitle = computed(() => `登录后才能继续访问 ${props.platform.toUpperCase()} 教程；未开通 VIP 时仍无法查看教程内容。`)

function resetMessages() {
  errorMessage.value = ''
  successMessage.value = ''
}

async function handleLogin() {
  resetMessages()
  loading.value = true
  try {
    const user = await login({ ...loginForm })
    emit('authenticated', user)
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  resetMessages()
  loading.value = true
  try {
    await register({
      phone: registerForm.phone,
      password: registerForm.password,
      nickname: registerForm.nickname,
      referrer: registerForm.referrer,
      registerPlatform: registerForm.registerPlatform
    })
    successMessage.value = '注册成功，请直接登录。'
    loginForm.phone = registerForm.phone
    loginForm.password = ''
    emit('switch-mode', 'login')
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.show, props.platform],
  ([show]) => {
    if (!show) return
    registerForm.registerPlatform = props.platform
    resetMessages()
  },
  { immediate: true }
)
</script>
