<template>
  <div class="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_transparent_36%),linear-gradient(160deg,_#f8fafc_0%,_#dbeafe_45%,_#e2e8f0_100%)] px-4 py-10 text-slate-900">
    <HomeDock />
    <div class="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center gap-10">
      <section class="hidden max-w-xl lg:block">
        <p class="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-brand-700">Member Access</p>
        <h1 class="text-5xl font-black leading-tight text-slate-900">登录后继续查看 {{ platformLabel }} 教程</h1>
        <p class="mt-6 text-lg leading-8 text-slate-600">首页保持公开，教程内容需要账号登录，并由管理员开通对应平台 VIP 权限。</p>
      </section>

      <div class="w-full max-w-lg">
        <AuthLoginCard :platform="platform" @close="handleClose" @go-register="goRegister" @authenticated="handleAuthenticated" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import HomeDock from '../../components/HomeDock.vue'
import AuthLoginCard from '../../components/AuthLoginCard.vue'
import { getAuthQuery, createAuthPageLink } from './auth-page-utils'

const { platform, redirect } = getAuthQuery()
const platformLabel = computed(() => platform.toUpperCase())

function handleAuthenticated() {
  window.location.href = redirect
}

function goRegister() {
  window.location.href = createAuthPageLink('register', platform, redirect)
}

function handleClose() {
  window.location.href = redirect.includes('#') ? redirect.split('#')[0] : redirect
}
</script>
