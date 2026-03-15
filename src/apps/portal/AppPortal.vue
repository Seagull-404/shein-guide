<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'

const staticBaseUrl = import.meta.env.BASE_URL
const languageStorageKey = 'portal-language'

const languages = [
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' }
]

const translations = {
  zh: {
    navItems: ['首页', '服务与模式', '入驻教程', '关于我们', '联系我们'],
    heroLine1: '让出海更简单',
    heroLine2: '让品牌更全球',
    heroSubtitle: '一站式国际平台招商入驻与运营赋能中心，帮助企业更高效拓展全球市场。',
    sheinEntry: '进入 SHEIN 招商中心',
    ozonEntry: '进入 OZON 招商中心',
    languageButton: '切换语言',
    dataStatus: '系统运行中',
    dataTitle: '全球业务增长引擎',
    dataSubtitle: '全息追踪矩阵 / 核心链路监控',
    metrics: [
      { label: '覆盖主流平台', value: '6+' },
      { label: '标准入驻模块', value: '12+' },
      { label: '沉淀工具模板', value: '30+' },
      { label: '活跃孵化项目', value: '50+' }
    ],
    aboutTitle: '关于泽屹',
    aboutBody: '泽屹跨境专注于为中国品牌提供一站式出海解决方案，覆盖平台招商、平台入驻和运营协同，打造高效可复制的国际化增长体系。',
    aboutPlaceholder: '公司实景 / 团队风采占位',
    contactTitle: '联系我们',
    contactLocation: '中国 · 义乌\n浙江省金华市义乌市泽屹跨境',
    ctaTitle: '渠道对接与入驻咨询',
    ctaBody: '获取主流跨境平台的最新招商政策。提交需求后，我们的顾问团队会提供 1v1 对接服务。',
    ctaButton: '联系商务顾问',
    copyright: '© 2026 ZEYI KUAJING. All rights reserved.'
  },
  en: {
    navItems: ['Home', 'Services', 'Tutorials', 'About', 'Contact'],
    heroLine1: 'Make Global Expansion',
    heroLine2: 'Simple for Every Brand',
    heroSubtitle: 'A unified gateway for marketplace onboarding, growth operations, and international expansion support.',
    sheinEntry: 'Enter SHEIN Center',
    ozonEntry: 'Enter OZON Center',
    languageButton: 'Language',
    dataStatus: 'System Active',
    dataTitle: 'Global Growth Engine',
    dataSubtitle: 'Holographic Tracking Matrix / Core Funnel Monitoring',
    metrics: [
      { label: 'Mainstream Platforms', value: '6+' },
      { label: 'Standard Modules', value: '12+' },
      { label: 'Operational Templates', value: '30+' },
      { label: 'Active Incubation Projects', value: '50+' }
    ],
    aboutTitle: 'About Zeyi',
    aboutBody: 'Zeyi Kuajing delivers integrated global expansion solutions for Chinese brands, covering marketplace recruitment, seller onboarding, and operational collaboration.',
    aboutPlaceholder: 'Company scene / team showcase placeholder',
    contactTitle: 'Contact Us',
    contactLocation: 'Yiwu, China\nCross-border e-commerce industry cluster',
    ctaTitle: 'Channel Access & Seller Advisory',
    ctaBody: 'Get the latest recruitment policies from major cross-border platforms. After you submit your needs, our consultants will provide 1-on-1 support.',
    ctaButton: 'Talk to an Advisor',
    copyright: '© 2026 ZEYI KUAJING. All rights reserved.'
  }
}

const platforms = [
  { name: 'SHEIN', icon: 'brands/shein-static.png' },
  { name: 'OZON', icon: 'brands/ozon.svg' },
  { name: 'TEMU', icon: 'brands/temu.svg' },
  { name: 'TikTok', icon: 'brands/tiktok.svg' },
  { name: 'Amazon', icon: 'brands/amazon.svg' },
  { name: 'Mercado Libre', icon: 'brands/mercadolibre.svg' }
]

const carouselImages = [
  { id: 1, src: 'carousel/shein-home.png', alt: 'SHEIN homepage' },
  { id: 2, src: 'carousel/temu-home.png', alt: 'Temu homepage' },
  { id: 3, src: 'carousel/tiktok-home.png', alt: 'TikTok Shop homepage' },
  { id: 4, src: 'carousel/ozon-home.png', alt: 'OZON homepage' }
]

const stripMaskStyle = {
  maskImage: 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 10%, rgba(0,0,0,1) 90%, rgba(0,0,0,0) 100%)',
  WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 10%, rgba(0,0,0,1) 90%, rgba(0,0,0,0) 100%)'
}

