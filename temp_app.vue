<script setup>
import { ref, computed } from 'vue'

// 步骤数据
const stepData = {
  1: {
    title: "1. 准备材料清单",
    list: [
      "• <b>身份证</b>：正反面照片(清晰无遮挡)",
      "• <b>营业执照</b>：电子版/扫描件(清晰无遮挡)",
      "• <b>手机号</b>：一个(能正常收发短信)"
    ],
    pdf: "files/material_guide.pdf",
    video: "https://example.com/video1"
  },
  2: {
    title: "2. 环境安装 (IP隔离)",
    list: [
      "• 下载并安装 <b>战斧浏览器</b> (必备)",
      "• 完成战斧浏览器的账户注册",
      "• 登录客户端并确保环境安全"
    ],
    pdf: "files/browser_setup.pdf",
    video: "https://example.com/video2"
  },
  3: {
    title: "3. 创建店铺与配置",
    list: [
      "• 进入战斧后台创建店铺项目",
      "• <b>购买云服务器</b>：地域选择【杭州】",
      "• 将云服务器与创建的店铺进行绑定"
    ],
    pdf: "files/server_config.pdf",
    video: "https://example.com/video3"
  },
  4: {
    title: "4. 注册 SHEIN 店铺",
    list: [
      "• 在隔离环境内打开 SHEIN 招商官网",
      "• 填写入驻信息并上传准备好的材料",
      "• 提交审核并等待官方反馈"
    ],
    pdf: "files/shein_reg.pdf",
    video: "https://example.com/video4"
  }
}

// 流程步骤
const flowSteps = [
  { id: 1, title: "准备材料", desc: "身份证/营业执照/手机号" },
  { id: 2, title: "环境隔离", desc: "战斧浏览器安装与配置" },
  { id: 3, title: "服务器部署", desc: "云服务器购买与绑定" },
  { id: 4, title: "正式开店", desc: "SHEIN 官网注册与提交" }
]

// 状态管理
const showHero = ref(true)
const showFlow = ref(false)
const showTutorial = ref(false)
const showMaterialsModal = ref(false)
const showStepModal = ref(false)
const materialsStep = ref(1)
const currentStepId = ref(1)

// 材料清单
const materials = ref([
  { id: 1, text: "身份证：法人/负责人身份证正反面照片（清晰无遮挡）", checked: false },
  { id: 2, text: "营业执照：最新年检合格的营业执照电子版或扫描件", checked: false },
  { id: 3, text: "手机号：一个可以正常接收短信的手机号码（建议未在 SHEIN 注册过）", checked: false }
])

const materialsProgress = computed(() => {
  const done = materials.value.filter(m => m.checked).length
  return `已完成 ${done} / ${materials.value.length} 项`
})

// 方法
const goToMaterials = () => {
  showMaterialsModal.value = true
}

const closeMaterials = () => {
  showMaterialsModal.value = false
}

const nextStep = () => {
  window.open('https://www.zhanfubrowser.com/download?code=3262', '_blank')
  materialsStep.value = 2
}

const nextStepDone = () => {
  showMaterialsModal.value = false
  materialsStep.value = 1
  showHero.value = false
  showFlow.value = true
  showTutorial.value = true
}

const showDetails = (id) => {
  currentStepId.value = id
  showStepModal.value = true
}

const closeStepModal = () => {
  showStepModal.value = false
}

const currentStep = computed(() => stepData[currentStepId.value])
</script>

<template>
  <h1>SHEIN </h1>
