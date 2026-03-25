<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" @click.self="handleCancel">
        <div class="bg-white/90 backdrop-blur-xl border border-white w-full max-w-lg rounded-3xl p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transform transition-transform" @click.stop>
          
          <button @click="handleCancel" class="absolute top-6 right-6 text-slate-400 hover:text-slate-600 hover:rotate-90 transition-transform">
             <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <div class="mb-6">
            <h2 class="text-2xl font-extrabold text-slate-800 flex items-center gap-3">📋 基础信息登记</h2>
            <p class="mt-2 text-sm text-slate-500">请填写您的企业信息，以便我们提供更好的服务</p>
          </div>
          
          <form @submit.prevent="handleSubmit" class="space-y-4">
            
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
            
            <div class="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl text-xs text-emerald-700 border border-emerald-100 mt-2">
              <span class="text-base">🔒</span>
              <span>您的信息将被严格保密，仅用于店铺注册服务</span>
            </div>
            
            <div class="flex gap-4 pt-4">
              <button type="button" class="flex-1 px-6 py-3 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors" @click="handleCancel">
                暂不填写
              </button>
              <button type="submit" class="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/20 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed" :disabled="isSubmitting">
                <span v-if="isSubmitting">提交中...</span>
                <span v-else>保存并继续</span>
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

const { submitBasicInfo, handleSkip } = useSurvey()

const isSubmitting = ref(false)

const form = reactive({
  team: '',
  licenseName: '',
  licenseCode: '',
  licenseDate: '',
  legalName: '',
  licenseAddress: ''
})

const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    await submitBasicInfo({ ...form })
    emit('submit', { ...form })
    emit('close')
    
    // 显示成功提示
    alert('✅ 信息保存成功！感谢您的配合。')
  } catch (error) {
    console.error('提交失败:', error)
    alert('❌ 提交失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  handleSkip('basic')
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
