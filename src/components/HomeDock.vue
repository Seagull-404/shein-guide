<template>
  <a
    :href="homeHref"
    class="fixed left-6 top-6 z-[1300] group flex items-center gap-3 outline-none"
  >
    <!-- Logo / Icon -->
    <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/40 border border-white/10 text-white/50 backdrop-blur-xl shadow-lg transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-brand-500 group-hover:to-indigo-500 group-hover:text-white group-hover:border-transparent group-hover:shadow-[0_8px_25px_rgba(99,102,241,0.4)] group-hover:scale-105 group-hover:rotate-3">
      <svg class="h-5 w-5 transition-transform duration-500 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    </div>
    <!-- Hover Text -->
    <div class="overflow-hidden">
      <span class="block -translate-x-[120%] opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:opacity-100 text-sm font-bold text-slate-700 tracking-widest">
        返回首页
      </span>
    </div>
  </a>
</template>

<script setup>
const homeHref = `${import.meta.env.BASE_URL}index.html`
</script>
