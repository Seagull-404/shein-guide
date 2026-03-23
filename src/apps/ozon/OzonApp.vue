<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import gsap from 'gsap'
import AuthAccessModal from '../../components/AuthAccessModal.vue'
import HomeDock from '../../components/HomeDock.vue'
import OzonSurveyModal from '../../components/OzonSurveyModal.vue'
import { useAuth } from '../../composables/useAuth'

const STEP_COUNT = 4
const staticBaseUrl = import.meta.env.BASE_URL

const showHero = ref(true)
const showTutorial = ref(false)
const showHeader = ref(true)
const currentStep = ref(1)
const showAuthModal = ref(false)
const authMode = ref('login')
const showSurveyModal = ref(false)
const showVipNotice = ref(false)
const pendingAction = ref(null)
let headerHideTimer = null

const { initializeAuth, isLoggedIn, hasVip } = useAuth()

const steps = [
  {
    label: '商家注册',
    title: 'OZON 商家注册',
    pdf: 'ozon/ozon-register.pdf',
    videos: [
      { title: '第二节', bvid: 'BV1SscfzPEZD', url: 'https://www.bilibili.com/video/BV1SscfzPEZD/' },
      { title: '第三节', bvid: 'BV1eEcBzmETL', url: 'https://www.bilibili.com/video/BV1eEcBzmETL/' }
    ],
    tools: [
      { title: '连连国际注册', href: 'https://global.lianlianpay.com/signup?bizSource=Y25fY29sbGVjdGlvbg==&invitecode=3B571D', external: true, meta: '收款账户开通' },
      { title: 'OZON 官方注册', href: 'https://seller.ozon.ru', external: true, meta: '官方商家后台' },
      { title: '店铺账号信息表', href: 'ozon/ozon-store-account.xlsx', download: true, meta: '下载模板' },
      { title: '快递渠道说明', href: 'ozon/ozon-courier.txt', download: true, meta: '下载文档' }
    ]
  },
  {
    label: '店铺绑定',
    title: '插件安装与店铺绑定',
    pdf: 'ozon/ozon-plugin-bind.pdf',
    videos: [
      { title: '第四节', bvid: 'BV1uscfzNEhi', url: 'https://www.bilibili.com/video/BV1uscfzNEhi/' }
    ],
    tools: [
      { title: 'Aliprice 搜图', href: 'https://www.aliprice.com/?ext_id=80354&channel=edge&platform=1688&version=3.6.4&browser=edge&mv=3', external: true, meta: '辅助找货' },
      { title: '毛子 ERP', href: 'https://ozon.maozierp.com/#/dashboard', external: true, meta: '后台管理' },
      { title: '上品帮 ERP', href: 'https://shopbang.cn/erp/#/index', external: true, meta: '授权与发布' },
      { title: '插件绑定文档', href: 'ozon/ozon-plugin-bind.pdf', download: true, meta: '下载 PDF' }
    ]
  },
  {
    label: '选品上架',
    title: '选品与上架',
    pdf: 'ozon/ozon-shangpin-flow.pdf',
    videos: [
      { title: '第六节', bvid: 'BV1SscfzPEwa', url: 'https://www.bilibili.com/video/BV1SscfzPEwa/' },
      { title: '第七节', bvid: 'BV1SscfzPE83', url: 'https://www.bilibili.com/video/BV1SscfzPE83/' }
    ],
    tools: [
      { title: '选品利润表', href: 'ozon/ozon-profit-selection.xlsx', download: true, meta: '下载模板' },
      { title: '义乌仓资费测算', href: 'ozon/ozon-yiwu-storage.xlsx', download: true, meta: '下载模板' },
      { title: 'OZON 定价模板', href: 'ozon/ozon-pricing-template.xlsx', download: true, meta: '下载模板' }
    ]
  },
  {
    label: '采购与发货',
    title: '采购、预报与物流发货',
    pdf: 'ozon/ozon-post-order.pdf',
    videos: [
      { title: '第八节', bvid: 'BV1SscfzPEeW', url: 'https://www.bilibili.com/video/BV1SscfzPEeW/' }
    ],
    tools: [
      { title: '发货利润核对表', href: 'ozon/ozon-shipping-profit-check.xlsx', download: true, meta: '下载模板' },
      { title: '跨境巴士', href: 'https://www.kuajing84.com/', external: true, meta: '物流下单' },
      { title: '上品流程文档', href: 'ozon/ozon-shangpin-flow.pdf', download: true, meta: '下载 PDF' },
      { title: '采购预报文档', href: 'ozon/ozon-post-order.pdf', download: true, meta: '下载 PDF' }
    ]
  }
]