<h1>商家入驻标准流程</h1>

  <!-- 主按钮区域 -->
  <div v-if="showHero" class="hero">
    <button class="primary-btn" @click="goToMaterials">我要开店</button>
  </div>

  <!-- 流程图 -->
  <div v-if="showFlow" class="flow-wrapper">
    <template v-for="(step, index) in flowSteps" :key="step.id">
      <div class="step-node" @click="showDetails(step.id)">
        <div class="step-number">{{ String(step.id).padStart(2, '0') }}</div>
        <div class="step-title">{{ step.title }}</div>
        <div class="step-desc">{{ step.desc }}</div>
      </div>
      <div v-if="index < flowSteps.length - 1" class="connector"></div>
    </template>
  </div>

  <!-- 教程区域 -->
  <div v-if="showTutorial" class="tutorial-section">
    <h2>详细开店教程</h2>
    <div class="tutorial-layout">
      <div class="pdf-panel">
        <h3>PDF 图文教程</h3>
        <iframe
          class="pdf-frame"
          src="/shein-guide.pdf"
        ></iframe>
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

  <!-- 材料准备弹窗 -->
  <div v-if="showMaterialsModal" class="modal-overlay" @click="closeMaterials">
    <div class="modal-content" @click.stop>
      <span class="close-btn" @click="closeMaterials">&times;</span>

      <!-- 第一步：材料清单 -->
      <div v-if="materialsStep === 1">
        <div class="modal-header">
          <h2>材料准备清单</h2>
        </div>
        <div class="detail-list">
          <div class="materials-list">
            <label v-for="material in materials" :key="material.id" class="material-item">
              <input type="checkbox" v-model="material.checked">
              <span>{{ material.text }}</span>
            </label>
          </div>
          <div class="materials-progress">{{ materialsProgress }}</div>
        </div>
        <div class="modal-footer">
          <button class="primary-btn" @click="nextStep">下一步</button>
        </div>
      </div>

      <!-- 第二步：下载确认 -->
      <div v-if="materialsStep === 2">
        <div class="modal-header">
          <h2>已下载战斧浏览器</h2>
        </div>
        <p class="modal-desc">请在新打开的标签页中完成下载与安装，完成后点击下方按钮继续。</p>
        <div class="modal-footer">
          <button class="primary-btn" @click="nextStepDone">下一步</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 步骤详情弹窗 -->
  <div v-if="showStepModal" class="modal-overlay" @click="closeStepModal">
    <div class="modal-content" @click.stop>
      <span class="close-btn" @click="closeStepModal">&times;</span>
      <div class="modal-header">
        <h2>{{ currentStep?.title }}</h2>
      </div>
      <div class="detail-list" v-html="currentStep?.list?.join('<br>')"></div>
      <div class="action-btns">
        <a :href="currentStep?.pdf" target="_blank" class="pdf-link">📄 操作文档 (PDF)</a>
        <a :href="currentStep?.video" target="_blank" class="video-link">🎬 视频教程</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero {
  max-width: 1100px;
  width: 100%;
  margin-bottom: 30px;
  text-align: center;
}

.hero p {
  color: #666;
  margin-bottom: 16px;
}

.primary-btn {
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(255, 80, 0, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  text-decoration: none;
  display: inline-block;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 22px rgba(255, 80, 0, 0.35);
  opacity: 0.95;
}

.primary-btn.dark {
  background: #222;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
}

/* 流程图容器 */
.flow-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0;
  max-width: 1100px;
  width: 100%;
}

/* 步骤节点 */
.step-node {
  background: var(--step-bg);
  border: 2px solid #e0e0e0;
  padding: 25px 20px;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  flex: 1;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  min-width: 180px;
}

.step-node:hover {
  border-color: var(--primary-color);
  transform: translateY(-8px);
  box-shadow: 0 12px 20px rgba(255, 80, 0, 0.15);
  z-index: 2;
}

.step-number {
  display: inline-block;
  width: 28px;
  height: 28px;
  background: #eee;
  border-radius: 50%;
  line-height: 28px;
  font-size: 14px;
  margin-bottom: 10px;
  color: #666;
}

.step-node:hover .step-number {
  background: var(--primary-color);
  color: white;
}

.step-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--text-main);
}

.step-desc {
  font-size: 13px;
  color: #999;
  margin-top: 8px;
}

/* 连接箭头 */
.connector {
  width: 50px;
  height: 2px;
  background: #ddd;
  position: relative;
}

.connector::after {
  content: '▶';
  position: absolute;
  right: -5px;
  top: -9px;
  color: #ddd;
  font-size: 12px;
}

/* 教程区域 */
.tutorial-section {
  width: 100%;
  margin: 20px 0 10px;
}

.tutorial-section h2 {
  margin: 0 0 12px;
  font-size: 20px;
  color: var(--text-main);
}

.tutorial-layout {
