<template>
  <div class="public-page-shell" :class="styleClass">
    <nav class="top-nav">
      <div class="nav-inner">
        <RouterLink to="/home" class="brand">
          <span>{{ siteName }}</span>
        </RouterLink>

        <div class="nav-tabs" aria-label="AllCanCode navigation">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="nav-tab"
            :exact-active-class="item.exact ? 'active' : ''"
            active-class="active"
          >
            {{ item.label }}
          </RouterLink>
        </div>

        <div class="nav-actions">
          <LocaleSwitcher />
          <button
            type="button"
            class="style-toggle"
            :aria-label="styleMode === 'dark' ? 'Switch to light style' : 'Switch to dark style'"
            :title="styleMode === 'dark' ? 'Light style' : 'Dark style'"
            @click="toggleStyle"
          >
            <Icon :name="styleMode === 'dark' ? 'sun' : 'moon'" size="sm" />
          </button>
          <RouterLink :to="actionPath" class="login-btn">
            {{ actionLabel }}
          </RouterLink>
        </div>
      </div>
    </nav>

    <main class="public-main">
      <slot />
    </main>

    <footer v-if="!hideFooter" class="public-footer">
      <div>
        <strong>{{ siteName }}</strong>
        <span>{{ subtitle }}</span>
      </div>
      <div class="footer-links">
        <RouterLink to="/home">{{ t('nav.home') }}</RouterLink>
        <RouterLink to="/ranking">{{ t('nav.ranking') }}</RouterLink>
        <RouterLink to="/monitor">{{ t('nav.monitor') }}</RouterLink>
        <RouterLink to="/key-usage">{{ t('nav.keyUsage') }}</RouterLink>
        <RouterLink to="/help">{{ t('nav.help') }}</RouterLink>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

defineProps<{
  hideFooter?: boolean
}>()

const appStore = useAppStore()
const authStore = useAuthStore()
const { t } = useI18n()

const STYLE_STORAGE_KEY = 'allcancode_public_style'

const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'AllCanCode')
const subtitle = computed(() => appStore.cachedPublicSettings?.site_subtitle || 'One key for OpenAI, Claude, and Gemini')
const actionPath = computed(() => (authStore.isAuthenticated ? (authStore.isAdmin ? '/admin/dashboard' : '/dashboard') : '/login'))
const actionLabel = computed(() => (authStore.isAuthenticated ? t('home.dashboard') : t('auth.signIn')))
const styleMode = ref<'dark' | 'light'>(readStyleMode())
const styleClass = computed(() => (styleMode.value === 'light' ? 'public-style-light' : 'public-style-dark'))

const navItems = computed(() => [
  { label: t('nav.home'), to: '/home', exact: true },
  { label: t('nav.ranking'), to: '/ranking' },
  { label: t('nav.monitor'), to: '/monitor' },
  { label: t('nav.keyUsage'), to: '/key-usage' },
  { label: t('nav.help'), to: '/help' },
])

function readStyleMode(): 'dark' | 'light' {
  return localStorage.getItem(STYLE_STORAGE_KEY) === 'light' ? 'light' : 'dark'
}

function toggleStyle(): void {
  styleMode.value = styleMode.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem(STYLE_STORAGE_KEY, styleMode.value)
  window.dispatchEvent(new CustomEvent('allcancode-public-style-change', { detail: styleMode.value }))
}

onMounted(() => {
  localStorage.setItem(STYLE_STORAGE_KEY, styleMode.value)
  if (!appStore.publicSettingsLoaded) {
    void appStore.fetchPublicSettings()
  }
})
</script>

<style scoped>
.public-page-shell {
  min-height: 100vh;
  background: #000;
  color: #fff;
  font-family: "PingFang SC", "Microsoft YaHei", "HarmonyOS Sans", Arial, sans-serif;
}

.announcement {
  position: relative;
  display: flex;
  min-height: 52px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  background: #000;
  color: inherit;
}

.pixel-row {
  pointer-events: none;
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
}

.pixel-row-left {
  left: 0;
}

.pixel-row-right {
  right: 0;
}

.pixel-row span {
  display: block;
  aspect-ratio: 1;
  height: 100%;
}

.announcement-text {
  z-index: 1;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.announcement-arrow {
  z-index: 1;
  color: rgba(255, 255, 255, 0.7);
  font-size: 22px;
  line-height: 1;
}

.top-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.94);
  backdrop-filter: blur(12px);
}

.nav-inner {
  display: grid;
  max-width: 1460px;
  min-height: 72px;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 24px;
  margin: 0 auto;
  padding: 0 40px;
}

.brand,
.nav-tabs,
.nav-actions,
.footer-links {
  display: flex;
  align-items: center;
}

.brand {
  gap: 12px;
  min-width: 0;
  color: #fff;
  font-size: 28px;
  font-weight: 850;
  letter-spacing: -0.03em;
}

