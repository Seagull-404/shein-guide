<script setup>
import { ref, computed } from 'vue'

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
const nextStep = () => { window.open('https://www.zhanfubrowser.com/download?code=3262', '_blank'); materialsStep.value = 2 }
const nextStepDone = () => { showMaterialsModal.value = false; materialsStep.value = 1; showHero.value = false; showTutorial.value = true }

const onZhanfuClick = () => { zhanfuClicked.value = true }
const onSheinClick = () => { sheinClicked.value = true }
const goToStep2 = () => { currentStep.value = 2 }
const goToStep1 = () => { currentStep.value = 1 }
const goToStep3 = () => { currentStep.value = 3 }
const goToStep4 = () => { currentStep.value = 4 }

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
  <h1>SHEIN 商家入驻标准流程</h1>
  <div v-if="showHero" class="hero">
    <button class="primary-btn" @click="goToMaterials">我要开店</button>
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
              <a href="https://seller.sheins.com" target="_blank" class="primary-btn dark" @click="onSheinClick">
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
      <transition name="fade">
        <div v-if="canGoNextStep" class="step-nav-buttons fixed-bottom">
          <button class="primary-btn next-step-btn" @click="goToStep2">下一步 →</button>
        </div>
      </transition>
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
      <div class="step-nav-buttons fixed-bottom">
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
      <div class="step-nav-buttons fixed-bottom">
        <button class="primary-btn outline" @click="goToStep2">← 上一步</button>
        <button class="primary-btn" @click="goToStep4">下一步 →</button>
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
.hero { max-width: 1100px; width: 100%; margin-bottom: 30px; text-align: center; }
.primary-btn { background: var(--primary-color); color: #fff; border: none; border-radius: 999px; padding: 12px 32px; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 8px 16px rgba(255, 80, 0, 0.25); transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease; text-decoration: none; display: inline-block; }
.primary-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 22px rgba(255, 80, 0, 0.35); opacity: 0.95; }
.primary-btn.dark { background: #222; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25); }
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
.next-step-btn { background: linear-gradient(135deg, #ff5000, #ff7a00); font-size: 18px; padding: 14px 40px; }
.step-nav-buttons { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 20px; }
.step-nav-buttons.fixed-bottom { position: fixed; bottom: 0; right: 0; left: 0; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px); box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08); z-index: 100; }
.miaoshou-download { margin-top: 16px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.logo-links { display: flex; align-items: center; justify-content: center; gap: 20px; }
.miaoshou-logo-link { display: inline-block; border-radius: 8px; transition: transform 0.2s ease, box-shadow 0.2s ease; }
.miaoshou-logo-link:hover { transform: scale(1.05); }
.miaoshou-logo-link:hover .miaoshou-logo { box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3); }
.miaoshou-logo { width: 150px; height: 40px; border-radius: 8px; object-fit: cover; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); transition: box-shadow 0.2s ease; }
.shein-logo-link { display: inline-block; border-radius: 8px; transition: transform 0.2s ease, box-shadow 0.2s ease; }
.shein-logo-link:hover { transform: scale(1.05); }
.shein-logo-link:hover .shein-logo { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2); }
.shein-logo { width: 40px; height: 40px; border-radius: 8px; object-fit: contain; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); transition: box-shadow 0.2s ease; }
.miaoshou-btn { background: linear-gradient(135deg, #667eea, #764ba2); box-shadow: 0 8px 16px rgba(102, 126, 234, 0.35); }
.miaoshou-btn:hover { box-shadow: 0 12px 22px rgba(102, 126, 234, 0.45); }
.browser-btns { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
.browser-btn { background: #fff; border: none; border-radius: 12px; padding: 12px 16px; cursor: pointer; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); transition: transform 0.2s ease, box-shadow 0.2s ease; display: flex; flex-direction: column; align-items: center; gap: 6px; text-decoration: none; }
.browser-btn:hover { transform: scale(1.05); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15); }
.browser-logo { width: 40px; height: 40px; border-radius: 4px; object-fit: contain; display: block; }
.browser-label { font-size: 12px; color: #333; font-weight: 500; white-space: nowrap; }
.primary-btn.outline { background: transparent; color: var(--primary-color); border: 2px solid var(--primary-color); box-shadow: none; }
.primary-btn.outline:hover { background: #fff5f0; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(255, 80, 0, 0.15); }
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
