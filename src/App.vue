<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const showHero = ref(true)
const showTutorial = ref(false)
const showMaterialsModal = ref(false)
const materialsStep = ref(1)
const currentStep = ref(1)

const zhanfuClicked = ref(false)
const sheinClicked = ref(false)

const canGoNextStep = computed(() => zhanfuClicked.value && sheinClicked.value)

const materials = ref([
  { id: 1, text: "身份证：法人/负责人身份证正反面照片（清晰无遮挡）", checked: false },
  { id: 2, text: "营业执照：最新年检合格的营业执照电子版或扫描件", checked: false },
  { id: 3, text: "手机号：一个可以正常接收短信的手机号码（建议未在 SHEIN 注册过）", checked: false }
])

const materialsProgress = computed(() => {
  const done = materials.value.filter(m => m.checked).length
  return `已完成 ${done} / ${materials.value.length} 项`
})

const goToMaterials = () => { showMaterialsModal.value = true }
const closeMaterials = () => { showMaterialsModal.value = false }
const nextStep = () => { materialsStep.value = 2 }
const nextStepDone = () => { 
  showMaterialsModal.value = false
  materialsStep.value = 1
  showHero.value = false
  showTutorial.value = true
  window.history.pushState({ page: 'tutorial', step: 1 }, '', '#step1')
}

const onZhanfuClick = () => { zhanfuClicked.value = true }
const onSheinClick = () => { sheinClicked.value = true }

const goToStep = (step) => {
  currentStep.value = step
  window.history.pushState({ page: 'tutorial', step }, '', `#step${step}`)
}

const goToStep1 = () => goToStep(1)
const goToStep2 = () => goToStep(2)
const goToStep3 = () => goToStep(3)
const goToStep4 = () => goToStep(4)

const handlePopState = (event) => {
  if (event.state) {
    if (event.state.page === 'tutorial') {
      showHero.value = false
      showTutorial.value = true
      currentStep.value = event.state.step || 1
    } else if (event.state.page === 'home') {
      showHero.value = true
      showTutorial.value = false
    }
  }
}

onMounted(() => {
  window.addEventListener('popstate', handlePopState)
  window.history.replaceState({ page: 'home' }, '', '/')
})

onUnmounted(() => {
  window.removeEventListener('popstate', handlePopState)
})