.brand > span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-tabs {
  justify-content: center;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.nav-tabs::-webkit-scrollbar {
  display: none;
}

.nav-tab {
  display: inline-flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: rgba(255, 255, 255, 0.62);
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.nav-tab:hover,
.nav-tab.active {
  border-color: rgba(7, 184, 50, 0.75);
  background: rgba(7, 184, 50, 0.18);
  box-shadow: 0 0 24px rgba(7, 184, 50, 0.18);
  color: #fff;
}

.nav-actions {
  justify-content: flex-end;
  gap: 12px;
}

.style-toggle {
  display: inline-flex;
  width: 38px;
  height: 38px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 999px;
  background: rgba(98, 98, 98, 0.3);
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(24px) saturate(120%);
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.style-toggle:hover {
  border-color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.1);
}

.login-btn {
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 999px;
  background: rgba(98, 98, 98, 0.3);
  color: rgba(255, 255, 255, 0.9);
  padding: 8px 24px;
  font-size: 15px;
  font-weight: 700;
  backdrop-filter: blur(24px) saturate(120%);
  transition: background 0.2s ease, border-color 0.2s ease;
}

.login-btn:hover {
  border-color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.1);
}

.public-main {
  position: relative;
  min-height: calc(100vh - 72px);
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 0%, rgba(7, 184, 50, 0.16), transparent 26%),
    radial-gradient(circle at 12% 40%, rgba(31, 149, 172, 0.16), transparent 24%),
    linear-gradient(180deg, #000 0%, #010704 58%, #000 100%);
}

.public-main::before {
  pointer-events: none;
  position: absolute;
  inset: 0;
  content: "";
  opacity: 0.16;
  background-image: repeating-linear-gradient(90deg, transparent 0, transparent 3px, rgba(255, 255, 255, 0.16) 4px);
  mix-blend-mode: screen;
}

.public-footer {
  position: relative;
  z-index: 1;
  display: flex;
  max-width: 1460px;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin: 0 auto;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
  padding: 28px 40px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 13px;
}

.public-footer div:first-child {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.public-footer strong {
  color: #fff;
}

.footer-links {
  gap: 14px;
}

.footer-links a {
  color: inherit;
  transition: color 0.18s ease;
}

.footer-links a:hover {
  color: #0ad840;
}

.public-style-light {
  background: #f8fafc;
  color: #0f172a;
}

.public-style-light .announcement,
.public-style-light .top-nav {
  border-bottom-color: rgba(37, 99, 235, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 250, 252, 0.9)),
    rgba(248, 250, 252, 0.96);
  box-shadow: 0 1px 0 rgba(37, 99, 235, 0.08);
}

.public-style-light .announcement-text,
.public-style-light .announcement-arrow {
  color: rgba(30, 41, 59, 0.74);
}

.public-style-light .brand,
.public-style-light .public-footer strong {
  color: #0f172a;
}

.public-style-light .nav-tab {
  border-color: rgba(37, 99, 235, 0.1);
  background: rgba(255, 255, 255, 0.58);
  color: rgba(51, 65, 85, 0.82);
}

.public-style-light .nav-tab:hover,
.public-style-light .nav-tab.active {
  border-color: rgba(37, 99, 235, 0.36);
  background: linear-gradient(180deg, rgba(239, 246, 255, 0.98), rgba(219, 234, 254, 0.86));
  color: #1d4ed8;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.12);
}

.public-style-light .style-toggle,
.public-style-light .login-btn {
  border-color: rgba(37, 99, 235, 0.28);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(239, 246, 255, 0.88));
  color: #1d4ed8;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.1);
}

.public-style-light .style-toggle:hover,
.public-style-light .login-btn:hover {
  border-color: rgba(14, 165, 233, 0.5);
  background: linear-gradient(180deg, #fff, rgba(239, 246, 255, 0.94));
  box-shadow: 0 12px 28px rgba(14, 165, 233, 0.12);
}

.public-style-light .public-main {
  color: #0f172a;
  background:
    radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.12), transparent 24%),
    radial-gradient(circle at 12% 40%, rgba(14, 165, 233, 0.1), transparent 24%),
    linear-gradient(180deg, #f8fafc 0%, #edf2f8 58%, #f8fafc 100%);
}

.public-style-light .public-main :deep(h1),
.public-style-light .public-main :deep(h2),
.public-style-light .public-main :deep(h3),
.public-style-light .public-main :deep(strong) {
  color: #0f172a;
  -webkit-text-fill-color: currentColor;
}

.public-style-light .public-main :deep(p),
.public-style-light .public-main :deep(small),
.public-style-light .public-main :deep(td),
.public-style-light .public-main :deep(th),
.public-style-light .public-main :deep(.hero-copy),
.public-style-light .public-main :deep(.panel-foot),
.public-style-light .public-main :deep(.state-box),
.public-style-light .public-main :deep(.compact-state) {
  color: #475569;
}

.public-style-light .public-main::before {
  opacity: 0.09;
  background-image: repeating-linear-gradient(90deg, transparent 0, transparent 3px, rgba(15, 23, 42, 0.14) 4px);
  mix-blend-mode: multiply;
}

.public-style-light .public-footer {
  border-top-color: rgba(37, 99, 235, 0.16);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.42), rgba(239, 246, 255, 0.42));
  color: rgba(51, 65, 85, 0.68);
}

@media (max-width: 900px) {
  .nav-inner {
    grid-template-columns: 1fr auto;
    gap: 12px;
    padding: 12px 16px;
  }

  .brand {
    font-size: 22px;
  }

  .nav-tabs {
    grid-column: 1 / -1;
    justify-content: flex-start;
    order: 3;
  }

  .login-btn {
    padding: 8px 16px;
  }

  .public-footer {
    flex-direction: column;
    align-items: flex-start;
    padding: 26px 16px;
  }
}

@media (max-width: 560px) {
  .announcement {
    min-height: 44px;
    padding: 0 44px;
  }

  .announcement-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
  }

  .brand > span:last-child {
    max-width: 145px;
  }

  .nav-actions {
    gap: 8px;
  }
}
</style>
