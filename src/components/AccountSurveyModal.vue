<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" @click.self="handleCancel">
        <div class="bg-white/90 backdrop-blur-xl border border-white w-full max-w-md rounded-3xl p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transform transition-transform" @click.stop>
          
          <button @click="handleCancel" class="absolute top-6 right-6 text-slate-400 hover:text-slate-600 hover:rotate-90 transition-transform">
             <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <div class="mb-8 text-center flex flex-col items-center">
            <div class="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-4xl shadow-lg shadow-emerald-500/30 mb-4 animate-bounce">🎉</div>
            <h2 class="text-2xl font-extrabold text-slate-800">恭喜完成注册！</h2>
            <p class="mt-2 text-sm text-slate-500 font-medium">请填写您的 SHEIN 店铺账号信息</p>
          </div>
          
          <form @submit.prevent="handleSubmit" class="space-y-4">
            
            <div class="space-y-1">
              <label for="sheinAccount" class="text-sm font-medium text-slate-700">
                <span class="text-red-500">*</span> 希音账号
              </label>
              <input
                id="sheinAccount"
                v-model="form.sheinAccount"
                type="text"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm outline-none"
                placeholder="通常是注册时使用的邮箱或手机号"
                required
              />
            </div>
            
            <div class="space-y-1">
              <label for="sheinPassword" class="text-sm font-medium text-slate-700">
                <span class="text-red-500">*</span> 希音密码
              </label>
              <div class="relative">
                <input
                  id="sheinPassword"
                  v-model="form.sheinPassword"
                  :type="showPassword ? 'text' : 'password'"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm outline-none pr-10"
                  placeholder="请输入店铺密码"
                  required
                />
                <button 
                  type="button" 
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  @click="showPassword = !showPassword"
                >
                  <svg v-if="!showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                </button>
              </div>
            </div>
            
            <div class="bg-blue-50/50 border border-blue-100/50 rounded-xl p-4 mt-6">
              <h4 class="text-xs font-bold text-blue-800 mb-2 flex items-center gap-2">📋 为什么需要这些信息？</h4>
              <ul class="text-xs text-blue-600/80 space-y-1 pl-6 list-disc marker:text-blue-300">
                <li>用于后续的订单自动化处理</li>
                <li>同步物流信息到您的店铺</li>
                <li>自动生成发货记录</li>
              </ul>
            </div>
            
            <div class="flex items-start gap-2 p-3 bg-amber-50 rounded-xl text-xs text-amber-800 border border-amber-100 mt-2">
              <span class="text-base leading-none">⚠️</span>
              <span class="leading-tight">请确保账号密码正确，错误的凭证将导致自动化失败</span>
            </div>
            
            <div class="flex gap-4 pt-4">
              <button type="button" class="flex-1 px-6 py-3 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors" @click="handleCancel">
                稍后再填
              </button>
              <button type="submit" class="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed" :disabled="isSubmitting">
                <span v-if="isSubmitting">提交中...</span>
                <span v-else>提交完成</span>
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useSurvey } from '../composables/useSurvey'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const { submitAccountInfo, handleSkip } = useSurvey()

const isSubmitting = ref(false)
const showPassword = ref(false)

const form = reactive({
  sheinAccount: '',
  sheinPassword: ''
})

const handleSubmit = async () => {
  if (!form.sheinAccount.trim() || !form.sheinPassword.trim()) {
    alert('请填写完整的账号信息')
    return
  }
  
  isSubmitting.value = true
  
  try {
    await submitAccountInfo({ ...form })
    emit('submit', { ...form })
    emit('close')
    
    // 显示成功提示
    alert('✅ 账号信息保存成功！现在您可以继续学习后续教程。')
  } catch (error) {
    console.error('提交失败:', error)
    alert('❌ 提交失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  handleSkip('account')
  emit('close')
}
</script>

<style scoped>
/* 动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95) translateY(10px);
}
</style>
