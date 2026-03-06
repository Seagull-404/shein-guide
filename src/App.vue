<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const showHero = ref(true)
const showTutorial = ref(false)
const showMaterialsModal = ref(false)
const materialsStep = ref(1)
const currentStep = ref(1)
const showHeader = ref(true)

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
const nextStep = () => { 
  showMaterialsModal.value = false
  materialsStep.value = 1
  showHero.value = false
  showTutorial.value = true
  window.history.pushState({ page: 'tutorial', step: 1 }, '', '#step1')
}

const goToStep = (step) => {
  currentStep.value = step
  showHeader.value = true
  window.history.pushState({ page: 'tutorial', step }, '', `#step${step}`)
  // 3秒后自动隐藏导航栏
  setTimeout(() => {
    showHeader.value = false
  }, 3000)
}

const getStepLabel = (step) => {
  const labels = ['商家注册', '店铺资料', '选品上架', '营销活动', '发货物流']
  return labels[step - 1] || ''
}

const getStepTitle = (step) => {
  const titles = [
    'SHEIN 商家注册',
    '店铺资料填写',
    '选品与上架',
    '营销活动报名',
    '发货与物流'
  ]
  return titles[step - 1] || ''
}

const goToStep1 = () => goToStep(1)
const goToStep2 = () => goToStep(2)
const goToStep3 = () => goToStep(3)
const goToStep4 = () => goToStep(4)
const goToStep5 = () => goToStep(5)

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
      <button class="primary-btn hero-btn" @click="goToMaterials">我要开店</button>
    </div>
  </div>
  <div v-if="showTutorial" class="tutorial-section">
    <!-- 顶部触发区域（仅8px高度） -->
    <div class="header-trigger-zone" @mouseenter="showHeader = true">
      <div class="trigger-hint">
        <div class="trigger-dot"></div>
      </div>
    </div>
    
    <!-- 隐藏式顶部导航（绝对定位，不占用文档流） -->
    <transition name="header-slide">
      <div v-show="showHeader" class="tutorial-header" @mouseleave="showHeader = false">
        <div class="header-main">
          <div class="header-title">
            <span class="title-badge">步骤 {{ currentStep }}/5</span>
            <h2 class="title-text">{{ getStepTitle(currentStep) }}</h2>
          </div>
          <div class="header-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (currentStep / 5 * 100) + '%' }"></div>
            </div>
            <span class="progress-text">已完成 {{ currentStep }}/5</span>
          </div>
        </div>
        
        <!-- 步骤导航标签 -->
        <div class="step-tabs">
          <button 
            v-for="step in 5" 
            :key="step"
            class="step-tab"
            :class="{ 
              'active': currentStep === step, 
              'completed': currentStep > step 
            }"
            @click="goToStep(step)"
          >
            <span class="tab-number">{{ step }}</span>
            <span class="tab-label">{{ getStepLabel(step) }}</span>
            <span v-if="currentStep > step" class="tab-check">✓</span>
          </button>
        </div>
      </div>
    </transition>
    
    <div v-if="currentStep === 1">
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
          <div class="tools-section">
            <h4>相关链接</h4>
            <div class="tools-grid">
              <a href="https://www.zhanfubrowser.com/register/?code=3262" target="_blank" class="tool-item">
                <img src="/zf-logo.svg" alt="战斧浏览器" class="tool-icon" style="width: 100px; height: 70px;" />
                <span class="tool-name">战斧浏览器</span>
              </a>
              <a href="https://shein.top/bbcumlm" target="_blank" class="tool-item">
                <img src="/shein-s.svg" alt="SHEIN" class="tool-icon small" />
                <span class="tool-name">SHEIN商家注册</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="currentStep === 2">
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
          <div class="tools-section">
            <h4>参考信息</h4>
            <div class="info-box compact">
              <div class="info-row"><span class="info-label">仓库：</span>纽约美东仓库</div>
              <div class="info-row"><span class="info-label">姓名：</span>JOHN LEAVY</div>
              <div class="info-row"><span class="info-label">邮编：</span>11413</div>
              <div class="info-row"><span class="info-label">手机：</span>（+1）123456789</div>
              <div class="info-row"><span class="info-label">省份：</span>NY</div>
              <div class="info-row"><span class="info-label">城市：</span>JAMAICA</div>
              <div class="info-row"><span class="info-label">地址：</span>133-11 FRANCLS LEWIS BLVD</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="currentStep === 3">
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
          <div class="tools-section">
            <h4>推荐工具</h4>
            <div class="tools-grid">
              <a href="https://erp.91miaoshou.com/" target="_blank" class="tool-item">
                <img src="/妙手logo.jpg" alt="妙手ERP" class="tool-icon" style="width: 80px; height: 80px;" />
                <span class="tool-name">妙手ERP</span>
              </a>
              <a href="https://us.shein.com/" target="_blank" class="tool-item">
                <img src="/shein-s.svg" alt="SHEIN" class="tool-icon small" />
                <span class="tool-name">SHEIN官网</span>
              </a>
            </div>
          </div>
          <div class="tools-section">
            <h4>插件下载</h4>
            <div class="tools-grid">
              <a href="https://erp.91miaoshou.com/api/app/views/static/plugin/kuajing-erp-plugin-v3.zip" download class="tool-item download">
                <span class="tool-icon emoji">🧩</span>
                <span class="tool-name">妙手ERP插件</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="currentStep === 4">
      <div class="tutorial-layout">
        <div class="pdf-panel">
          <h3>PDF 图文教程</h3>
          <iframe class="pdf-frame" src="/shein-guide4.pdf"></iframe>
        </div>
        <div class="video-panel">
          <h3>视频教程</h3>
          <div class="placeholder-box video-placeholder">
            <p>视频教程准备中...</p>
            <p class="placeholder-hint">即将上线</p>
          </div>
        </div>
      </div>
    </div>
    <div v-if="currentStep === 5">
      <div class="tutorial-layout">
        <div class="pdf-panel">
          <h3>PDF 图文教程</h3>
          <iframe class="pdf-frame" src="/shein-guide5.pdf"></iframe>
        </div>
        <div class="video-panel">
          <h3>视频教程</h3>
          <div class="placeholder-box video-placeholder">
            <p>视频教程准备中...</p>
            <p class="placeholder-hint">即将上线</p>
          </div>
          <div class="tools-section">
            <h4>工具下载</h4>
            <div class="tools-grid">
              <a href="/弘联插件.zip" download class="tool-item download">
                <img src="/弘联icon.png" alt="弘联插件" class="tool-icon" />
                <span class="tool-name">弘联插件</span>
              </a>
              <a href="/弘联配置文件.json" download class="tool-item download">
                <span class="tool-icon emoji">⚙️</span>
                <span class="tool-name">配置文件</span>
              </a>
              <a href="/track123模板.xlsx" download class="tool-item download">
                <span class="tool-icon emoji">📊</span>
                <span class="tool-name">Track123模板</span>
              </a>
            </div>
          </div>
          <div class="tools-section">
            <h4>常用平台</h4>
            <div class="tools-grid">
              <a href="https://wl.wwerp.cc/orders" target="_blank" class="tool-item">
                <span class="tool-icon emoji">📦</span>
                <span class="tool-name">物流测试平台</span>
              </a>
              <a href="https://kj.qizhishangke.com/user/login" target="_blank" class="tool-item">
                <img src="/wdt-logo.png" alt="旺店通" class="tool-icon" style="width: 80px; height: 80px;" />
                <span class="tool-name">旺店通ERP</span>
              </a>
              <a href="https://member.track123.com/login?lang=zh" target="_blank" class="tool-item">
                <img src="/track123-logo.png" alt="Track123" class="tool-icon" style="width: 80px; height: 80px;" />
                <span class="tool-name">Track123</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 浮动导航按钮 -->
    <div class="floating-nav">
      <button 
        v-if="currentStep > 1" 
        class="floating-btn prev" 
        @click="goToStep(currentStep - 1)"
      >
        ← 上一步
      </button>
      <button 
        v-if="currentStep < 5" 
        class="floating-btn next" 
        @click="goToStep(currentStep + 1)"
      >
        下一步 →
      </button>
      <button 
        v-if="currentStep === 5" 
        class="floating-btn complete" 
        @click="showHero = true; showTutorial = false"
      >
        完成 ✓
      </button>
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
.hero-btn { padding: 16px 48px; font-size: 18px; text-align: center; }
@media (max-width: 600px) { .hero-container { padding: 32px 24px; } .hero-title { font-size: 24px; } .hero-features { gap: 20px; } }
.hero { max-width: 1100px; width: 100%; margin-bottom: 30px; text-align: center; }
.primary-btn { background: var(--primary-color); color: #fff; border: none; border-radius: 999px; padding: 12px 32px; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 8px 16px rgba(37, 99, 235, 0.25); transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease; text-decoration: none; display: inline-block; }
.primary-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 22px rgba(37, 99, 235, 0.35); opacity: 0.95; }
.primary-btn.dark { background: #1e293b; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25); }
.tutorial-section { width: 100%; background: #f8fafc; min-height: 100vh; position: relative; padding-top: 8px; }

/* 隐藏式顶部导航 - 绝对定位 */
.tutorial-header { background: #fff; border-bottom: 1px solid #e2e8f0; padding: 16px 24px; position: absolute; top: 0; left: 0; right: 0; z-index: 100; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12); }

/* 导航栏滑入滑出动画 */
.header-slide-enter-active, .header-slide-leave-active { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.header-slide-enter-from, .header-slide-leave-to { transform: translateY(-10px); opacity: 0; }

/* 顶部触发区域 - 仅8px高度 */
.header-trigger-zone { position: absolute; top: 0; left: 0; right: 0; height: 8px; z-index: 90; cursor: pointer; }
.trigger-hint { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 60px; height: 4px; background: #cbd5e1; border-radius: 0 0 4px 4px; opacity: 0.6; transition: opacity 0.2s; }
.header-trigger-zone:hover .trigger-hint { opacity: 1; background: #94a3b8; }
.trigger-dot { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 4px; height: 4px; background: #64748b; border-radius: 50%; opacity: 0; transition: opacity 0.2s; }
.header-trigger-zone:hover .trigger-dot { opacity: 1; }
.header-main { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.header-title { display: flex; align-items: center; gap: 12px; }
.title-badge { background: linear-gradient(135deg, #2563eb, #3b82f6); color: #fff; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
.title-text { font-size: 24px; font-weight: 700; color: #1e293b; margin: 0; }
.header-progress { display: flex; align-items: center; gap: 12px; }
.progress-bar { width: 120px; height: 6px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #10b981, #34d399); border-radius: 999px; transition: width 0.3s ease; }
.progress-text { font-size: 13px; color: #64748b; font-weight: 500; }

/* 步骤标签导航 */
.step-tabs { max-width: 1400px; margin: 0 auto; display: flex; gap: 8px; }
.step-tab { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; cursor: pointer; transition: all 0.2s ease; position: relative; }
.step-tab:hover { border-color: #cbd5e1; background: #f8fafc; }
.step-tab.active { background: linear-gradient(135deg, #2563eb, #3b82f6); border-color: #2563eb; color: #fff; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }
.step-tab.completed { background: #f0fdf4; border-color: #10b981; }
.tab-number { width: 24px; height: 24px; border-radius: 50%; background: #f1f5f9; color: #64748b; font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; }
.step-tab.active .tab-number { background: rgba(255, 255, 255, 0.2); color: #fff; }
.step-tab.completed .tab-number { background: #10b981; color: #fff; }
.tab-label { font-size: 14px; font-weight: 500; color: #475569; }
.step-tab.active .tab-label { color: #fff; }
.step-tab.completed .tab-label { color: #10b981; }
.tab-check { position: absolute; top: -4px; right: -4px; width: 18px; height: 18px; background: #10b981; color: #fff; border-radius: 50%; font-size: 10px; display: flex; align-items: center; justify-content: center; }

/* 浮动导航按钮 */
.floating-nav { position: fixed; bottom: 24px; right: 24px; display: flex; gap: 12px; z-index: 100; }
.floating-btn { padding: 12px 24px; border-radius: 999px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; border: none; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
.floating-btn.prev { background: #fff; color: #475569; border: 1px solid #e2e8f0; }
.floating-btn.prev:hover { background: #f8fafc; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2); }
.floating-btn.next { background: linear-gradient(135deg, #2563eb, #3b82f6); color: #fff; }
.floating-btn.next:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4); }
.floating-btn.complete { background: linear-gradient(135deg, #10b981, #34d399); color: #fff; }
.floating-btn.complete:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4); }

.tutorial-layout { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 24px; max-width: 1500px; margin: 0 auto; padding: 24px; }
.pdf-panel, .video-panel { background: #fff; border-radius: 16px; padding: 12px; box-shadow: 0 6px 14px rgba(0, 0, 0, 0.04); }
.pdf-panel h3, .video-panel h3 { margin-top: 0; margin-bottom: 10px; font-size: 16px; color: var(--text-main); }
.pdf-frame { width: 100%; height: calc(100vh - 120px); min-height: 600px; border: none; border-radius: 8px; }
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
.reg-links { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; margin-top: 24px; padding-left: 8px; }
.reg-link { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); transition: transform 0.2s ease, box-shadow 0.2s ease; text-decoration: none; }
.reg-link:hover { transform: translateX(4px); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12); }
.reg-logo { border-radius: 8px; object-fit: contain; }
.reg-logo.zhanfu { width: 180px; height: 70px; }
.reg-logo.shein { width: 50px; height: 50px; }
.reg-logo.miaoshou { width: 180px; height: 70px; }
.reg-logo.honglian { width: 50px; height: 50px; border-radius: 8px; object-fit: contain; }
.reg-logo.config-icon { width: 50px; height: 50px; border-radius: 8px; position: relative; display: flex; align-items: center; justify-content: center; background: #f0f7ff; }
.honglian-small { width: 30px; height: 30px; object-fit: contain; }
.file-badge { position: absolute; bottom: -4px; right: -4px; background: #2563eb; color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
.reg-logo.excel-icon { width: 50px; height: 50px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 28px; background: #f0fdf4; }
.reg-logo.platform-icon { width: 50px; height: 50px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 28px; background: #fef3c7; }
.reg-logo.wdt { width: 180px; height: 60px; border-radius: 8px; object-fit: contain; }
.reg-logo.track123 { width: 180px; height: 60px; border-radius: 8px; object-fit: contain; }
.tools-section { margin-top: 20px; }
.tools-section h4 { margin: 0 0 12px; font-size: 14px; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
.tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
.tool-item { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 24px 20px; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); transition: all 0.2s ease; text-decoration: none; border: 1px solid transparent; }
.tool-item:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); border-color: #e2e8f0; }
.tool-item.download { background: linear-gradient(135deg, #f0f9ff, #e0f2fe); }
.tool-item.download:hover { border-color: #3b82f6; }
.tool-icon { width: 80px; height: 80px; border-radius: 12px; object-fit: contain; }
.tool-icon.small { width: 72px; height: 72px; }
.tool-icon.emoji { display: flex; align-items: center; justify-content: center; font-size: 32px; background: #f8fafc; }
.tool-name { font-size: 13px; color: var(--text-main); font-weight: 500; text-align: center; line-height: 1.3; }
.info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-top: 20px; }
.info-box.compact { padding: 12px 16px; margin-top: 0; }
.info-box h4 { margin: 0 0 12px; font-size: 16px; color: var(--text-main); border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
.info-row { font-size: 13px; color: #475569; line-height: 1.6; display: flex; gap: 4px; }
.info-label { font-weight: 600; color: var(--text-main); white-space: nowrap; }
.miaoshou-btn { background: linear-gradient(135deg, #1e293b, #334155); box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25); }
.miaoshou-btn:hover { box-shadow: 0 12px 22px rgba(0, 0, 0, 0.35); }
.browser-btns { display: flex; gap: 16px; flex-wrap: wrap; justify-content: flex-start; padding-left: 8px; margin-top: 16px; }
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
