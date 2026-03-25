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
    <p v-if="successMessage" class="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ successMessage }}</p>

    <form class="space-y-4" @submit.prevent="handleRegister">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="space-y-1">
          <label class="text-sm font-medium text-slate-700">手机号</label>
          <input v-model="form.phone" type="text" class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="11 位手机号" />
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium text-slate-700">昵称</label>
          <input v-model="form.nickname" type="text" class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="至少 2 个字符" />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="space-y-1">
          <label class="text-sm font-medium text-slate-700">密码</label>
          <input v-model="form.password" type="password" class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="至少 8 位" />
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium text-slate-700">推荐人</label>
          <input v-model="form.referrer" type="text" class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="选填" />
        </div>
      </div>

      <div class="space-y-1">
        <label class="text-sm font-medium text-slate-700">入驻平台</label>
        <div class="grid grid-cols-2 gap-3">
          <button type="button" class="rounded-xl border px-4 py-3 text-sm font-semibold transition" :class="form.registerPlatform === 'shein' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'" @click="form.registerPlatform = 'shein'">SHEIN</button>
          <button type="button" class="rounded-xl border px-4 py-3 text-sm font-semibold transition" :class="form.registerPlatform === 'ozon' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'" @click="form.registerPlatform = 'ozon'">OZON</button>
        </div>
      </div>

      <button class="w-full rounded-xl bg-brand-600 px-6 py-3 font-bold text-white transition hover:bg-brand-500 disabled:opacity-70" :disabled="loading">
        {{ loading ? '注册中...' : '注册并返回登录' }}
      </button>
    </form>

    <button type="button" class="mt-4 w-full text-sm font-semibold text-brand-700 transition hover:text-brand-600" @click="emit('go-login')">
      已有账号？去登录
    </button>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useAuth } from '../composables/useAuth'

const props = defineProps({
  platform: { type: String, default: 'shein' }
})

const emit = defineEmits(['close', 'go-login'])
const { register } = useAuth()

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const form = reactive({
  phone: '',
  password: '',
  nickname: '',
  referrer: '',
  registerPlatform: 'shein'
})

const title = computed(() => `${props.platform.toUpperCase()} 账号注册`)
const subtitle = computed(() => `注册成功后可登录账号；教程访问仍需管理员开通 ${props.platform.toUpperCase()} VIP。`)

async function handleRegister() {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true
  try {
    await register({
      phone: form.phone,
      password: form.password,
      nickname: form.nickname,
      referrer: form.referrer,
      registerPlatform: form.registerPlatform
    })
    successMessage.value = '注册成功，请直接登录。'
    emit('go-login')
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

watch(
  () => props.platform,
  (platform) => {
    form.registerPlatform = platform
  },
  { immediate: true }
)
</script>
