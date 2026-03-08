<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="survey-modal" @click.self="handleCancel">
        <div class="modal-content">
          <div class="modal-header success-header">
            <div class="success-icon">🎉</div>
            <h2>恭喜完成注册！</h2>
            <p class="subtitle">请填写您的 SHEIN 店铺账号信息</p>
          </div>
          
          <form @submit.prevent="handleSubmit" class="survey-form">
            <div class="form-group">
              <label for="sheinAccount">
                <span class="required">*</span> 希音账号（SHEIN店铺账号）
              </label>
              <input
                id="sheinAccount"
                v-model="form.sheinAccount"
                type="text"
                placeholder="请输入您的SHEIN店铺账号"
                required
              />
              <span class="hint">通常是注册时使用的邮箱或手机号</span>
            </div>
            
            <div class="form-group">
              <label for="sheinPassword">
                <span class="required">*</span> 希音密码
              </label>
              <div class="password-input">
                <input
                  id="sheinPassword"
                  v-model="form.sheinPassword"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入店铺密码"
                  required
                />
                <button 
                  type="button" 
                  class="toggle-password"
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
              <span class="hint">密码将被加密存储，仅用于后续自动化服务</span>
            </div>
            
            <div class="info-box">
              <h4>📋 为什么需要这些信息？</h4>
              <ul>
                <li>用于后续的订单自动化处理</li>
                <li>同步物流信息到您的店铺</li>
                <li>自动生成发货记录</li>
              </ul>
            </div>
            
            <div class="form-notice warning">
              <span class="icon">⚠️</span>
              <span>请确保账号密码正确，错误的凭证将导致自动化失败</span>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="handleCancel">
                稍后再填
              </button>
              <button type="submit" class="btn-submit" :disabled="isSubmitting">
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
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
  text-align: center;
}

.success-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-bottom: none;
}

.success-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.success-header h2 {
  color: white;
}

.subtitle {
  margin: 8px 0 0;
  font-size: 14px;
  opacity: 0.9;
}

.survey-form {
  padding: 20px 24px 24px;
}

.form-group {
  margin-bottom: 20px;
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

input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.password-input {
  position: relative;
}

.password-input input {
  padding-right: 40px;
}

.toggle-password {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
}

.info-box {
  background: #eff6ff;
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
}

.info-box h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #1e40af;
}

.info-box ul {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  color: #3b82f6;
}

.info-box li {
  margin-bottom: 4px;
}

.form-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  margin: 20px 0;
  font-size: 13px;
}

.form-notice.warning {
  background: #fffbeb;
  color: #92400e;
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
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
</style>
