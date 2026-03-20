<template>
  <div class="w-full rounded-3xl border border-white bg-white/95 p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.35)] backdrop-blur-xl">
    <div class="mb-6 flex items-start justify-between gap-4">
      <div>
        <h2 class="text-2xl font-extrabold text-slate-800">{{ title }}</h2>
        <p class="mt-2 text-sm text-slate-500">{{ subtitle }}</p>
      </div>
      <button type="button" class="text-slate-400 transition-transform hover:rotate-90 hover:text-slate-600" @click="emit('close')">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <p v-if="errorMessage" class="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{{ errorMessage }}</p>

    <form class="space-y-4" @submit.prevent="handleLogin">
      <div class="space-y-1">
        <label class="text-sm font-medium text-slate-700">手机号</label>
        <input v-model="form.phone" type="text" class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="请输入手机号" />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium text-slate-700">密码</label>
        <input v-model="form.password" type="password" class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="请输入密码" />
      </div>
      <button class="w-full rounded-xl bg-brand-600 px-6 py-3 font-bold text-white transition hover:bg-brand-500 disabled:opacity-70" :disabled="loading">
        {{ loading ? '登录中...' : '登录并继续' }}
      </button>
    </form>

    <button type="button" class="mt-4 w-full text-sm font-semibold text-brand-700 transition hover:text-brand-600" @click="emit('go-register')">
      没有账号？去注册
    </button>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const props = defineProps({
  platform: { type: String, default: 'shein' }
})

const emit = defineEmits(['close', 'authenticated', 'go-register'])
const { login } = useAuth()

const loading = ref(false)
const errorMessage = ref('')
const form = reactive({
  phone: '',
  password: ''
})

const title = computed(() => `${props.platform.toUpperCase()} 教程权限验证`)
const subtitle = computed(() => `登录后才能继续访问 ${props.platform.toUpperCase()} 教程；未开通 VIP 时仍无法查看教程内容。`)

async function handleLogin() {
  errorMessage.value = ''
  loading.value = true
  try {
    const user = await login({ ...form })
    emit('authenticated', user)
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}
</script>