const currentLang = ref('zh')
const isLangMenuOpen = ref(false)
const activeSlide = ref(0)

const copy = computed(() => translations[currentLang.value])
const currentLanguage = computed(() => languages.find((language) => language.code === currentLang.value) ?? languages[0])

let slideInterval = null

const nextSlide = () => {
  activeSlide.value = (activeSlide.value + 1) % carouselImages.length
}

const startAutoSlide = () => {
  stopAutoSlide()
  slideInterval = window.setInterval(nextSlide, 3500)
}

const stopAutoSlide = () => {
  if (slideInterval) {
    clearInterval(slideInterval)
    slideInterval = null
  }
}

const setLanguage = (languageCode) => {
  currentLang.value = languageCode
  isLangMenuOpen.value = false
  window.localStorage.setItem(languageStorageKey, languageCode)
  document.documentElement.lang = languageCode === 'zh' ? 'zh-CN' : 'en'
}

const toggleLanguageMenu = () => {
  isLangMenuOpen.value = !isLangMenuOpen.value
}

const handleWindowClick = (event) => {
  if (!event.target.closest('.lang-switch')) {
    isLangMenuOpen.value = false
  }
}

onMounted(() => {
  const storedLanguage = window.localStorage.getItem(languageStorageKey)
  if (storedLanguage && translations[storedLanguage]) {
    currentLang.value = storedLanguage
  }

  document.documentElement.lang = currentLang.value === 'zh' ? 'zh-CN' : 'en'

  gsap.fromTo('.nav-anim', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' })
  gsap.fromTo('.hero-anim', { y: 30, opacity: 0, filter: 'blur(10px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.2 })
  gsap.fromTo('.strip-anim', { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power2.out', delay: 0.55 })
  gsap.fromTo('.section-anim', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.16, ease: 'power3.out', delay: 0.75 })

  window.addEventListener('click', handleWindowClick)
  startAutoSlide()
})

onUnmounted(() => {
  window.removeEventListener('click', handleWindowClick)
  stopAutoSlide()
})
</script>

<template>
  <main class="min-h-screen w-full overflow-x-hidden bg-[#050D22] text-white font-sans selection:bg-brand-500 selection:text-white">
    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div class="absolute left-[-10%] top-[-20%] h-[60%] w-[60%] rounded-full bg-blue-600/10 blur-[120px]"></div>
      <div class="absolute bottom-[-20%] right-[-10%] h-[50%] w-[50%] rounded-full bg-cyan-500/10 blur-[120px]"></div>
    </div>

    <div class="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <nav class="nav-anim flex items-center justify-between py-6">
        <div class="relative z-20 flex items-center gap-3">
          <img :src="`${staticBaseUrl}companylogo.png`" alt="Zeyi Kuajing" class="h-20 w-auto object-contain" />
        </div>

        <div class="hidden items-center gap-8 rounded-full border border-white/10 bg-[#081A3A]/40 px-8 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.2)] backdrop-blur-xl md:flex">
          <a
            v-for="item in copy.navItems"
            :key="item"
            href="#"
            class="text-sm font-medium text-[#B7C7E6] transition-all hover:-translate-y-0.5 hover:text-white"
          >
            {{ item }}
          </a>
        </div>

        <div class="lang-switch relative flex items-center">
          <button
            class="flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(30,107,255,0.25)]"
            @click.stop="toggleLanguageMenu"
          >
            <span class="text-lg leading-none">{{ currentLanguage.flag }}</span>
            <span class="hidden sm:inline">{{ currentLanguage.label }}</span>
            <svg class="h-4 w-4 transition-transform" :class="isLangMenuOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div
            v-if="isLangMenuOpen"
            class="absolute right-0 top-[calc(100%+0.75rem)] min-w-[180px] rounded-2xl border border-white/15 bg-[#07142E]/95 p-2 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
          >
            <button
              v-for="language in languages"
              :key="language.code"
              class="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition-colors hover:bg-white/10"
              :class="language.code === currentLang ? 'bg-white/10 text-white' : 'text-[#B7C7E6]'"
              @click.stop="setLanguage(language.code)"
            >
              <span class="flex items-center gap-3">
                <span class="text-lg leading-none">{{ language.flag }}</span>
                <span>{{ language.label }}</span>
              </span>
              <span v-if="language.code === currentLang" class="text-cyan-300">●</span>
            </button>
          </div>
        </div>
      </nav>

      <header class="flex flex-col items-center justify-center py-16 text-center md:py-24">
        <h1 class="hero-anim mb-6 text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
          <span class="bg-gradient-to-r from-white to-[#B7C7E6] bg-clip-text text-transparent drop-shadow-sm">
            {{ copy.heroLine1 }}
          </span>
          <br class="md:hidden" />
          <span class="bg-gradient-to-r from-[#35D4FF] to-[#1E6BFF] bg-clip-text text-transparent drop-shadow-sm">
            {{ copy.heroLine2 }}
          </span>
        </h1>

        <p class="hero-anim mx-auto mb-12 max-w-2xl text-lg font-light leading-relaxed text-[#B7C7E6] md:text-xl">
          {{ copy.heroSubtitle }}
        </p>

        <div class="hero-anim flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
          <a
            href="./shein.html"
            class="w-full rounded-xl border border-white/10 bg-[#1E6BFF] px-8 py-4 text-center font-bold text-white shadow-[0_0_30px_rgba(30,107,255,0.3)] transition-all hover:-translate-y-1 hover:bg-[#2DA8FF] hover:shadow-[0_0_40px_rgba(30,107,255,0.5)] sm:w-auto"
          >
            {{ copy.sheinEntry }}
          </a>
          <a
            href="./ozon.html"
            class="w-full rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-center font-bold text-white shadow-lg backdrop-blur-xl transition-all hover:-translate-y-1 hover:bg-white/15 sm:w-auto"
          >
            {{ copy.ozonEntry }}
          </a>
        </div>
      </header>

      <section class="mb-9">
        <div class="strip-anim platform-marquee-wrap rounded-2xl border border-white/10 bg-[#081A3A]/30 py-4 backdrop-blur-xl" :style="stripMaskStyle">
          <div class="platform-marquee-track">
            <div class="platform-marquee-group">
              <div
                v-for="platform in platforms"
                :key="`${platform.name}-a`"
                class="brand-chip group relative"
              >
                <div class="brand-chip-surface flex h-24 w-24 items-center justify-center rounded-[1.55rem] border border-cyan-200/10 p-4 shadow-[0_14px_30px_rgba(0,0,0,0.32)] backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:border-cyan-300/25 sm:h-28 sm:w-28">
                  <img
                    :src="`${staticBaseUrl}${platform.icon}`"
                    :alt="platform.name"
                    class="max-h-full max-w-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            <div class="platform-marquee-group" aria-hidden="true">
              <div
                v-for="platform in platforms"
                :key="`${platform.name}-b`"
                class="brand-chip group relative"
              >
                <div class="brand-chip-surface flex h-24 w-24 items-center justify-center rounded-[1.55rem] border border-cyan-200/10 p-4 shadow-[0_14px_30px_rgba(0,0,0,0.32)] backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:border-cyan-300/25 sm:h-28 sm:w-28">
                  <img
                    :src="`${staticBaseUrl}${platform.icon}`"
                    :alt="platform.name"
                    class="max-h-full max-w-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section-anim mb-16">
        <article
          class="relative h-[430px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#081A3A]/40 p-2 shadow-[0_12px_40px_rgba(0,0,0,0.26)] backdrop-blur-xl sm:h-[520px] lg:h-[620px]"
          @mouseenter="stopAutoSlide"
          @mouseleave="startAutoSlide"
        >
          <div class="relative h-full w-full overflow-hidden rounded-[1.6rem] bg-[#0A2C6B]">
            <transition-group name="fade" tag="div" class="relative h-full w-full">
              <div
                v-for="(img, idx) in carouselImages"
                :key="img.id"
                v-show="activeSlide === idx"
                class="absolute inset-0 h-full w-full"
              >
                <img
                  :src="`${staticBaseUrl}${img.src}`"
                  :alt="img.alt"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </transition-group>

            <div class="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-3">
              <button
                v-for="(_, idx) in carouselImages"
                :key="idx"
                :aria-label="`Go to slide ${idx + 1}`"
                class="transition-all duration-300 focus:outline-none"
                :class="activeSlide === idx ? 'h-2.5 w-9 rounded-full bg-[#35D4FF] shadow-[0_0_12px_rgba(53,212,255,0.7)]' : 'h-2.5 w-2.5 rounded-full bg-white/35 hover:bg-white/55'"
                @click="activeSlide = idx"
              ></button>
            </div>
          </div>
        </article>
      </section>

      <section class="section-anim group relative mb-24 overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-[#03091A]/80 shadow-[0_0_40px_rgba(30,107,255,0.2)] backdrop-blur-2xl">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0gNDAgMCBMMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg1MywgMjEyLCAyNTUsIDAuMDYpIiBzdHJva2Utd2lkdGg9IjEuNSIvPgo8L3N2Zz4=')] opacity-60 animate-grid-pan"></div>
        <div class="absolute left-0 top-0 z-0 h-[2px] w-full animate-scanner bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 shadow-[0_0_20px_rgba(53,212,255,1)] group-hover:opacity-100"></div>
        <div class="pointer-events-none absolute -left-32 -top-32 z-0 h-96 w-96 rounded-full bg-blue-600/20 blur-[100px] mix-blend-screen"></div>
        <div class="pointer-events-none absolute -bottom-32 -right-32 z-0 h-96 w-96 rounded-full bg-cyan-400/20 blur-[100px] mix-blend-screen"></div>

        <div class="relative z-10 p-8 sm:p-10">
          <div class="mb-12 flex flex-col items-start justify-between md:flex-row md:items-center">
            <div>
              <div class="mb-3 flex items-center gap-3">
                <span class="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(53,212,255,0.8)] animate-pulse"></span>
                <span class="rounded border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 font-mono text-xs uppercase tracking-widest text-cyan-400 shadow-inner">
                  {{ copy.dataStatus }}
                </span>
              </div>
              <h2 class="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-3xl font-black tracking-tight text-transparent drop-shadow-sm sm:text-4xl">
                {{ copy.dataTitle }}
              </h2>
              <p class="mt-3 text-sm font-light tracking-wide text-cyan-100/70 sm:text-base">
                {{ copy.dataSubtitle }}
              </p>
            </div>

            <div class="relative mt-6 hidden h-20 items-end gap-2 md:flex md:mt-0">
              <div class="relative h-[30%] w-6 overflow-hidden rounded-t-md bg-gradient-to-t from-blue-600/40 to-cyan-500 shadow-[0_0_15px_rgba(53,212,255,0.3)] transition-all duration-700 ease-out group-hover:h-[60%]"><div class="absolute inset-0 animate-pulse bg-white/20"></div></div>
              <div class="h-[20%] w-6 rounded-t-md bg-gradient-to-t from-blue-600/40 to-cyan-400 shadow-[0_0_15px_rgba(53,212,255,0.3)] transition-all duration-700 ease-out group-hover:h-[45%]"></div>
              <div class="h-[50%] w-6 rounded-t-md bg-gradient-to-t from-blue-600/40 to-cyan-400 shadow-[0_0_15px_rgba(53,212,255,0.3)] transition-all duration-700 ease-out group-hover:h-[80%]"></div>
              <div class="relative h-[70%] w-6 overflow-hidden rounded-t-md bg-gradient-to-t from-blue-600/50 to-cyan-300 shadow-[0_0_20px_rgba(53,212,255,0.6)] transition-all duration-700 ease-out group-hover:h-[95%]"><div class="absolute inset-0 animate-pulse bg-white/30"></div></div>
              <div class="h-[85%] w-6 rounded-t-md border-t-2 border-white/80 bg-gradient-to-t from-blue-500/60 to-cyan-200 shadow-[0_0_25px_rgba(53,212,255,0.8)] transition-all duration-700 ease-out group-hover:h-[110%]"></div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            <div
              v-for="metric in copy.metrics"
              :key="metric.label"
              class="group/card relative overflow-hidden rounded-[1.25rem] border border-blue-500/30 bg-[#0A1736]/70 p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-cyan-400/80 hover:shadow-[0_12px_40px_rgba(30,107,255,0.35)]"
            >
              <div class="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500/20 blur-2xl transition-colors group-hover/card:bg-cyan-400/30"></div>
              <div class="absolute bottom-0 left-0 h-[2px] w-full scale-x-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent transition-transform duration-700 group-hover/card:scale-x-100"></div>
              <span class="relative z-10 mb-3 block text-[11px] font-mono uppercase tracking-wider text-cyan-200/70 sm:text-xs">
                <span class="mr-1.5 text-cyan-400 animate-pulse">●</span>{{ metric.label }}
              </span>
              <div class="relative z-10 flex items-baseline gap-1.5">
                <span class="bg-gradient-to-b from-white via-cyan-100 to-blue-400 bg-clip-text text-5xl font-black text-transparent drop-shadow-[0_2px_10px_rgba(53,212,255,0.2)] sm:text-6xl">
                  {{ metric.value.replace('+', '') }}
                </span>
                <span class="text-2xl font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(53,212,255,0.8)] sm:text-3xl">+</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer class="section-anim grid grid-cols-1 gap-6 md:grid-cols-3">
        <div class="flex flex-col rounded-3xl border border-white/10 bg-[#0A1A3A]/40 p-8 backdrop-blur-md">
          <div class="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 shadow-sm">
            <span class="text-2xl filter drop-shadow">🏢</span>
          </div>
          <h3 class="mb-4 text-lg font-bold">{{ copy.aboutTitle }}</h3>
          <p class="mb-8 flex-1 text-sm leading-relaxed text-[#B7C7E6]">
            {{ copy.aboutBody }}
          </p>
          <div class="flex h-32 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <span class="text-xs font-medium text-[#B7C7E6]/60">{{ copy.aboutPlaceholder }}</span>
          </div>
        </div>

        <div class="flex flex-col rounded-3xl border border-white/10 bg-[#0A1A3A]/40 p-8 backdrop-blur-md">
          <div class="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 shadow-sm">
            <span class="text-2xl filter drop-shadow">📍</span>
          </div>
          <h3 class="mb-6 text-lg font-bold">{{ copy.contactTitle }}</h3>
          <ul class="space-y-6 text-sm text-[#EAF2FF]">
            <li class="flex items-start gap-4">
              <svg class="mt-0.5 h-5 w-5 shrink-0 text-[#35D4FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="leading-relaxed whitespace-pre-line">{{ copy.contactLocation }}</span>
            </li>
            <li class="flex items-center gap-4">
              <svg class="h-5 w-5 shrink-0 text-[#35D4FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>contact@zeyikuajing.com</span>
            </li>
            <li class="flex items-center gap-4">
              <svg class="h-5 w-5 shrink-0 text-[#35D4FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span class="font-bold tracking-wider">400-XXX-XXXX</span>
            </li>
          </ul>
        </div>

        <div class="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#1E6BFF]/30 bg-gradient-to-b from-[#1E6BFF]/20 to-[#0A2C6B]/80 p-8 backdrop-blur-md">
          <div class="data-grid pointer-events-none absolute inset-0 opacity-20"></div>
          <div class="relative z-10">
            <div class="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1E6BFF] shadow-lg shadow-[#1E6BFF]/30">
              <span class="text-2xl filter drop-shadow">🚀</span>
            </div>
            <h3 class="mb-4 text-lg font-bold">{{ copy.ctaTitle }}</h3>
            <p class="mb-8 text-sm leading-relaxed text-[#EAF2FF]">
              {{ copy.ctaBody }}
            </p>
          </div>
          <button class="relative z-10 w-full rounded-xl bg-white py-4 text-sm font-bold text-[#0A2C6B] shadow-[0_8px_20px_rgba(255,255,255,0.15)] transition-all hover:-translate-y-0.5 hover:bg-[#EAF2FF] focus:ring-4 focus:ring-white/20">
            {{ copy.ctaButton }}
          </button>
        </div>
      </footer>

      <div class="mt-16 text-center text-xs font-medium text-[#B7C7E6]/40">
        {{ copy.copyright }}
      </div>
    </div>
  </main>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.brand-chip-surface {
  background:
    radial-gradient(circle at 28% 22%, rgba(92, 177, 255, 0.18) 0%, rgba(92, 177, 255, 0) 56%),
    linear-gradient(160deg, rgba(13, 35, 76, 0.82), rgba(8, 20, 48, 0.92));
}

.brand-chip::before {
  content: '';
  position: absolute;
  inset: -10px;
  border-radius: 1.8rem;
  background: radial-gradient(circle, rgba(62, 201, 255, 0.16) 0%, rgba(62, 201, 255, 0) 68%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.brand-chip:hover::before {
  opacity: 1;
}

.platform-marquee-wrap {
  overflow: hidden;
}

.platform-marquee-track {
  display: flex;
  width: max-content;
  animation: platformMarquee 22s linear infinite;
}

.platform-marquee-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 0.75rem;
}

.platform-marquee-wrap:hover .platform-marquee-track {
  animation-play-state: paused;
}

@keyframes platformMarquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.data-grid {
  background-image: linear-gradient(rgba(255, 255, 255, 0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.18) 1px, transparent 1px);
  background-size: 14px 14px;
}

@keyframes gridPan {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 40px 40px;
  }
}

.animate-grid-pan {
  animation: gridPan 3s linear infinite;
  background-size: 40px 40px;
}

@keyframes scanner {
  0% {
    transform: translateY(-30px);
    opacity: 0;
  }
  15% {
    opacity: 0.8;
  }
  85% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(400px);
    opacity: 0;
  }
}

.animate-scanner {
  animation: scanner 4s alternate infinite;
}
</style>
