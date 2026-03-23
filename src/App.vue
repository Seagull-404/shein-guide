<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import gsap from 'gsap'
import AuthAccessModal from './components/AuthAccessModal.vue'
import CombinedSurveyModal from './components/CombinedSurveyModal.vue'
import HomeDock from './components/HomeDock.vue'
import { useAuth } from './composables/useAuth'

const STEP_COUNT = 5
const staticBaseUrl = import.meta.env.BASE_URL

const showHero = ref(true)
const showTutorial = ref(false)
const showMaterialsModal = ref(false)
const materialsStep = ref(1)
const currentStep = ref(1)
const showHeader = ref(true)
const showAuthModal = ref(false)
const authMode = ref('login')
const showSurveyModal = ref(false)
const showVipNotice = ref(false)
const pendingAction = ref(null)
let headerHideTimer = null

const { initializeAuth, isLoggedIn, hasVip } = useAuth()

const scheduleHeaderHide = () => {
  if (headerHideTimer) clearTimeout(headerHideTimer)
  headerHideTimer = setTimeout(() => { showHeader.value = false }, 3000)
}

const animateHero = () => {
  gsap.fromTo('.hero-anim', 
    { y: 60, opacity: 0, filter: 'blur(10px)' },
    { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, stagger: 0.1, ease: 'power3.out' }
  )
}

const animateTutorial = () => {
  gsap.fromTo('.bento-item',
    { y: 30, opacity: 0, scale: 0.98 },
    { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.08, ease: 'back.out(1.2)', clearProps: 'transform' }
  )
}

