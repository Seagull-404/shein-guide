<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
        @click.self="handleCancel"
      >
        <div
          class="survey-modal relative w-full max-w-lg rounded-3xl border border-white bg-white/90 p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl"
          @click.stop
        >
          <button class="absolute right-6 top-6 text-slate-400 transition-transform hover:rotate-90 hover:text-slate-600" @click="handleCancel">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <div class="mb-6">
            <h2 class="flex items-center gap-3 text-2xl font-extrabold text-slate-800">📝 信息登记</h2>
            <p class="mt-2 text-sm text-slate-500">请先填写团队与开店信息，提交后即可进入 OZON 教程流程。</p>
          </div>

          <form class="space-y-5" @submit.prevent="handleSubmit">
            <div class="space-y-4">
              <h3 class="border-b border-slate-200 pb-2 text-sm font-bold text-slate-700">📦 团队基础信息</h3>

              <div class="space-y-1">
                <label for="team" class="text-sm font-medium text-slate-700"><span class="text-red-500">*</span> 隶属团队（推荐人）</label>
                <input
                  id="team"
                  v-model="form.team"
                  type="text"
                  class="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
                  placeholder="请输入所属团队或推荐人"
                  required
                />
              </div>

              <div class="space-y-1">
                <label for="name" class="text-sm font-medium text-slate-700"><span class="text-red-500">*</span> 姓名</label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  class="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
                  placeholder="请输入姓名"
                  required
                />
              </div>

              <div class="space-y-1">
                <label for="contact" class="text-sm font-medium text-slate-700"><span class="text-red-500">*</span> 联系方式</label>
                <input
                  id="contact"
                  v-model="form.contact"
                  type="text"
                  class="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
                  placeholder="请输入手机号或微信号"
                  required
                />
              </div>

              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="space-y-1">
                  <label for="teamSize" class="text-sm font-medium text-slate-700"><span class="text-red-500">*</span> 团队人数</label>
                  <input
                    id="teamSize"
                    v-model="form.teamSize"
                    type="number"
                    min="1"
                    class="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
                    placeholder="例如 5"
                    required
                  />
                </div>

                <div class="space-y-1">
                  <label for="storeCount" class="text-sm font-medium text-slate-700"><span class="text-red-500">*</span> 预计开店数量</label>
                  <input
                    id="storeCount"
                    v-model="form.storeCount"
                    type="number"
                    min="1"
                    class="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
                    placeholder="例如 3"
                    required
                  />
                </div>
              </div>
            </div>

            <div class="rounded-xl border border-blue-100/50 bg-blue-50/50 p-4">
              <h4 class="mb-2 flex items-center gap-2 text-xs font-bold text-blue-800">🔌 飞书接口预留</h4>
              <ul class="list-disc space-y-1 pl-5 text-xs text-blue-600/80 marker:text-blue-300">
                <li>提交后会按现有飞书接口格式写入记录。</li>
                <li>请求体已标记平台为 OZON，后续可以直接接你们的表字段。</li>
              </ul>
            </div>

            <div class="flex gap-4 pt-4">
              <button
                type="button"
                class="flex-1 rounded-xl bg-slate-100 px-6 py-3 font-medium text-slate-600 transition-colors hover:bg-slate-200"
                @click="handleCancel"
              >
                稍后填写
              </button>
              <button
                type="submit"
                class="flex-1 rounded-xl bg-brand-600 px-6 py-3 font-bold text-white shadow-lg shadow-brand-500/20 transition-all hover:scale-[1.02] hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-70"
                :disabled="isSubmitting"
              >
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
import { reactive, ref } from 'vue'
import { useOzonSurvey } from '../composables/useOzonSurvey'

defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])
const { submitSurvey, handleSkip } = useOzonSurvey()

const isSubmitting = ref(false)
const form = reactive({
  team: '',
  name: '',
  contact: '',
  teamSize: '',
  storeCount: ''
})

const handleSubmit = async () => {
  isSubmitting.value = true

  try {
    await submitSurvey({ ...form })
    emit('submit', { ...form })
    emit('close')
  } catch (error) {
    console.error('OZON survey submit failed:', error)
    alert('提交失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  handleSkip()
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
  overflow-x: hidden;
  overflow-y: auto;
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
  border: 2px solid transparent;
  border-radius: 10px;
  background-clip: padding-box;
}
</style>
