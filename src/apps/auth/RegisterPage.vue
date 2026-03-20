<template>
  <div class="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_34%),linear-gradient(160deg,_#f8fafc_0%,_#dcfce7_38%,_#ecfeff_100%)] px-4 py-10 text-slate-900">
    <HomeDock />
    <div class="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center gap-10">
      <section class="hidden max-w-xl lg:block">
        <p class="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-emerald-700">Create Account</p>
        <h1 class="text-5xl font-black leading-tight text-slate-900">注册 {{ platformLabel }} 学习账号</h1>
        <p class="mt-6 text-lg leading-8 text-slate-600">注册成功后可以登录，但教程访问仍需管理员为账号开通对应平台 VIP 权限。</p>
      </section>

      <div class="w-full max-w-lg">
        <AuthRegisterCard :platform="platform" @close="handleClose" @go-login="goLogin" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import HomeDock from '../../components/HomeDock.vue'
import AuthRegisterCard from '../../components/AuthRegisterCard.vue'
import { getAuthQuery, createAuthPageLink } from './auth-page-utils'

const { platform, redirect } = getAuthQuery()
const platformLabel = computed(() => platform.toUpperCase())

function goLogin() {
  window.location.href = createAuthPageLink('login', platform, redirect)
}

function handleClose() {
  window.location.href = redirect.includes('#') ? redirect.split('#')[0] : redirect
}
</script>
