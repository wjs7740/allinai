<template>
  <PublicPageShell hide-footer>
    <div class="auth-page">
      <section class="auth-copy">
        <p>ALLCANCODE ACCESS</p>
        <div class="hero-brand">
          <span>{{ brandInitial }}</span>
        </div>
        <h1>{{ siteName }}</h1>
        <span>{{ siteSubtitle }}</span>
      </section>

      <section class="auth-panel">
        <div v-if="settingsLoaded" class="auth-brand">
          <div class="brand-logo">
            <span>{{ brandInitial }}</span>
          </div>
          <div>
            <strong>{{ siteName }}</strong>
            <span>{{ siteSubtitle }}</span>
          </div>
        </div>

        <div class="auth-card">
          <slot />
        </div>

        <div class="auth-footer">
          <slot name="footer" />
        </div>
      </section>
    </div>
  </PublicPageShell>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/stores'
import PublicPageShell from '@/components/public/PublicPageShell.vue'

const appStore = useAppStore()

const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'AllCanCode')
const siteSubtitle = computed(() => appStore.cachedPublicSettings?.site_subtitle || 'Subscription to API Conversion Platform')
const settingsLoaded = computed(() => appStore.publicSettingsLoaded)
const brandInitial = computed(() => 'AC')

onMounted(() => {
  appStore.fetchPublicSettings()
})
</script>

<style scoped>
.auth-page {
  position: relative;
  z-index: 1;
  display: grid;
  max-width: 1180px;
  min-height: calc(100vh - 124px);
  grid-template-columns: minmax(0, 1fr) 440px;
  align-items: center;
  gap: 56px;
  margin: 0 auto;
  padding: 64px 40px 84px;
}