const features = [
  { icon: '📋', text: '入驻信息问卷' },
  { icon: '📘', text: '图文视频教程' },
  { icon: '🧰', text: '工具与模板资源' }
]

const currentConfig = computed(() => steps[currentStep.value - 1])
const currentEmbed = computed(() => {
  const firstVideo = currentConfig.value.videos?.[0]
  if (!firstVideo?.bvid) return ''
  return `https://player.bilibili.com/player.html?bvid=${firstVideo.bvid}&page=1&high_quality=1&danmaku=0`
})

const extraVideos = computed(() => currentConfig.value.videos?.slice(1) || [])
const currentDocSrc = computed(() => currentConfig.value.pdf ? `${staticBaseUrl}${currentConfig.value.pdf}` : '')

const animateHero = () => {
  gsap.fromTo(
    '.hero-anim',
    { y: 60, opacity: 0, filter: 'blur(10px)' },
    { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, stagger: 0.1, ease: 'power3.out' }
  )
}

const animateTutorial = () => {
  gsap.fromTo(
    '.bento-item',
    { y: 30, opacity: 0, scale: 0.98 },
    { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.08, ease: 'back.out(1.2)', clearProps: 'transform' }
  )
}

const scheduleHeaderHide = () => {
  if (headerHideTimer) clearTimeout(headerHideTimer)
  headerHideTimer = setTimeout(() => {
    showHeader.value = false
  }, 3000)
}

const getStepFromHash = () => {
  const match = window.location.hash.match(/^#step([1-4])$/)
  if (!match) return null
  const step = Number(match[1])
  return step >= 1 && step <= STEP_COUNT ? step : null
}

const ensureAccess = (action) => {
  if (!isLoggedIn.value) {
    pendingAction.value = action
    authMode.value = 'login'
    showAuthModal.value = true
    return false
  }
  if (!hasVip('ozon')) {
    showVipNotice.value = true
    return false
  }
  showVipNotice.value = false
  pendingAction.value = action
  return true
}

const enterTutorialStep = (step) => {
  const nextHash = `#step${step}`
  if (window.location.hash === nextHash) {
    syncRouteState()
    return
  }
  window.location.hash = nextHash
}

const syncRouteState = () => {
  const step = getStepFromHash()
  if (step) {
    if (ensureAccess({ type: 'step', step })) {
      showHero.value = false
      showTutorial.value = true
      currentStep.value = step
      showHeader.value = true
      scheduleHeaderHide()
    } else {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
      showHero.value = true
      showTutorial.value = false
      currentStep.value = 1
      showHeader.value = true
    }
  } else {
    showHero.value = true
    showTutorial.value = false
    currentStep.value = 1
    showHeader.value = true
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
  nextTick(() => {
    animateTutorial()
  })
})

const resolveLink = (href) => {
  if (!href) return '#'
  if (href.startsWith('http://') || href.startsWith('https://')) return href
  return `${staticBaseUrl}${href}`
}

const goToStep = (step) => {
  if (!ensureAccess({ type: 'step', step })) return
  enterTutorialStep(step)
}

const navigateHome = () => {
  const cleanUrl = `${window.location.pathname}${window.location.search}`
  window.history.pushState(null, '', cleanUrl)
  syncRouteState()
}

const backToPortal = () => {
  window.location.href = `${staticBaseUrl}index.html`
}

const openTutorial = () => {
  if (!ensureAccess({ type: 'survey', step: 1 })) return
  showSurveyModal.value = true
}

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
  if (!hasVip('ozon')) {
    showVipNotice.value = true
    return
  }
  if (action.type === 'survey') {
    showSurveyModal.value = true
    return
  }
  if (action.type === 'step') {
    enterTutorialStep(action.step)
  }
}

const handleAuthModeChange = (mode) => {
  authMode.value = mode === 'register' ? 'register' : 'login'
}

const handleSurveyClose = () => {
  showSurveyModal.value = false
  enterTutorialStep(1)
}