const getStepFromHash = () => {
  const match = window.location.hash.match(/^#step([1-5])$/)
  if (!match) return null
  const step = Number(match[1])
  return step >= 1 && step <= STEP_COUNT ? step : null
}

const resetToHero = () => {
  showHero.value = true
  showTutorial.value = false
  currentStep.value = 1
  showHeader.value = true
}

const ensureAccess = (action) => {
  if (!isLoggedIn.value) {
    pendingAction.value = action
    authMode.value = 'login'
    showAuthModal.value = true
    return false
  }
  if (!hasVip('shein')) {
    showVipNotice.value = true
    return false
  }
  showVipNotice.value = false
  pendingAction.value = action
  return true
}

const applyRoute = (step) => {
  showHero.value = false
  showTutorial.value = true
  currentStep.value = step
  showHeader.value = true
  scheduleHeaderHide()
}

const syncRouteState = () => {
  const step = getStepFromHash()
  if (step) {
    if (ensureAccess({ type: 'step', step })) {
      applyRoute(step)
    } else {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
      resetToHero()
    }
  } else {
    resetToHero()
    if (headerHideTimer) {
      clearTimeout(headerHideTimer)
      headerHideTimer = null
    }
  }
  
  nextTick(() => {
    if (showHero.value) animateHero()
    if (showTutorial.value) animateTutorial()
  })
}

watch(currentStep, () => {
  if (!showTutorial.value) return
  nextTick(() => { animateTutorial() })
})

const navigateToStep = (step) => {
  const nextHash = `#step${step}`
  if (window.location.hash === nextHash) {
    syncRouteState()
    return
  }
  window.location.hash = nextHash
}

const navigateHome = () => {
  const cleanUrl = `${window.location.pathname}${window.location.search}`
  window.history.pushState(null, '', cleanUrl)
  syncRouteState()
}

const materials = ref([
  { id: 1, text: '身份证：法人/负责人身份证正反面照片（清晰无遮挡）', checked: false },
  { id: 2, text: '营业执照：最新年检合格的营业执照电子版或扫描件', checked: false },
  { id: 3, text: '手机号：一个可以正常接收短信的手机号码（建议未在 SHEIN 注册过）', checked: false }
])

const materialsProgress = computed(() => {
  const done = materials.value.filter(m => m.checked).length
  return `已完成 ${done} / ${materials.value.length} 项`
})

const goToMaterials = () => {
  if (!ensureAccess({ type: 'survey' })) return
  showSurveyModal.value = true
}
const closeMaterials = () => { showMaterialsModal.value = false }
const nextStep = () => {
  showMaterialsModal.value = false
  materialsStep.value = 1
  navigateToStep(1)
}

const goToStep = (step) => {
  if (!ensureAccess({ type: 'step', step })) return
  navigateToStep(step)
}

const getStepLabel = (step) => {
  const labels = ['商家注册', '店铺资料', '选品上架', '营销活动', '发货物流']
  return labels[step - 1] || ''
}

const getStepTitle = (step) => {
  const titles = ['SHEIN 商家注册', '店铺资料填写', '选品与上架', '营销活动报名', '发货与物流']
  return titles[step - 1] || ''
}

const currentPdfSrc = computed(() => `${staticBaseUrl}shein-guide${currentStep.value > 1 ? currentStep.value : ''}.pdf`)

const handleAuthClose = () => {
  showAuthModal.value = false
  authMode.value = 'login'
  pendingAction.value = null
}

const handleAuthSuccess = () => {
  showAuthModal.value = false
  authMode.value = 'login'
  const action = pendingAction.value
  pendingAction.value = null
  if (!action) return
  if (!hasVip('shein')) {
    showVipNotice.value = true
    return
  }
  if (action.type === 'survey') {
    showSurveyModal.value = true
    return
  }
  if (action.type === 'materials') {
    showMaterialsModal.value = true
    return
  }
  if (action.type === 'step') {
    navigateToStep(action.step)
  }
}

const handleAuthModeChange = (mode) => {
  authMode.value = mode === 'register' ? 'register' : 'login'
}

const handleSurveyClose = () => {
  showSurveyModal.value = false
  showMaterialsModal.value = true
}

const handleSurveySubmit = () => {
  showSurveyModal.value = false
  showMaterialsModal.value = true
}

onMounted(async () => {
  await initializeAuth()
  window.addEventListener('hashchange', syncRouteState)
  syncRouteState()
})

onUnmounted(() => {
  window.removeEventListener('hashchange', syncRouteState)
  if (headerHideTimer) clearTimeout(headerHideTimer)
})
</script>

<template>
  <div class="relative w-full min-h-screen text-brand-900 font-sans tracking-tight">
    <HomeDock />
    <div v-if="showHero" class="flex items-center justify-center min-h-screen p-6 relative z-10">
      <div class="glass max-w-3xl w-full p-12 md:p-16 rounded-[2.5rem] flex flex-col items-center text-center border-t border-white/80 shadow-2xl relative overflow-hidden group">
        <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out pointer-events-none"></div>

        <div class="hero-anim mb-8">
          <div class="p-4 bg-white/50 backdrop-blur-md rounded-3xl shadow-lg border border-white/60 inline-block transition-transform hover:scale-105 duration-300">
            <img :src="`${staticBaseUrl}companylogo.jpg`" alt="Company Logo" class="h-16 w-auto mix-blend-multiply object-contain rounded-xl" />
          </div>
        </div>
        
        <h1 class="hero-anim text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-brand-900 via-brand-600 to-indigo-900 mb-6 tracking-tight leading-tight whitespace-nowrap">
          SHEIN 商家入驻标准流程
        </h1>
        <p class="hero-anim text-lg md:text-xl text-slate-600 mb-12 font-medium max-w-xl leading-relaxed">
          一站式开店指引，采用反重力极简设计，助您优雅开启跨境之旅。
        </p>

        <div class="hero-anim grid grid-cols-3 gap-4 mb-12 w-full max-w-2xl mx-auto">
          <div v-for="(feat, idx) in [{i:'📋', t:'材料准备清单'}, {i:'📖', t:'图文视频教程'}, {i:'🛠️', t:'工具下载指引'}]" :key="idx" 
               class="glass-card flex flex-col items-center justify-center gap-3 p-4 rounded-2xl hover:-translate-y-1 transition-transform duration-300 cursor-default text-center">
            <span class="text-3xl sm:text-4xl filter drop-shadow-sm">{{feat.i}}</span>
            <span class="text-xs sm:text-sm font-semibold text-slate-700 leading-tight">{{feat.t}}</span>
          </div>
        </div>

        <button @click="goToMaterials" 
                class="hero-anim group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white transition-all duration-300 bg-brand-600 rounded-full hover:bg-brand-500 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(37,99,235,0.6)] focus:outline-none focus:ring-4 focus:ring-brand-500/30 overflow-hidden">
          <span class="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
          <span class="relative flex items-center gap-2">我要开店</span>
        </button>
      </div>
    </div>

    <div v-if="showTutorial" class="flex flex-col min-h-screen relative z-10 pt-8 pb-32 px-4 md:px-8 max-w-[1600px] mx-auto">
      <div class="fixed top-0 left-0 right-0 h-4 z-[90] cursor-pointer group" @mouseenter="showHeader = true">
         <div class="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-slate-300/50 rounded-b-lg group-hover:bg-slate-400/60 transition-colors"></div>
      </div>

      <transition enter-active-class="transition duration-300 ease-out"
                  enter-from-class="transform -translate-y-full opacity-0"
                  enter-to-class="transform translate-y-0 opacity-100"
                  leave-active-class="transition duration-200 ease-in"
                  leave-from-class="transform translate-y-0 opacity-100"
                  leave-to-class="transform -translate-y-full opacity-0">
        <div v-show="true" class="glass fixed top-4 left-4 right-4 md:left-auto md:right-auto md:w-[90%] md:mx-auto max-w-6xl rounded-2xl z-[100] p-4 flex flex-col md:flex-row shadow-2xl items-center justify-between gap-4 border border-white/40">
          <div class="flex items-center gap-4 w-full md:w-auto">
             <div class="bg-gradient-to-r from-brand-500 to-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-inner">步 骤 {{currentStep}}/5</div>
             <h2 class="text-xl font-extrabold text-slate-800 tracking-tight m-0">{{ getStepTitle(currentStep) }}</h2>
          </div>

          <div class="flex flex-1 w-full justify-end max-w-2xl gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
            <button v-for="step in 5" :key="step" @click="goToStep(step)"
              class="relative flex-1 min-w-[100px] flex flex-col items-center justify-center p-2 rounded-xl border border-transparent transition-all duration-300 overflow-hidden group"
              :class="[
                currentStep === step ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30 scale-105' : 
                currentStep > step ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 
                'bg-white/50 text-slate-500 hover:bg-white/80 hover:scale-[1.02]'
              ]">
              <span class="text-xs font-bold opacity-80 mb-0.5">STEP {{step}}</span>
              <span class="text-sm font-medium whitespace-nowrap">{{ getStepLabel(step) }}</span>
              <div v-if="currentStep === step" class="absolute bottom-0 left-0 h-1 bg-white/40 animate-pulse w-full"></div>
            </button>
          </div>
        </div>
      </transition>

      <div v-if="currentStep === 1" class="pointer-events-none absolute right-2 top-10 z-[95] flex justify-end md:right-[-28px] md:top-[36px] lg:right-[-60px] lg:top-[28px]">
        <div class="relative max-w-[280px] rounded-2xl border border-amber-200/80 bg-white/90 px-4 py-3 text-right shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur-md">
          <div class="absolute -top-2 right-10 h-4 w-4 rotate-45 border-l border-t border-amber-200/80 bg-white/90"></div>
          <p class="text-sm font-bold tracking-wide text-amber-700 md:text-[15px]">微信内部请在浏览器打开</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full mt-24 flex-grow">
        <div class="lg:col-span-8 flex flex-col glass-card rounded-[2rem] p-4 border border-white/60 shadow-xl overflow-hidden bento-item h-[70vh] min-h-[600px] relative group">
          <div class="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none z-10 h-24"></div>
          <h3 class="text-lg font-bold text-slate-800 mb-4 px-2 relative z-20 flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-brand-500"></span> 官方权威指南</h3>
          <div class="flex-1 rounded-2xl overflow-hidden bg-slate-100/50 inner-shadow relative z-20">
            <iframe class="w-full h-full border-none" :src="currentPdfSrc"></iframe>
          </div>
        </div>

        <div class="lg:col-span-4 flex flex-col gap-6 bento-item h-[70vh] min-h-[600px]">
          <div class="glass-card rounded-[2rem] p-4 flex flex-col border border-white/60 shadow-xl flex-shrink-0 relative overflow-hidden group">
            <h3 class="text-lg font-bold text-slate-800 mb-3 px-2 flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-indigo-500"></span> 视频教程</h3>
            <div class="w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-700/50 shadow-inner relative flex items-center justify-center">
               <template v-if="currentStep === 3">
                  <iframe class="w-full h-full absolute inset-0" src="https://player.bilibili.com/player.html?bvid=BV1A4cXzzEVm&page=1&high_quality=1&danmaku=0" scrolling="no" border="0" frameborder="no" allowfullscreen="true"></iframe>
               </template>
               <template v-else-if="currentStep === 4">
                  <iframe class="w-full h-full absolute inset-0" src="https://player.bilibili.com/player.html?bvid=BV1a4P4zWEbo&page=1&high_quality=1&danmaku=0" scrolling="no" border="0" frameborder="no" allowfullscreen="true"></iframe>
               </template>
               <template v-else-if="currentStep === 5">
                  <iframe class="w-full h-full absolute inset-0" src="https://player.bilibili.com/player.html?bvid=BV1GPNFzEEC9&page=1&high_quality=1&danmaku=0" scrolling="no" border="0" frameborder="no" allowfullscreen="true"></iframe>
               </template>
               <template v-else>
                  <p class="text-white/50 font-medium z-10 flex flex-col items-center gap-2">
                    <svg class="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    视频制作中...
                  </p>
               </template>
            </div>
          </div>

          <div class="glass-card rounded-[2rem] p-6 flex-1 border border-white/60 shadow-xl overflow-y-auto flex flex-col">
            <h4 class="text-xs font-extrabold text-slate-400 tracking-wider uppercase mb-4">相关资源与工具</h4>
            
            <div class="grid grid-cols-2 gap-3" v-if="currentStep === 1">
              <a href="https://www.zhanfubrowser.com/register/?code=3262" target="_blank" class="group flex flex-col bg-white/60 items-center justify-center gap-2 p-4 rounded-2xl hover:bg-white transition-all shadow-sm hover:shadow-md border border-white hover:border-brand-200">
                <img :src="`${staticBaseUrl}zf-logo.svg`" alt="战斧浏览器" class="h-10 w-auto object-contain transition-transform group-hover:scale-110" />
                <span class="text-xs font-semibold text-slate-700">战斧浏览器</span>
              </a>
              <a href="https://shein.top/bbcumlm" target="_blank" class="group flex flex-col bg-white/60 items-center justify-center gap-2 p-4 rounded-2xl hover:bg-white transition-all shadow-sm hover:shadow-md border border-white hover:border-brand-200">
                <img :src="`${staticBaseUrl}shein-s.svg`" alt="SHEIN" class="h-10 w-auto object-contain transition-transform group-hover:scale-110" />
                <span class="text-xs font-semibold text-slate-700">商家注册</span>
              </a>
            </div>

            <div class="flex flex-col gap-2" v-if="currentStep === 2">
              <div class="bg-white/50 backdrop-blur rounded-2xl p-4 border border-white/80 shadow-sm text-sm text-slate-600 font-mono space-y-2">
                <div class="flex"><span class="w-16 text-slate-400 font-bold">仓库</span><span class="text-slate-800">纽约美东仓库</span></div>
                <div class="flex"><span class="w-16 text-slate-400 font-bold">姓名</span><span class="text-slate-800">JOHN LEAVY</span></div>
                <div class="flex"><span class="w-16 text-slate-400 font-bold">邮编</span><span class="text-slate-800">11413</span></div>
                <div class="flex"><span class="w-16 text-slate-400 font-bold">手机</span><span class="text-slate-800">（+1）123456789(随便写满足位数要求即可)</span></div>
                <div class="flex"><span class="w-16 text-slate-400 font-bold">省市</span><span class="text-slate-800">NY, JAMAICA</span></div>
                <div class="flex"><span class="w-16 text-slate-400 font-bold">邮箱</span><span class="text-slate-800">XXXXXX@gmail.com</span></div>
                <div class="flex mt-2"><span class="w-16 text-slate-400 font-bold">地址</span><span class="text-slate-800">133-11 FRANCLS LEWIS BLVD</span></div>
              </div>
            </div>

            <div class="flex flex-col gap-4" v-if="currentStep === 3">
               <div class="grid grid-cols-3 gap-3">
                 <a href="https://erp.91miaoshou.com/" target="_blank" class="group flex flex-col bg-white/60 items-center justify-center gap-2 p-4 rounded-2xl hover:bg-white transition-all shadow-sm hover:shadow-md border border-white hover:border-brand-200">
                  <img :src="`${staticBaseUrl}miaoshou-logo.jpg`" alt="妙手ERP" class="h-10 w-auto rounded object-contain transition-transform group-hover:scale-110" />
                  <span class="text-xs font-semibold text-slate-700">妙手ERP</span>
                 </a>
                 <a href="https://erp.91miaoshou.com/sid/Gx0iMm" target="_blank" class="group flex flex-col bg-white/60 items-center justify-center gap-2 p-4 rounded-2xl hover:bg-white transition-all shadow-sm hover:shadow-md border border-white hover:border-brand-200">
                  <img :src="`${staticBaseUrl}miaoshou-logo.jpg`" alt="妙手分销" class="h-10 w-auto rounded object-contain transition-transform group-hover:scale-110 saturate-150 hue-rotate-15" />
                  <span class="text-xs font-semibold text-slate-700">妙手分销</span>
                 </a>
                 <a href="https://us.shein.com/" target="_blank" class="group flex flex-col bg-white/60 items-center justify-center gap-2 p-4 rounded-2xl hover:bg-white transition-all shadow-sm hover:shadow-md border border-white hover:border-brand-200">
                  <img :src="`${staticBaseUrl}shein-s.svg`" alt="SHEIN官网" class="h-10 w-auto object-contain transition-transform group-hover:scale-110" />
                  <span class="text-xs font-semibold text-slate-700">SHEIN官网</span>
                 </a>
               </div>
               <a href="https://erp.91miaoshou.com/api/app/views/static/plugin/kuajing-erp-plugin-v3.zip" download class="group flex items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 hover:border-blue-300 transition-all shadow-sm hover:shadow text-slate-700">
                 <span class="text-2xl bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">🧩</span>
                 <div class="flex flex-col">
                   <span class="font-bold text-sm text-brand-700">下载插件</span>
                   <span class="text-xs text-slate-500">妙手ERP插件 V3.zip</span>
                 </div>
               </a>
            </div>

            <div class="flex flex-col gap-4" v-if="currentStep === 5">
               <div class="grid grid-cols-3 gap-2">
                 <a :href="`${staticBaseUrl}honglian-plugin.zip`" download class="flex flex-col items-center gap-2 bg-white/60 p-3 rounded-xl hover:bg-white hover:shadow-md transition-all text-center group">
                   <img :src="`${staticBaseUrl}honglian-icon.png`" class="w-8 h-8 rounded group-hover:scale-110 transition-transform"/>
                   <span class="text-[10px] font-bold text-slate-600">订单插件</span>
                 </a>
                  <a :href="`${staticBaseUrl}honglian-config.json`" download class="flex flex-col items-center gap-2 bg-white/60 p-3 rounded-xl hover:bg-white hover:shadow-md transition-all text-center group">
                   <span class="text-2xl group-hover:scale-110 transition-transform group-hover:rotate-45">⚙️</span>
                   <span class="text-[10px] font-bold text-slate-600">配置文件</span>
                 </a>
                 <a :href="`${staticBaseUrl}track123-template.xlsx`" download class="flex flex-col items-center gap-2 bg-white/60 p-3 rounded-xl hover:bg-white hover:shadow-md transition-all text-center group">
                   <span class="text-2xl group-hover:scale-110 transition-transform">📊</span>
                   <span class="text-[10px] font-bold text-slate-600">Track123模板</span>
                 </a>
               </div>
               <div class="grid grid-cols-3 gap-2 mt-2">
                 <a href="https://wl.wwerp.cc/orders" target="_blank" class="flex flex-col items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-xl hover:border-brand-300 transition-all text-center">
                   <span class="text-xl">📦</span><span class="text-[10px] font-medium">物流平台</span>
                 </a>
                 <a href="https://kj.qizhishangke.com/user/login" target="_blank" class="flex flex-col items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-xl hover:border-brand-300 transition-all text-center">
                   <img :src="`${staticBaseUrl}wdt-logo.png`" class="h-6 object-contain"/><span class="text-[10px] font-medium">旺店通ERP</span>
                 </a>
                 <a href="https://member.track123.com/login?lang=zh" target="_blank" class="flex flex-col items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-xl hover:border-brand-300 transition-all text-center">
                   <img :src="`${staticBaseUrl}track123-logo.png`" class="h-6 object-contain"/><span class="text-[10px] font-medium">Track123</span>
                 </a>
               </div>
            </div>

          </div>
        </div>
      </div>

      <div class="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50 p-2 glass rounded-full shadow-2xl border-white/60 bento-item">
        <button v-if="currentStep > 1" @click="goToStep(currentStep - 1)" class="px-6 py-2.5 rounded-full text-sm font-bold text-slate-600 hover:text-brand-600 bg-white/50 hover:bg-white transition-all border border-transparent hover:border-brand-200 hover:shadow-md">
           ← 上一步
        </button>
        <button v-if="currentStep < 5" @click="goToStep(currentStep + 1)" class="px-8 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-brand-500 to-indigo-500 hover:from-brand-400 hover:to-indigo-400 shadow-lg shadow-brand-500/30 hover:scale-105 transition-all">
           下一步 →
        </button>
        <button v-if="currentStep === 5" @click="navigateHome" class="px-8 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/30 hover:scale-105 transition-all">
           完成入驻 ✓
        </button>
      </div>
    </div>

    <AuthAccessModal
      :show="showAuthModal"
      :mode="authMode"
      platform="shein"
      @close="handleAuthClose"
      @switch-mode="handleAuthModeChange"
      @authenticated="handleAuthSuccess"
    />

    <CombinedSurveyModal
      :show="showSurveyModal"
      @close="handleSurveyClose"
      @submit="handleSurveySubmit"
    />

    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showVipNotice" class="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/50 p-4" @click="showVipNotice = false">
        <div class="w-full max-w-md rounded-3xl border border-white bg-white p-8 shadow-2xl" @click.stop>
          <h3 class="text-2xl font-extrabold text-slate-800">未开通 SHEIN VIP</h3>
          <p class="mt-3 text-sm leading-relaxed text-slate-600">你已登录，但管理员尚未为你的账号开通 SHEIN VIP。请联系管理员在后台开通后再访问教程。</p>
          <button class="mt-6 w-full rounded-xl bg-brand-600 px-6 py-3 font-bold text-white transition hover:bg-brand-500" @click="showVipNotice = false">知道了</button>
        </div>
      </div>
    </transition>

    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 backdrop-blur-none" enter-to-class="opacity-100 backdrop-blur-sm" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 backdrop-blur-sm" leave-to-class="opacity-0 backdrop-blur-none">
      <div v-if="showMaterialsModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" @click="closeMaterials">
        <div class="bg-white/90 backdrop-blur-xl border border-white w-full max-w-md rounded-3xl p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transform transition-transform" @click.stop>
          <button @click="closeMaterials" class="absolute top-6 right-6 text-slate-400 hover:text-slate-600 hover:rotate-90 transition-transform">
             <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          
          <h2 class="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">清单确认 <span class="text-brand-500 text-sm bg-brand-50 px-3 py-1 rounded-full">{{materialsStep}}/1</span></h2>
          
          <div class="space-y-3 mb-6">
            <label v-for="material in materials" :key="material.id" class="flex flex-row items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-brand-50 hover:border-brand-200 transition-colors group">
               <div class="relative flex items-center justify-center pt-0.5">
                 <input type="checkbox" v-model="material.checked" class="w-5 h-5 opacity-0 absolute z-10 cursor-pointer peer">
                 <div class="w-5 h-5 rounded border-2 border-slate-300 peer-checked:bg-brand-500 peer-checked:border-brand-500 transition-colors flex items-center justify-center">
                   <svg class="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                 </div>
               </div>
               <span class="text-sm font-medium text-slate-600 leading-snug flex-1 group-hover:text-brand-900 transition-colors mt-0.5">{{ material.text }}</span>
            </label>
          </div>

          <div class="flex items-center justify-between mt-8">
            <span class="text-xs font-bold text-slate-400 tracking-wide">{{ materialsProgress }}</span>
            <button @click="nextStep" class="px-8 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 hover:scale-105 transition-all">
              已完成
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style>
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.inner-shadow { box-shadow: inset 0 2px 10px rgba(0,0,0,0.05); }
</style>