.auth-copy p {
  margin: 0 0 12px;
  color: #0ad840;
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero-brand {
  display: grid;
  width: 92px;
  height: 92px;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(46, 195, 83, 0.65);
  border-radius: 8px;
  background: linear-gradient(135deg, #0ad840, #1f95ac);
  color: #001a06;
  font-size: 40px;
  font-weight: 950;
  box-shadow: 0 0 80px rgba(10, 216, 64, 0.28);
  margin-bottom: 24px;
}

.auth-copy h1 {
  margin: 0;
  background: linear-gradient(270deg, #fff 62%, rgba(10, 216, 64, 0.58) 100%);
  background-clip: text;
  color: #fff;
  font-size: clamp(46px, 7vw, 96px);
  font-weight: 560;
  line-height: 1.02;
  -webkit-text-fill-color: transparent;
}

.auth-copy span {
  display: block;
  max-width: 560px;
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.68);
  font-size: 17px;
  line-height: 1.65;
}

.auth-panel {
  width: 100%;
}

.auth-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.brand-logo {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(46, 195, 83, 0.65);
  border-radius: 8px;
  background: linear-gradient(135deg, #0ad840, #1f95ac);
  color: #001a06;
  font-size: 18px;
  font-weight: 950;
  box-shadow: 0 0 24px rgba(7, 184, 50, 0.18);
}

.auth-brand strong,
.auth-brand span {
  display: block;
}

.auth-brand strong {
  color: #fff;
  font-size: 16px;
  font-weight: 900;
}

.auth-brand span {
  color: rgba(255, 255, 255, 0.56);
  font-size: 12px;
}

.auth-card {
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.065);
  padding: 30px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(14px);
}

.auth-footer {
  margin-top: 18px;
  text-align: center;
  font-size: 14px;
}

.auth-page :deep(.text-gray-900),
.auth-page :deep(.dark\:text-white) {
  color: #fff;
}

.auth-page :deep(.text-gray-500),
.auth-page :deep(.dark\:text-dark-400) {
  color: rgba(255, 255, 255, 0.58);
}

.auth-page :deep(.input-label) {
  color: rgba(255, 255, 255, 0.78);
}

.auth-page :deep(.input),
.auth-page :deep(input),
.auth-page :deep(select),
.auth-page :deep(textarea) {
  border-color: rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.38);
  color: #fff;
}

.auth-page :deep(.input::placeholder),
.auth-page :deep(input::placeholder),
.auth-page :deep(textarea::placeholder) {
  color: rgba(255, 255, 255, 0.36);
}

.auth-page :deep(.input:focus),
.auth-page :deep(input:focus),
.auth-page :deep(select:focus),
.auth-page :deep(textarea:focus) {
  border-color: rgba(10, 216, 64, 0.72);
  box-shadow: 0 0 0 3px rgba(10, 216, 64, 0.18);
}

.auth-page :deep(.btn-primary) {
  border-color: #0ad840;
  background: #0ad840;
  color: #001a06;
}

.auth-page :deep(.text-primary-600),
.auth-page :deep(.dark\:text-primary-400) {
  color: #9dffb3;
}

.auth-page :deep(.bg-gray-200),
.auth-page :deep(.dark\:bg-dark-700) {
  background: rgba(255, 255, 255, 0.14);
}

:global(.public-style-light) .auth-copy h1 {
  background: none;
  color: #101412;
  -webkit-text-fill-color: currentColor;
}

:global(.public-style-light) .auth-copy span,
:global(.public-style-light) .auth-brand span,
:global(.public-style-light) .auth-page :deep(.text-gray-500),
:global(.public-style-light) .auth-page :deep(.dark\:text-dark-400) {
  color: rgba(6, 58, 22, 0.62);
}

:global(.public-style-light) .hero-brand,
:global(.public-style-light) .brand-logo {
  border-color: rgba(8, 123, 47, 0.38);
  background: linear-gradient(135deg, #0fbf4a 0%, #58c7b1 58%, #f2c45a 100%);
  color: #001a06;
  box-shadow:
    0 12px 30px rgba(8, 123, 47, 0.16),
    inset 0 1px rgba(255, 255, 255, 0.55);
}

:global(.public-style-light) .auth-card {
  border-color: rgba(8, 123, 47, 0.2);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(239, 250, 241, 0.78));
  box-shadow: 0 18px 60px rgba(6, 58, 22, 0.1);
}

:global(.public-style-light) .auth-brand strong,
:global(.public-style-light) .auth-page :deep(.text-gray-900),
:global(.public-style-light) .auth-page :deep(.dark\:text-white) {
  color: #101412;
}

:global(.public-style-light) .auth-page :deep(.input-label) {
  color: rgba(6, 58, 22, 0.78);
}

:global(.public-style-light) .auth-page :deep(.input),
:global(.public-style-light) .auth-page :deep(input),
:global(.public-style-light) .auth-page :deep(select),
:global(.public-style-light) .auth-page :deep(textarea) {
  border-color: rgba(15, 127, 120, 0.24);
  background: rgba(255, 255, 255, 0.92);
  color: #101412;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

:global(.public-style-light) .auth-page :deep(.input::placeholder),
:global(.public-style-light) .auth-page :deep(input::placeholder),
:global(.public-style-light) .auth-page :deep(textarea::placeholder) {
  color: rgba(6, 58, 22, 0.38);
}

:global(.public-style-light) .auth-page :deep(.text-primary-600),
:global(.public-style-light) .auth-page :deep(.dark\:text-primary-400) {
  color: #067a25;
}

:global(.public-style-light) .auth-page :deep(.btn-primary) {
  border-color: #087b2f;
  background: linear-gradient(180deg, #0a8f36 0%, #066828 100%);
  color: #fff;
  box-shadow:
    0 14px 34px rgba(8, 123, 47, 0.22),
    inset 0 1px rgba(255, 255, 255, 0.24);
}

:global(.public-style-light) .auth-page :deep(.bg-gray-200),
:global(.public-style-light) .auth-page :deep(.dark\:bg-dark-700) {
  background: rgba(8, 123, 47, 0.16);
}

@media (max-width: 900px) {
  .auth-page {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .auth-copy {
    text-align: center;
  }

  .hero-brand {
    margin-right: auto;
    margin-left: auto;
  }

  .auth-copy span {
    margin-right: auto;
    margin-left: auto;
  }
}

@media (max-width: 560px) {
  .auth-page {
    padding: 42px 16px 64px;
  }

  .auth-card {
    padding: 22px;
  }
}
</style>