const handleSurveySubmit = () => {
  showSurveyModal.value = false
  enterTutorialStep(1)
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
  <div class="relative min-h-screen w-full font-sans tracking-tight text-brand-900">
    <HomeDock />
    <div v-if="showHero" class="relative z-10 flex min-h-screen items-center justify-center p-6">
      <div class="glass group relative flex w-full max-w-3xl flex-col items-center overflow-hidden rounded-[2.5rem] border-t border-white/80 p-12 text-center shadow-2xl md:p-16">
        <div class="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 transition-all duration-1000 ease-in-out group-hover:translate-x-full group-hover:opacity-100"></div>

        <div class="hero-anim mb-8">
          <div class="inline-block rounded-3xl border border-white/60 bg-white/50 p-4 shadow-lg backdrop-blur-md transition-transform duration-300 hover:scale-105">
            <img :src="`${staticBaseUrl}ozon/ozon-logo.svg`" alt="OZON Logo" class="h-16 w-auto object-contain rounded-xl" />
          </div>
        </div>

        <h1 class="hero-anim mb-6 whitespace-nowrap bg-gradient-to-br from-brand-900 via-brand-600 to-indigo-900 bg-clip-text text-3xl font-extrabold leading-tight text-transparent sm:text-4xl md:text-5xl lg:text-6xl">
          OZON 商家入驻标准流程
        </h1>
        <p class="hero-anim mb-12 max-w-xl text-lg font-medium leading-relaxed text-slate-600 md:text-xl">
          使用与 SHEIN 教程完全统一的界面体系，帮助团队快速完成 OZON 入驻、绑定、上架与发货流程。
        </p>

        <div class="hero-anim mx-auto mb-12 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          <div
            v-for="feature in features"
            :key="feature.text"
            class="glass-card flex cursor-default flex-col items-center justify-center gap-3 rounded-2xl p-4 text-center transition-transform duration-300 hover:-translate-y-1"
          >
            <span class="text-3xl drop-shadow-sm sm:text-4xl">{{ feature.icon }}</span>
            <span class="text-xs font-semibold leading-tight text-slate-700 sm:text-sm">{{ feature.text }}</span>
          </div>
        </div>

        <div class="hero-anim flex flex-wrap justify-center gap-3">
          <button
            class="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-brand-600 px-10 py-5 text-lg font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-brand-500 hover:shadow-[0_0_40px_-10px_rgba(37,99,235,0.6)] focus:outline-none focus:ring-4 focus:ring-brand-500/30"
            @click="openTutorial"
          >
            <span class="absolute inset-0 -mt-1 h-full w-full rounded-lg bg-gradient-to-b from-transparent via-transparent to-black opacity-30"></span>
            <span class="relative flex items-center gap-2">我要开店</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="showTutorial" class="relative z-10 mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 pb-32 pt-8 md:px-8">
      <div class="group fixed left-0 right-0 top-0 z-[90] h-4 cursor-pointer" @mouseenter="showHeader = true">
        <div class="absolute left-1/2 top-0 h-1.5 w-20 -translate-x-1/2 rounded-b-lg bg-slate-300/50 transition-colors group-hover:bg-slate-400/60"></div>
      </div>

      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform -translate-y-full opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-full opacity-0"
      >
        <div
          v-show="showHeader"
          class="glass fixed left-4 right-4 top-4 z-[100] flex max-w-6xl flex-col items-center justify-between gap-4 rounded-2xl border border-white/40 p-4 shadow-2xl md:left-auto md:right-auto md:mx-auto md:w-[90%] md:flex-row"
        >
          <div class="flex w-full items-center gap-4 md:w-auto">
            <div class="rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 px-3 py-1 text-xs font-bold text-white shadow-inner">
              步骤 {{ currentStep }}/{{ STEP_COUNT }}
            </div>
            <h2 class="m-0 text-xl font-extrabold tracking-tight text-slate-800">{{ currentConfig.title }}</h2>
          </div>

          <div class="hide-scrollbar flex w-full max-w-2xl flex-1 justify-end gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              v-for="step in STEP_COUNT"
              :key="step"
              class="group relative flex min-w-[110px] flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border border-transparent p-2 transition-all duration-300"
              :class="[
                currentStep === step
                  ? 'scale-105 bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30'
                  : currentStep > step
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-white/50 text-slate-500 hover:scale-[1.02] hover:bg-white/80'
              ]"
              @click="goToStep(step)"
            >
              <span class="mb-0.5 text-xs font-bold opacity-80">STEP {{ step }}</span>
              <span class="whitespace-nowrap text-sm font-medium">{{ steps[step - 1].label }}</span>
              <div v-if="currentStep === step" class="absolute bottom-0 left-0 h-1 w-full animate-pulse bg-white/40"></div>
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

      <div class="mt-24 grid w-full flex-grow grid-cols-1 gap-6 lg:grid-cols-12">
        <div class="bento-item glass-card relative flex h-[70vh] min-h-[600px] flex-col overflow-hidden rounded-[2rem] border border-white/60 p-4 shadow-xl lg:col-span-8">
          <div class="pointer-events-none absolute inset-0 z-10 h-24 bg-gradient-to-b from-white/40 to-transparent"></div>
          <h3 class="relative z-20 mb-4 flex items-center gap-2 px-2 text-lg font-bold text-slate-800">
            <span class="h-2 w-2 rounded-full bg-brand-500"></span>
            官方权威指南
          </h3>
          <div class="inner-shadow relative z-20 flex-1 overflow-hidden rounded-2xl bg-slate-100/50">
            <iframe v-if="currentDocSrc" class="h-full w-full border-none" :src="currentDocSrc"></iframe>
            <div v-else class="flex h-full items-center justify-center px-8 text-center text-sm text-slate-500">
              本步骤暂无独立 PDF，请直接参考右侧资源与工具卡片中的资料。
            </div>
          </div>
        </div>

        <div class="bento-item flex h-[70vh] min-h-[600px] flex-col gap-6 lg:col-span-4">
          <div class="glass-card relative flex flex-shrink-0 flex-col overflow-hidden rounded-[2rem] border border-white/60 p-4 shadow-xl">
            <h3 class="mb-3 flex items-center gap-2 px-2 text-lg font-bold text-slate-800">
              <span class="h-2 w-2 rounded-full bg-indigo-500"></span>
              视频教程
            </h3>
            <div class="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900 shadow-inner">
              <iframe
                v-if="currentEmbed"
                class="absolute inset-0 h-full w-full"
                :src="currentEmbed"
                scrolling="no"
                frameborder="no"
                allowfullscreen="true"
              ></iframe>
              <p v-else class="z-10 text-sm font-medium text-white/50">该步骤暂无视频内容</p>
            </div>
            <div v-if="extraVideos.length" class="mt-3 space-y-2">
              <a
                v-for="video in extraVideos"
                :key="video.bvid"
                :href="video.url"
                target="_blank"
                rel="noreferrer"
                class="block rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:text-blue-600"
              >
                {{ video.title }}（站外打开）
              </a>
            </div>
          </div>

          <div class="glass-card flex flex-1 flex-col overflow-y-auto rounded-[2rem] border border-white/60 p-6 shadow-xl">
            <h4 class="mb-4 text-xs font-extrabold uppercase tracking-wider text-slate-400">相关资源与工具</h4>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                v-for="tool in currentConfig.tools"
                :key="tool.title"
                :href="resolveLink(tool.href)"
                :download="tool.download ? '' : null"
                :target="tool.external ? '_blank' : null"
                :rel="tool.external ? 'noreferrer' : null"
                class="group rounded-2xl border border-white bg-white/60 p-4 shadow-sm transition-all hover:border-brand-200 hover:bg-white hover:shadow-md"
              >
                <p class="text-sm font-bold text-slate-700 transition-colors group-hover:text-brand-700">{{ tool.title }}</p>
                <p class="mt-1 text-xs text-slate-500">{{ tool.meta }}</p>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="bento-item glass fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border-white/60 p-2 shadow-2xl md:bottom-10">
        <button
          v-if="currentStep > 1"
          class="rounded-full border border-transparent bg-white/50 px-6 py-2.5 text-sm font-bold text-slate-600 transition-all hover:border-brand-200 hover:bg-white hover:text-brand-600 hover:shadow-md"
          @click="goToStep(currentStep - 1)"
        >
          上一步
        </button>
        <button
          v-if="currentStep < STEP_COUNT"
          class="rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition-all hover:scale-105 hover:from-brand-400 hover:to-indigo-400"
          @click="goToStep(currentStep + 1)"
        >
          下一步
        </button>
        <button
          v-if="currentStep === STEP_COUNT"
          class="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 hover:from-emerald-400 hover:to-teal-400"
          @click="navigateHome"
        >
          完成教程
        </button>
      </div>
    </div>

    <AuthAccessModal
      :show="showAuthModal"
      :mode="authMode"
      platform="ozon"
      @close="handleAuthClose"
      @switch-mode="handleAuthModeChange"
      @authenticated="handleAuthSuccess"
    />

    <OzonSurveyModal
      :show="showSurveyModal"
      @close="handleSurveyClose"
      @submit="handleSurveySubmit"
    />

    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showVipNotice" class="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/50 p-4" @click="showVipNotice = false">
        <div class="w-full max-w-md rounded-3xl border border-white bg-white p-8 shadow-2xl" @click.stop>
          <h3 class="text-2xl font-extrabold text-slate-800">未开通 OZON VIP</h3>
          <p class="mt-3 text-sm leading-relaxed text-slate-600">你已登录，但管理员尚未为你的账号开通 OZON VIP。请联系管理员在后台开通后再访问教程。</p>
          <button class="mt-6 w-full rounded-xl bg-brand-600 px-6 py-3 font-bold text-white transition hover:bg-brand-500" @click="showVipNotice = false">知道了</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.inner-shadow {
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.05);
}
</style>
