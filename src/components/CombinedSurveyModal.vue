<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" @click.self="handleCancel">
        <div class="survey-modal bg-white/90 backdrop-blur-xl border border-white w-full max-w-lg rounded-3xl p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transform transition-transform" @click.stop>
          
          <button @click="handleCancel" class="absolute top-6 right-6 text-slate-400 hover:text-slate-600 hover:rotate-90 transition-transform">
             <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <div class="mb-6">
            <h2 class="text-2xl font-extrabold text-slate-800 flex items-center gap-3">📋 信息登记</h2>
            <p class="mt-2 text-sm text-slate-500">请填写您的企业信息和店铺账号，以便我们提供更好的服务</p>
          </div>
          
          <form @submit.prevent="handleSubmit" class="space-y-5">
            
            <!-- 营业执照信息 -->
            <div class="space-y-4">
              <h3 class="text-sm font-bold text-slate-700 border-b border-slate-200 pb-2">📄 营业执照信息</h3>
              
              <div class="space-y-1">
                <label for="team" class="text-sm font-medium text-slate-700">
                  <span class="text-red-500">*</span> 隶属团队（推荐人）
                </label>
                <input
                  id="team"
                  v-model="form.team"
                  type="text"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm outline-none"
                  placeholder="请输入您的推荐人或团队名称"
                  required
                />
              </div>
              
              <div class="space-y-1">
                <label for="licenseName" class="text-sm font-medium text-slate-700">
                  <span class="text-red-500">*</span> 营业执照名称
                </label>
                <input
                  id="licenseName"
                  v-model="form.licenseName"
                  type="text"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm outline-none"
                  placeholder="请输入营业执照上的完整名称"
                  required
                />
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label for="licenseCode" class="text-sm font-medium text-slate-700">
                    <span class="text-red-500">*</span> 信用代码
                  </label>
                  <input
                    id="licenseCode"
                    v-model="form.licenseCode"
                    type="text"
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm outline-none"
                    placeholder="9111..."
                    maxlength="18"
                    required
                  />
                </div>
                
                <div class="space-y-1">
                  <label for="licenseDate" class="text-sm font-medium text-slate-700">
                    <span class="text-red-500">*</span> 注册日期
                  </label>
                  <input
                    id="licenseDate"
                    v-model="form.licenseDate"
                    type="date"
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm outline-none"
                    required
                  />
                </div>
              </div>
              
              <div class="space-y-1">
                <label for="legalName" class="text-sm font-medium text-slate-700">
                  <span class="text-red-500">*</span> 营业执照法人姓名
                </label>
                <input
                  id="legalName"
                  v-model="form.legalName"
                  type="text"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm outline-none"
                  placeholder="请输入法人姓名"
                  required
                />
              </div>
              
              <div class="space-y-1">
                <label for="licenseAddress" class="text-sm font-medium text-slate-700">
                  <span class="text-red-500">*</span> 营业执照注册地址
                </label>
                <textarea
                  id="licenseAddress"
                  v-model="form.licenseAddress"
                  rows="2"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm outline-none resize-none"
                  placeholder="请输入完整的注册地址"
                  required
                ></textarea>
              </div>
            </div>
            
            <!-- SHEIN 账号信息 -->
            <div class="space-y-4">
              <h3 class="text-sm font-bold text-slate-700 border-b border-slate-200 pb-2">🔐 SHEIN 店铺账号</h3>
              
              <div class="space-y-1">
                <label for="sheinAccount" class="text-sm font-medium text-slate-700">
                  <span class="text-red-500">*</span> 希音账号
                </label>
                <input
                  id="sheinAccount"
                  v-model="form.sheinAccount"
                  type="text"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm outline-none"
                  placeholder="SHEIN店铺右上角GS开头的账号"
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
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm outline-none pr-10"
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
            </div>
            
            <div class="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl text-xs text-emerald-700 border border-emerald-100">
              <span class="text-base">🔒</span>
              <span>您的信息将被严格保密，仅用于店铺注册服务</span>
            </div>
            
            <div class="bg-blue-50/50 border border-blue-100/50 rounded-xl p-4">
              <h4 class="text-xs font-bold text-blue-800 mb-2 flex items-center gap-2">📋 为什么需要这些信息？</h4>
              <ul class="text-xs text-blue-600/80 space-y-1 pl-6 list-disc marker:text-blue-300">
                <li>用于后续的订单自动化处理</li>
                <li>同步物流信息到您的店铺</li>
                <li>自动生成发货记录</li>
              </ul>
            </div>
            
            <div class="flex gap-4 pt-4">
              <button type="button" class="flex-1 px-6 py-3 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors" @click="handleCancel">
                稍后再填
              </button>
              <button type="submit" class="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/20 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed" :disabled="isSubmitting">
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

const { submitCombinedInfo, handleSkip } = useSurvey()

const isSubmitting = ref(false)
const showPassword = ref(false)

const form = reactive({
  team: '',
  licenseName: '',
  licenseCode: '',
  licenseDate: '',
  legalName: '',
  licenseAddress: '',
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
    await submitCombinedInfo({ ...form })
    emit('submit', { ...form })
    emit('close')
    
    alert('✅ 信息保存成功！感谢您的配合。')
  } catch (error) {
    console.error('提交失败:', error)
    alert('❌ 提交失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  handleSkip('combined')
  emit('close')
}
</script>

<style scoped>
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

.survey-modal {
  max-height: 85vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.survey-modal::-webkit-scrollbar {
  width: 8px;
}

.survey-modal::-webkit-scrollbar-track {
  background: transparent;
  margin: 12px 0;
}

.survey-modal::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%);
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.survey-modal::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%);
  border: 2px solid transparent;
  background-clip: padding-box;
}

.survey-modal::-webkit-scrollbar-corner {
  background: transparent;
}
</style>
