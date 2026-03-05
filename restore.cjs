const fs = require('fs');
const content = `<script setup>
import { ref, computed } from 'vue'

const stepData = {
  1: { title: "1. 准备材料清单", list: ["• <b>身份证</b>：正反面照片(清晰无遮挡)", "• <b>营业执照</b>：电子版/扫描件(清晰无遮挡)", "• <b>手机号</b>：一个(能正常收发短信)"], pdf: "files/material_guide.pdf", video: "https://example.com/video1" },
  2: { title: "2. 环境安装 (IP隔离)", list: ["• 下载并安装 <b>战斧浏览器</b> (必备)", "• 完成战斧浏览器的账户注册", "• 登录客户端并确保环境安全"], pdf: "files/browser_setup.pdf", video: "https://example.com/video2" },
  3: { title: "3. 创建店铺与配置", list: ["• 进入战斧后台创建店铺项目", "• <b>购买云服务器</b>：地域选择【杭州】", "• 将云服务器与创建的店铺进行绑定"], pdf: "files/server_config.pdf", video: "https://example.com/video3" },
  4: { title: "4. 注册 SHEIN 店铺", list: ["• 在隔离环境内打开 SHEIN 招商官网", "• 填写入驻信息并上传准备好的材料", "• 提交审核并等待官方反馈"], pdf: "files/shein_reg.pdf", video: "https://example.com/video4" }
}

const flowSteps = [
  { id: 1, title: "准备材料", desc: "身份证/营业执照/手机号" },
  { id: 2, title: "环境隔离", desc: "战斧浏览器安装与配置" },
  { id: 3, title: "服务器部署", desc: "云服务器购买与绑定" },
  { id: 4, title: "正式开店", desc: "SHEIN 官网注册与提交" }
]

const showHero = ref(true)
const showFlow = ref(false)
const showTutorial = ref(false)
const showMaterialsModal = ref(false)
const showStepModal = ref(false)
const materialsStep = ref(1)
const currentStepId = ref(1)

const materials = ref([
  { id: 1, text: "身份证：法人/负责人身份证正反面照片（清晰无遮挡）", checked: false },
  { id: 2, text: "营业执照：最新年检合格的营业执照电子版或扫描件", checked: false },
  { id: 3, text: "手机号：一个可以正常接收短信的手机号码（建议未在 SHEIN 注册过）", checked: false }
])

const materialsProgress = computed(() => {
  const done = materials.value.filter(m => m.checked).length
  return \`已完成 \${done} / \${materials.value.length} 项\`
})

const goToMaterials = () => { showMaterialsModal.value = true }
const closeMaterials = () => { showMaterialsModal.value = false }
const nextStep = () => { window.open('https://www.zhanfubrowser.com/download?code=3262', '_blank'); materialsStep.value = 2 }
const nextStepDone = () => { showMaterialsModal.value = false; materialsStep.value = 1; showHero.value = false; showFlow.value = true; showTutorial.value = true }
const showDetails = (id) => { currentStepId.value = id; showStepModal.value = true }
const closeStepModal = () => { showStepModal.value = false }
const currentStep = computed(() => stepData[currentStepId.value])
</script>

<template>
  <h1>SHEIN 商家入驻标准流程</h1>
  <div v-if="showHero" class="hero">
    <button class="primary-btn" @click="goToMaterials">我要开店</button>
  </div>
  <div v-if="showFlow" class="flow-wrapper">
    <template v-for="(step, index) in flowSteps" :key="step.id">
      <div class="step-node" @click="showDetails(step.id)">
        <div class="step-number">{{ String(step.id).padStart(2, '00') }}</div>
        <div class="step-title">{{ step.title }}</div>
        <div class="step-desc">{{ step.desc }}</div>
      </div>
      <div v-if="index < flowSteps.length - 1" class="connector"></div>
    </template>
  </div>
  <div v-if="showTutorial" class="tutorial-section">
    <h2>详细开店教程</h2>
    <div class="tutorial-layout">
      <div class="pdf-panel">
        <h3>PDF 图文教程</h3>
        <iframe class="pdf-frame" src="/shein-guide.pdf"></iframe>
      </div>
      <div class="video-panel">
        <h3>视频教程</h3>
        <video class="video-frame" controls>
          <source src="/tutorial.mp4" type="video/mp4" />
          您的浏览器不支持视频播放，请下载后本地观看。
        </video>
        <div class="action-links">
          <a href="https://www.zhanfubrowser.com/register/?code=3262" target="_blank" class="primary-btn">注册战斧浏览器</a>
          <a href="https://seller.sheins.com" target="_blank" class="primary-btn dark">SHEIN 商家注册</a>
        </div>
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
  <div v-if="showStepModal" class="modal-overlay" @click="closeStepModal">
    <div class="modal-content" @click.stop>
      <span class="close-btn" @click="closeStepModal">&times;</span>
      <div class="modal-header"><h2>{{ currentStep?.title }}</h2></div>
      <div class="detail-list" v-html="currentStep?.list?.join('<br>')"></div>
      <div class="action-btns">
        <a :href="currentStep?.pdf" target="_blank" class="pdf-link">操作文档 (PDF)</a>
        <a :href="currentStep?.video" target="_blank" class="video-link">视频教程</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero { max-width: 1100px; width: 100%; margin-bottom: 30px; text-align: center; }
.hero p { color: #666; margin-bottom: 16px; }
.primary-btn { background: var(--primary-color); color: #fff; border: none; border-radius: 999px; padding: 12px 32px; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 8px 16px rgba(255, 80, 0, 0.25); transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease; text-decoration: none; display: inline-block; }
.primary-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 22px rgba(255, 80, 0, 0.35); opacity: 0.95; }
.primary-btn.dark { background: #222; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25); }
.flow-wrapper { display: flex; justify-content: center; align-items: center; gap: 0; max-width: 1100px; width: 100%; }
.step-node { background: var(--step-bg); border: 2px solid #e0e0e0; padding: 25px 20px; border-radius: 12px; text-align: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); flex: 1; position: relative; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); min-width: 180px; }
.step-node:hover { border-color: var(--primary-color); transform: translateY(-8px); box-shadow: 0 12px 20px rgba(255, 80, 0, 0.15); z-index: 2; }
.step-number { display: inline-block; width: 28px; height: 28px; background: #eee; border-radius: 50%; line-height: 28px; font-size: 14px; margin-bottom: 10px; color: #666; }
.step-node:hover .step-number { background: var(--primary-color); color: white; }
.step-title { font-size: 18px; font-weight: bold; color: var(--text-main); }
.step-desc { font-size: 13px; color: #999; margin-top: 8px; }
.connector { width: 50px; height: 2px; background: #ddd; position: relative; }
.connector::after { content: '▶'; position: absolute; right: -5px; top: -9px; color: #ddd; font-size: 12px; }
.tutorial-section { width: 100%; margin: 20px 0 10px; }
.tutorial-section h2 { margin: 0 0 12px; font-size: 20px; color: var(--text-main); }
.tutorial-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 25vw); justify-content: center; gap: 24px; }
.pdf-panel, .video-panel { background: #fff; border-radius: 16px; padding: 16px; box-shadow: 0 6px 14px rgba(0, 0, 0, 0.04); }
.pdf-panel h3, .video-panel h3 { margin-top: 0; margin-bottom: 10px; font-size: 16px; color: var(--text-main); }
.pdf-frame { width: 100%; aspect-ratio: 210 / 297; max-height: calc(100vh - 140px); border: none; border-radius: 8px; }
.video-frame { width: 100%; aspect-ratio: 16 / 9; max-height: 25vh; min-height: 200px; border-radius: 8px; background: #000; }
.action-links { margin-top: 12px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
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
.action-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.action-btns a { text-decoration: none; padding: 12px; border-radius: 8px; text-align: center; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity 0.2s; }
.pdf-link { background: #f0f0f0; color: #333; border: 1px solid #ddd; }
.video-link { background: var(--primary-color); color: white; }
.action-btns a:hover { opacity: 0.8; }
@media (max-width: 900px) { .tutorial-layout { grid-template-columns: 1fr; } .pdf-frame { max-height: 70vh; } }
@media (max-width: 768px) { .flow-wrapper { flex-direction: column; } .connector { width: 2px; height: 30px; margin: 10px 0; } .connector::after { transform: rotate(90deg); right: -7px; bottom: -10px; top: auto; } }
</style>
`;
fs.writeFileSync('src/App.vue', content);
console.log('Done! Lines:', content.split('\n').length);
