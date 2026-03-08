<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="survey-modal" @click.self="handleCancel">
        <div class="modal-content">
          <div class="modal-header">
            <h2>📋 基础信息登记</h2>
            <p class="subtitle">请填写您的企业信息，以便我们提供更好的服务</p>
          </div>
          
          <form @submit.prevent="handleSubmit" class="survey-form">
            <div class="form-group">
              <label for="team">
                <span class="required">*</span> 隶属团队（推荐人）
              </label>
              <input
                id="team"
                v-model="form.team"
                type="text"
                placeholder="请输入您的推荐人或团队名称"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="licenseName">
                <span class="required">*</span> 营业执照名称
              </label>
              <input
                id="licenseName"
                v-model="form.licenseName"
                type="text"
                placeholder="请输入营业执照上的完整名称"
                required
              />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="licenseCode">
                  <span class="required">*</span> 营业执照信用代码
                </label>
                <input
                  id="licenseCode"
                  v-model="form.licenseCode"
                  type="text"
                  placeholder="9111..."
                  maxlength="18"
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="licenseDate">
                  <span class="required">*</span> 营业执照注册日期
                </label>
                <input
                  id="licenseDate"
                  v-model="form.licenseDate"
                  type="date"
                  required
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="legalName">
                <span class="required">*</span> 营业执照法人姓名
              </label>
              <input
                id="legalName"
                v-model="form.legalName"
                type="text"
                placeholder="请输入法人姓名"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="licenseAddress">
                <span class="required">*</span> 营业执照注册地址
              </label>
              <textarea
                id="licenseAddress"
                v-model="form.licenseAddress"
                rows="2"
                placeholder="请输入完整的注册地址"
                required
              ></textarea>
            </div>
            
            <div class="form-notice">
              <span class="icon">🔒</span>
              <span>您的信息将被严格保密，仅用于店铺注册服务</span>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="handleCancel">
                暂不填写
              </button>
              <button type="submit" class="btn-submit" :disabled="isSubmitting">
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
.survey-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #111827;
}

.subtitle {
  margin: 8px 0 0;
  font-size: 14px;
  color: #6b7280;
}

.survey-form {
  padding: 20px 24px 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #ef4444;
  margin-right: 2px;
}

input,
textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f0fdf4;
  border-radius: 8px;
  margin: 20px 0;
  font-size: 13px;
  color: #166534;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #6b7280;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(10px);
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