const downloadUrl = 'https://erp.91miaoshou.com/api/app/views/static/plugin/kuajing-erp-plugin-v3.zip'
const downloadForChrome = () => {
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = ''
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
const downloadForEdge = () => {
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = ''
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div v-if="showHero" class="hero-page">
    <div class="hero-container">
      <div class="company-brand">
        <img src="/companylogo.jpg" alt="Company Logo" class="company-logo" />
      </div>
      <h1 class="hero-title">SHEIN 商家入驻标准流程</h1>
      <p class="hero-subtitle">一站式开店指引，助您轻松开启跨境之旅</p>
      <div class="hero-features">
        <div class="feature-item">
          <div class="feature-icon">📋</div>
          <div class="feature-text">材料准备清单</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">📖</div>
          <div class="feature-text">图文视频教程</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🛠️</div>
          <div class="feature-text">工具下载指引</div>
        </div>
      </div>
      <button class="primary-btn hero-btn" @click="goToMaterials">
        <span>立即开始</span>
        <svg class="btn-arrow" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/></svg>
      </button>
    </div>
  </div>
  <div v-if="showTutorial" class="tutorial-section">
    <div v-if="currentStep === 1">
      <h2 class="section-title"><span class="step-number">1.</span> SHEIN 商家注册</h2>
      <div class="tutorial-layout">
        <div class="pdf-panel">
          <h3>PDF 图文教程</h3>
          <iframe class="pdf-frame" src="/shein-guide.pdf"></iframe>
        </div>
        <div class="video-panel">
          <h3>视频教程</h3>
          <div class="placeholder-box video-placeholder">
            <p>视频教程准备中...</p>
            <p class="placeholder-hint">即将上线</p>
          </div>
          <div class="action-links">
            <div class="action-item">
              <a href="https://www.zhanfubrowser.com/register/?code=3262" target="_blank" class="primary-btn" @click="onZhanfuClick">
                注册战斧账号
              </a>
              <span v-if="zhanfuClicked" class="status-badge done">
                <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                已完成
              </span>
            </div>
            <div class="action-item">
              <a href="https://sbn-prod01.sheincorp.cn/" target="_blank" class="primary-btn dark" @click="onSheinClick">
                SHEIN 商家注册
              </a>
              <span v-if="sheinClicked" class="status-badge done">
                <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                已完成
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="step-nav-buttons">
        <button class="primary-btn outline" @click="goToStep1" v-if="currentStep > 1">← 上一步</button>
        <button class="primary-btn" @click="goToStep2" v-if="currentStep === 1">下一步 →</button>
        <button class="primary-btn" @click="goToStep3" v-if="currentStep === 2">下一步 →</button>
      </div>
    </div>
    <div v-if="currentStep === 2">
      <h2 class="section-title"><span class="step-number">2.</span> 店铺资料填写</h2>
      <div class="tutorial-layout">
        <div class="pdf-panel">
          <h3>PDF 图文教程</h3>
          <iframe class="pdf-frame" src="/shein-guide2.pdf"></iframe>
        </div>
        <div class="video-panel">
          <h3>视频教程</h3>
          <div class="placeholder-box video-placeholder">
            <p>视频教程准备中...</p>
            <p class="placeholder-hint">即将上线</p>
          </div>
        </div>
      </div>
      <div class="step-nav-buttons">
        <button class="primary-btn outline" @click="goToStep1">← 上一步</button>
        <button class="primary-btn" @click="goToStep3">下一步 →</button>
      </div>
    </div>
    <div v-if="currentStep === 3">
      <h2 class="section-title"><span class="step-number">3.</span> 选品与上架</h2>
      <div class="tutorial-layout">
        <div class="pdf-panel">
          <h3>PDF 图文教程</h3>
          <iframe class="pdf-frame" src="/shein-guide3.pdf"></iframe>
        </div>
        <div class="video-panel">
          <h3>视频教程</h3>
          <div class="placeholder-box video-placeholder">
            <p>视频教程准备中...</p>
            <p class="placeholder-hint">即将上线</p>
          </div>
          <div class="miaoshou-download">
            <div class="logo-links">
              <a href="https://erp.91miaoshou.com/" target="_blank" class="miaoshou-logo-link">
                <img src="/妙手logo.jpg" alt="妙手ERP" class="miaoshou-logo" />
              </a>
              <a href="https://us.shein.com/" target="_blank" class="shein-logo-link">
                <img src="/shein-s.svg" alt="SHEIN" class="shein-logo" />
              </a>
            </div>
            <div class="browser-btns">
              <a href="chrome://extensions/" class="browser-btn" @click="downloadForChrome">
                <img src="/chrome-logo-m100.svg" alt="Chrome" class="browser-logo" />
                <span class="browser-label">Chrome版下载</span>
              </a>
              <a href="edge://extensions/" class="browser-btn" @click="downloadForEdge">
                <img src="/edge-logo.jpg" alt="Edge" class="browser-logo" />
                <span class="browser-label">Edge版下载</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="step-nav-buttons">
        <button class="primary-btn outline" @click="goToStep2">← 上一步</button>
      </div>
    </div>
  </div>
  <div v-if="showMaterialsModal" class="modal-overlay" @click="closeMaterials">
    <div class="modal-content" @click.stop>
      <span class="close-btn" @click="closeMaterials">&times;</span>
      <div v-if="materialsStep === 1">
        <div class="modal-header"><h2>材料准备清单</h2></div>
        <div class="detail-list">
          <div class="materials-list">
            <label v-for="material in materials" :key="material.id" class="material-item">
              <input type="checkbox" v-model="material.checked">
              <span>{{ material.text }}</span>
            </label>
          </div>
          <div class="materials-progress">{{ materialsProgress }}</div>
        </div>
        <div class="modal-footer"><button class="primary-btn" @click="nextStep">下一步</button></div>
      </div>
      <div v-if="materialsStep === 2">
        <div class="modal-header"><h2>已下载战斧浏览器</h2></div>
        <p class="modal-desc">请在新打开的标签页中完成下载与安装，完成后点击下方按钮继续。</p>
        <div class="modal-footer"><button class="primary-btn" @click="nextStepDone">下一步</button></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f0f7ff 0%, #e0efff 100%); padding: 20px; }
.hero-container { max-width: 600px; width: 100%; text-align: center; background: #fff; border-radius: 24px; padding: 48px 40px; box-shadow: 0 20px 60px rgba(37, 99, 235, 0.12); }
.company-brand { margin-bottom: 24px; }
.company-logo { width: 200px; height: 80px; border-radius: 16px; object-fit: cover; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
.hero-title { font-size: 32px; font-weight: 700; color: var(--text-main); margin: 0 0 12px; }
.hero-subtitle { font-size: 16px; color: #64748b; margin: 0 0 32px; }
.hero-features { display: flex; justify-content: center; gap: 32px; margin-bottom: 40px; flex-wrap: wrap; }
.feature-item { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.feature-icon { font-size: 32px; }
.feature-text { font-size: 14px; color: #475569; font-weight: 500; }
.hero-btn { padding: 16px 48px; font-size: 18px; display: inline-flex; align-items: center; }
.btn-arrow { margin-left: 8px; }
@media (max-width: 600px) { .hero-container { padding: 32px 24px; } .hero-title { font-size: 24px; } .hero-features { gap: 20px; } }
.hero { max-width: 1100px; width: 100%; margin-bottom: 30px; text-align: center; }
.primary-btn { background: var(--primary-color); color: #fff; border: none; border-radius: 999px; padding: 12px 32px; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 8px 16px rgba(37, 99, 235, 0.25); transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease; text-decoration: none; display: inline-block; }
.primary-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 22px rgba(37, 99, 235, 0.35); opacity: 0.95; }
.primary-btn.dark { background: #1e293b; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25); }
.tutorial-section { width: 100%; margin: 20px 0 10px; }
.section-title { margin: 0 0 20px; font-size: 24px; color: var(--text-main); display: flex; align-items: center; gap: 8px; padding-bottom: 12px; border-bottom: 2px solid var(--primary-color); }
.step-number { color: var(--primary-color); font-weight: 700; }
.tutorial-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 45vw); justify-content: center; gap: 16px; }
.pdf-panel, .video-panel { background: #fff; border-radius: 16px; padding: 12px; box-shadow: 0 6px 14px rgba(0, 0, 0, 0.04); }
.pdf-panel h3, .video-panel h3 { margin-top: 0; margin-bottom: 10px; font-size: 16px; color: var(--text-main); }
.pdf-frame { width: 100%; aspect-ratio: 210 / 297; max-height: calc(100vh - 140px); border: none; border-radius: 8px; }
.placeholder-box { width: 100%; aspect-ratio: 210 / 297; max-height: calc(100vh - 140px); border: 2px dashed #ddd; border-radius: 8px; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #999; background: #fafafa; }
.video-placeholder { aspect-ratio: 16 / 9; max-height: 50vh; min-height: 360px; }
.placeholder-box p { margin: 8px 0; font-size: 16px; }
.placeholder-hint { font-size: 13px !important; color: #bbb; }
.video-frame { width: 100%; aspect-ratio: 16 / 9; max-height: 50vh; min-height: 360px; border-radius: 8px; background: #000; }
.action-links { margin-top: 12px; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
.action-item { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 500; animation: fadeIn 0.3s ease; }
.status-badge.done { background: #e8f5e9; color: #2e7d32; }
.status-badge svg { color: #4caf50; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
.next-step-container { margin-top: 20px; text-align: right; }
.next-step-btn { background: linear-gradient(135deg, #2563eb, #3b82f6); font-size: 18px; padding: 14px 40px; }
.step-nav-buttons { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 0; margin-top: 20px; }
.miaoshou-download { margin-top: 16px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.logo-links { display: flex; align-items: center; justify-content: center; gap: 20px; }
.miaoshou-logo-link { display: inline-block; border-radius: 8px; transition: transform 0.2s ease, box-shadow 0.2s ease; }
.miaoshou-logo-link:hover { transform: scale(1.05); }
.miaoshou-logo-link:hover .miaoshou-logo { box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3); }
.miaoshou-logo { width: 150px; height: 40px; border-radius: 8px; object-fit: cover; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); transition: box-shadow 0.2s ease; }
.shein-logo-link { display: inline-block; border-radius: 8px; transition: transform 0.2s ease, box-shadow 0.2s ease; }
.shein-logo-link:hover { transform: scale(1.05); }
.shein-logo-link:hover .shein-logo { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2); }
.shein-logo { width: 40px; height: 40px; border-radius: 8px; object-fit: contain; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); transition: box-shadow 0.2s ease; }
.miaoshou-btn { background: linear-gradient(135deg, #1e293b, #334155); box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25); }
.miaoshou-btn:hover { box-shadow: 0 12px 22px rgba(0, 0, 0, 0.35); }
.browser-btns { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
.browser-btn { background: #fff; border: none; border-radius: 12px; padding: 12px 16px; cursor: pointer; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); transition: transform 0.2s ease, box-shadow 0.2s ease; display: flex; flex-direction: column; align-items: center; gap: 6px; text-decoration: none; }
.browser-btn:hover { transform: scale(1.05); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15); }
.browser-logo { width: 40px; height: 40px; border-radius: 4px; object-fit: contain; display: block; }
.browser-label { font-size: 12px; color: #333; font-weight: 500; white-space: nowrap; }
.primary-btn.outline { background: transparent; color: var(--primary-color); border: 2px solid var(--primary-color); box-shadow: none; }
.primary-btn.outline:hover { background: #eff6ff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; width: 90%; max-width: 500px; border-radius: 20px; padding: 35px; position: relative; animation: slideIn 0.3s ease; }
@keyframes slideIn { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.close-btn { position: absolute; top: 20px; right: 20px; font-size: 24px; color: #999; cursor: pointer; }
.modal-header { border-bottom: 2px solid #f5f5f5; padding-bottom: 15px; margin-bottom: 20px; }
.modal-header h2 { margin: 0; color: var(--primary-color); }
.modal-desc { color: #666; margin: 20px 0; }
.modal-footer { text-align: right; margin-top: 10px; }
.detail-list { text-align: left; background: #f9f9f9; padding: 15px 20px; border-radius: 10px; margin-bottom: 25px; line-height: 1.8; color: #444; }
.materials-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }
.material-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; background: #fafafa; border: 1px solid #eee; font-size: 14px; color: #444; cursor: pointer; }
.material-item input[type="checkbox"] { width: 16px; height: 16px; }
.materials-progress { font-size: 13px; color: #999; text-align: right; }
@media (max-width: 900px) { .tutorial-layout { grid-template-columns: 1fr; } .pdf-frame { max-height: 70vh; } }
</style>
